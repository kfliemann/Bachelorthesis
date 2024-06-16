import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskDetailsEditService {

  constructor(private http: HttpClient) { }

  /**
   * 
   * @param questionData 
   * mcQuestion_id, user_id, user_cookie, name, text, descr, conceptNode_id
   * @returns mcQuestionId
   */
  updateQuestion(questionData: []) {
    return this.http.post(environment.server + "/task-details-edit/update-question/", questionData);
  }

  /**
   * 
   * @param mcOptionsData 
   * user_id, user_cookie, mcOptions [mcOption_createdAt, mcOption_id, mcOption_isCorrect, mcOption_score, mcOption_text, is_new(only for new mcoptions) 
   * @returns mcQuestionId
   */
  updateMCOptions(mcOptionsData: {}) {
    return this.http.post(environment.server + "/task-details-edit/update-mcoptions/", mcOptionsData);
  }

}
