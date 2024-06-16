import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserController } from '@/user/user.controller';
import { TaskDetailsEditService } from './task-details-edit.service';

@Controller('task-details-edit')
export class TaskDetailsEditController {
    constructor(private userController: UserController, private taskDetailsEditService: TaskDetailsEditService) { }

   /**
    * 
    * @param questionData 
    * question_id, user_id, user_cookie, name, descr
    * @returns mcQuestionId
    */
    @Post('update-question')
    async updateQuestion(@Body() questionData: any) {
        let isValid = await this.userController.validateUser(questionData.user_id, questionData.user_cookie);
        if (isValid == 1) {
            return this.taskDetailsEditService.updateQuestion(questionData);
        } else {
            let result = {
                text: "Error validating user. Action permitted.",
            }
            return result;
        }
    }

   /**
    * 
    * @param mcOptionsData 
    * user_id, user_cookie, mcOptions [mcOption_createdAt, mcOption_id, mcOption_isCorrect, mcOption_score, mcOption_text, is_new(only for new mcoptions) 
    * @returns mcQuestionId
    */
    @Post('update-mcoptions')
    async updateMCOptions(@Body() mcOptionsData: any) {
        let isValid = await this.userController.validateUser(mcOptionsData.user_id, mcOptionsData.user_cookie);
        if (isValid == 1) {
            return this.taskDetailsEditService.updateMcOptions(mcOptionsData);
        } else {
            let result = {
                text: "Error validating user. Action permitted.",
            }
            return result;
        }
    }

}
