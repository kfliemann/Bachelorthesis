import "reflect-metadata"
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './Modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Components
import { GraphComponent } from './Pages/graph/graph.component';
import { ContentBoardComponent } from './Pages/contentBoard/contentBoard.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { ConceptOverviewComponent } from './Pages/conceptOverview/conceptOverview.component';
import { DiscussionComponent } from './Pages/discussion/discussion.component';
import { CodeTaskComponent } from './Pages/contentView/contentElement/codeTask/codeTask.component';
import { PdfViewerComponent } from './Pages/contentView/contentElement/pdfViewer/pdfViewer.component';
import { McQuizComponent } from './Pages/contentView/contentElement/mcQuiz/mcQuiz.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { FileUploadComponent } from './Pages/test/file-upload/file-upload.component';
import { ContentViewComponent } from './Pages/contentView/contentView.component';
import { CreateConceptDialogComponent } from './Pages/graph/graph-dialogs/create-concept-dialog/create-concept-dialog.component';
import { VideoViewerComponent } from './Pages/contentView/contentElement/videoViewer/videoViewer.component';
import { CompetenciesComponent } from './Pages/competencies/competencies.component';
import { AnalyticsBoardComponent } from './Pages/analytics-board/analytics-board.component';
import { TasksOverviewComponent } from './PageComponent/tasks-overview/tasks-overview.component';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort"; 
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TaskDetailsComponent } from './PageComponent/task-details/task-details.component';
import { QuestionFilterComponent } from './Pages/discussion/question-filter/question-filter.component';
import { QuestionOverviewComponent } from './Pages/discussion/question-overview/question-overview.component';
import { QuestionComponent } from './Pages/discussion/question-overview/question/question.component';
import { VoteBoxComponent } from './Pages/discussion/vote-box/vote-box.component';
import { FilterMenuComponent } from './Pages/discussion/question-filter/filter-menu/filter-menu.component';
import { DiscussionPageComponent } from './Pages/discussion/discussion-page/discussion-page.component';
import { QuestionCreationComponent } from './Pages/discussion/question-creation/question-creation.component';
import { DiscussionPageQuestionComponent } from './Pages/discussion/discussion-page/discussion-page-question/discussion-page-question.component';
import { DiscussionPageCommentComponent } from './Pages/discussion/discussion-page/discussion-page-comment/discussion-page-comment.component';
import { TaskDetailsEditComponent } from './PageComponent/task-details-edit/task-details-edit.component';
import { TaskDetailsCompareComponent } from './PageComponent/task-details-compare/task-details-compare.component';
import { TaskDetailsMonacoComponent } from './PageComponent/task-details-monaco/task-details-monaco.component';
import { MonacoEditorModule } from "ngx-monaco-editor-v2";



@NgModule({
  declarations: [
    AppComponent,
    ContentBoardComponent,
    DashboardComponent,
    ConceptOverviewComponent,
    DiscussionComponent,
    CodeTaskComponent,
    PdfViewerComponent,
    McQuizComponent,
    GraphComponent,
    FileUploadComponent,
    ContentViewComponent,
    CreateConceptDialogComponent,
    VideoViewerComponent,
    CompetenciesComponent,
    AnalyticsBoardComponent,
    TasksOverviewComponent,
    TaskDetailsComponent,
    QuestionFilterComponent,
    QuestionOverviewComponent,
    QuestionComponent,
    VoteBoxComponent,
    FilterMenuComponent,
    DiscussionPageComponent,
    QuestionCreationComponent,
    DiscussionPageQuestionComponent,
    DiscussionPageCommentComponent,
    TaskDetailsEditComponent,
    TaskDetailsCompareComponent,
    TaskDetailsMonacoComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    NgxExtendedPdfViewerModule,
    HttpClientModule,
    MatPaginatorModule,
    MatSortModule,
    MonacoEditorModule.forRoot(),
    MatTooltipModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
