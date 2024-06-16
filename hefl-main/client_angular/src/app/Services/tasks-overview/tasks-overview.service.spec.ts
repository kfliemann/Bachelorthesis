import { TestBed } from '@angular/core/testing';

import { TasksOverviewService } from './tasks-overview.service';

describe('TasksOverviewService', () => {
  let service: TasksOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
