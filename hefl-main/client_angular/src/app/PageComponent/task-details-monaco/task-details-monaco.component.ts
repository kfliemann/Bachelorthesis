import { Component } from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-task-details-monaco',
  templateUrl: './task-details-monaco.component.html',
  styleUrls: ['./task-details-monaco.component.scss']
})
export class TaskDetailsMonacoComponent {
  taskDetailsLeft: any = {
    mcQuestion_id: 0,
    question_name: "",
    question_type: "",
    isApproved: false,
    question_version: 0,
    question_descr: "",
    question_text: "",
    question_score: 0,
    questionAnalyticsObj: [],
    mcOption_details: [],
    versions: [],
    newestQuestionVersion: 0,
    selected_version: 0,
    conceptNode_name: "",
    conceptNode_id: 0,
  };

  taskDetailsRight: any = {
    mcQuestion_id: 0,
    question_name: "",
    question_type: "",
    isApproved: false,
    question_version: 0,
    question_descr: "",
    question_text: "",
    question_score: 0,
    questionAnalyticsObj: [],
    mcOptions: [],
    versions: [],
    newestQuestionVersion: 0,
    selected_version: 0,
    conceptNode_name: "",
    conceptNode_id: 0,
  };

  taskAnalyticsLeft: any = {
    avgScore: 0,
    itemDifficultyIndex: 0,
    itemDifficultyIndexCorrected: 0,
    itemDiscriminationConceptNode: 0,
    itemDiscriminationFull: 0,
    itemVariance: 0,
  };
  taskAnalyticsRight: any = {
    avgScore: 0,
    itemDifficultyIndex: 0,
    itemDifficultyIndexCorrected: 0,
    itemDiscriminationConceptNode: 0,
    itemDiscriminationFull: 0,
    itemVariance: 0,
  };

  options = {
    theme: 'vs-light',
    readOnly: true,
    wordWrap: true
  };

  originalQuestion: DiffEditorModel = {
    code: '',
    language: 'text/plain'
  };

  modifiedQuestion: DiffEditorModel = {
    code: '',
    language: 'text/plain'
  };

  originalText: DiffEditorModel = {
    code: '',
    language: 'text/plain'
  };

  modifiedText: DiffEditorModel = {
    code: '',
    language: 'text/plain'
  };

  originalOptions: DiffEditorModel = {
    code: '',
    language: 'text/plain'
  };

  modifiedOptions: DiffEditorModel = {
    code: '',
    language: 'text/plain'
  };

  /**
   * initialize task-details-monaco based on task-details this.taskDetails object version
   * @param side 
   * 0 left side, 1 right side
   * @param taskDetails 
   * params in taskDetails match this.taskDetails
   */
  initView(side: number, taskDetails: any) {
    if (side == 0) {
      this.taskDetailsLeft = {
        ...taskDetails,
        answered_total:
          (Number(taskDetails.questionAnalyticsObj[0].answerResult.correct) +
            Number(taskDetails.questionAnalyticsObj[0].answerResult.incomplete) +
            Number(taskDetails.questionAnalyticsObj[0].answerResult.wrong))
      };
      this.taskAnalyticsLeft = { ...taskDetails.questionAnalyticsObj[0] };
      this.taskDetailsRight = {
        ...taskDetails,
        answered_total:
          (Number(taskDetails.questionAnalyticsObj[0].answerResult.correct) +
            Number(taskDetails.questionAnalyticsObj[0].answerResult.incomplete) +
            Number(taskDetails.questionAnalyticsObj[0].answerResult.wrong))
      };
      this.taskAnalyticsRight = { ...taskDetails.questionAnalyticsObj[0] };
    } else {
      this.taskDetailsRight = {
        ...taskDetails,
        answered_total:
          (Number(taskDetails.questionAnalyticsObj[0].answerResult.correct) +
            Number(taskDetails.questionAnalyticsObj[0].answerResult.incomplete) +
            Number(taskDetails.questionAnalyticsObj[0].answerResult.wrong))
      };
      this.taskAnalyticsRight = { ...taskDetails.questionAnalyticsObj[0] };
    }

    this.originalQuestion = {
      code: this.taskDetailsLeft.question_name,
      language: 'text/plain'
    };

    this.modifiedQuestion = {
      code: this.taskDetailsRight.question_name,
      language: 'text/plain'
    };

    this.originalText = {
      code: this.taskDetailsLeft.question_text,
      language: 'text/plain'
    };

    this.modifiedText = {
      code: this.taskDetailsRight.question_text,
      language: 'text/plain'
    };

    this.originalOptions = {
      code: this.stringifyOptions(this.taskDetailsLeft.mcOptions),
      language: 'text/plain'
    };

    this.modifiedOptions = {
      code: this.stringifyOptions(this.taskDetailsRight.mcOptions),
      language: 'text/plain'
    };
  }



  /**
   * turns array of MCOptions into a string containing every MCOption Text for comparison
   * @param options 
   * array of MCOption {mcOption_answer_selected, mcOption_createdAt, mcOption_id, mcOption_isCorrect, mcOption_score, mcOption_text}
   * @returns string
   */
  stringifyOptions(options: any) {
    let optionsString = "";
    options.forEach((element: { mcOption_text: string; }, index: number) => {
      optionsString += `Option ${index + 1}: \n ${element.mcOption_text}\n\n`;
    });
    return optionsString;
  }
}
