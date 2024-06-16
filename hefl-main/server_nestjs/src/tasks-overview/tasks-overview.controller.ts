import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TasksOverviewService } from './tasks-overview.service';
import { UserController } from '@/user/user.controller';

@Controller('tasks-overview')
export class TasksOverviewController {

    constructor(private userController: UserController, private tasksOverviewService: TasksOverviewService) { }

    /**
     * input userData
     * user_id, user_cookie
     * 
     * return QuestionOverview
     * the data has been remapped to make it easier to autogenerate the table with the corresponding columns
     * question_id, mcQuestion_id, "Question Name", "Question Description", "Score", "Version", "Answered Overall", "Quota"
     * 
     * return taskOverviewAnalytics which contain
     * conceptNodeId, conceptNodeName, count of how many times answered, itemDifficulty, itemDifficultyCorrected(SC only!), itemDiscriminationFull, itemDiscriminationConceptNode 
    */
    @Post('task-list')
    async getAllQuestions(@Body() userData: any) {
        let isValid = await this.userController.validateUser(userData.user_id, userData.user_cookie);
        if (isValid == 1) {
            let allQuestionsObj = await this.tasksOverviewService.getAllQuestions();
            let taskOverviewAnalytics = await this.tasksOverviewService.getTaskOverviewAnalytics();

            let taskOverviewObj = {
                allQuestionsObj: allQuestionsObj,
                taskOverviewAnalytics: taskOverviewAnalytics
            }

            return taskOverviewObj;
        } else {
            let result = {
                text: "Error validating user. Action permitted.",
            }
            return result;
        }
    }
}
