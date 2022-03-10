import { Component, OnInit } from "@angular/core";
import { FormArray, FormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "app-topic",
  templateUrl: "./topic.component.html",
  styleUrls: ["./topic.component.scss"],
})
export class TopicComponent implements OnInit {
  role = localStorage.roleId;
  testTypes = [];
  selectedTestType = 0;
  sections = [];
  selectedSection = 0;
  topic = new FormControl("", [Validators.required]);
  subTopics = new FormArray([new FormControl("", [Validators.required])]);
  error = false;
  saveClicked = false;
  private readonly notifier: NotifierService;

  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.httpClient
      .get("/api/get_test_type_sections", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          this.testTypes = JSON.parse(response.data);
          this.sections = this.testTypes[this.selectedTestType]["sections"];
          console.log(this.testTypes, this.sections);
        },
        (error) => {
          console.log(error);
          this.notifier.notify("warning", "Unable to load data");
        }
      );
  }

  addSubTopic() {
    this.subTopics.push(new FormControl("", [Validators.required]));
  }

  removeSubTopic(index) {
    this.subTopics.removeAt(index);
  }

  onTestTypeSelection() {
    this.selectedSection = 0;
    this.sections = this.testTypes[this.selectedTestType]["sections"];
    console.log(this.testTypes);
  }

  createTopic() {
    if (!this.saveClicked) {
      this.saveClicked = true;
      this.error = false;
      let errorOccurred = false;
      if (this.topic.invalid || this.subTopics.invalid) {
        errorOccurred = true;
      }
      this.error = errorOccurred;
      if (!errorOccurred) {
        const subTopics = [];
        for (let i = 0; i < this.subTopics.controls.length; i++) {
          subTopics.push(this.subTopics.controls[i].value);
        }
        console.log(subTopics);
        this.httpClient
          .post(
            "/api/create_topic_subtopic",
            {
              topic: this.topic.value,
              subtopic: subTopics,
              scoring_section_id: this.sections[this.selectedSection][
                "scoring_section_type_id"
              ],
              test_type_id: this.testTypes[this.selectedTestType][
                "test_type_id"
              ],
            },
            {
              headers: {
                Authorization: "Bearer " + localStorage.accessToken,
              },
            }
          )
          .subscribe(
            (response) => {
              console.log(response);
              this.notifier.notify("success", "Successfully created Topic");
              this.saveClicked = false;
              this.selectedSection = 0;
              this.selectedTestType = 0;
              this.sections = this.testTypes[0]["sections"];
              this.topic.setValue("");
              for (let i = this.subTopics.controls.length - 1; i >= 0; i--) {
                this.subTopics.removeAt(i);
              }
              this.subTopics.push(new FormControl("", [Validators.required]));
            },
            (error) => {
              console.log(error);
              this.notifier.notify("warning", "Unable to create Topic");
              this.saveClicked = false;
            }
          );
      } else {
        this.saveClicked = false;
      }
    }
  }
}
