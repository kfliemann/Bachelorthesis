import { TestBed } from '@angular/core/testing';

import { TaskDetailsAnalyticsService } from './task-details-analytics.service';

describe('TaskDetailsAnalyticsService', () => {
  let service: TaskDetailsAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDetailsAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
