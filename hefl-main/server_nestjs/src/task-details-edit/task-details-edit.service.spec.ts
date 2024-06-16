import { Test, TestingModule } from '@nestjs/testing';
import { TaskDetailsEditService } from './task-details-edit.service';

describe('TaskDetailsEditService', () => {
  let service: TaskDetailsEditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskDetailsEditService],
    }).compile();

    service = module.get<TaskDetailsEditService>(TaskDetailsEditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
