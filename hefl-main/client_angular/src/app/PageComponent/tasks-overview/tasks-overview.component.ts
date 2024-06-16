import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TasksOverviewService } from 'src/app/Services/tasks-overview/tasks-overview.service';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { MatSort } from '@angular/material/sort';
import { Chart } from 'chart.js/auto';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-tasks-overview',
  templateUrl: './tasks-overview.component.html',
  styleUrls: ['./tasks-overview.component.scss'],
})
export class TasksOverviewComponent {
  @ViewChild('taskDetails') taskDetailsComponent?: TaskDetailsComponent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  taskList: any;
  displayedColumns: string[] = [];
  filterOptions: any[] = [];
  dataSource: any;
  selectedFilterOption: any;
  previousFilterOption: any;
  currentTab: any;

  userTries: any;
  userTriesTip: any;
  taskDifficulty: any;
  taskDifficultyCorrected: any;
  taskDifficultyTip: any;
  taskDiscriminationFull: any;
  taskDiscriminationConceptNode: any;
  taskDiscriminationTip: any;
  selectedMCQuestionId: any;

  userTriesChart: any;
  taskDifficultyChart: any;
  taskDiscriminationChart: any;

  constructor(private tasksDataService: TasksOverviewService) { this.currentTab = 0; this.initView(); }

  /**
   * initialize task-overview by pulling data from api
   */
  initView() {
    this.userTries = [];
    this.taskDifficulty = [];
    this.taskDifficultyCorrected = [];
    this.taskDiscriminationFull = [];
    this.taskDiscriminationConceptNode = [];
    this.selectedMCQuestionId = "";

    //please fix multiline tooltips angular material - \n, &#13;, <br>, white-space:pre-line; - nothing works
    this.userTriesTip = "Each bar represents the amount of tries accumulated by all students over all tries per question";
    this.taskDifficultyTip = `The difficulty index is calculated as follows:
    The sum of the points achieved by each student is divided by multiplying the number of attempts by the maximum achievable score.
    The corrected index subtracts from the number of points achieved in the numerator the division of the number of points not achieved divided by the number of incorrect answer options.
    The most desired value is 50 
    `;
    this.taskDiscriminationTip = `The task discrimination represents the correlation coefficient of a task in the corresponding contexts.
    Full means that the task is viewed and evaluated in the context of all tasks in the system. Per concept node means that the calculations only take place on the basis of the questions of the corresponding concept node. 
    Desired values are between 0.4 and 0.7, values near 0 need to be adjusted as soon as possible`;
    
    /**
     * TODO: get global user_id, user_cookie of current logged in user
     * TODO: should task-overview api be restricted to certain roles only? 
     * if yes: add validateAdmin() method to verify user (seek task-details-edit nestjs controller for example code)
     */
    let userData = {
      user_id: 1,
      user_cookie: "user_cookie"
    }
    this.taskList = this.tasksDataService.getTaskList(userData);

    this.taskList.subscribe((x: any) => {
      this.setAnalytics(x.taskOverviewAnalytics);
      this.setTaskOverviewTab(x.allQuestionsObj);
    });
  }

  /**
   * set all analytics diagrams
   * @param taskAnalytics 
   */
  setAnalytics(taskAnalytics: any) {
    this.selectedFilterOption = (this.selectedFilterOption !== undefined) ? this.selectedFilterOption : "";
    if (this.selectedFilterOption === "") {
      taskAnalytics.forEach((element: any) => {
        this.userTries.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.count, question_text: element.question_text });
        this.taskDifficulty.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDifficulty, question_text: element.question_text });
        this.taskDifficultyCorrected.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDifficultyCorrected, question_text: element.question_text });
        this.taskDiscriminationFull.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDiscriminationFull, question_text: element.question_text });
        this.taskDiscriminationConceptNode.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDiscriminationConceptNode, question_text: element.question_text });
      });
    } else {
      taskAnalytics.forEach((element: any) => {
        if (element.conceptNodeName == this.selectedFilterOption) {
          this.userTries.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.count, question_text: element.question_text });
          this.taskDifficulty.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDifficulty, question_text: element.question_text });
          this.taskDifficultyCorrected.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDifficultyCorrected, question_text: element.question_text });
          this.taskDiscriminationFull.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDiscriminationFull, question_text: element.question_text });
          this.taskDiscriminationConceptNode.push({ mcQuestionId: element.mcQuestion_id, y_variable: element.itemDiscriminationConceptNode, question_text: element.question_text });
        }
      });
    }

    switch (this.currentTab) {
      case 0:
        this.userTriesChart = this.initAnalyticsCharts(this.userTriesChart, [this.userTries], "userTries", ["User Tries"]);
        break;
      case 1:
        this.taskDifficultyChart = this.initAnalyticsCharts(this.taskDifficultyChart, [this.taskDifficulty, this.taskDifficultyCorrected], "taskDifficulty", ["Difficulty", "Difficulty Corrected"]);
        break;
      case 2:
        this.taskDiscriminationChart = this.initAnalyticsCharts(this.taskDiscriminationChart, [this.taskDiscriminationFull, this.taskDiscriminationConceptNode], "taskDiscrimination", ["Discrimination Full", "Discrimination per ConceptNode"]);
        break;
      default:
        break;
    }
  }

  /**
   * init the actual chart
   * @param chartVar 
   * @param mcOptions 
   * @param chartName 
   * @param displayedChartNames 
   * @returns 
   */
  initAnalyticsCharts(chartVar: Chart<"bar", any[], any>, mcOptions: any[], chartName: string, displayedChartNames: any[]) {
    if (chartVar !== undefined) {
      chartVar.destroy();
    }

    let dataSets = [];
    let labels: any[] = [];
    let labelText: any[] = [];

    for (let i = 0; i < mcOptions.length; i++) {
      let data: any[] = [];
      mcOptions[i].forEach((element: { mcQuestionId: any; y_variable: any; question_text: string; }) => {
        if (i == 0) {
          labels.push(["Question ID: " + element.mcQuestionId]);
          labelText.push(element.question_text);
        }
        data.push(element.y_variable);
      });
      let temp = {
        label: displayedChartNames[i],
        data: data,
        backgroundColor: (i == 0) ? '#3f51b5' : '#b5a33f'
      }
      dataSets.push(temp)
    }

    chartVar = new Chart(chartName, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataSets
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          legend: {
            display: true,
            onClick: () => { },
            labels: {
              font: {
                size: 30
              }
            }
          },
          tooltip: {
            callbacks: {
              title: function (tooltipItem: any) {
                return labelText[tooltipItem[0].dataIndex];
              },

            }
          }
        },
        onClick: (event, elements) => {
          const label = labels[elements[0].index][0];
          this.switchTab(label.match(/Question ID: (\d+)/)[1]);
        }
      },
    });
    return chartVar;
  }

  /**
   * init the task-table which displays the MCQuestion objects with the details button
   * @param x 
   */
  setTaskOverviewTab(x: any[]) {
    this.selectedFilterOption = (this.selectedFilterOption !== undefined) ? this.selectedFilterOption : "";
    if (this.selectedFilterOption === "") {
      this.dataSource = new MatTableDataSource(x);
    } else {
      let tempArr = x.filter(obj => obj["Concept Node"] === this.selectedFilterOption);
      this.dataSource = new MatTableDataSource(tempArr);
    }
    this.paginator.pageSize = 15;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.filterOptions = this.setFilterOptions(x);

    this.displayedColumns = Object.keys(x[0]);
  }

  /**
   * when triggered save the clicked MCQuestion id and swap to the task-table tab to display the details
   * @param mcQuestionId 
   */
  switchTab(mcQuestionId: number) {
    this.selectedMCQuestionId = mcQuestionId
    this.tabGroup.selectedIndex = 3;
  }

  /**
   * this function handles the tab change event
   * @param event 
   */
  onTabChange(event: MatTabChangeEvent): void {
    if (this.taskDetailsComponent) {
      this.taskDetailsComponent.closeAllSubWindows();
    }
    this.currentTab = event.index;
    switch (event.index) {
      case 0:
        this.userTriesChart = this.initAnalyticsCharts(this.userTriesChart, [this.userTries], "userTries", ["User Tries"]);
        break;
      case 1:
        this.taskDifficultyChart = this.initAnalyticsCharts(this.taskDifficultyChart, [this.taskDifficulty, this.taskDifficultyCorrected], "taskDifficulty", ["Difficulty", "Difficulty Corrected"]);
        break;
      case 2:
        this.taskDiscriminationChart = this.initAnalyticsCharts(this.taskDiscriminationChart, [this.taskDiscriminationFull, this.taskDiscriminationConceptNode], "taskDiscrimination", ["Discrimination Full", "Discrimination per ConceptNode"]);
        break;

      default:
        break;
    }
    if (this.selectedMCQuestionId != "") {
      this.openDetail(this.selectedMCQuestionId);
      this.selectedMCQuestionId = "";
    }
  }

  /**
   * get all possible concept node-names for filter usage
   */
  setFilterOptions(taskDetails: any[]) {
    let tempArr: any[] = [];
    taskDetails.forEach((element: any) => {
      if (!tempArr.includes(element["Concept Node"])) {
        tempArr.push(element["Concept Node"]);
      }
    });
    return tempArr;
  }

  /**
   * change the displayed questions based on the (de-)selected filter
   */
  onFilterChange() {
    if (this.selectedFilterOption === this.previousFilterOption) {
      this.selectedFilterOption = "";
    }
    this.previousFilterOption = this.selectedFilterOption;

    this.refreshView();
  }

  /**
   * refresh overview, after editing question-details
   */
  refreshView() {
    this.initView()
  }

  /**
   * display question details
   * @param mcQuestionId 
   */
  openDetail(mcQuestionId: number) {
    if (this.taskDetailsComponent) {
      this.taskDetailsComponent.closeAllSubWindows();
    }
    if (this.taskDetailsComponent) {
      this.taskDetailsComponent.initView(mcQuestionId)
    }
    let tableOverviewDiv = document.getElementById("task-overview-div");
    if (tableOverviewDiv) {
      tableOverviewDiv.style.display = "none";
    }
    let tableDetailsDiv = document.getElementById("task-details-div")
    if (tableDetailsDiv) {
      tableDetailsDiv.style.display = "unset";
    }
  }
}

