import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskDetailsAnalyticsService {
    constructor(private prisma: PrismaService) { }


    /**
     * 
     * @param mcQuestionId 
     * @returns difficultyIndex as number
     * calculates the difficultyindex per mcQuestion. takes every attempt into consideration (multiple per person is possible)
     */
    async calculateTaskStats(mcQuestionId: number) {
        interface QuestionDifficultyIndex {
            score: number,
            answered_total: number,
            type: String,
            question_version: number,
        }

        let questionDetailsAnalytics = await this.prisma.$queryRaw<QuestionDifficultyIndex[]>`
            SELECT q.score as score, q.type as type, (SELECT COUNT(UserMCAnswer.id)
                FROM UserMCAnswer
                WHERE UserMCAnswer.mcQuestionId = mcq.id ) as answered_total, 
                qv.version as question_version
            FROM MCQuestion mcq
            LEFT JOIN QuestionVersion qv ON qv.id = mcq.questionVersionId
            LEFT JOIN Question q ON q.id = qv.questionId
            WHERE mcq.id = ${mcQuestionId};`

        questionDetailsAnalytics = questionDetailsAnalytics.map(row => ({
            score: Number(row.score),
            question_version: Number(row.question_version),
            answered_total: Number(row.answered_total),
            type: row.type
        }));

        //exit if noone answered this question
        if (questionDetailsAnalytics[0]["answered_total"] == 0) {
            return {
                itemDifficultyIndex: -1,
                itemVariance: -1
            }
        }

        let totalScore = (await this.prisma.$queryRaw<any>`
        SELECT SUM(pointsScored) as totalScore 
        FROM UserMCAnswer
        WHERE UserMCAnswer.mcQuestionId = ${mcQuestionId};`)[0].totalScore

        const itemDifficultyIndex = (totalScore / (questionDetailsAnalytics[0]["answered_total"] * questionDetailsAnalytics[0]["score"])) * 100;

        let missedScore = (questionDetailsAnalytics[0]["answered_total"] * questionDetailsAnalytics[0]["score"]-totalScore);
        
        let correctedDifficulty = ((totalScore - (missedScore / 2)) / (questionDetailsAnalytics[0]["answered_total"] * questionDetailsAnalytics[0]["score"]))*100
        

        let answerScores = (await this.prisma.$queryRaw<any[]>`
        SELECT pointsScored as score 
        FROM UserMCAnswer
        WHERE UserMCAnswer.mcQuestionId = ${mcQuestionId};`)

        let varianceTotalScore = 0;
        let answerResult = {
            correct: 0,
            incomplete: 0,
            wrong: 0
        }
        answerScores.forEach(scoreArr => {
            let score = scoreArr.score;
            varianceTotalScore += Math.pow(score - ((itemDifficultyIndex / 100) * questionDetailsAnalytics[0]["score"]), 2)
            if (score == questionDetailsAnalytics[0]["score"]) {
                answerResult.correct += 1;
            } else if (score == 0) {
                answerResult.wrong += 1;
            } else {
                answerResult.incomplete += 1;
            }
        });

        const itemVariance = varianceTotalScore / questionDetailsAnalytics[0]["answered_total"];

        const mcOptionArr = await this.getMCOptionCount(mcQuestionId);

        const resultObj = {
            question_version: questionDetailsAnalytics[0]["question_version"],
            itemDifficultyIndex: itemDifficultyIndex,
            itemVariance: itemVariance,
            mcOptions: mcOptionArr,
            answerResult: answerResult,
        }

        return resultObj;
    }

    /**
     * get all MCOptions linked to MCQuestion and the amount the option was chosen by user
     * @param mcQuestionId 
     * @returns mcOptions
     */
    async getMCOptionCount(mcQuestionId: number) {
        let mcOptions = await this.prisma.$queryRaw<any[]>`
        SELECT mco.id as mcOptionId, mco.text as mcOptionText, mco.is_correct as is_correct, (SELECT COUNT(usmcos.mcOptionId) as option_count
            FROM UserMCOptionSelected usmcos
            WHERE usmcos.mcOptionId = mco.id) as option_count
        FROM MCQuestionOption mcqo
        LEFT JOIN MCOption mco ON mco.id = mcqo.mcOptionId
        WHERE mcqo.mcQuestionId = ${mcQuestionId};`

        mcOptions = mcOptions.map(row => ({
            mcOptionId: Number(row.mcOptionId),
            mcOptionText: row.mcOptionText,
            is_correct: Number(row.is_correct),
            option_count: Number(row.option_count)
        }));

        return mcOptions;
    }

    /**
     * 
     * @param mcQuestionId 
     * @returns difficultyIndex as number
     * calculates the difficultyindex per mcQuestion. takes every attempt into consideration (multiple per person is possible)
     */
    async calculateCorrectedDifficultyIndex(mcQuestionId: number) {
        interface itemDifficultyIndexCorrected {
            itemDifficultyIndexCorrected: number
        }
        let questionDetailsAnalytics = await this.prisma.$queryRaw<itemDifficultyIndexCorrected[]>`
            SELECT IF(@questionType LIKE "SC", IF(@total > 0, ((@correct - (@incorrect/(@mcOptionCount-1)))/@total)*100, 0),0) as itemDifficultyIndexCorrected
            FROM (SELECT 
                @total := (SELECT COUNT(UserMCAnswer.id)
                    FROM UserMCAnswer
                    WHERE UserMCAnswer.mcQuestionId = mcq.id ) as answered_total,
                @correct := (SELECT COUNT(UserMCAnswer.id)
                    FROM UserMCAnswer
                    WHERE UserMCAnswer.mcQuestionId = mcq.id AND UserMCAnswer.isCorrectAnswer = 1) as correct_answered_count,
                @incorrect := (SELECT COUNT(UserMCAnswer.id)
                    FROM UserMCAnswer
                    WHERE UserMCAnswer.mcQuestionId = mcq.id AND UserMCAnswer.isCorrectAnswer = 0) as incorrect_answered_count,
                @mcOptionCount := (SELECT COUNT(id) 
                    FROM MCQuestionOption
                    WHERE MCQuestionOption.mcQuestionId = mcq.id) as mcOptionCount,
                @questionType := q.type
                FROM MCQuestion mcq
                LEFT JOIN QuestionVersion qv ON qv.id = mcq.questionVersionId
                LEFT JOIN Question q ON q.id = qv.questionId
                WHERE mcq.id = ${mcQuestionId}) mcq_sub;`

        questionDetailsAnalytics = questionDetailsAnalytics.map(row => ({
            itemDifficultyIndexCorrected: Number(row.itemDifficultyIndexCorrected)
        }));

        //TODO: does a difficulty index below 0 make sense? if you think so, then just return the else option
        if (questionDetailsAnalytics[0].itemDifficultyIndexCorrected < 0) {
            return 0
        } else {
            return questionDetailsAnalytics[0].itemDifficultyIndexCorrected;
        }
    }

    /**
     * 
     * @param userMCOptionSelected 
     * @returns refactored array with userMcAnswerId as keys, indicating person has given MCOptions on userMCAnswerId run
     */
    refactorMCOptions(userMCOptionSelected: any[]) {
        let temp = {};
        userMCOptionSelected.forEach(element => {
            if (!temp[element.userMCAnswerId]) {
                temp[element.userMCAnswerId] = [];
            }

            temp[element.userMCAnswerId].push(element.mcOptionId);
        });

        return Object.values(temp);
    }


}
