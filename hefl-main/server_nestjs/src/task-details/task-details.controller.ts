import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TaskDetailsService } from './task-details.service';
import { UserController } from '@/user/user.controller';


@Controller('task-details')
export class TaskDetailsController {

    constructor(private userController: UserController, private tasksDetailsService: TaskDetailsService) { }

    /**
     * get question details by MCQuestion Id
     * @param questionDetails 
     * user_id, user_cookie, mcQuestionId
     * @returns taskDetails
     * mcQuestion_id, mcOption_details, question_name, question_type, question_types, 
     * question_version, isApproved, correct_mcOptions, question_descr, question_text, question_score, 
     * answered_total, correct_answered_count, incorrect_answered_count, num_quote, versions, selected_version, newestQuestionVersion, 
     * conceptNode_name, conceptNode_id,
     */
    @Post()
    async getQuestionDetails(@Body() questionDetails: any) {
        let isValid = await this.userController.validateAdmin(questionDetails.user_id, questionDetails.user_cookie);
        if (isValid == 1) {
            let questionDetailsObj = await this.tasksDetailsService.getQuestionDetails(questionDetails.mcQuestionId);
            let questionAnalyticsObj = await this.tasksDetailsService.getQuestionAnalytics(questionDetails.mcQuestionId);
            let mcOptionsObj = await this.tasksDetailsService.getAnswerDetails(questionDetails.mcQuestionId);
            let versionsObj     = await this.tasksDetailsService.getQuestionVersions(questionDetails.mcQuestionId);

            questionDetailsObj = questionDetailsObj.map(detail => ({
                ...detail,
                questionAnalyticsObj: questionAnalyticsObj,
                mcOptions: mcOptionsObj,
                versions: versionsObj,
            }));

            const [questionDetailsResult] = await Promise.all([questionDetailsObj]);
            return [questionDetailsResult];
        } else {
            let result = {
                text: "Error validating user. Action permitted.",
            }
            return result;
        }
    }

    /**
     * 
     * @param mcQuestionId 
     * @returns boolean (true if successful, false if error)
     */
    @Get(':mcQuestionId')
    async approveQuestion(@Param('mcQuestionId') mcQuestionId: number){
        return await this.tasksDetailsService.approveQuestion(mcQuestionId);
    }
}
