import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { ActivatedRoute, Params } from "@angular/router";
import { NotifierService } from "angular-notifier";
import * as moment from "moment";
import { FormArray, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-online-test",
  templateUrl: "./online-test.component.html",
  styleUrls: ["./online-test.component.scss"],
})
export class OnlineTestComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  testType = "";
  testCode = "";
  selectedOption = "";
  questions = new FormArray([]);
  studentTestId = null;
  testId = null;
  timeLeft = 0;
  mobileSelectedIndex = 0;
  timerBlockIndex = null;
  sections = [];
  paramSubscription: Subscription;
  testDate = moment(new Date()).format("MM-DD-YYYY");
  private readonly notifier: NotifierService;
  timer = null;
  startTimerClicked = false;
  submitClicked = false;
  submitError = false;
  submittedSections = [];
  isPauseAllowed = false;
  pauseClicked = false;
  pausedQuestions = [];
  submittedQuestions = [];
  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.paramSubscription = this.route.params.subscribe((params: Params) => {
      this.studentTestId = params.studentTestId;
    });
  }

  ngOnInit() {
    this.httpClient
      .get(`/api/start_test_details?studentTestId=${this.studentTestId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          //console.log(response);
          this.testId = response[0]["testId"];
          this.testType = response[0]["testTypeName"];
          this.testCode = response[0]["testCode"];
          this.sections = response[0]["sections"];
          this.isPauseAllowed =
            response[0]["isPauseAllowed"] === 1 ? true : false;
          for (let i = 0; i < this.sections.length; i++) {
            this.questions.push(new FormArray([]));
            for (
              let j = 0;
              j < this.sections[i]["sectionQuestionIds"]["length"];
              j++
            ) {
              const answerIndex = this.sections[i]["studentAnswers"].findIndex(
                (answer) =>
                  answer["qid"] ===
                  this.sections[i]["sectionQuestionIds"][j]["qid"]
              );
              if (this.sections[i]["sectionQuestionIds"][j]["isChar"] === 0) {
                this.questions.controls[i]["push"](
                  new FormControl(
                    answerIndex > -1
                      ? this.sections[i]["studentAnswers"][answerIndex][
                          "answer"
                        ]
                        ? this.sections[i]["studentAnswers"][answerIndex][
                            "answer"
                          ]
                        : ""
                      : "",
                    [
                      Validators.pattern(
                        "^[0-9]*[.]?[0-9]+$|^[0-9]+[/]?[0-9]+$"
                      ),
                    ]
                  )
                );
              } else {
                this.questions.controls[i]["push"](
                  new FormControl(
                    answerIndex > -1
                      ? this.sections[i]["studentAnswers"][answerIndex][
                          "answer"
                        ]
                        ? this.sections[i]["studentAnswers"][answerIndex][
                            "answer"
                          ]
                        : ""
                      : ""
                  )
                );
              }
            }
          }
          for (let i = 0; i < this.sections["length"]; i++) {
            if (this.sections[i]["section_status"] === "stopped") {
              this.submittedSections.push(i);
            } else if (this.sections[i]["section_status"] === "started") {
              this.pausedQuestions.push(i);
            }
          }
          //console.log(this.questions);
        },
        (error) => {
          //console.log(error);
          this.notifier.notify("error", "Unable to fetch test data");
        }
      );
  }

  startTimerBlock(index) {
    this.timerBlockIndex = index;
    this.timeLeft = this.sections[index]["sectionTime"];
    this.mobileSelectedIndex = index;
    //console.log(index);
    this.startTimer();
  }

  setTimerInterval() {
    this.timer = setInterval(() => {
      //console.log("time");
      this.timeLeft = this.timeLeft - 1;
      if (this.timeLeft === 300) {
        this.notifier.notify("warning", "5 more minutes left");
      } else if (this.timeLeft === 180) {
        this.notifier.notify("warning", "3 more minutes left");
      } else if (this.timeLeft === 60) {
        this.notifier.notify("warning", "1 more minute left");
      } else if (this.timeLeft === 0) {
        clearInterval(this.timer);
        this.submitTest("timerExpired", this.timerBlockIndex);
        this.timer = null;
      }
      if (this.timeLeft % 15 === 0) {
        if (!this.submitClicked) {
          const remainingTimedata = {};
          remainingTimedata["studentTestId"] = parseInt(this.studentTestId);
          remainingTimedata["testSectionId"] = this.sections[
            this.timerBlockIndex
          ]["testSectionId"];
          remainingTimedata["remainingTime"] = this.timeLeft;
          this.httpClient
            .post("/api/save_remaining_time", remainingTimedata, {
              headers: {
                Authorization: "Bearer " + localStorage.accessToken,
              },
            })
            .subscribe(
              (response) => {
                //console.log(response);
              },
              (error) => {
                //console.log(error);
              }
            );
        }
      }
    }, 1000);
  }

  startTimer() {
    if (!this.startTimerClicked) {
      this.startTimerClicked = true;
      const data = {};
      data["studentTestId"] = parseInt(this.studentTestId);
      data["testSectionId"] = this.sections[this.timerBlockIndex][
        "testSectionId"
      ];
      data["remainingTime"] = this.timeLeft;
      this.httpClient
        .post("/api/start_test_by_section", data, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
        .subscribe(
          (response) => {
            //console.log(response);
            this.startTimerClicked = false;
            this.submittedQuestions = [];
            if (this.timeLeft > 0) {
              this.setTimerInterval();
            }
          },
          (error) => {
            this.startTimerClicked = false;
            //console.log(error);
            this.timerBlockIndex = null;
            this.timeLeft = 0;
            this.mobileSelectedIndex = 0;
            this.notifier.notify("error", "Unable to start section");
          }
        );
    }
  }

  getTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    let constructedMinutes = JSON.stringify(minutes);
    let constructedSeconds = JSON.stringify(seconds);
    if (minutes < 10) {
      constructedMinutes = "0" + minutes;
    }
    if (seconds < 10) {
      constructedSeconds = "0" + seconds;
    }
    return constructedMinutes + ":" + constructedSeconds;
  }

  selectOption(option, questionIndex) {
    console.log(option, questionIndex);
    let value = option;
    if (
      this.questions["controls"][this.timerBlockIndex]["controls"][
        questionIndex
      ]["value"] === option
    ) {
      this.questions["controls"][this.timerBlockIndex]["controls"][
        questionIndex
      ]["setValue"]("");
      value = null;
    } else {
      this.questions["controls"][this.timerBlockIndex]["controls"][
        questionIndex
      ]["setValue"](option);
    }
    this.submitAnswer(value, questionIndex);
  }

  submitNumber(questionIndex) {
    if (
      this.questions["controls"][this.timerBlockIndex]["controls"][
        questionIndex
      ]["valid"]
    ) {
      const value = this.questions["controls"][this.timerBlockIndex][
        "controls"
      ][questionIndex]["value"]
        ? this.questions["controls"][this.timerBlockIndex]["controls"][
            questionIndex
          ]["value"]
        : null;
      this.submitAnswer(value, questionIndex);
    }
  }

  submitAnswer(value, questionIndex) {
    console.log(this.submittedQuestions);
    console.log(this.submittedQuestions.indexOf(questionIndex));
    if (this.submittedQuestions.indexOf(questionIndex) < 0) {
      console.log(questionIndex);
      this.submittedQuestions.push(questionIndex);
      const data = {};
      data["student_id"] = localStorage.userId;
      data["test_date"] = this.testDate;
      data["test_id"] = this.testId;
      data["student_test_id"] = parseInt(this.studentTestId);
      data["section_answers"] = {
        section_id: this.sections[this.timerBlockIndex]["testSectionId"],
        answers: [
          {
            qid: this.sections[this.timerBlockIndex]["sectionQuestionIds"][
              questionIndex
            ]["qid"],
            answer: value,
          },
        ],
      };
      //console.log(data);
      this.httpClient
        .post("/api/submit_online_test_by_question", data, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
        .subscribe(
          (response) => {
            console.log(response);
            this.submittedQuestions = this.submittedQuestions.filter(
              (submittedQuestion) => submittedQuestion !== questionIndex
            );
          },
          (error) => {
            console.log(error);
            this.submittedQuestions = this.submittedQuestions.filter(
              (submittedQuestion) => submittedQuestion !== questionIndex
            );
          }
        );
    }
  }

  submitTest(status, index) {
    if (!this.submitClicked) {
      this.submitClicked = true;
      //console.log(status, index);
      //console.log(this.questions);
      let error = false;
      if (
        this.questions["controls"][this.timerBlockIndex]["invalid"] &&
        status === "userSubmit" &&
        this.timeLeft > 0
      ) {
        error = true;
      }
      this.submitError = error;
      if (!error) {
        const data = {};
        data["student_id"] = localStorage.userId;
        data["test_date"] = this.testDate;
        data["test_id"] = this.testId;
        data["student_test_id"] = parseInt(this.studentTestId);
        data["section_answers"] = {
          section_id: this.sections[this.timerBlockIndex]["testSectionId"],
          answers: [],
        };
        const answers = [];
        for (
          let i = 0;
          i <
          this.questions["controls"][this.timerBlockIndex]["controls"][
            "length"
          ];
          i++
        ) {
          if (
            this.sections[this.timerBlockIndex]["sectionQuestionIds"][i][
              "isChar"
            ] === 0 &&
            this.questions["controls"][this.timerBlockIndex]["controls"][i][
              "invalid"
            ]
          ) {
            answers.push({
              qid: this.sections[this.timerBlockIndex]["sectionQuestionIds"][i][
                "qid"
              ],
              answer: null,
            });
          } else {
            answers.push({
              qid: this.sections[this.timerBlockIndex]["sectionQuestionIds"][i][
                "qid"
              ],
              answer: this.questions["controls"][this.timerBlockIndex][
                "controls"
              ][i]["value"]
                ? this.questions["controls"][this.timerBlockIndex]["controls"][
                    i
                  ]["value"]
                : null,
            });
          }
        }
        data["section_answers"]["answers"] = answers;
        //console.log(data);
        this.httpClient
          .post("/api/submit_online_test_by_section", data, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          })
          .subscribe(
            (response) => {
              //console.log(response);
              this.notifier.notify("success", "Successfully saved section");
              this.submittedSections.push(this.timerBlockIndex);
              if (status === "userSubmit") {
                clearInterval(this.timer);
                this.timer = null;
              }
              this.timeLeft = 0;
              this.timerBlockIndex = null;
              let element = document.querySelector("#online-test__timer");
              element.classList.remove("online-test__header__showTimer");
              element.classList.add("online-test__header__hideTimer");
              clearInterval(this.timer);
              this.submittedQuestions = [];
              this.submitClicked = false;
            },
            (error) => {
              //console.log(error);
              this.submitClicked = false;
              this.notifier.notify("error", "Unable to submit test");
              this.submittedQuestions = [];
              if (this.timeLeft === 0) {
                let element = document.querySelector("#online-test__timer");
                element.classList.remove("online-test__header__showTimer");
                element.classList.add("online-test__header__hideTimer");
              }
            }
          );
      } else {
        this.submitClicked = false;
        this.notifier.notify("error", "Invalid format found");
      }
    }
  }

  pauseTest() {
    if (!this.pauseClicked) {
      this.pauseClicked = true;
      const timeLeft = this.timeLeft;
      const data = {};
      data["studentTestId"] = parseInt(this.studentTestId);
      data["testSectionId"] = this.sections[this.timerBlockIndex][
        "testSectionId"
      ];
      data["remainingTime"] = timeLeft;
      clearInterval(this.timer);
      this.httpClient
        .post("/api/save_remaining_time", data, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
        .subscribe(
          (response) => {
            //console.log(response);
            this.pauseClicked = false;
            this.sections[this.timerBlockIndex]["sectionTime"] = timeLeft;
            if (this.pausedQuestions.indexOf(this.timerBlockIndex) < 0) {
              this.pausedQuestions.push(this.timerBlockIndex);
            }
            this.timerBlockIndex = null;
            this.timeLeft = 0;
            // this.mobileSelectedIndex = 0;
          },
          (error) => {
            //console.log(error);
            this.pauseClicked = false;
            this.notifier.notify("error", "Unable to pause the test");
            this.setTimerInterval();
          }
        );
    }
  }

  numberValidator = (event: any) => {
    let value = /^[0-9]*[.]?[0-9]*$|^[0-9]+[/]?[0-9]*$/.test(
      event.target.value
    );
    // //console.log(value);
    if (!value) {
      event.target.value = event.target.value.slice(0, -1);
    }
  };

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    if (this.timer !== null) {
      let element = document.querySelector("#online-test__timer");
      let timerElement = document.getElementById(
        `online-test__testBody__section__answers__buttonStack__${this.timerBlockIndex}`
      );
      if (timerElement) {
        if (timerElement.getBoundingClientRect()["top"] <= 0) {
          element.classList.add("online-test__header__showTimer");
          element.classList.remove("online-test__header__hideTimer");
        } else {
          element.classList.remove("online-test__header__showTimer");
          element.classList.add("online-test__header__hideTimer");
        }
      }
    }
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
    //console.log("on destroy reached");
    //console.log(this.timer);
    if (this.timer !== null) {
      //console.log("clearing timer");
      clearInterval(this.timer);
    }
  }
}
