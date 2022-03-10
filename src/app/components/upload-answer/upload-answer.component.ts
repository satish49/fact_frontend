import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import * as XLSX from "xlsx";
import { FormArray, FormControl, Validators } from "@angular/forms";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "app-upload-answer",
  templateUrl: "./upload-answer.component.html",
  styleUrls: ["./upload-answer.component.scss"],
})
export class UploadAnswerComponent implements OnInit {
  results = [];
  fileName = "";
  resultsValidated = false;
  resultsWithIssues = [];
  skippedRecords = [];
  openRecords = [];
  uploadError = false;
  invalidSheet = false;
  uploadClicked = false;
  private readonly notifier: NotifierService;
  constructor(notifierService: NotifierService) {
    this.notifier = notifierService;
  }

  ngOnInit() {}

  chooseFile = () => {
    document.getElementById("selectFile").click();
  };

  clearFile = () => {
    this.resultsValidated = false;
    this.results = [];
    this.resultsWithIssues = [];
    this.fileName = "";
    this.skippedRecords = [];
    this.openRecords = [];
    this.invalidSheet = false;
    this.uploadClicked = false;
  };

  skipRecord = (index) => {
    console.log("skipRecord", index);
    if (this.skippedRecords.indexOf(index) < 0) {
      this.skippedRecords.push(index);
    }
  };

  revertRecord = (index) => {
    console.log("revertRecord", index);
    const recordIndex = this.skippedRecords.indexOf(index);
    console.log("recertRecord", recordIndex);
    if (recordIndex > -1) {
      this.skippedRecords.splice(recordIndex, 1);
    }
  };

  openRecord = (index) => {
    console.log("openRecord", index);
    if (this.openRecords.indexOf(index) < 0) {
      this.openRecords.push(index);
    }
  };

  closeRecord = (index) => {
    console.log("closeRecord", index);
    const recordIndex = this.openRecords.indexOf(index);
    console.log("recertRecord", recordIndex);
    if (recordIndex > -1) {
      this.openRecords.splice(recordIndex, 1);
    }
  };

  onFileChange(ev) {
    console.log([...this.results]);
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    const extension = file.name.substring(
      file.name.lastIndexOf(".") + 1,
      file.name.length
    );
    if (
      extension.toLowerCase() !== "ods" &&
      extension.toLowerCase() !== "xls" &&
      extension.toLowerCase() !== "xlsx" &&
      extension.toLowerCase() !== "csv"
    ) {
      this.notifier.notify("error", "Invalid File format");
      document.getElementById("selectFile")["value"] = "";
      return false;
    }
    if (file["name"].length > 100) {
      this.fileName = file["name"]["substring"](0, 97) + "...";
    } else {
      this.fileName = file["name"];
    }
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: "binary" });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const validSheetParameters = [];
      for (let i = 0; i < jsonData["Sheet1"].length; i++) {
        const answers = [];
        const student = {
          File: jsonData["Sheet1"][i]["File"],
          "S.No": jsonData["Sheet1"][i]["S.No"],
          studentid: jsonData["Sheet1"][i]["studentid"],
          test_date: jsonData["Sheet1"][i]["test_date"],
          testid: jsonData["Sheet1"][i]["testid"],
        };
        for (let property in jsonData["Sheet1"][i]) {
          if (
            property !== "File" &&
            property !== "S.No" &&
            property !== "studentid" &&
            property !== "test_date" &&
            property !== "testid"
          ) {
            answers.push(jsonData["Sheet1"][i][property]);
          }
          if (
            property === "File" ||
            property === "S.No" ||
            property === "studentid" ||
            property === "test_date" ||
            property === "testid"
          ) {
            validSheetParameters.push(property);
          }
        }
        student["answers"] = [...answers];
        this.results.push(student);
      }
      if (validSheetParameters.length < 5) {
        this.invalidSheet = true;
      }
    };
    reader.readAsBinaryString(file);
  }

  validateResults = () => {
    const validatedResults = [];
    for (let i = 0; i < this.results.length; i++) {
      const student = this.results[i];
      let errorOccurred = false;
      const errors = [];
      const errorQuestionIndexes = [];
      const errorFormArray = new FormArray([]);
      // if (student["studentid"] === "") {
      //   errorOccurred = true;
      //   errors.push("Students ID is missing");
      // }
      // if (student["testid"] === "") {
      //   errorOccurred = true;
      //   errors.push("Test ID is missing");
      // }
      // if (!moment(student["test_date"], "MM-DD-YYYY").isValid()) {
      //   errorOccurred = true;
      //   errors.push("Test Date is invalid");
      // }
      for (let j = 0; j < student["answers"].length; j++) {
        const answer = student["answers"][j];
        if (
          !/^[A-Z]{0,1}$/.test(answer) &&
          !/^[0-9]*[\.]?[0-9]+$/.test(answer) &&
          !/^[0-9]+[\/]?[0-9]+$/.test(answer)
        ) {
          errorOccurred = true;
          errors.push(`Q${j + 1} has invalid answer`);
          errorQuestionIndexes.push(j);
          errorFormArray.push(
            new FormControl(answer, [
              Validators.pattern(
                "^[A-Z]{0,1}$|^[0-9]*[.]?[0-9]+$|^[0-9]+[/]?[0-9]+$"
              ),
            ])
          );
        }
      }
      validatedResults.push({
        studentid: student["studentid"],
        error: errorOccurred,
        errors: errors,
      });
      if (errorOccurred) {
        this.resultsWithIssues.push({
          recordIndex: i,
          questionIndexes: errorQuestionIndexes,
          formArray: errorFormArray,
        });
      }
    }
    this.resultsValidated = true;
    console.log(this.resultsWithIssues);
    console.log(this.results);
  };

  uploadResults = () => {
    if (!this.uploadClicked) {
      this.uploadClicked = true;
      this.uploadError = false;
      let errorOccurred = false;
      for (let i = 0; i < this.resultsWithIssues.length; i++) {
        if (
          this.resultsWithIssues[i]["formArray"].invalid &&
          this.skippedRecords.indexOf(i) < 0
        ) {
          errorOccurred = true;
          break;
        }
      }
      this.uploadError = errorOccurred;
      console.log(errorOccurred);
      if (!errorOccurred) {
        const sortedSkippedRecords = [...this.skippedRecords];
        const constructedResults = [...this.results];
        sortedSkippedRecords.sort();
        console.log(sortedSkippedRecords);
        console.log(this.skippedRecords);
        for (let i = 0; i < this.resultsWithIssues.length; i++) {
          if (this.skippedRecords.indexOf(i) < 0) {
            const constructedIndividualResult = {
              ...constructedResults[this.resultsWithIssues[i]["recordIndex"]],
            };
            const constructedAnswers = [
              ...constructedIndividualResult["answers"],
            ];
            for (
              let j = 0;
              j < this.resultsWithIssues[i]["questionIndexes"].length;
              j++
            ) {
              constructedAnswers[
                this.resultsWithIssues[i]["questionIndexes"][j]
              ] = this.resultsWithIssues[i]["formArray"].controls[j].value;
            }
            constructedIndividualResult["answers"] = constructedAnswers;
            constructedResults[
              this.resultsWithIssues[i]["recordIndex"]
            ] = constructedIndividualResult;
          }
        }
        for (let i = sortedSkippedRecords.length - 1; i >= 0; i--) {
          constructedResults.splice(
            this.resultsWithIssues[sortedSkippedRecords[i]]["recordIndex"],
            1
          );
        }
        console.log(this.results);
        console.log(constructedResults);
        setTimeout(() => {
          this.notifier.notify("success", "Successfully Uploaded Records");
          this.clearFile();
          this.uploadClicked = false;
        }, 2000);
      } else {
        this.uploadClicked = false;
      }
    }
  };
}
