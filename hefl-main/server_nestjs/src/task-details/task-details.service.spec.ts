import { Test, TestingModule } from '@nestjs/testing';
import { TaskDetailsService } from './task-details.service';

describe('TaskDetailsService', () => {
  let service: TaskDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskDetailsService],
    }).compile();

    service = module.get<TaskDetailsService>(TaskDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
