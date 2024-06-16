import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsMonacoComponent } from './task-details-monaco.component';

describe('TaskDetailsMonacoComponent', () => {
  let component: TaskDetailsMonacoComponent;
  let fixture: ComponentFixture<TaskDetailsMonacoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskDetailsMonacoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskDetailsMonacoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
