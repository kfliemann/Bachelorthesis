import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskDetailsService {
  constructor(private prisma: PrismaService) { }

  /**
   * get all question details
   * @param mcQuestionId 
   * @returns 
   */
  async getQuestionDetails(mcQuestionId: number) {

    interface QuestionDetails {
      question_id: number;
      question_name: string;
      question_descr: string;
      question_text: string;
      question_type: string;
      question_score: number;
      question_approved: boolean;
      question_version: number;
      newest_version: number;
      answered_total: number;
      correct_answered_count: number;
      incorrect_answered_count: number;
      conceptNode_name: string;
      conceptNode_id: number;
    }

    const questionDetails = await this.prisma.$queryRaw<QuestionDetails[]>`
      SELECT 
      q.id as question_id,
      q.type as question_type,
      q.name AS question_name,
      q.description AS question_descr,
      q.text AS question_text,
      q.score AS question_score,
      qv.isApproved as question_approved,
      qv.version as question_version,
      cn.name as conceptNode_name,
      q.conceptNodeId as conceptNode_id
      FROM MCQuestion mcq
      LEFT JOIN QuestionVersion qv ON qv.id = mcq.questionVersionId
      LEFT JOIN Question q ON q.id = IF(qv.successorId IS NULL, qv.questionId, qv.successorId)
      LEFT JOIN ConceptNode cn ON cn.id = q.conceptNodeId
      WHERE mcq.id = ${mcQuestionId};`;

    const versionsArray = (await this.prisma.$queryRaw`
      SELECT MAX(version) as newest_version
      FROM QuestionVersion
      WHERE QuestionVersion.questionId = (
      SELECT questionId 
      FROM QuestionVersion
      WHERE QuestionVersion.id = (SELECT questionVersionId FROM MCQuestion WHERE id = ${mcQuestionId}))`)[0].newest_version

    return questionDetails.map(row => ({
      question_id: Number(row.question_id),
      question_name: row.question_name,
      question_descr: row.question_descr,
      question_text: row.question_text,
      question_type: row.question_type,
      question_score: Number(row.question_score),
      question_approved: Boolean(row.question_approved),
      question_version: Number(row.question_version),
      newest_version: Number(versionsArray),
      conceptNode_name: row.conceptNode_name,
      conceptNode_id: Number(row.conceptNode_id),
    }));

  }

  /**
 * get all details regarding mcOptions for a given mcQuestion
 * @param mcQuestionId 
 * @returns 
 */
  async getAnswerDetails(mcQuestionId: number) {

    interface AnswerDetails {
      mcOption_id: number;
      mcOption_text: string;
      mcOption_isCorrect: string;
      mcOption_count: number;
    }

    const mcOptions = await this.prisma.$queryRaw<AnswerDetails[]>`
      SELECT 
      mco.id as mcOption_id, 
      mco.text as mcOption_text,
      mco.is_correct as mcOption_isCorrect, 
      (SELECT COUNT(usmcos.mcOptionId) as option_count
        FROM UserMCOptionSelected usmcos
        LEFT JOIN UserMCAnswer usmca ON usmcos.userMCAnswerId = usmca.id
        WHERE usmcos.mcOptionId = mco.id AND usmca.mcQuestionId = ${mcQuestionId}) as mcOption_count
      FROM MCQuestionOption mcqo
      LEFT JOIN MCOption mco ON mco.id = mcqo.mcOptionId
      WHERE mcqo.mcQuestionId = ${mcQuestionId}
      ORDER BY mco.id ASC;`

    return mcOptions.map(row => ({
      mcOption_id: Number(row.mcOption_id),
      mcOption_text: row.mcOption_text,
      mcOption_isCorrect: row.mcOption_isCorrect,
      mcOption_count: Number(row.mcOption_count)
    }));
  }

  /**
   * 
   * @param mcQuestionId 
   * @returns difficultyIndex as number
   * calculates the difficultyindex per mcQuestion. takes every attempt into consideration (multiple per person is possible)
   */
  async getQuestionAnalytics(mcQuestionId: number) {
    interface QuestionDifficultyIndex {
      score: number,
      question_type: string,
      answered_total: number,
      answered_incorrect: number,
      answered_correct: number,
      mcOption_count: number,
      conceptNodeID: number,
    }

    let questionDetailsAnalytics = await this.prisma.$queryRaw<QuestionDifficultyIndex[]>`
      SELECT q.score as score, 
      q.conceptNodeID as conceptNodeID,
      q.type as question_type,
      (SELECT COUNT(UserMCAnswer.id)
        FROM UserMCAnswer
        WHERE UserMCAnswer.mcQuestionId = mcq.id ) as answered_total,
      (SELECT COUNT(UserMCAnswer.id)
        FROM UserMCAnswer
        WHERE UserMCAnswer.mcQuestionId = mcq.id AND UserMCAnswer.isCorrectAnswer = 0 ) as answered_incorrect,
      (SELECT COUNT(UserMCAnswer.id)
        FROM UserMCAnswer
        WHERE UserMCAnswer.mcQuestionId = mcq.id AND UserMCAnswer.isCorrectAnswer = 1 ) as answered_correct,
      (SELECT COUNT(MCQuestionOption.id)
        FROM MCQuestionOption
        LEFT JOIN MCOption ON MCOption.id = MCQuestionOption.mcOptionId
        WHERE MCQuestionOption.mcQuestionId = mcq.id ) as mcOption_count
      FROM MCQuestion mcq
      LEFT JOIN QuestionVersion qv ON qv.id = mcq.questionVersionId
      LEFT JOIN Question q ON q.id = IF(qv.successorId IS NULL, qv.questionId, qv.successorId)
      WHERE mcq.id = ${mcQuestionId};`

    questionDetailsAnalytics = questionDetailsAnalytics.map(row => ({
      score: Number(row.score),
      question_type: row.question_type,
      answered_total: Number(row.answered_total),
      answered_incorrect: Number(row.answered_incorrect),
      answered_correct: Number(row.answered_correct),
      mcOption_count: Number(row.mcOption_count),
      conceptNodeID: Number(row.conceptNodeID),
    }));

    //exit if no one answered this question (keep this return in sync with the "real" return)
    if (questionDetailsAnalytics[0]["answered_total"] == 0) {
      return [{
        isEmpty: true,
        itemDifficultyIndex: 0,
        itemDifficultyIndexCorrected: 0,
        itemStandardDeviation: 0,
        itemDiscriminationFull: 0,
        itemDiscriminationConceptNode: 0,
        avgScore: 0,
        answerResult: { correct: 0, incomplete: 0, wrong: 0 }
      }]
    }

    const userAnsweredTotal = questionDetailsAnalytics[0]["answered_total"];
    const userAnsweredCorrect = questionDetailsAnalytics[0]["answered_correct"];
    const userAnsweredIncorrect = questionDetailsAnalytics[0]["answered_incorrect"];
    const questionMaxScore = questionDetailsAnalytics[0]["score"];
    const mcOption_count = questionDetailsAnalytics[0]["mcOption_count"];
    const userScoredPoints = (await this.prisma.$queryRaw<any>`
      SELECT SUM(pointsScored) as totalScore 
      FROM UserMCAnswer
      WHERE UserMCAnswer.mcQuestionId = ${mcQuestionId};`)[0].totalScore
    const userAvgScore = (await this.prisma.$queryRaw<any>`
      SELECT SUM(pointsScored)/COUNT(id) as averageScore
      FROM UserMCAnswer
      WHERE UserMCAnswer.mcQuestionId = ${mcQuestionId};`)[0].averageScore

    const itemDifficultyIndex = (userScoredPoints / (userAnsweredTotal * questionMaxScore)) * 100;
    let itemDifficultyIndexCorrected = 0
    if(questionDetailsAnalytics[0]["question_type"] == "SC"){
        itemDifficultyIndexCorrected = ((userAnsweredCorrect - (userAnsweredIncorrect / (mcOption_count-1))) / (userAnsweredTotal)) * 100
    }
    const itemDiscriminationFull = Number(await this.calculateItemDiscriminationFull(mcQuestionId));
    const itemDiscriminationConceptNode = Number(await this.calculateItemDiscriminationPerConceptNode(mcQuestionId, questionDetailsAnalytics[0]["conceptNodeID"]))

    const answerScores = (await this.prisma.$queryRaw<any[]>`
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
      varianceTotalScore += Math.pow(score - ((itemDifficultyIndex / 100) * questionMaxScore), 2)
      if (score == questionMaxScore) {
        answerResult.correct += 1;
      } else if (score == 0) {
        answerResult.wrong += 1;
      } else {
        answerResult.incomplete += 1;
      }
    });

    const itemStandardDeviation = Math.sqrt(varianceTotalScore / userAnsweredTotal);

    const resultObj = {
      itemDifficultyIndex: Number(itemDifficultyIndex.toFixed(2)) < 0 ? 0 : Number(itemDifficultyIndex.toFixed(2)),
      itemDifficultyIndexCorrected: Number(itemDifficultyIndexCorrected.toFixed(2)) < 0 ? 0 : Number(itemDifficultyIndexCorrected.toFixed(2)),
      itemStandardDeviation: Number(itemStandardDeviation.toFixed(2)) < 0 ? 0 : Number(itemStandardDeviation.toFixed(2)),
      itemDiscriminationFull: Number(itemDiscriminationFull.toFixed(2)) < 0 ? 0 : Number(itemDiscriminationFull.toFixed(2)),
      itemDiscriminationConceptNode: Number(itemDiscriminationConceptNode.toFixed(2)) < 0 ? 0 : Number(itemDiscriminationConceptNode.toFixed(2)),
      avgScore: userAvgScore.toFixed(2),
      answerResult: answerResult,
      isEmpty: false,
    }

    return await Promise.all([resultObj]);
  }

  /**
   * get all version numbers of question
   * @param mcQuestionId 
   * @returns question version
   */
  async getQuestionVersions(mcQuestionId: number) {
    interface QuestionVersions {
      version: number
      isApproved: boolean
      mcQuestionId: number
    }

    const versionsArray = await this.prisma.$queryRaw<QuestionVersions[]>`
    SELECT version, isApproved, MCQuestion.id as mcQuestionId
    FROM QuestionVersion
    LEFT JOIN MCQuestion ON MCQuestion.questionVersionId = QuestionVersion.id
    WHERE QuestionVersion.questionId = (
    SELECT questionId 
    FROM QuestionVersion
    WHERE QuestionVersion.id = (SELECT questionVersionId FROM MCQuestion WHERE id = ${mcQuestionId}))`

    return versionsArray.map(row => ({
      version: Number(row.version),
      isApproved: Number(row.isApproved),
      mcQuestionId: Number(row.mcQuestionId)
    }));
  }

  /**
   * get the newest question version number
   * @param mcQuestionId 
   * @returns 
   */
  async getnewestQuestionVersion(mcQuestionId: number) {
    interface QuestionVersions {
      newest_version: number
    }

    const versionsArray = await this.prisma.$queryRaw<QuestionVersions[]>`
    SELECT MAX(version) as newest_version
    FROM QuestionVersion
    WHERE QuestionVersion.questionId = (
    SELECT questionId 
    FROM QuestionVersion
    WHERE QuestionVersion.id = (SELECT questionVersionId FROM MCQuestion WHERE id = ${mcQuestionId}))`

    return versionsArray.map(row => ({
      newest_version: Number(row.newest_version),
    }));
  }


  /**
   * this calculates the item "trennschärfe" based on every question available
   * @param mcQuestionId 
   * @returns 
   */
  async calculateItemDiscriminationFull(mcQuestionId: number) {
    const userScores = await this.prisma.$queryRaw<any[]>`
        SELECT UserMCAnswer.userId, SUM(pointsScored) as pointsScored, sub_usmca.allPoints
        FROM UserMCAnswer
        LEFT JOIN (SELECT userId, SUM(pointsScored) as allPoints
            FROM UserMCAnswer
            GROUP BY userId) sub_usmca ON sub_usmca.userId = UserMCAnswer.userId
        WHERE UserMCAnswer.mcQuestionId = ${mcQuestionId}
        GROUP BY UserMCAnswer.userId;`

    return await this.calculateCorrelationCoefficient(userScores);
  }

  /**
   * this calculates the item "trennschärfe" based on the every item from the same conceptNode as input mcQuestion
   * @param mcQuestionId 
   * @param conceptNodeId 
   * @returns 
   */
  async calculateItemDiscriminationPerConceptNode(mcQuestionId: number, conceptNodeId: number) {
    const userScores = await this.prisma.$queryRaw<any[]>`
        SELECT UserMCAnswer.userId, SUM(pointsScored) as pointsScored, sub_usmca.allPoints
        FROM UserMCAnswer
        LEFT JOIN (SELECT userId, SUM(pointsScored) as allPoints
            FROM UserMCAnswer
            LEFT JOIN MCQuestion ON MCQuestion.id = UserMCAnswer.mcQuestionId
            LEFT JOIN QuestionVersion ON QuestionVersion.id = MCQuestion.questionVersionId
            LEFT JOIN Question ON QuestionVersion.questionId = Question.id
            WHERE Question.conceptNodeId = ${conceptNodeId} 
            GROUP BY userId) sub_usmca ON sub_usmca.userId = UserMCAnswer.userId
        WHERE UserMCAnswer.mcQuestionId = ${mcQuestionId}
        GROUP BY UserMCAnswer.userId;`

    return await this.calculateCorrelationCoefficient(userScores);
  }

  /**
   * this is the actual calculation of the value
   * @param userScores 
   * @returns 
   */
  async calculateCorrelationCoefficient(userScores: any[]) {
    const n = userScores.length;
    let sumXY = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXSquare = 0;
    let sumYSquare = 0;

    userScores.forEach(user => {
      sumXY += user.pointsScored * user.allPoints;
      sumX += user.pointsScored;
      sumY += user.allPoints;
      sumXSquare += user.pointsScored * user.pointsScored;
      sumYSquare += user.allPoints * user.allPoints;
    });

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXSquare - sumX * sumX) * (n * sumYSquare - sumY * sumY));
    return numerator / denominator;
  }

  /**
   * approve a question to unlock it for students
   * @param mcQuestionId 
   * @returns 
   */
  async approveQuestion(mcQuestionId: number) {
    try {
      await this.prisma.$queryRaw`UPDATE QuestionVersion
          SET isApproved = 1
          WHERE id = (SELECT questionVersionId FROM MCQuestion WHERE id = ${mcQuestionId});`;
    } catch (error) {
      return 0;
    }
    return 1;
  }
}
