import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { FormControl, Validators } from "@angular/forms";
import { AngularEditorConfig } from "@kolkov/angular-editor";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnInit {
  role = localStorage.roleId;
  email = true;
  message = false;
  sendToParents = false;
  sendToType = "0";
  selectedMailType = "CC";
  students = [];
  batches = [];
  files = [];
  body = new FormControl("", [Validators.required]);
  subject = new FormControl("", [Validators.required]);
  messageBody = new FormControl("", [Validators.required]);
  sendClicked = false;
  error = false;
  noStudentsError = false;
  selectedStudents = [];
  selectedBatches = [];
  addedStudents = [];
  addedBatches = [];
  openBatches = [];
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "15rem",
    minHeight: "5rem",
    placeholder: "Enter text here...",
    translate: "no",
    defaultParagraphSeparator: "p",
    defaultFontName: "Arial",
    toolbarHiddenButtons: [
      [],
      [
        "customClasses",
        "backgroundColor",
        "insertImage",
        "insertVideo",
        "toggleEditorMode",
        "removeFormat",
      ],
    ],
  };
  private readonly notifier: NotifierService;
  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.httpClient
      .get("/api/get_all_students", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response) => {
          const students = JSON.parse(response["data"]);
          for (let i = 0; i < students.length; i++) {
            students[i]["studentName"] =
              students[i]["first_name"] + " " + students[i]["last_name"];
            students[i]["studentId"] = students[i]["student_id"];
          }
          this.students = students;
          console.log(this.students);
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unablt to fetch students");
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

  getSelectedStudents(students) {
    this.selectedStudents = students;
  }

  getSelectedBatches(batches) {
    this.selectedBatches = batches;
  }

  addBatchOrStudent() {
    console.log(this.sendToType);
    if (this.sendToType === "0") {
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

  addFiles() {
    document.getElementById("notificationAttachment").click();
  }

  removeFile(fileIndex) {
    this.files.splice(fileIndex, 1);
  }

  onFileChange(ev) {
    for (let file of ev["target"]["files"]) {
      this.files.push(file);
    }
    console.log(this.files);
  }

  sendNotification() {
    if (!this.sendClicked) {
      this.sendClicked = true;
      this.error = false;
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
      console.log(this.body);
      if (!this.message && !this.email) {
        errorOccurred = true;
      } else if (students["length"] === 0) {
        errorOccurred = true;
      } else if (
        this.email &&
        (this.subject.invalid || this.subject.value.trim() === "")
      ) {
        errorOccurred = true;
      } else if (
        this.email &&
        (this.body.invalid || this.body.value.trim() === "")
      ) {
        errorOccurred = true;
      } else if (
        this.message &&
        (this.messageBody.invalid || this.messageBody.value.trim() === "")
      ) {
        errorOccurred = true;
      }
      if (students["length"] === 0) {
        console.log(students);
        this.noStudentsError = true;
      }
      this.error = errorOccurred;
      if (!errorOccurred) {
        const formData = new FormData();
        const data = {
          isMessage: this.message ? 1 : 0,
          isEmail: this.email ? 1 : 0,
          isSendToParents: this.sendToParents ? 1 : 0,
          smsContent: this.message ? this.messageBody["value"] : null,
          body: this.email ? this.body["value"] : "",
          subject: this.email ? this.subject["value"] : "",
          students,
          isCc: this.selectedMailType === "CC" ? 1 : 0,
        };
        console.log(data);
        formData.append("data", JSON.stringify(data));
        for (let file of this.files) {
          formData.append("files", file, file["name"]);
        }
        this.httpClient
          .post("/api/send_batch_notifications", formData, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          })
          .subscribe(
            (response) => {
              console.log(response);
              this.sendClicked = false;
              this.notifier.notify("success", "Success");
            },
            (error) => {
              console.log(error);
              this.sendClicked = false;
              this.notifier.notify("error", "Notification request failed");
            }
          );
      } else {
        this.sendClicked = false;
      }
    }
  }
}
