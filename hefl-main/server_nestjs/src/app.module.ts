import { ContentModule } from './content/content.module';
import { FilesModule } from './files/files.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphModule } from './graph/graph.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { TasksOverviewModule } from './tasks-overview/tasks-overview.module';
import { TaskDetailsModule } from './task-details/task-details.module';
import { DiscussionController } from './discussion/discussion.controller';
import { DiscussionService } from './discussion/discussion.service';
import { QuestionModule } from './question/question.module';
import { TaskDetailsEditModule } from './task-details-edit/task-details-edit.module';
@Module({
  imports: [FilesModule, GraphModule, PrismaModule, ContentModule, UserModule, TasksOverviewModule, TaskDetailsModule, QuestionModule, TaskDetailsEditModule],
  controllers: [AppController, DiscussionController],
  providers: [AppService, DiscussionService],
})
export class AppModule { }
