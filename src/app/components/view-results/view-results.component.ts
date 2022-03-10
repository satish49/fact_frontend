import { Component, OnInit, OnDestroy } from "@angular/core";
import * as moment from "moment";
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { ParentChildrenService } from "src/app/services/parent-children.service";
import { NotifierService } from "angular-notifier";
import { Router } from "@angular/router";

@Component({
  selector: "app-view-results",
  templateUrl: "./view-results.component.html",
  styleUrls: ["./view-results.component.scss"],
})
export class ViewResultsComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  userName = "";
  tests = [];
  children = [];
  selectedChildren = "0";
  students = [];
  selectedStudent;
  searchClicked = false;
  noDataFound = false;
  parentChildrenIndexSubscription: Subscription;
  parentChildrenArraySubscription: Subscription;
  private readonly notifier: NotifierService;

  constructor(
    private httpClient: HttpClient,
    private parentChildrenService: ParentChildrenService,
    private notifierService: NotifierService,
    private router: Router
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.role === localStorage.roleId;
    this.noDataFound = false;
    if (localStorage.roleId === "3") {
      this.userName = localStorage.userName;
    }
    if (localStorage.roleId === "4") {
      this.parentChildrenArraySubscription = this.parentChildrenService.children.subscribe(
        (children) => {
          console.log(children);
          this.children = children;
        }
      );
      this.parentChildrenIndexSubscription = this.parentChildrenService.selectedChildren.subscribe(
        (index) => {
          console.log(index);
          this.selectedChildren = index;
        }
      );
    }
    if (this.children.length > 0) {
      this.userName = this.children[this.selectedChildren]["first_name"];
    }
    if (
      localStorage.roleId === "3" ||
      (localStorage.roleId === "4" && this.children.length > 0)
    ) {
      this.httpClient
        .get(
          `/api/get_student_score?student_id=${
            localStorage.roleId === "3"
              ? localStorage.userId
              : this.children[this.selectedChildren]["student_id"]
          }`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          }
        )
        .subscribe(
          (response) => {
            console.log(response);
            this.tests = JSON.parse(response["data"]);
            this.tests.sort((a, b) =>
              a["test_date"] > b["test_date"] ? -1 : 1
            );
            this.noDataFound = false;
            console.log(this.tests);
          },
          (error) => {
            console.log(error);
            this.noDataFound = true;
          }
        );
    } else if (localStorage.roleId === "4" && this.children.length === 0) {
      this.httpClient
        .get("/api/get_childrens", {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
          responseType: "json",
        })
        .subscribe(
          (response) => {
            console.log(response);
            this.parentChildrenService.setChildren(response);
            this.getReports(response[this.selectedChildren]["student_id"]);
            if (response["length"] > 0) {
              this.userName = this.children[0]["first_name"];
            }
          },
          (error) => {
            console.log(error);
          }
        );
    } else if (localStorage.roleId === "1" || localStorage.roleId === "2") {
      this.httpClient
        .get("/api/get_all_students", {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
        .subscribe(
          (response) => {
            console.log(response);
            const students = JSON.parse(response["data"]);
            console.log([...students]);
            for (let i = 0; i < students.length; i++) {
              students[i]["name"] =
                students[i]["first_name"] + " " + students[i]["last_name"];
            }
            console.log([...students]);
            this.students = students;
            console.log(this.students);
          },
          (error) => {
            console.log(error);
            this.notifier.notify("error", "Unable to fetch Students");
          }
        );
    }
  }

  getReportsForSelectedUser() {
    console.log(this.selectedStudent);
    console.log(this.students);
    if (this.selectedStudent) {
      this.getReports(this.selectedStudent["student_id"]);
    } else {
      this.notifier.notify("warning", "Please select a student");
    }
  }

  selectStudent(student) {
    this.selectedStudent = { ...student };
  }

  onChangeSearch(student) {
    this.selectedStudent = null;
  }

  getDate(date) {
    // console.log(moment(date));
    return moment(date).format("MMMM DD, YYYY");
  }

  getReports(student_id) {
    if (!this.searchClicked) {
      this.searchClicked = true;
      this.httpClient
        .get(`/api/get_student_score?student_id=${student_id}`, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
        .subscribe(
          (response) => {
            console.log(response);
            this.tests = JSON.parse(response["data"]);
            this.tests.sort((a, b) =>
              a["test_date"] > b["test_date"] ? -1 : 1
            );
            this.searchClicked = false;
            this.noDataFound = false;
            console.log(this.tests);
          },
          (error) => {
            console.log(error);
            this.searchClicked = false;
            this.noDataFound = true;
          }
        );
    }
  }

  round(number) {
    return Math.round(number);
  }

  goToReport(index: number) {
    // this.router.navigate([
    //   `/report?student_id=${
    //     localStorage.roleId === "3"
    //       ? localStorage.userId
    //       : localStorage.roleId === "4"
    //       ? this.children[this.selectedChildren]["student_id"]
    //       : this.selectedStudent["student_id"]
    //   }&test_id=${this.tests[index]["test_id"]}&test_date=${moment(
    //     this.tests[index]["test_date"]
    //   ).format("DD-MM-YYYY")}`,
    // ]);
    this.router.navigate(["/report"], {
      queryParams: {
        student_id:
          localStorage.roleId === "3"
            ? localStorage.userId
            : localStorage.roleId === "4"
            ? this.children[this.selectedChildren]["student_id"]
            : this.selectedStudent["student_id"],
        test_id: this.tests[index]["test_id"],
        test_date: moment(this.tests[index]["test_date"]).format("DD-MM-YYYY"),
      },
    });
  }

  ngOnDestroy() {
    if (this.parentChildrenIndexSubscription) {
      this.parentChildrenIndexSubscription.unsubscribe();
    }
    if (this.parentChildrenArraySubscription) {
      this.parentChildrenArraySubscription.unsubscribe();
    }
  }
}
