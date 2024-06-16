import { TestBed } from '@angular/core/testing';

import { TaskDetailsService } from './task-details.service';

describe('TaskDetailsService', () => {
  let service: TaskDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
