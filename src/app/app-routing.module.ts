import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { LoginComponent } from "./components/login/login.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import {
  AuthGuard,
  UnAuthGuard,
  RoleSelectGuard,
  AdminGuard,
  UserGuard,
  NonRoleSelectGuard,
  AdminOrTutorGuard,
  StudentGuard,
} from "./auth.guard";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { UsersComponent } from "./components/users/users.component";
import { ErrorComponent } from "./components/error/error.component";
import { TermsComponent } from "./components/terms/terms.component";
import { UserDetailsComponent } from "./components/user-details/user-details.component";
import { OurTeamComponent } from "./components/our-team/our-team.component";
import { UploadAnswerComponent } from "./components/upload-answer/upload-answer.component";
import { ViewResultsComponent } from "./components/view-results/view-results.component";
import { ReportComponent } from "./components/report/report.component";
import { ReportAnalysisComponent } from "./components/report-analysis/report-analysis.component";
import { ReportErrorLogComponent } from "./components/report-error-log/report-error-log.component";
import { QandaComponent } from "./components/qanda/qanda.component";
import { AnswerKeyComponent } from "./components/answer-key/answer-key.component";
import { TopicComponent } from "./components/topic/topic.component";
import { OnlineTestComponent } from "./components/online-test/online-test.component";
import { ListOfTestsComponent } from "./components/list-of-tests/list-of-tests.component";
import { AssignTestComponent } from "./components/assign-test/assign-test.component";
import { ClassesComponent } from "./components/classes/classes.component";
import { BatchComponent } from "./components/batch/batch.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { CompletedTestComponent } from "./components/completed-test/completed-test.component";
import { ScoreAnalysisComponent } from "./components/score-analysis/score-analysis.component";
import { NewLandingPageComponent } from "./components/new-landing-page/new-landing-page.component";
import { PaymentComponent } from "./components/payment/payment.component";
import { StudentCreationComponent } from "./components/student-creation/student-creation.component";
import { NotesComponent } from "./components/notes/notes.component";
import { StudentClassesComponent } from "./components/student-classes/student-classes.component";
import { ManageCourseMaterialContainerComponent } from "./components/manage-course-material-container/manage-course-material-container.component";
import { StudentMaterialComponent } from "./components/student-material/student-material.component";

const routes: Routes = [
  {
    path: "",
    canActivate: [UnAuthGuard],
    component: NewLandingPageComponent,
  },
  /*
  {
    path: "our-team",
    canActivate: [UnAuthGuard],
    component: OurTeamComponent,
  },
  */
  {
    path: "dashboard",
    canActivate: [AuthGuard, RoleSelectGuard],
    component: DashboardComponent,
  },
  {
    path: "login",
    canActivate: [UnAuthGuard],
    component: LoginComponent,
  },
  {
    path: "register",
    canActivate: [UnAuthGuard],
    component: LoginComponent,
  },
  {
    path: "role-select",
    canActivate: [AuthGuard, NonRoleSelectGuard],
    component: UserProfileComponent,
  },
  {
    path: "profile",
    canActivate: [AuthGuard, RoleSelectGuard, UserGuard],
    component: UserProfileComponent,
  },
  {
    path: "users",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: UsersComponent,
  },
  {
    path: "user-details/:userId",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: UserDetailsComponent,
  },
  {
    path: "upload-results",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: UploadAnswerComponent,
  },
  {
    path: "view-results",
    canActivate: [AuthGuard, RoleSelectGuard],
    component: ViewResultsComponent,
  },
  {
    path: "report/:studentTestId",
    canActivate: [AuthGuard, RoleSelectGuard],
    component: ReportComponent,
  },
  {
    path: "tests",
    canActivate: [AuthGuard, RoleSelectGuard, AdminOrTutorGuard],
    component: QandaComponent,
  },
  {
    path: "classes",
    canActivate: [AuthGuard, RoleSelectGuard, AdminOrTutorGuard],
    component: ClassesComponent,
  },
  {
    path: "create-batch",
    canActivate: [AuthGuard, RoleSelectGuard, AdminOrTutorGuard],
    component: BatchComponent,
  },
  {
    path: "edit-batch/:batchId",
    canActivate: [AuthGuard, RoleSelectGuard, AdminOrTutorGuard],
    component: BatchComponent,
  },
  {
    path: "topic",
    canActivate: [AuthGuard, RoleSelectGuard, AdminOrTutorGuard],
    component: TopicComponent,
  },
  {
    path: "answer-key/:testId",
    canActivate: [AuthGuard, RoleSelectGuard, AdminOrTutorGuard],
    component: AnswerKeyComponent,
  },
  {
    path: "assign-test/:testId",
    canActivate: [AuthGuard, RoleSelectGuard, AdminOrTutorGuard],
    component: AssignTestComponent,
  },
  {
    path: "list-of-tests",
    canActivate: [AuthGuard, RoleSelectGuard],
    component: ListOfTestsComponent,
  },
  {
    path: "online-test/:studentTestId",
    canActivate: [AuthGuard, RoleSelectGuard],
    component: OnlineTestComponent,
  },
  {
    path: "notification",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: NotificationComponent,
  },
  {
    path: "notes",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: NotesComponent,
  },
  {
    path: "analyze-test/:testId",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: CompletedTestComponent,
  },
  {
    path: "score-analysis/:testId",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: ScoreAnalysisComponent,
  },
  {
    path: "manage-course-material",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: ManageCourseMaterialContainerComponent,
  },
  {
    path: "my-material",
    canActivate: [AuthGuard, RoleSelectGuard, StudentGuard],
    component: StudentMaterialComponent,
  },
  {
    path: "create-student",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: StudentCreationComponent,
  },
  {
    path: "payments",
    canActivate: [AuthGuard, RoleSelectGuard, AdminGuard],
    component: PaymentComponent,
  },
  {
    path: "view-classes",
    canActivate: [AuthGuard, RoleSelectGuard],
    component: StudentClassesComponent,
  },
  {
    path: "terms",
    component: TermsComponent,
  },
  {
    path: "privacy-policy",
    component: TermsComponent,
  },
  {
    path: "error",
    component: LoginComponent,
  },
  {
    path: "**",
    redirectTo: "#/",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
