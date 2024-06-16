import { Module } from '@nestjs/common';
import { TasksOverviewService } from './tasks-overview.service';
import { TasksOverviewController } from './tasks-overview.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user/user.controller';
import { TaskDetailsService } from '@/task-details/task-details.service';

@Module({
  providers: [TasksOverviewService, UserService, UserController, TaskDetailsService],
  controllers: [TasksOverviewController],
  imports: [PrismaModule],
})
export class TasksOverviewModule { }
