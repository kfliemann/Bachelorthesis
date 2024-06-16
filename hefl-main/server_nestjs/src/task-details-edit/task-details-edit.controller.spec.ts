import { Test, TestingModule } from '@nestjs/testing';
import { TaskDetailsEditController } from './task-details-edit.controller';

describe('TaskDetailsEditController', () => {
  let controller: TaskDetailsEditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskDetailsEditController],
    }).compile();

    controller = module.get<TaskDetailsEditController>(TaskDetailsEditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
