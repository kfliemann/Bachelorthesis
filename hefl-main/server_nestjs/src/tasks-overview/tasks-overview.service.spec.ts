import { Test, TestingModule } from '@nestjs/testing';
import { TasksOverviewService } from './tasks-overview.service';

describe('TasksOverviewService', () => {
  let service: TasksOverviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksOverviewService],
    }).compile();

    service = module.get<TasksOverviewService>(TasksOverviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
