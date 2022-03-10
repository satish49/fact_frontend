import { Component, OnInit, OnDestroy } from "@angular/core";

import * as moment from "moment";
import { FormControl, FormArray, Validators, FormGroup } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { NotifierService } from "angular-notifier";
import { ActivatedRoute, Params, Router } from "@angular/router";

@Component({
  selector: "app-assign-test",
  templateUrl: "./assign-test.component.html",
  styleUrls: ["./assign-test.component.scss"],
})
export class AssignTestComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  testCode = null;
  testType = null;
  testId = null;
  students = [];
  lastStudentError = false;
  assignClicked = false;
  error = false;
  totalCompleted = null;
  totalAssigned = null;
  isPartialAllowed = false;
  assignedStudents = new FormArray([
    new FormGroup({
      student: new FormControl(null, [Validators.required]),
      dueDate: new FormControl("", [Validators.required]),
    }),
  ]);
  dueBy = new FormControl(null, [Validators.required]);
  fromDate = new FormControl(null, [Validators.required]);
  toDate = new FormControl(null, [Validators.required]);
  selectedType = "0";
  selectedDate = new FormControl();
  batches = [];
  selectedStudents = [];
  selectedBatches = [];
  addedStudents = [];
  addedBatches = [];
  openBatches = [];
  noStudentsError = false;
  searchClicked = false;
  searchError = false;
  studentsForThisTest = [];
  notStartedCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  selectedStatus = 0;
  private readonly notifier: NotifierService;
  paramSubscription: Subscription;

  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.notifier = notifierService;
    this.paramSubscription = this.route.params.subscribe((params: Params) => {
      this.testId = params.testId;
    });
  }

  ngOnInit() {
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

    this.httpClient
      .get(`/api/assignment_count?testId=${this.testId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          const data = JSON.parse(response["data"]);
          this.totalCompleted = data["total_completed"];
          this.totalAssigned = data["total_assigned"];
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch test details");
        }
      );

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
            students[i]["studentName"] =
              students[i]["first_name"] + " " + students[i]["last_name"];
            students[i]["studentId"] = students[i]["student_id"];
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
          this.batches = this.batches.filter(
            (batch) => batch["isBatchActive"] === 1
          );
          for (let i = 0; i < this.batches.length; i++) {
            this.batches[i]["removedStudents"] = [];
            this.batches[i]["allStudentsSelected"] = true;
          }
          console.log(this.batches);
        },
        (error) => {
          this.notifier.notify("error", "Unable to fetch batches");
        }
      );
  }

  selectStudent(student, index) {
    console.log(student);
    this.assignedStudents["controls"][index]["controls"]["student"]["setValue"](
      student
    );
  }

  onChangeSearch(student, index) {
    this.assignedStudents["controls"][index]["controls"]["student"]["setValue"](
      null
    );
  }

  getSelectedStudents(students) {
    this.selectedStudents = students;
  }

  getSelectedBatches(batches) {
    this.selectedBatches = batches;
  }

  addBatchOrStudent() {
    console.log(this.selectedType);
    if (this.selectedType === "0") {
      const newStudents = this.selectedStudents.filter(
        (studentId) => this.addedStudents.indexOf(studentId) < 0
      );
      this.addedStudents = this.addedStudents.concat(newStudents);
    } else {
      const newBatches = this.selectedBatches.filter(
        (batchId) => this.addedBatches.indexOf(batchId) < 0
      );
      this.addedBatches = this.addedBatches.concat(newBatches);
    }
    if (this.error) {
      this.noStudentsError = false;
    }
  }

  noStudentsValidation() {
    let noStudents = false;
    if (
      this.addedBatches["length"] === 0 &&
      this.addedStudents["length"] === 0
    ) {
      noStudents = true;
    } else if (
      this.addedStudents["length"] === 0 &&
      this.addedBatches["length"] > 0
    ) {
      let students = [];
      const batches = this.batches.filter(
        (batch) => this.addedBatches.indexOf(batch["batchId"]) > -1
      );
      console.log(batches);
      for (let i = 0; i < batches["length"]; i++) {
        for (let j = 0; j < batches[i]["students"]["length"]; j++) {
          if (
            batches[i]["removedStudents"].indexOf(
              batches[i]["students"][j]["studentId"]
            ) < 0
          ) {
            students.push(batches[i]["students"][j]["studentId"]);
            break;
          }
          console.log(i);
        }
      }
      if (students["length"] === 0) {
        noStudents = true;
      }
    }
    this.noStudentsError = noStudents;
  }

  removeStudent(studentId) {
    this.addedStudents = this.addedStudents.filter(
      (student) => student !== studentId
    );
    if (this.error) {
      this.noStudentsValidation();
    }
  }

  removeBatch(batchId, batchIndex) {
    this.addedBatches = this.addedBatches.filter((batch) => batch !== batchId);
    this.batches[batchIndex]["removedStudents"] = [];
    this.batches[batchIndex]["allStudentsSelected"] = true;
    this.openBatches = this.openBatches.filter((batch) => batch !== batchId);
    if (this.error) {
      this.noStudentsValidation();
    }
  }

  toggleBatchDrillDown(batchId) {
    console.log(batchId);
    const batchIndex = this.openBatches.indexOf(batchId);
    if (batchIndex < 0) {
      this.openBatches.push(batchId);
    } else {
      this.openBatches.splice(batchIndex, 1);
    }
  }

  toggleStudentInBatch(batchIndex, studentId) {
    const studentIndex = this.batches[batchIndex]["removedStudents"].indexOf(
      studentId
    );
    if (studentIndex < 0) {
      this.batches[batchIndex]["removedStudents"].push(studentId);
    } else {
      this.batches[batchIndex]["removedStudents"].splice(studentIndex, 1);
    }
    if (this.batches[batchIndex]["removedStudents"]["length"] === 0) {
      this.batches[batchIndex]["allStudentsSelected"] = true;
    } else {
      this.batches[batchIndex]["allStudentsSelected"] = false;
    }
    if (this.error) {
      this.noStudentsValidation();
    }
  }

  selectAllStudents(checked, batchIndex) {
    if (checked) {
      this.batches[batchIndex]["removedStudents"] = [];
      console.log([...this.batches[batchIndex]["removedStudents"]]);
    } else {
      const removedStudents = [];
      for (let i = 0; i < this.batches[batchIndex]["students"]["length"]; i++) {
        removedStudents.push(
          this.batches[batchIndex]["students"][i]["studentId"]
        );
      }
      this.batches[batchIndex]["removedStudents"] = removedStudents;
    }
    this.batches[batchIndex]["allStudentsSelected"] = checked;
    if (this.error) {
      this.noStudentsValidation();
    }
  }

  // addNewStudent() {
  //   console.log("I'm here");
  //   console.log(this.assignedStudents);
  //   if (
  //     this.assignedStudents["controls"][
  //       this.assignedStudents["controls"]["length"] - 1
  //     ]["controls"]["dueDate"]["valid"]
  //   ) {
  //     this.assignedStudents.push(
  //       new FormGroup({
  //         student: new FormControl(null, [Validators.required]),
  //         dueDate: new FormControl(
  //           this.assignedStudents["controls"][
  //             this.assignedStudents["controls"]["length"] - 1
  //           ]["controls"]["dueDate"]["value"],
  //           [Validators.required]
  //         ),
  //       })
  //     );
  //     this.lastStudentError = false;
  //   } else {
  //     this.lastStudentError = true;
  //   }
  // }

  // removeStudent(index) {
  //   this.assignedStudents.removeAt(index);
  // }

  getStudentsForTest() {
    if (!this.searchClicked) {
      this.searchClicked = true;
      this.searchError = false;
      if (this.fromDate["invalid"] || this.toDate["invalid"]) {
        this.searchError = true;
      }
      if (!this.searchError) {
        this.httpClient
          .get(
            `/api/get_students_status_for_test?testId=${
              this.testId
            }&fromDate=${moment(this.fromDate["value"]).format(
              "MM-DD-YYYY"
            )}&toDate=${moment(this.toDate["value"]).format("MM-DD-YYYY")}`,
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
              const students = JSON.parse(response["data"]);
              let notStartedCount = 0,
                inProgressCount = 0,
                completedCount = 0;
              for (let i = 0; i < students["length"]; i++) {
                if (students[i]["testStatus"] === 1) {
                  notStartedCount++;
                } else if (students[i]["testStatus"] === 2) {
                  inProgressCount++;
                } else if (students[i]["testStatus"] === 3) {
                  completedCount++;
                }
              }
              this.notStartedCount = notStartedCount;
              this.inProgressCount = inProgressCount;
              this.completedCount = completedCount;
              students.sort((a, b) => (a["name"] > b["name"] ? 1 : -1));
              console.log(students);
              this.studentsForThisTest = students;
            },
            (error) => {
              console.log(error);
              this.searchClicked = false;
            }
          );
      } else {
        this.searchClicked = false;
      }
    }
  }

  assignTest() {
    if (!this.assignClicked) {
      this.assignClicked = true;
      let errorOccurred = false;
      this.noStudentsError = false;
      let students = [...this.addedStudents];
      const batches = this.batches.filter(
        (batch) => this.addedBatches.indexOf(batch["batchId"]) > -1
      );
      for (let i = 0; i < batches["length"]; i++) {
        const batch = { ...batches[i] };
        let batchStudents = [];
        if (
          batch["students"]["length"] !== batch["removedStudents"]["length"]
        ) {
          batchStudents = batch["students"].filter((student) => {
            return batch["removedStudents"].indexOf(student["studentId"]) < 0;
          });
          batchStudents = batchStudents.map((student) => student["studentId"]);
        }
        console.log(batchStudents);
        students = students.concat(
          batchStudents.filter((studentId) => students.indexOf(studentId) < 0)
        );
      }
      if (this.dueBy["invalid"]) {
        errorOccurred = true;
      } else if (students["length"] === 0) {
        errorOccurred = true;
      }
      if (students["length"] === 0) {
        console.log(students);
        this.noStudentsError = true;
      }
      this.error = errorOccurred;
      if (!errorOccurred) {
        const data = {};
        data["test_id"] = parseInt(this.testId);
        data["list"] = students;
        data["completeBy"] = moment(this.dueBy["value"]).format("MM-DD-YYYY");
        data["is_pause_allowed"] = this.isPartialAllowed ? 1 : 0;
        console.log(data);
        this.httpClient
          .post("/api/assign_test", data, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          })
          .subscribe(
            (response) => {
              console.log(response);
              this.assignClicked = false;
              this.notifier.notify("success", "succesfully assigned students");
              this.router.navigate(["/tests"]);
            },
            (error) => {
              console.log(error);
              let errorThrown = false;
              if (error) {
                if (error["error"]) {
                  if (
                    error["error"]["msg"] === "test_conversion_not_available"
                  ) {
                    errorThrown = true;
                    this.notifier.notify("error", "Missing score conversion");
                  }
                }
              }
              if (!errorThrown) {
                this.notifier.notify("error", "Unable to assign student");
              }
              this.assignClicked = false;
            }
          );
      } else {
        this.assignClicked = false;
      }
    }
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }
}
