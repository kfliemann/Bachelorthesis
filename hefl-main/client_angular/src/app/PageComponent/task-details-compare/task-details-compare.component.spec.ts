import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDetailsCompareComponent } from './task-details-compare.component';

describe('TaskDetailsCompareComponent', () => {
  let component: TaskDetailsCompareComponent;
  let fixture: ComponentFixture<TaskDetailsCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskDetailsCompareComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskDetailsCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
