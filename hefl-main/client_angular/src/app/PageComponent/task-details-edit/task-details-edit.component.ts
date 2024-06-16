import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { TaskDetailsEditService } from 'src/app/Services/task-details-edit/task-details-edit.service';

@Component({
  selector: 'app-task-details-edit',
  templateUrl: './task-details-edit.component.html',
  styleUrls: ['./task-details-edit.component.scss']
})
export class TaskDetailsEditComponent {
  @Output() mcQuestionIdChanged = new EventEmitter<number>();
  @Output() closeDetails = new EventEmitter<void>();

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
    question_text: "",
    question_score: 0,
    answered_total: 0,
    correct_answered_count: 0,
    incorrect_answered_count: 0,
    num_quote: 0,
    versions: [],
    selected_version: 0,
    newestQuestionVersion: 0,
    conceptNode_name: "",
    conceptNode_id: 0,
  };
  scoreOptions: any;

  constructor(private taskDetailsEditService: TaskDetailsEditService) { }

  /**
   * initialize task-details-edit based on task-details this.taskDetails object
   * @param taskDetails 
   * params in taskDetails match this.taskDetails
   */
  initView(taskDetails: any) {
    this.taskDetails = taskDetails;
    this.scoreOptions = []
    for (let i = 1; i <= 50; i++) {
      this.scoreOptions.push(i);
    }
  }

  /**
   * close task-details-edit 
   */
  closeEdit() {
    let taskDetails = document.getElementById("task-details-row");
    if (taskDetails) {
      taskDetails.style.display = "flex";
    }

    let taskDetailsEdit = document.getElementById("task-details-edit-div")
    if (taskDetailsEdit) {
      taskDetailsEdit.style.display = "none";
    }

    let closeDetailsButton = document.getElementById("closeDetailsButton");
    if (closeDetailsButton) {
      closeDetailsButton.style.display = "unset";
    }
  }

  /**
   * update question details and emit mcQuestionIdChanged event with new mcquestion id
   * in order to trigger task-details refreshView()
   * @param mcQuestionId 
   */
  updateQuestion(mcQuestionId: Number) {
    /**
     * TODO: get global user_id, user_cookie of current logged in user
     * TODO: should task-details-edit api be restricted to certain roles only? 
     * if yes: add validateAdmin() method to verify user (seek task-details-edit nestjs controller for example code)
     */
    let questionData: any = {
      mcQuestion_id: mcQuestionId,
      user_id: 1,
      user_cookie: "user_cookie",
      question_name: this.taskDetails.question_name,
      question_text: this.taskDetails.question_text,
      question_descr: this.taskDetails.question_descr,
      question_score: this.taskDetails.question_score,
      question_type: this.taskDetails.question_type,
      question_conceptNode_id: this.taskDetails.conceptNode_id
    };

    this.taskDetailsEditService.updateQuestion(questionData).subscribe((response) => {
      this.mcQuestionIdChanged.emit(Number(response));
      this.closeEdit()
    });
  }


  /**
   * add new mcOption to mcOption_details array
   */
  addOption() {

    let newMCOption: any = {
      mcOption_id: null,
      mcOption_createdAt: 0,
      mcOption_text: "New Option",
      mcOption_isCorrect: "Correct",
      mcOption_score: null,
      is_new: true
    };

    this.taskDetails.mcOption_details.push(newMCOption)
  }

  /**
   * delete option from mcOption_details array
   * @param mcOptionId 
   */
  deleteOption(mcOptionId: number) {
    const index = this.taskDetails.mcOption_details.findIndex((option: { mcOption_id: number }) => option.mcOption_id === mcOptionId);

    if (index !== -1) {
      this.taskDetails.mcOption_details.splice(index, 1);
    }
  }

  /**
   * create new question version and mcquestion and connect them with the selected mcOptions
   * emit mcQuestionIdChanged event with new mcquestion id
   * in order to trigger task-details refreshView()
   */
  saveOptions() {
    /**
    * TODO: get global user_id, user_cookie of current logged in user
    * TODO: should task-details-edit api be restricted to certain roles only? 
    * if yes: add validateAdmin() method to verify user (seek task-details-edit nestjs controller for example code)
    */
    let mcOptionsData: any = {
      user_id: 1,
      user_cookie: "user_cookie",
      mcQuestion_id: this.taskDetails.mcQuestion_id,
      mcOptions: this.taskDetails.mcOption_details
    };

    this.taskDetailsEditService.updateMCOptions(mcOptionsData).subscribe((response) => {
      this.mcQuestionIdChanged.emit(Number(response));
      this.closeEdit()
    });
  }
}
