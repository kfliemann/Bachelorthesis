import { TestBed } from '@angular/core/testing';

import { TaskDetailsEditService } from './task-details-edit.service';

describe('TaskDetailsEditService', () => {
  let service: TaskDetailsEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDetailsEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
