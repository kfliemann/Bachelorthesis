import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsEditComponent } from './task-details-edit.component';

describe('TaskDetailsEditComponent', () => {
  let component: TaskDetailsEditComponent;
  let fixture: ComponentFixture<TaskDetailsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDetailsEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
