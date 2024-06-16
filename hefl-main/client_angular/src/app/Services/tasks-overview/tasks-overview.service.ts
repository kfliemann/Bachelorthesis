import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksOverviewService {

  constructor(private http: HttpClient) { }

 /**
  * @param userData 
  * user_id, user_cookie
  * @returns QuestionOverview
  * the data has been remapped to make it easier to autogenerate the table with the corresponding columns
  * question_id, mcQuestion_id, "Question Name", "Question Description", "Score", "Version", "Answered Overall", "Quota"
  */
  getTaskList(userData: {}) {
    return this.http.post(environment.server + "/tasks-overview/task-list/", userData);
  }
}
