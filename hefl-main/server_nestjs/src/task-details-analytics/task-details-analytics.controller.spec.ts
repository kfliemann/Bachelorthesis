import { Test, TestingModule } from '@nestjs/testing';
import { TaskDetailsAnalyticsController } from './task-details-analytics.controller';

describe('TaskDetailsAnalyticsController', () => {
  let controller: TaskDetailsAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskDetailsAnalyticsController],
    }).compile();

    controller = module.get<TaskDetailsAnalyticsController>(TaskDetailsAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
