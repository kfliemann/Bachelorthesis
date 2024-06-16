import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskDetailsEditService {
    constructor(private prisma: PrismaService) { }

    /**
     * questionData
     * mcQuestion_id, user_id, user_cookie, question_name, question_descr, question_score, question_type
    */
    async updateQuestion(questionData: any) {

        const isDifferent = await this.prisma.$queryRaw`SELECT COUNT(*) as result
        FROM MCQuestion
        LEFT JOIN QuestionVersion ON QuestionVersion.id = MCQuestion.questionVersionId
        LEFT JOIN Question ON Question.id = IF(QuestionVersion.successorId IS NULL, QuestionVersion.questionId, QuestionVersion.successorId)
        WHERE MCQuestion.id = ${questionData.mcQuestion_id}
          AND Question.name = ${questionData.question_name}
          AND Question.text = ${questionData.question_text}
          AND Question.score = ${questionData.question_score};`

        const questionVersionData = await this.prisma.$queryRaw`SELECT QuestionVersion.questionId, QuestionVersion.version+1 as version
        FROM MCQuestion
        LEFT JOIN QuestionVersion ON QuestionVersion.id = MCQuestion.questionVersionId
        WHERE MCQuestion.id = ${questionData.mcQuestion_id};`

        if (isDifferent[0].result == 0) {
            const question_result = await this.prisma.question.create({
                data: {
                    updatedAt: new Date(),
                    name: questionData.question_name,
                    description: questionData.question_descr,
                    score: Number(questionData.question_score),
                    type: questionData.question_type,
                    authorId: 1,
                    text: questionData.question_text,
                    contentElementId: null,
                    conceptNodeId: questionData.question_conceptNode_id,
                },
            });

            const questionVersion_result = await this.prisma.questionVersion.create({
                data: {
                    updatedAt: new Date(),
                    questionId: questionVersionData[0].questionId,
                    successorId: question_result.id,
                    version: Number(questionVersionData[0].version),
                },
            });

            let isSC: boolean;
            if (questionData.question_type == "MC") {
                isSC = false
            } else {
                isSC = true
            }

            const mcQuestionResult = await this.prisma.mCQuestion.create({
                data: {
                    updatedAt: new Date(),
                    questionVersionId: questionVersion_result.id,
                    shuffleoptions: true,
                    isSC: isSC,
                },
            });


            let mcOptions: []
            mcOptions = await this.prisma.$queryRaw`SELECT MCQuestionOption.mcOptionId as id 
            FROM MCQuestionOption
            WHERE MCQuestionOption.mcQuestionId = ${questionData.mcQuestion_id};`

            mcOptions.forEach(async (option: { id: number }) => {
                const updateResult = await this.prisma.mCQuestionOption.create({
                    data: {
                        updatedAt: new Date(),
                        mcQuestionId: mcQuestionResult.id,
                        mcOptionId: option.id
                    },
                });
            });

            return mcQuestionResult.id
        } else {
            return "no difference"
        }
    }

    /**
     * mcOptionsData
     * user_id, user_cookie, mcQuestion_id, mcOptions [mcOption_createdAt, mcOption_id, mcOption_isCorrect, mcOption_score, mcOption_text, is_new(only for new mcoptions) 
    */
    async updateMcOptions(mcOptionsData: any) {
        let mcQuestionCreated = 0;
        let mcOptionNeedsUpdate = []

        for (let mcOption of mcOptionsData.mcOptions) {
            let newMcOption = mcOption;
            let optionType: boolean

            if (mcOption.mcOption_isCorrect == 1) {
                optionType = true
            } else {
                optionType = false
            }

            if (mcOption.is_new == true) {
                if (mcQuestionCreated == 0) {
                    mcQuestionCreated = await this.createQuestionVersionSequence(mcOptionsData.mcQuestion_id);
                }

                const mcOptionResult = await this.prisma.mCOption.create({
                    data: {
                        updatedAt: new Date(),
                        text: mcOption.mcOption_text,
                        is_correct: optionType,
                    },
                });
                newMcOption = mcOptionResult;

                const updateResult = await this.prisma.mCQuestionOption.create({
                    data: {
                        updatedAt: new Date(),
                        mcQuestionId: mcQuestionCreated,
                        mcOptionId: newMcOption.id
                    },
                });

            } else {
                const isDifferent = await this.prisma.$queryRaw`SELECT COUNT(*) as result
                FROM MCOption
                WHERE MCOption.id = ${mcOption.mcOption_id}
                  AND MCOption.text = ${mcOption.mcOption_text}
                  AND MCOption.is_correct = ${optionType};`

                if (Number(isDifferent[0].result) == 0) {
                    if (mcQuestionCreated == 0) {
                        mcQuestionCreated = await this.createQuestionVersionSequence(mcOptionsData.mcQuestion_id);
                    }
                    const mcOptionResult = await this.prisma.mCOption.create({
                        data: {
                            updatedAt: new Date(),
                            text: mcOption.mcOption_text,
                            is_correct: optionType,
                        },
                    });
                    newMcOption = mcOptionResult;

                    const updateResult = await this.prisma.mCQuestionOption.create({
                        data: {
                            updatedAt: new Date(),
                            mcQuestionId: mcQuestionCreated,
                            mcOptionId: newMcOption.id
                        },
                    });

                } else {
                    mcOptionNeedsUpdate.push(mcOption)
                }
            }
        };
        //question already created and answers need to be connected
        if (mcQuestionCreated != 0 && mcOptionNeedsUpdate.length > 0) {
            mcOptionNeedsUpdate.forEach(async element => {
                const updateResult = await this.prisma.mCQuestionOption.create({
                    data: {
                        updatedAt: new Date(),
                        mcQuestionId: mcQuestionCreated,
                        mcOptionId: element.mcOption_id
                    },
                });
            });
        }
        //no question created yet (because anwser got deleted and no option got changed)
        if (mcQuestionCreated == 0 && mcOptionNeedsUpdate.length > 0) {
            mcQuestionCreated = await this.createQuestionVersionSequence(mcOptionsData.mcQuestion_id);
            mcOptionNeedsUpdate.forEach(async element => {
                const updateResult = await this.prisma.mCQuestionOption.create({
                    data: {
                        updatedAt: new Date(),
                        mcQuestionId: mcQuestionCreated,
                        mcOptionId: element.mcOption_id
                    },
                });
            });
        }
        return mcQuestionCreated
    }

    async createQuestionVersionSequence(mcQuestionId: number) {
        let questionVersionObj = await this.prisma.$queryRaw`SELECT 
        QuestionVersion.questionId, 
        QuestionVersion.successorId, 
        QuestionVersion.version+1 as version,
        MCQuestion.isSC as isSC 
        FROM QuestionVersion
        LEFT JOIN MCQuestion ON MCQuestion.questionVersionId = QuestionVersion.id
        WHERE MCQuestion.id = ${mcQuestionId};`

        let newQuestionVersion = await this.prisma.questionVersion.create({
            data: {
                updatedAt: new Date(),
                questionId: questionVersionObj[0].questionId,
                successorId: questionVersionObj[0].successorId,
                version: Number(questionVersionObj[0].version)
            }
        });

        let isSC: boolean;
        if (questionVersionObj[0].isSC == 0) {
            isSC = false
        } else {
            isSC = true
        }

        const mcQuestionResult = await this.prisma.mCQuestion.create({
            data: {
                updatedAt: new Date(),
                questionVersionId: newQuestionVersion.id,
                shuffleoptions: true,
                isSC: isSC,
            },
        });

        return mcQuestionResult.id
    }
}
