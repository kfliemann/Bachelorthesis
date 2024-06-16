import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskDetailsService {

  constructor(private http: HttpClient) { }

  /**
   * @param questionDetails 
   * user_id, user_cookie, mcQuestionId
   * @returns taskDetails
   * mcQuestion_id, mcOption_details, question_name, question_type, question_types, 
   * question_version, isApproved, correct_mcOptions, question_descr, question_text, question_score, 
   * answered_total, correct_answered_count, incorrect_answered_count, num_quote, versions, selected_version, newestQuestionVersion,
   * conceptNode_name, conceptNode_id,
   */
  getTaskDetails(questionDetails: {}) {
    return this.http.post(environment.server + "/task-details/", questionDetails);
  }

  /**
   * @param mcQuestionId 
   * @returns boolean (true if successful, false if error)
   */
  approveQuestion(mcQuestionId: number) {
    return this.http.get(environment.server + "/task-details/" + mcQuestionId);
  }
}
