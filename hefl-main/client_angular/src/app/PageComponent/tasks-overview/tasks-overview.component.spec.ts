import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksOverviewComponent } from './tasks-overview.component';

describe('TasksOverviewComponent', () => {
  let component: TasksOverviewComponent;
  let fixture: ComponentFixture<TasksOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TasksOverviewComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TasksOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
