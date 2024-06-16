import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskDetailsService } from '@/task-details/task-details.service';



@Injectable()
export class TasksOverviewService {
    constructor(private prisma: PrismaService, private taskDetailsService: TaskDetailsService) { }


    /**
     * this is used for the task-table
     * @returns mcquestions
     */
    async getAllQuestions() {

        interface QuestionOverview {
            question_id: number;
            mcQuestion_id: number;
            question_text: string;
            question_descr: string;
            conceptNode_name: string,
            score: number;
            version: number;
            answered_overall: number;
            quota: string;
        }

        const result = await this.prisma.$queryRaw<QuestionOverview[]>`SELECT 
        Question.id as "question_id",
        MCQuestion.id as "mcQuestion_id",
        Question.text as "question_text",
        Question.description as "question_descr",
        ConceptNode.name as "conceptNode_name",
        score,
        version,
        (SELECT COUNT(id)
            FROM UserMCAnswer as usma 
            WHERE usma.mcQuestionId = MCQuestion.id) as "answered_overall",

        @total := (SELECT COUNT(UserMCAnswer.id)
                FROM UserMCAnswer
                WHERE UserMCAnswer.mcQuestionId = MCQuestion.id ) as "answers_total",
                
        @correct := (SELECT COUNT(UserMCAnswer.id)
                FROM UserMCAnswer
                WHERE UserMCAnswer.mcQuestionId = MCQuestion.id AND UserMCAnswer.isCorrectAnswer = 1) as "correct_answers",

        IFNULL(CONCAT(ROUND((@correct * 100 / @total),2), "%"), "0%") as "quota"
        
        FROM (SELECT QuestionVersion.*,  IF(QuestionVersion.successorId IS NULL, QuestionVersion.questionId, QuestionVersion.successorId) as currentQuestion
            FROM QuestionVersion
            RIGHT JOIN (SELECT QV.questionId, MAX(QV.version) AS version
                FROM QuestionVersion AS QV
                GROUP BY QV.questionId) AS current_vers ON current_vers.questionId = QuestionVersion.questionId AND current_vers.version = QuestionVersion.version) as currentQuestVer
        LEFT JOIN Question ON Question.id = currentQuestVer.currentQuestion
        LEFT JOIN MCQuestion ON MCQuestion.questionVersionId = currentQuestVer.id
        LEFT JOIN ConceptNode ON ConceptNode.id = Question.conceptNodeId;`


        /**
         * here are the columns defined, which are displayed in the overview.
         * add/delete arrayentries to add/delete columns in table
         */
        return result.map(row => ({
            question_id: Number(row.question_id),
            mcQuestion_id: Number(row.mcQuestion_id),
            "Concept Node": row.conceptNode_name,
            "Question Text": row.question_text,
            "Score": Number(row.score),
            "Version": Number(row.version),
            "Answered Overall": Number(row.answered_overall),
            "Detailansicht": ""
        }));
    }

    /**
     * this is used for the overview analytics
     * @returns 
     */
    async getTaskOverviewAnalytics() {
        const taskProperties = await this.prisma.$queryRaw<any[]>`
        SELECT Question.text, Question.conceptNodeId as conceptNodeId, ConceptNode.name as conceptNodeName, mcQuestionId, COUNT(mcQuestionId) as count, Question.type as questiontype
        FROM UserMCAnswer
        LEFT JOIN MCQuestion ON MCQuestion.id = UserMCAnswer.mcQuestionId
        INNER JOIN (SELECT QuestionVersion.*,  IF(QuestionVersion.successorId IS NULL, QuestionVersion.questionId, QuestionVersion.successorId) as currentQuestion
            FROM QuestionVersion
            RIGHT JOIN (SELECT QV.questionId, MAX(QV.version) AS version
                FROM QuestionVersion AS QV
                GROUP BY QV.questionId) AS current_vers ON current_vers.questionId = QuestionVersion.questionId AND current_vers.version = QuestionVersion.version) AS currentQuestVer ON currentQuestVer.currentQuestion = MCQuestion.questionVersionId
        LEFT JOIN Question ON Question.id = currentQuestVer.currentQuestion
        LEFT JOIN ConceptNode ON ConceptNode.id = Question.conceptNodeId
        GROUP BY mcQuestionId;`

        let resultArr = taskProperties.map(async row => ({
            question_text: (row.text),
            conceptNodeId: Number(row.conceptNodeId),
            conceptNodeName: row.conceptNodeName,
            mcQuestion_id: Number(row.mcQuestionId),
            count: Number(row.count),
            question_type: row.questiontype,
            itemDifficulty: Number((await this.taskDetailsService.getQuestionAnalytics(row.mcQuestionId))[0].itemDifficultyIndex),
            itemDifficultyCorrected: Number((await this.taskDetailsService.getQuestionAnalytics(row.mcQuestionId))[0].itemDifficultyIndexCorrected),
            itemDiscriminationFull: Number(await this.taskDetailsService.calculateItemDiscriminationFull(row.mcQuestionId)),
            itemDiscriminationConceptNode: Number(await this.taskDetailsService.calculateItemDiscriminationPerConceptNode(row.mcQuestionId, row.conceptNodeId))
        }));

        return await Promise.all(resultArr);
    }
}
