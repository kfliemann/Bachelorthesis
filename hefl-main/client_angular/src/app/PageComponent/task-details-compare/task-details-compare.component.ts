import { Component, ViewChild } from '@angular/core';
import { TaskDetailsService } from 'src/app/Services/task-details/task-details.service';
import { TaskDetailsMonacoComponent } from '../task-details-monaco/task-details-monaco.component';

@Component({
  selector: 'app-task-details-compare',
  templateUrl: './task-details-compare.component.html',
  styleUrls: ['./task-details-compare.component.scss']
})
export class TaskDetailsCompareComponent {
  @ViewChild('taskDetailsMonaco') taskDetailsMonacoComponent?: TaskDetailsMonacoComponent;

  taskDetails: any = {
    mcQuestion_id: 0,
    mcOption_details: [],
    question_name: "",
    question_type: "",
    question_types: [],
    question_version: 0,
    isApproved: false,
    correct_mcOptions: 1,
    question_descr: "",
    question_score: 0,
    answered_total: 0,
    correct_answered_count: 0,
    incorrect_answered_count: 0,
    num_quote: 0,
    versions: [],
    selected_version: 0,
    newestQuestionVersion: 0,
  };

  taskDetailsLeft = this.taskDetails;
  taskDetailsRight = this.taskDetails;
  constructor(private taskDetailsService: TaskDetailsService) { }

  /**
   * initialize task-details-compare based on task-details this.taskDetails object
   * @param taskDetails 
   * params in taskDetails match this.taskDetails
   */
  initView(taskDetails: any) {
    this.taskDetails = taskDetails;
    this.taskDetailsLeft = { ...taskDetails };
    this.taskDetailsRight = { ...taskDetails };
    this.onVersionChange(0);
  }

  /**
   * load task-details-compare for a selected question version and fill this.taskDetails with new data
   * if the left side version gets changed, change the right side to be the same version or higher
   * if the right side version gets changed, just change the right side fields
   * @param side  
   * 0 left side, 1 right side
   */
  onVersionChange(side: number) {
    if (side == 0) {
      const selectedObject = this.taskDetailsLeft.versions.find((version: { version: number; }) => version.version === this.taskDetailsLeft.selected_version);

      if (selectedObject) {
        /**
         * TODO: get global user_id, user_cookie of current logged in user
         * TODO: should task-details api be restricted to certain roles only? 
         * if yes: add validateAdmin() method to verify user (seek task-details-edit nestjs controller for example code)
         */
        let questionDetails = {
          user_id: 1,
          user_cookie: "user_cookie",
          mcQuestionId: selectedObject.mcQuestionId
        }
        this.taskDetailsService.getTaskDetails(questionDetails).subscribe((x: any) => {
          if (this.taskDetailsMonacoComponent) {
            this.taskDetailsMonacoComponent.initView(0, x[0][0])
          }
        });

        this.taskDetailsService.getTaskDetails(questionDetails).subscribe((x: any) => {
          if (this.taskDetailsMonacoComponent) {
            this.taskDetailsMonacoComponent.initView(1, x[0][0])
          }
          this.taskDetailsRight.selected_version = x[0][0].question_version
        });
      }
    } else {
      const selectedObject = this.taskDetailsRight.versions.find((version: { version: number; }) => version.version === this.taskDetailsRight.selected_version);

      if (selectedObject) {
        /**
         * TODO: get global user_id, user_cookie of current logged in user
         * TODO: should task-details api be restricted to certain roles only? 
         * if yes: add validateAdmin() method to verify user (seek task-details-edit nestjs controller for example code)
         */
        let questionDetails = {
          user_id: 1,
          user_cookie: "user_cookie",
          mcQuestionId: selectedObject.mcQuestionId
        }

        this.taskDetailsService.getTaskDetails(questionDetails).subscribe((x: any) => {
          if (this.taskDetailsMonacoComponent) {
            this.taskDetailsMonacoComponent.initView(1, x[0][0])
          }
        });
      }
    }
  }

  /**
   * close task-details-compare 
   */
  closeCompare() {
    let taskDetails = document.getElementById("task-details-row");
    if (taskDetails) {
      taskDetails.style.display = "flex";
    }

    let taskDetailsEdit = document.getElementById("task-details-compare-div")
    if (taskDetailsEdit) {
      taskDetailsEdit.style.display = "none";
    }

    let closeDetailsButton = document.getElementById("closeDetailsButton");
    if (closeDetailsButton) {
      closeDetailsButton.style.display = "unset";
    }
  }
}
