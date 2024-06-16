import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TaskDetailsService } from 'src/app/Services/task-details/task-details.service';
import { TaskDetailsEditComponent } from '../task-details-edit/task-details-edit.component';
import { TaskDetailsCompareComponent } from '../task-details-compare/task-details-compare.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent {
  @ViewChild('taskDetailsEdit') taskDetailsEditComponent?: TaskDetailsEditComponent;
  @ViewChild('taskDetailsCompare') taskDetailsCompareComponent?: TaskDetailsCompareComponent;
  @Output() refreshTaskOverview = new EventEmitter<void>();
  editDisable: boolean;
  approveDisable: boolean;
  itemDifficultyDescription: string;
  analyticsChartsExpl: string;
  mcOptionChart: any;
  taskStatsChart: any;
  taskDiscriminationChart: any;

  taskDiscriminationFull: any;
  taskDiscriminationConceptNode: any;

  taskDetails: any = {
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

  constructor(private taskDetailsService: TaskDetailsService) {
    this.editDisable = false
    this.approveDisable = true
    this.itemDifficultyDescription = "The number above the scale is the item difficulty, the number below is the corrected item difficulty, which removes the guess probabilty";

    //please fix multiline tooltips angular material - \n, &#13;, <br>, white-space:pre-line; - nothing works
    this.analyticsChartsExpl = `Answer Result:
    Correct answered = all points received on answering, partially correct = some points were gained on answering, wrong = no points were gained 
    | Task Options: Lists the possible Options for the Question
    | Task Discrimination:
    Discrimination Full = this question in the context of all avaiable questions, Discrimination per Node = this question in the context of the Concept Node it is in.`;
  }

  /**
   * initialize task-details by pulling data from api
   * @param mcQuestionId 
   */
  initView(mcQuestionId: number) {
    this.destroyCharts();
    /**
     * TODO: get global user_id, user_cookie of current logged in user
     * TODO: should task-details api be restricted to certain roles only? 
     * if yes: add validateAdmin() method to verify user (seek task-details-edit nestjs controller for example code)
     */
    let questionDetails = {
      user_id: 1,
      user_cookie: "user_cookie",
      mcQuestionId: mcQuestionId
    }

    this.taskDiscriminationFull = [];
    this.taskDiscriminationConceptNode = [];

    this.taskDetailsService.getTaskDetails(questionDetails).subscribe((x: any) => {
      let questionDetailsObj = x[0][0];
      let answerDetailsObj = questionDetailsObj.mcOptions;

      this.taskDetails.mcQuestion_id = mcQuestionId;
      this.taskDetails.question_name = questionDetailsObj.question_name;
      this.taskDetails.question_type = questionDetailsObj.question_type;
      this.taskDetails.isApproved = questionDetailsObj.question_approved;
      this.approveDisable = this.taskDetails.isApproved
      this.taskDetails.question_version = questionDetailsObj.question_version;
      this.taskDetails.question_descr = questionDetailsObj.question_descr;
      this.taskDetails.question_text = questionDetailsObj.question_text;
      this.taskDetails.question_score = questionDetailsObj.question_score;
      this.taskDetails.mcOption_details = answerDetailsObj;
      this.taskDetails.versions = questionDetailsObj.versions;
      this.taskDetails.newestQuestionVersion = questionDetailsObj.newest_version;
      this.taskDetails.selected_version = questionDetailsObj.question_version
      this.taskDetails.conceptNode_name = questionDetailsObj.conceptNode_name
      this.taskDetails.conceptNode_id = questionDetailsObj.conceptNode_id
      this.taskDetails.questionAnalyticsObj = questionDetailsObj.questionAnalyticsObj[0]

      if (!this.taskDetails.questionAnalyticsObj.isEmpty) {
        this.mcOptionChart = this.initMCOptionChart(this.mcOptionChart, answerDetailsObj);
        this.taskStatsChart = this.initTaskStatsChart(this.taskStatsChart, this.taskDetails.questionAnalyticsObj.answerResult);
        let discriminationValues = {
          itemDiscriminationFull: Number(this.taskDetails.questionAnalyticsObj.itemDiscriminationFull),
          itemDiscriminationConceptNode: Number(this.taskDetails.questionAnalyticsObj.itemDiscriminationConceptNode)
        }
        this.taskDiscriminationChart = this.initItemDiscriminationChart(this.taskDiscriminationChart, discriminationValues);
      }

      if (this.taskDetails.newestQuestionVersion !== this.taskDetails.question_version) {
        this.editDisable = true;
        this.approveDisable = true;
      } else {
        this.editDisable = false;
      }
    });
  }

  /**
   * refresh task-details, after editing question-details and trigger a refresh of task-overview, 
   * to display correct questions, when closing task-details
   * @param mcQuestionId 
   */
  refreshView(mcQuestionId: number) {
    this.initView(mcQuestionId)
    this.refreshTaskOverview.emit();
  }

  /**
   * show task-details-edit and hide task-details
   */
  editDetails() {
    let taskDetails = document.getElementById("task-details-row");
    if (taskDetails) {
      taskDetails.style.display = "none";
    }
    let taskDetailsEdit = document.getElementById("task-details-edit-div")
    if (taskDetailsEdit) {
      taskDetailsEdit.style.display = "flex";
    }

    let closeDetailsButton = document.getElementById("closeDetailsButton");
    if (closeDetailsButton) {
      closeDetailsButton.style.display = "none";
    }

    if (this.taskDetailsEditComponent) {
      this.taskDetailsEditComponent.initView(this.taskDetails)
    }
  }

  /**
   * load task-details for a selected question version and fill this.taskDetails with new data
   */
  onVersionChange() {
    const selectedObject = this.taskDetails.versions.find((version: { version: number; }) => version.version === this.taskDetails.selected_version);

    if (selectedObject) {
      this.destroyCharts();
      this.initView(selectedObject.mcQuestionId)
    }
  }

  /**
   * approve a question, making it accessible for students to answer
   */
  approveQuestion() {
    this.taskDetailsService.approveQuestion(this.taskDetails.mcQuestion_id).subscribe((x: any) => {
      this.approveDisable = true;
      this.taskDetails.versions[this.taskDetails.versions.length - 1].isApproved = 1;
    });
  }

  /**
   * close details 
   */
  closeDetails() {
    if (!this.taskDetails.questionAnalyticsObj.isEmpty) {
      this.destroyCharts();
    }

    let tableOverviewDiv = document.getElementById("task-overview-div");
    if (tableOverviewDiv) {
      tableOverviewDiv.style.display = "unset";
    }
    let tableDetailsDiv = document.getElementById("task-details-div")
    if (tableDetailsDiv) {
      tableDetailsDiv.style.display = "none";
    }

    let taskDetails = document.getElementById("task-details-row");
    if (taskDetails) {
      taskDetails.style.display = "flex";
    }
    let taskDetailsEdit = document.getElementById("task-details-edit-div")
    if (taskDetailsEdit) {
      taskDetailsEdit.style.display = "none";
    }
  }

  /**
 * init mcOption chart
 * @param mcOptions 
 */
  initMCOptionChart(chartVar: any, mcOptions: any[]) {
    let labels: any[] = [];
    let backgroundColor: string[] = [];
    let data: any[] = [];
    let optionTexts: string[] = [];

    mcOptions.forEach((element: { mcOption_text: any; mcOption_isCorrect: any; mcOption_count: any; }) => {
      labels.push(labels.length + 1);
      backgroundColor.push(element.mcOption_isCorrect ? '#009100' : '#ba0000');
      data.push(element.mcOption_count);
      optionTexts.push(element.mcOption_text);
    });

    chartVar = new Chart("mcOptionChart", {
      type: 'bar',

      data: {
        labels: labels,
        datasets: [
          {
            label: "Task Options",
            data: data,
            backgroundColor: backgroundColor
          },
        ]
      },
      options: {
        aspectRatio: 1.5,
        plugins: {
          legend: {
            display: true,
            onClick: () => { },
            labels: {
              generateLabels: function (chart: any) {
                const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                originalLabels.forEach((label: any) => {
                  label.fillStyle = 'transparent';
                });
                return originalLabels;
              },
              font: {
                size: 30
              }
            }
          },
          tooltip: {
            callbacks: {
              title: function (tooltipItem: any) {
                return optionTexts[tooltipItem[0].dataIndex];
              },

            }
          }
        }
      },
    });
    return chartVar;
  }

  /**
   * init task stats chart
   * @param answerResult 
   */
  initTaskStatsChart(chartVar: any, answerResult: { correct: any; incomplete: any; wrong: any; }) {
    chartVar = new Chart("taskStatsChart", {
      type: 'bar',

      data: {
        labels: ["Correct answered", "Partially correct", "Wrong"],
        datasets: [
          {
            label: "Answer Results",
            data: [answerResult.correct, answerResult.incomplete, answerResult.wrong],
            backgroundColor: ['#009100', "#ffa500", '#ba0000']
          },
        ]
      },
      options: {
        aspectRatio: 1.5,
        plugins: {
          legend: {
            display: true,
            onClick: () => { },
            labels: {
              generateLabels: function (chart: any) {
                const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                originalLabels.forEach((label: any) => {
                  label.fillStyle = 'transparent';
                });
                return originalLabels;
              },
              font: {
                size: 30
              }
            }
          }
        }
      },
    });
    return chartVar;
  }

  /**
 * init mcOption chart
 * @param mcOptions 
 */
  initItemDiscriminationChart(chartVar: any, discriminationValues: any) {
    let labels = ["All Questions", "Per ConceptNode"];
    chartVar = new Chart("taskDiscriminationChart", {
      type: 'bar',

      data: {
        labels: ["", ""],
        datasets: [
          {
            label: "Task Discrimination",
            data: [discriminationValues.itemDiscriminationFull, discriminationValues.itemDiscriminationConceptNode],
            backgroundColor: ['#3f51b5', '#b5a33f']
          },
        ]
      },
      options: {
        aspectRatio: 1.5,
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 0.1,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            onClick: () => { },
            labels: {
              generateLabels: function (chart: any) {
                const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                originalLabels.forEach((label: any) => {
                  label.fillStyle = 'transparent';
                });
                return originalLabels;
              },
              font: {
                size: 30
              }
            }
          },
          tooltip: {
            callbacks: {
              title: function (tooltipItem: any) {
                return labels[tooltipItem[0].dataIndex];
              },

            }
          }
        }
      },
    });
    return chartVar;
  }

  /**
   * show compare versions
   */
  openCompare() {
    let taskDetails = document.getElementById("task-details-row");
    if (taskDetails) {
      taskDetails.style.display = "none";
    }
    let taskDetailsEdit = document.getElementById("task-details-compare-div")
    if (taskDetailsEdit) {
      taskDetailsEdit.style.display = "flex";
    }

    let closeDetailsButton = document.getElementById("closeDetailsButton");
    if (closeDetailsButton) {
      closeDetailsButton.style.display = "none";
    }

    if (this.taskDetailsCompareComponent) {
      this.taskDetailsCompareComponent.initView(this.taskDetails)
    }
  }

  closeAllSubWindows() {
    let tableOverviewDiv = document.getElementById("task-overview-div");
    if (tableOverviewDiv) {
      tableOverviewDiv.style.display = "unset";
    }

    let taskDetailsEdit = document.getElementById("task-details-edit-div")
    if (taskDetailsEdit) {
      taskDetailsEdit.style.display = "none";
    }

    let tableDetailsDiv = document.getElementById("task-details-div")
    if (tableDetailsDiv) {
      tableDetailsDiv.style.display = "none";
    }
    let taskDetailsCompare = document.getElementById("task-details-compare-div")
    if (taskDetailsCompare) {
      taskDetailsCompare.style.display = "none";
    }
  }

  destroyCharts() {
    if (this.mcOptionChart && this.mcOptionChart.canvas !== null) {
      this.mcOptionChart.destroy();
    }
    if (this.taskStatsChart && this.taskStatsChart.canvas !== null) {
      this.taskStatsChart.destroy();
    }
    if (this.taskDiscriminationChart && this.taskDiscriminationChart.canvas !== null) {
      this.taskDiscriminationChart.destroy();
    }
  }
}
