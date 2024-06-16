import { Test, TestingModule } from '@nestjs/testing';
import { TaskDetailsController } from './task-details.controller';

describe('TaskDetailsController', () => {
  let controller: TaskDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskDetailsController],
    }).compile();

    controller = module.get<TaskDetailsController>(TaskDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
