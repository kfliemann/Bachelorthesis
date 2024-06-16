import { Test, TestingModule } from '@nestjs/testing';
import { TasksOverviewController } from './tasks-overview.controller';

describe('TasksOverviewController', () => {
  let controller: TasksOverviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksOverviewController],
    }).compile();

    controller = module.get<TasksOverviewController>(TasksOverviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
