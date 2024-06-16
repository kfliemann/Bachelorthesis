import { Module } from '@nestjs/common';
import { TaskDetailsAnalyticsService } from './task-details-analytics.service';
import { TaskDetailsAnalyticsController } from './task-details-analytics.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user/user.controller';

@Module({
  providers: [TaskDetailsAnalyticsService, UserService, UserController],
  controllers: [TaskDetailsAnalyticsController],
  imports: [PrismaModule],
})
export class TaskDetailsAnalyticsModule { }
