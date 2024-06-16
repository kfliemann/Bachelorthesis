import { TestBed } from '@angular/core/testing';
import { TaskDetailsCompareService } from './task-details-compare.service';

describe('TaskDetailsCompareService', () => {
  let service: TaskDetailsCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDetailsCompareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
