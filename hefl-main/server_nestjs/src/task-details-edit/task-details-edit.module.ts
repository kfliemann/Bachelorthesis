import { Module } from '@nestjs/common';
import { TaskDetailsEditController } from './task-details-edit.controller';
import { TaskDetailsEditService } from './task-details-edit.service';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user/user.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [TaskDetailsEditController],
  providers: [TaskDetailsEditService, UserService, UserController],
  imports: [PrismaModule]
})
export class TaskDetailsEditModule { }
