import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TaskDetailsAnalyticsService } from './task-details-analytics.service';
import { UserController } from '@/user/user.controller';

@Controller('task-details-analytics')
export class TaskDetailsAnalyticsController {

    constructor(private userController: UserController, private taskDetailsAnalyticsService: TaskDetailsAnalyticsService) { }

    @Post()
    async getQuestionAnalytics(@Body() questionDetails: any) {
        let isValid = await this.userController.validateAdmin(questionDetails.user_id, questionDetails.user_cookie);
        if (isValid == 1) {
            let taskDetailsAnalyticsObj = {};
            taskDetailsAnalyticsObj = await this.taskDetailsAnalyticsService.calculateTaskStats(questionDetails.mcQuestionId);
            return await Promise.all([taskDetailsAnalyticsObj]);
        } else {
            let result = {
                text: "Error validating user. Action permitted.",
            }
            return result;
        }
    }


}
