import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskDetailsAnalyticsService {

  constructor(private http: HttpClient) { }

  /**
   * 
   * @param questionDetails 
   * user_id, user_cookie, mcQuestionId
   * @returns taskDifficultyIndex, taskDifficultyVariance, taskGuessProbability
   */
  getTaskAnalytics(questionDetails: {}) {
    return this.http.post(environment.server + "/task-details-analytics/", questionDetails);
  }
}
