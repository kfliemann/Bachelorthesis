import { Module } from '@nestjs/common';
import { TaskDetailsService } from './task-details.service';
import { TaskDetailsController } from './task-details.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user/user.controller';

@Module({
  providers: [TaskDetailsService, UserService, UserController],
  controllers: [TaskDetailsController],
  imports: [PrismaModule],
})
export class TaskDetailsModule {}
