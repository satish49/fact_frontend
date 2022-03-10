import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { CommonModule, DecimalPipe } from "@angular/common";
import { BsDropdownModule } from "ngx-bootstrap";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";

import { AppComponent } from "./app.component";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material";
import { MatSortModule } from "@angular/material/sort";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
// import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { SelectAutocompleteModule } from "mat-select-autocomplete";
import { AutocompleteLibModule } from "angular-ng-autocomplete";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { PopoverModule } from "ngx-smart-popover";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { MultiSelectModule } from "primeng-lts/multiselect";
import { AccordionModule } from "primeng-lts/accordion";
import { OverlayPanelModule } from "primeng-lts/overlaypanel";
import { AutoCompleteModule } from "primeng-lts/autocomplete";
import { InputSwitchModule } from "primeng-lts/inputswitch";
import { SelectButtonModule } from "primeng-lts/selectbutton";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DropdownModule } from 'primeng-lts/dropdown';
import { TreeModule } from 'primeng-lts/tree';
import { DialogModule } from 'primeng-lts/dialog';
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { CarouselModule } from 'primeng-lts/carousel';
import { TreeTableModule } from 'primeng-lts/treetable';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { LoginComponent } from "./components/login/login.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NotifierModule, NotifierOptions } from "angular-notifier";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { UsersComponent } from "./components/users/users.component";
import { HttpInterceptorService } from "./http-interceptor.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ErrorComponent } from "./components/error/error.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TermsComponent } from "./components/terms/terms.component";
import { UserDetailsComponent } from "./components/user-details/user-details.component";
import { OurTeamComponent } from "./components/our-team/our-team.component";
import { UploadAnswerComponent } from "./components/upload-answer/upload-answer.component";
import { CommonHeaderComponent } from "./components/common-header/common-header.component";
import { CommonService } from "./services/common.service";
import { ParentChildrenService } from "./services/parent-children.service";
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
import { InfoPopupComponent } from "./components/info-popup/info-popup.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { CompletedTestComponent } from "./components/completed-test/completed-test.component";
import { ScoreAnalysisComponent } from "./components/score-analysis/score-analysis.component";
import { NewLandingPageComponent } from "./components/new-landing-page/new-landing-page.component";
import { StudentCreationComponent } from "./components/student-creation/student-creation.component";
import { PaymentComponent } from "./components/payment/payment.component";
import { NotesComponent } from "./components/notes/notes.component";
import { StudentClassesComponent } from "./components/student-classes/student-classes.component";
import { ManageCourseMaterialComponent } from "./components/manage-course-material/manage-course-material.component";
import { ManageCourseMaterialContainerComponent } from './components/manage-course-material-container/manage-course-material-container.component';
import { AssignCourseMaterialComponent } from './components/assign-course-material/assign-course-material.component';
import { StudentMaterialComponent } from './components/student-material/student-material.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

/**
 * Custom angular notifier options
 */
const customNotifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "right",
      distance: 12,
    },
    vertical: {
      position: "top",
      distance: 12,
      gap: 10,
    },
  },
  theme: "material",
  behaviour: {
    autoHide: 5000,
    onClick: "hide",
    onMouseover: "pauseAutoHide",
    showDismissButton: true,
    stacking: 4,
  },
  animations: {
    enabled: true,
    show: {
      preset: "slide",
      speed: 300,
      easing: "ease",
    },
    hide: {
      preset: "fade",
      speed: 300,
      easing: "ease",
      offset: 50,
    },
    shift: {
      speed: 300,
      easing: "ease",
    },
    overlap: 150,
  },
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingPageComponent,
    LoginComponent,
    UserProfileComponent,
    DashboardComponent,
    UsersComponent,
    ErrorComponent,
    TermsComponent,
    UserDetailsComponent,
    OurTeamComponent,
    UploadAnswerComponent,
    CommonHeaderComponent,
    ViewResultsComponent,
    ReportComponent,
    ReportAnalysisComponent,
    ReportErrorLogComponent,
    QandaComponent,
    AnswerKeyComponent,
    TopicComponent,
    OnlineTestComponent,
    ListOfTestsComponent,
    AssignTestComponent,
    ClassesComponent,
    BatchComponent,
    InfoPopupComponent,
    NotificationComponent,
    CompletedTestComponent,
    ScoreAnalysisComponent,
    NewLandingPageComponent,
    StudentCreationComponent,
    PaymentComponent,
    NotesComponent,
    StudentClassesComponent,
    ManageCourseMaterialComponent,
    ManageCourseMaterialContainerComponent,
    AssignCourseMaterialComponent,
    StudentMaterialComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatIconModule,
    HttpClientModule,
    NotifierModule.withConfig(customNotifierOptions),
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule,
    MatAutocompleteModule,
    PopoverModule,
    SelectAutocompleteModule,
    AutocompleteLibModule,
    BsDropdownModule.forRoot(),
    NgxIntlTelInputModule,
    BrowserAnimationsModule,
    NgxMaterialTimepickerModule,
    AngularEditorModule,
    MultiSelectModule,
    AccordionModule,
    OverlayPanelModule,
    AutoCompleteModule,
    InputSwitchModule,
    SelectButtonModule,
    MatTooltipModule,
    MatChipsModule,
    DropdownModule,
    TreeModule,
    DialogModule,
    NgxDocViewerModule,
    CarouselModule,
    TreeTableModule,
    PdfViewerModule,
    MatProgressSpinnerModule
  ],
  providers: [
    CommonService,
    DecimalPipe,
    ParentChildrenService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
