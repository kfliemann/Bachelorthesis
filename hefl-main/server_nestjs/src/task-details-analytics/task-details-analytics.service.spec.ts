import { Test, TestingModule } from '@nestjs/testing';
import { TaskDetailsAnalyticsService } from './task-details-analytics.service';

describe('TaskDetailsAnalyticsService', () => {
  let service: TaskDetailsAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskDetailsAnalyticsService],
    }).compile();

    service = module.get<TaskDetailsAnalyticsService>(TaskDetailsAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
