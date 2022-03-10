import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormArray, FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ActivatedRoute, Params, Router } from "@angular/router";

@Component({
  selector: "app-batch",
  templateUrl: "./batch.component.html",
  styleUrls: ["./batch.component.scss"],
})
export class BatchComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  selectedCourse = null;
  courseList = [];
  batchName = new FormControl("", [Validators.required]);
  schedules = new FormArray([
    new FormGroup({
      bschId: new FormControl(null),
      day: new FormControl(null, [Validators.required]),
      startTime: new FormControl("", [Validators.required]),
      endTime: new FormControl("", [Validators.required]),
      timeZone: new FormControl("", [Validators.required]),
      classUrl: new FormControl("", [Validators.required]),
      isScheduleActive: new FormControl(1),
    }),
  ]);
  studentList = [];
  screenType = "";
  startDate = new FormControl(null, [Validators.required]);
  endDate = new FormControl(null, [Validators.required]);
  defaultSelectedChildren = <any>[];
  selectedStudents = <any>[];
  students = <any>[];
  defaultSelectedStudents = <any>[];
  removedSchedules = [];
  removedStudents = [];
  isBatchActive = true;
  courses = [];
  removedCourses = [];
  createOrUpdateBatchClicked = false;
  error = false;
  paramSubscription: Subscription;
  batchId = null;
  private readonly notifier: NotifierService;
  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    if (window.location.hash === "#/create-batch") {
      this.screenType = "create";
    } else if (window.location.hash.indexOf("#/edit-batch/") === 0) {
      this.screenType = "update";
    }
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.httpClient
      .get("/api/get_courses", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          this.courses = response.data ? response.data : [];
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch courses");
        }
      );
    if (this.screenType === "update") {
      this.paramSubscription = this.route.params.subscribe((params: Params) => {
        this.batchId = parseInt(params.batchId);
        this.getBatchData();
      });
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

  getBatchData() {
    this.screenType = "update";
    this.httpClient
      .get(`/api/get_batch_by_batchid?batchId=${this.batchId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response) => {
          const data = JSON.parse(response["data"]);
          console.log(data);
          this.batchName.setValue(data["batchName"]);
          this.courseList = data["courses"]["filter"](
            (course) => course["isCourseActive"] === 1
          );
          this.removedCourses = data["courses"]["filter"](
            (course) => course["isCourseActive"] === 0
          );
          this.studentList = data["students"]["filter"](
            (course) => course["isStudentActive"] === 1
          );
          this.removedStudents = data["students"]["filter"](
            (course) => course["isStudentActive"] === 0
          );
          this.startDate.setValue(
            new Date(data["startDate"].split("-").join("/"))
          );
          this.endDate.setValue(new Date(data["endDate"].split("-").join("/")));
          this.isBatchActive = data["isBatchActive"] === 1;
          this.schedules = new FormArray([]);
          for (let index = 0; index < data["schedules"]["length"]; index++) {
            this.schedules.push(
              new FormGroup({
                bschId: new FormControl(data["schedules"][index]["bschId"]),
                day: new FormControl(data["schedules"][index]["day"], [
                  Validators.required,
                ]),
                startTime: new FormControl(
                  data["schedules"][index]["startTime"],
                  [Validators.required]
                ),
                endTime: new FormControl(data["schedules"][index]["endTime"], [
                  Validators.required,
                ]),
                timeZone: new FormControl(
                  data["schedules"][index]["timeZone"],
                  [Validators.required]
                ),
                classUrl: new FormControl(
                  data["schedules"][index]["classUrl"],
                  [Validators.required]
                ),
                isScheduleActive: new FormControl(1),
              })
            );
          }
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch batch data");
        }
      );
  }

  getSelectedStudents = (selected) => {
    this.selectedStudents = selected;
  };

  selectCourse() {
    if (
      this.courseList.findIndex(
        (course) => course.courseId === this.selectedCourse
      ) < 0
    ) {
      let bcId = null;
      if (this.screenType === "update") {
        const removedCourseIndex = this.removedCourses.findIndex(
          (course) => course.courseId === this.selectedCourse
        );
        if (removedCourseIndex > -1) {
          bcId = this.removedCourses[removedCourseIndex]["bcId"];
          this.removedCourses.splice(removedCourseIndex, 1);
        }
      }
      this.courseList.push({
        ...this.courses[
          this.courses.findIndex(
            (course) => course.courseId === this.selectedCourse
          )
        ],
        bcId,
        isCourseActive: 1,
      });
    }
  }

  addNewSchedule() {
    this.schedules.push(
      new FormGroup({
        bschId: new FormControl(null),
        day: new FormControl(null, [Validators.required]),
        startTime: new FormControl("", [Validators.required]),
        endTime: new FormControl("", [Validators.required]),
        timeZone: new FormControl("", [Validators.required]),
        classUrl: new FormControl("", [Validators.required]),
        isScheduleActive: new FormControl(1),
      })
    );
  }

  addStudents() {
    console.log(this.selectedStudents);
    for (
      let selectedStudentIndex = 0;
      selectedStudentIndex < this.selectedStudents.length;
      selectedStudentIndex++
    ) {
      if (
        this.studentList.findIndex(
          (student) =>
            student.studentId === this.selectedStudents[selectedStudentIndex]
        ) < 0
      ) {
        let bstId = null;
        const removedStudentIndex = this.removedStudents.findIndex(
          (student) =>
            student.studentId === this.selectedStudents[selectedStudentIndex]
        );
        if (removedStudentIndex > -1) {
          bstId = this.removedStudents[removedStudentIndex]["bstId"];
          this.removedStudents.splice(removedStudentIndex, 1);
        }
        const studentIndex = this.students.findIndex(
          (student) =>
            student.student_id === this.selectedStudents[selectedStudentIndex]
        );
        this.studentList.push({
          bstId,
          isStudentActive: 1,
          studentName: this.students[studentIndex]["studentName"],
          studentId: this.students[studentIndex]["student_id"],
        });
      }
    }
    console.log(this.studentList);
  }

  removeSchedule(index) {
    if (
      this.schedules["controls"][index]["controls"]["bschId"]["value"] !== null
    ) {
      this.removedSchedules.push({
        bschId: this.schedules["controls"][index]["controls"]["bschId"][
          "value"
        ],
        day: this.schedules["controls"][index]["controls"]["day"]["value"],
        startTime: this.schedules["controls"][index]["controls"]["startTime"][
          "value"
        ],
        endTime: this.schedules["controls"][index]["controls"]["endTime"][
          "value"
        ],
        timeZone: this.schedules["controls"][index]["controls"]["timeZone"][
          "value"
        ],
        classUrl: this.schedules["controls"][index]["controls"]["classUrl"][
          "value"
        ],
        isScheduleActive: 0,
      });
    }
    this.schedules.removeAt(index);
  }

  removeCourse(index) {
    if (
      this.screenType === "update" &&
      this.courseList[index]["bcId"] !== null
    ) {
      this.removedCourses.push({
        ...this.courseList[index],
        isCourseActive: 0,
      });
    }
    this.courseList.splice(index, 1);
  }

  removeStudent(index) {
    if (this.studentList[index]["bstId"] !== null) {
      this.removedStudents.push({
        ...this.studentList[index],
        isStudentActive: 0,
      });
    }
    this.studentList.splice(index, 1);
  }

  createOrUpdateBatch() {
    if (!this.createOrUpdateBatchClicked) {
      this.createOrUpdateBatchClicked = true;
      this.error = false;
      let errorOccurred = false;
      if (this.batchName.invalid) {
        errorOccurred = true;
      } else if (this.courseList.length === 0) {
        errorOccurred = true;
      } else if (this.startDate.invalid) {
        errorOccurred = true;
      } else if (this.endDate.invalid) {
        errorOccurred = true;
      } else if (this.schedules.invalid) {
        errorOccurred = true;
      }
      if (!errorOccurred) {
        const data = {};
        data["batchName"] = this.batchName.value;
        data["isBatchActive"] = this.isBatchActive ? 1 : 0;
        data["batchId"] = this.batchId;
        data["selectedCourses"] =
          this.screenType === "create"
            ? this.courseList
            : this.screenType === "update"
            ? [...this.courseList, ...this.removedCourses]
            : [];
        data["selectedStudents"] =
          this.screenType === "create"
            ? this.studentList
            : this.screenType === "update"
            ? [...this.studentList, ...this.removedStudents]
            : [];
        data["start_date"] = moment(this.startDate.value).format("MM-DD-YYYY");
        data["end_date"] = moment(this.endDate.value).format("MM-DD-YYYY");
        const schedules = [];
        for (
          let scheduleIndex = 0;
          scheduleIndex < this.schedules.controls.length;
          scheduleIndex++
        ) {
          schedules.push({
            bschId: this.schedules.controls[scheduleIndex]["controls"][
              "bschId"
            ]["value"],
            day: this.schedules.controls[scheduleIndex]["controls"]["day"][
              "value"
            ],
            startTime: this.schedules.controls[scheduleIndex]["controls"][
              "startTime"
            ]["value"],
            endTime: this.schedules.controls[scheduleIndex]["controls"][
              "endTime"
            ]["value"],
            timeZone: this.schedules.controls[scheduleIndex]["controls"][
              "timeZone"
            ]["value"],
            classUrl: this.schedules.controls[scheduleIndex]["controls"][
              "classUrl"
            ]["value"],
            isScheduleActive: this.schedules.controls[scheduleIndex][
              "controls"
            ]["isScheduleActive"]["value"],
          });
        }
        data["schedules"] =
          this.screenType === "create"
            ? schedules
            : this.screenType === "update"
            ? schedules.concat(this.removedSchedules)
            : [];
        this.httpClient
          .post("/api/create_edit_batch", data, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          })
          .subscribe(
            (response) => {
              console.log(response);
              const data = JSON.parse(response["data"]);
              const batchId = data["batchId"];
              this.batchId = batchId;
              if (this.screenType === "create") {
                this.router.navigate([`/edit-batch/${batchId}`]);
              } else if (this.screenType === "update") {
                this.getBatchData();
              }
              this.createOrUpdateBatchClicked = false;
              this.notifier.notify(
                "success",
                `Succesfully ${
                  this.screenType === "update"
                    ? "updated"
                    : this.screenType === "create"
                    ? "created"
                    : ""
                } the batch`
              );
            },
            (error) => {
              console.log(error);
              let notificationDisplayed = false;
              if (error["error"]) {
                if (
                  error["error"]["msg"] ===
                  "while creating a batch , batchname is not uniqueTest 1"
                ) {
                  this.notifier.notify("warning", "Duplicate batch name");
                  notificationDisplayed = true;
                }
              }
              if (!notificationDisplayed) {
                this.notifier.notify(
                  "error",
                  `Unable to ${
                    this.screenType === "update"
                      ? "update"
                      : this.screenType === "create"
                      ? "create"
                      : ""
                  } the batch`
                );
              }
              this.createOrUpdateBatchClicked = false;
            }
          );
      } else {
        this.error = errorOccurred;
        this.createOrUpdateBatchClicked = false;
      }
    }
  }

  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }
}
