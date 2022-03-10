import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { ActivatedRoute, Params } from "@angular/router";
import { NotifierService } from "angular-notifier";
import { MatTableDataSource, MatPaginator } from "@angular/material";
import { Validators, FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment";

@Component({
  selector: "app-completed-test",
  templateUrl: "./completed-test.component.html",
  styleUrls: ["./completed-test.component.scss"],
})
export class CompletedTestComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  testId = null;
  questions = new MatTableDataSource([]);
  columnsToDisplay = [
    "sno",
    "student",
    "section",
    "qid",
    "correct_answer",
    "actual_answer",
  ];
  fromDate = new FormControl(null, [Validators.required]);
  toDate = new FormControl(null, [Validators.required]);
  questionsArray = [];
  batches = [];
  testType = "";
  testCode = "";
  sections = [];
  students = [];
  searchedStudents = [];
  selectedSection = 0;
  selectedAnswerType = 0;
  selectedQuestion = 1;
  searchClicked = false;
  searchError = false;
  originalQuestions = [];
  selectedSectionName = "";
  dateDrillDown = true;
  batchDrillDown = true;
  studentsDrillDown = true;
  sectionsDrillDown = true;
  drillDown = true;
  paramSubscription: Subscription;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private readonly notifier: NotifierService;
  constructor(
    private route: ActivatedRoute,
    notifierService: NotifierService,
    private httpClient: HttpClient
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.paramSubscription = this.route.params.subscribe((params: Params) => {
      this.testId = params.testId;
      this.httpClient
        .get(`/api/test_details?testId=${this.testId}`, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
        .subscribe(
          (response: any) => {
            this.testType = response[0]["testTypeName"];
            this.testCode = response[0]["testCode"];
            this.sections = response[0]["sections"];
            this.selectedSectionName = this.sections[0]["testSection"];
            this.questionsArray = this.sections[0]["sectionQuestionIds"];
          },
          (error) => {
            this.notifier.notify("error", "Unable to fetch test details");
          }
        );
    });
    this.httpClient
      .get("/api/get_all_batch", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response) => {
          const data = JSON.parse(response["data"]);
          if (data["batches"].length === 0) {
            this.notifier.notify("info", "No batches found");
          }
          this.batches = data["batches"];
        },
        (error) => {
          this.notifier.notify("error", "Unable to fetch batches");
        }
      );
  }

  toggleDrillDown() {
    this.drillDown = !this.drillDown;
  }

  toggleDateDrillDown() {
    this.dateDrillDown = !this.dateDrillDown;
  }

  toggleBatchDrillDown() {
    this.batchDrillDown = !this.batchDrillDown;
  }

  toggleStudentsDrillDown() {
    this.studentsDrillDown = !this.studentsDrillDown;
  }

  toggleSectionsDrillDown() {
    this.sectionsDrillDown = !this.sectionsDrillDown;
  }

  filter() {
    let questions = [...this.originalQuestions];
    questions = questions.filter(
      (question) =>
        question["section_id"] ===
        this.sections[this.selectedSection]["testSectionId"]
    );
    const students = this.searchedStudents
      .filter((student) => student["selected"])
      .map((student) => student["studentId"]);
    questions = questions.filter(
      (question) => students.indexOf(question["student_id"]) > -1
    );
    questions = questions.filter(
      (question) => question["qid"] === this.selectedQuestion
    );
    questions = questions.filter(
      (question) => question["is_correct"] === this.selectedAnswerType
    );
    this.questions = new MatTableDataSource(questions);
    this.questions.paginator = this.paginator;
  }

  getSelectedBatches(batches) {
    const selectedBatches = this.batches.filter(
      (batch) => batches.indexOf(batch["batchId"]) > -1
    );
    let students = [...this.students];
    for (let i = 0; i < selectedBatches["length"]; i++) {
      for (let j = 0; j < selectedBatches[i]["students"]["length"]; j++) {
        if (
          students.findIndex(
            (student) =>
              selectedBatches[i]["students"][j]["studentId"] ===
              student["studentId"]
          ) < 0
        ) {
          students.push({
            ...selectedBatches[i]["students"][j],
            selected: true,
          });
        }
      }
    }
    const unExistingStudentIds = [];
    for (let i = 0; i < students["length"]; i++) {
      let studentExist = false;
      for (let j = 0; j < selectedBatches["length"]; j++) {
        for (let k = 0; k < selectedBatches[j]["students"]["length"]; k++) {
          if (
            students[i]["studentId"] ===
            selectedBatches[j]["students"][k]["studentId"]
          ) {
            studentExist = true;
            break;
          }
        }
        if (studentExist) {
          break;
        }
      }
      if (!studentExist) {
        unExistingStudentIds.push(students[i]["studentId"]);
      }
    }
    students = students.filter(
      (student) => unExistingStudentIds.indexOf(student["studentId"]) < 0
    );
    students.sort((first, second) =>
      first["studentName"] > second["studentName"] ? 1 : -1
    );
    this.students = students;
  }

  onSectionSelection() {
    this.questionsArray = this.sections[this.selectedSection][
      "sectionQuestionIds"
    ];
    this.selectedSectionName = this.sections[this.selectedSection][
      "testSection"
    ];
    if (this.questionsArray["length"] < this.selectedQuestion) {
      this.selectedQuestion = this.questionsArray["length"];
    }
    this.filter();
  }

  changeSelectedQuestion(question) {
    this.selectedQuestion = question;
    this.filter();
  }

  searchQuestions() {
    if (!this.searchClicked) {
      this.searchClicked = true;
      this.searchError = false;
      let errorOccurred = false;
      if (this.fromDate["invalid"] || this.toDate["invalid"]) {
        errorOccurred = true;
      } else if (this.students["length"] === 0) {
        errorOccurred = true;
      }
      this.searchError = errorOccurred;
      if (!errorOccurred) {
        const data = {
          testId: parseInt(this.testId),
          fromDate: moment(this.fromDate["value"]).format("MM-DD-YYYY"),
          toDate: moment(this.toDate["value"]).format("MM-DD-YYYY"),
          students: this.students.map((student) => student["studentId"]),
        };
        this.httpClient
          .post(`/api/analyze_test`, data, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          })
          .subscribe(
            (response) => {
              this.searchClicked = false;
              this.searchedStudents = [...this.students];
              this.originalQuestions = JSON.parse(response["data"]);
              this.filter();
            },
            (error) => {
              this.searchClicked = false;
              this.notifier.notify("error", "No Question Data Found");
            }
          );
      } else {
        this.searchClicked = false;
      }
    }
  }

  selectOrUnSelectAll(selectType) {
    for (let i = 0; i < this.searchedStudents["length"]; i++) {
      this.searchedStudents[i]["selected"] = selectType;
    }
    this.filter();
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }
}
