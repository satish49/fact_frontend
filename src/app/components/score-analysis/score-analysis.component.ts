import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { NotifierService } from "angular-notifier";
import { Subscription } from "rxjs";
import { ActivatedRoute, Params } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { MatTableDataSource, MatPaginator, MatSort } from "@angular/material";
import { FormControl, Validators } from "@angular/forms";
import * as moment from "moment";

@Component({
  selector: "app-score-analysis",
  templateUrl: "./score-analysis.component.html",
  styleUrls: ["./score-analysis.component.scss"],
})
export class ScoreAnalysisComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  testId = null;
  testType = "";
  testCode = "";
  scores = new MatTableDataSource([]);
  columnsToDisplay = [
    "student",
    "date",
    "reading",
    "writing",
    "readingAndWriting",
    "math",
    "total",
  ];
  fromDate = new FormControl(null, [Validators.required]);
  toDate = new FormControl(null, [Validators.required]);
  searchClicked = false;
  searchError = false;
  paramSubscription: Subscription;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
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
            console.log(response);
            this.testType = response[0]["testTypeName"];
            this.testCode = response[0]["testCode"];
          },
          (error) => {
            console.log(error);
            this.notifier.notify("error", "Unable to fetch test details");
          }
        );
    });
  }

  getDate(date) {
    return moment(date).format("MM-DD-YYYY");
  }

  searchQuestions() {
    if (!this.searchClicked) {
      this.searchClicked = true;
      this.searchError = false;
      let errorOccurred = false;
      if (this.fromDate["invalid"] || this.toDate["invalid"]) {
        errorOccurred = true;
      }
      this.searchError = errorOccurred;
      if (!errorOccurred) {
        const fromDate = moment(this.fromDate["value"]).format("MM-DD-YYYY");
        const toDate = moment(this.toDate["value"]).format("MM-DD-YYYY");
        this.httpClient
          .get(
            `/api/analyze_test_scores?testId=${this.testId}&fromDate=${fromDate}&toDate=${toDate}`,
            {
              headers: {
                Authorization: "Bearer " + localStorage.accessToken,
              },
            }
          )
          .subscribe(
            (response) => {
              console.log(response);
              this.searchClicked = false;
              console.log(JSON.parse(response["data"]));
              const data = JSON.parse(response["data"]);
              const scores = data["scores"];
              const scoringSections = data["scoringSections"];
              const uniqueStudentTests = [];
              for (let i = 0; i < scores["length"]; i++) {
                const studentTestIndex = uniqueStudentTests.findIndex(
                  (studentTest) =>
                    studentTest["studentTestId"] === scores[i]["studentTestId"]
                );
                const score = { ...scores[i] };
                if (studentTestIndex < 0) {
                  const sections = {};
                  sections[score["scoringSectionId"]] = {
                    scoringSectionId: score["scoringSectionId"],
                    score: score["score"],
                    scoringSectionName:
                      scoringSections[score["scoringSectionId"]],
                  };
                  uniqueStudentTests.push({
                    studentTestId: score["studentTestId"],
                    studentName: score["studentName"],
                    studentId: score["studentId"],
                    testDate: score["testDate"],
                    sections,
                  });
                } else {
                  uniqueStudentTests[studentTestIndex]["sections"][
                    score["scoringSectionId"]
                  ] = {
                    scoringSectionId: score["scoringSectionId"],
                    score: score["score"],
                    scoringSectionName:
                      scoringSections[score["scoringSectionId"]],
                  };
                }
              }
              console.log(uniqueStudentTests);
              const originialData = [];
              for (let i = 0; i < uniqueStudentTests["length"]; i++) {
                const studentTest = { ...uniqueStudentTests[i] };
                studentTest["readingAndWriting"] =
                  studentTest["sections"][1]["score"] +
                  studentTest["sections"][2]["score"];
                studentTest["math"] = studentTest["sections"][3]["score"];
                studentTest["total"] =
                  studentTest["sections"][1]["score"] +
                  studentTest["sections"][2]["score"] +
                  studentTest["sections"][3]["score"];
                originialData.push(studentTest);
              }
              originialData.sort((first, second) =>
                first["total"] < second["total"] ? 1 : -1
              );
              console.log(originialData);
              this.scores = new MatTableDataSource(originialData);
              this.scores.paginator = this.paginator;
              this.scores.sortingDataAccessor = (item, property) => {
                console.log(item, property);
                switch (property) {
                  case "reading":
                    return item["sections"][1]["score"];
                  case "writing":
                    return item["sections"][2]["score"];
                  default:
                    return item[property];
                }
              };
              this.scores.sort = this.sort;
            },
            (error) => {
              console.log(error);
              this.searchClicked = false;
              this.notifier.notify("error", "No Question Data Found");
            }
          );
      } else {
        this.searchClicked = false;
      }
    }
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }
}
