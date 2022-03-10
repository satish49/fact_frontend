import { Component, OnInit, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { FormArray, FormControl, Validators, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { ActivatedRoute, Params, Router } from "@angular/router";

@Component({
  selector: "app-answer-key",
  templateUrl: "./answer-key.component.html",
  styleUrls: ["./answer-key.component.scss"],
})
export class AnswerKeyComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  error = false;
  sections = [];
  testTypeId = null;
  testCode = null;
  testType = null;
  selectedSection = 0;
  answerType = "char";
  saveQuestionClicked = false;
  numbers = new FormArray([
    new FormControl("", [
      Validators.pattern("^[0-9]*[.]?[0-9]+$|^[0-9]+[/]?[0-9]+$"),
      Validators.required,
    ]),
  ]);
  subTopicsLoading = true;
  selectedLevel = null;
  selectedPassage = null;
  selectedQuestionNumber = 1;
  selectedCharacter = "";
  answerMinVal = new FormControl("", [
    Validators.pattern("^[0-9]*[.]?[0-9]+$|^[0-9]+[/]?[0-9]+$"),
    Validators.required,
  ]);
  answerMinInc = false;
  answerMaxVal = new FormControl("", [
    Validators.pattern("^[0-9]*[.]?[0-9]+$|^[0-9]+[/]?[0-9]+$"),
    Validators.required,
  ]);
  answerMaxInc = false;
  questions = [];
  answeredQuestions = [];
  topics = [];
  availableTopics = new FormArray([
    new FormGroup({
      topic: new FormControl(null, Validators.required),
      subTopic: new FormControl(null, Validators.required),
    }),
  ]);
  difficultyLevels = [];
  passageTypes = [];
  private readonly notifier: NotifierService;
  paramSubscription: Subscription;
  testId = null;
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
          this.testTypeId = response[0]["testTypeId"];
          this.testCode = response[0]["testCode"];
          this.sections = response[0]["sections"];
          this.answeredQuestions = [
            ...response[0]["sections"][0]["sectionQuestionIds"],
          ];
          this.questions = new Array(
            response[0]["sections"][0]["totalQuestions"]
          ).fill(0);
          this.getTopics(0);
          // if (
          //   response[0]["sections"][0]["sectionQuestionIds"].indexOf(1) > -1
          // ) {
          //   this.getQuestion(1);
          // }
          this.selectQuestion(1);
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch test details");
        }
      );
    this.httpClient
      .get("/api/difficulty_levels", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          // console.log(response);
          this.difficultyLevels = response;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch difficulty levels");
        }
      );
    this.httpClient
      .get("/api/passage_levels", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          // console.log(response);
          this.passageTypes = response;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch passage types");
        }
      );
  }

  onTopicSelection(index) {
    this.availableTopics.controls[index]["controls"]["subTopic"][
      "value"
    ] = null;
  }

  isQuestionAnswered(index) {
    // return this.answeredQuestions.indexOf(index) > -1;
    for (let i = 0; i < this.answeredQuestions.length; i++) {
      if (this.answeredQuestions[i]["qid"] === index) {
        return true;
      }
    }
    return false;
  }

  getTopics(sectionIndex) {
    this.subTopicsLoading = true;
    this.httpClient
      .get(
        `/api/get_topic_subtopic_score_sectionwise?scoring_section_id=${this.sections[sectionIndex]["scoringSectionId"]}&test_type_id=${this.testTypeId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        }
      )
      .subscribe(
        (response: any) => {
          console.log(JSON.parse(response.data));
          this.topics = JSON.parse(response.data)["result"];
          console.log(this.topics);
          this.subTopicsLoading = false;
          // for (let i = this.availableTopics.controls.length - 1; i >= 0; i--) {
          //   this.availableTopics.removeAt(i);
          // }
          // this.availableTopics.push(
          //   new FormGroup({
          //     topic: new FormControl(null, Validators.required),
          //     subTopic: new FormControl(null, Validators.required),
          //   })
          // );
        },
        (error) => {
          console.log(error);
          this.subTopicsLoading = false;
          this.topics = [];
        }
      );
  }

  onSectionSelection() {
    console.log(this.selectedSection);
    this.questions = new Array(
      this.sections[this.selectedSection]["totalQuestions"]
    ).fill(0);
    this.answeredQuestions = [
      ...this.sections[this.selectedSection]["sectionQuestionIds"],
    ];
    console.log(this.sections[this.selectedSection]);
    console.log(this.sections[this.selectedSection]["sectionTypeId"]);
    this.getTopics(this.selectedSection);
    // if (
    //   this.sections[this.selectedSection]["sectionQuestionIds"].indexOf(1) > -1
    // ) {
    //   this.getQuestion(1);
    // }
    this.selectQuestion(1);
    this.clearQuestion();
    // this.httpClient.get(`/api/get_topic_subtopic_sectionwise?section_type_id=${this.sections}`)
  }

  addTopic() {
    // console.log("addTopic reached");
    this.availableTopics.push(
      new FormGroup({
        topic: new FormControl(null, Validators.required),
        subTopic: new FormControl(null, Validators.required),
      })
    );
    // console.log([...this.availableTopics.controls]);
  }

  removeTopic(index) {
    this.availableTopics.removeAt(index);
  }

  numberValidator = (event: any) => {
    let value = /^[0-9]*[.]?[0-9]*$|^[0-9]+[/]?[0-9]*$/.test(
      event.target.value
    );
    // console.log(value);
    if (!value) {
      event.target.value = event.target.value.slice(0, -1);
    }
  };

  addNumber() {
    this.numbers.push(
      new FormControl("", [
        Validators.pattern("^[0-9]*[.]?[0-9]+$|^[0-9]+[/]?[0-9]+$"),
        Validators.required,
      ])
    );
  }

  removeNumber() {
    this.numbers.removeAt(this.numbers.controls.length - 1);
  }

  selectQuestion(question) {
    // console.log(question);
    this.selectedQuestionNumber = question;
    // if (this.answeredQuestions.indexOf(question) > -1) {
    //   this.getQuestion(question);
    // }
    this.clearQuestion();
    if (this.isQuestionAnswered(question)) {
      this.getQuestion(question);
    }
  }

  clearQuestion() {
    this.selectedLevel = null;
    this.selectedPassage = null;
    this.answerType = "char";
    this.selectedCharacter = "";
    for (let i = this.numbers.length - 1; i >= 0; i--) {
      this.numbers.removeAt(i);
    }
    this.addNumber();
    this.answerMinVal.setValue("");
    this.answerMinInc = false;
    this.answerMaxVal.setValue("");
    this.answerMaxInc = false;
    // console.log("Clearing topics");
    // for (let i = this.availableTopics.length - 1; i >= 0; i--) {
    //   this.availableTopics.removeAt(i);
    // }
    this.availableTopics = new FormArray([]);
    // console.log([...this.availableTopics.controls]);
    // console.log("adding single topic");
    this.addTopic();
  }

  getSubTopics(topicIndex) {
    let index = null;
    for (let i = 0; i < this.topics.length; i++) {
      if (
        this.topics[i]["topic_id"] ===
        this.availableTopics.controls[topicIndex]["controls"]["topic"]["value"]
      ) {
        index = i;
        break;
      }
    }
    return index !== null ? this.topics[index]["subtopics"] : [];
  }

  getQuestion(qid) {
    this.httpClient
      .get(
        `/api/get_each_question?qid=${qid}&section_id=${
          this.sections[this.selectedSection]["testSectionId"]
        }&test_id=${parseInt(this.testId)}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        }
      )
      .subscribe(
        (response: any) => {
          console.log(JSON.parse(response["data"]));
          const questionData = JSON.parse(response["data"]);
          this.selectedLevel = questionData.difficulty_level;
          if (this.sections[this.selectedSection]["isPassageType"]) {
            this.selectedPassage = questionData.passage_type;
          }
          if (questionData["answer_detail"]["is_char"] === 1) {
            this.answerType = "char";
            this.selectedCharacter =
              questionData["answer_detail"]["direct_answer"][0];
          } else {
            if (questionData["answer_detail"]["range_max"]) {
              this.answerType = "range";
              this.answerMinVal.setValue(
                questionData["answer_detail"]["range_min"]
              );
              this.answerMinInc =
                questionData["answer_detail"]["is_min_inclusive"] === 1;
              this.answerMaxVal.setValue(
                questionData["answer_detail"]["range_max"]
              );
              this.answerMaxInc =
                questionData["answer_detail"]["is_max_inclusive"] === 1;
            } else {
              this.answerType = "num";
              for (let i = this.numbers.length - 1; i >= 0; i--) {
                this.numbers.removeAt(i);
              }
              for (
                let i = 0;
                i < questionData["answer_detail"]["direct_answer"].length;
                i++
              ) {
                this.numbers.push(
                  new FormControl(
                    questionData["answer_detail"]["direct_answer"][i],
                    [
                      Validators.pattern(
                        "^[0-9]*[.]?[0-9]+$|^[0-9]+[/]?[0-9]+$"
                      ),
                      Validators.required,
                    ]
                  )
                );
              }
            }
          }
          // for (let i = this.availableTopics.controls.length - 1; i >= 0; i--) {
          //   this.availableTopics.removeAt(i);
          // }
          this.availableTopics = new FormArray([]);
          // console.log("adding topics");
          // console.log([...this.availableTopics.controls]);
          // console.log(questionData["topic_subtopic"]);
          for (let i = 0; i < questionData["topic_subtopic"].length; i++) {
            // console.log(
            //   "inside topic subtopic",
            //   questionData["topic_subtopic"][i]["topic"],
            //   questionData["topic_subtopic"][i]["subtopic"]
            // );
            // console.log("Topic being updated");
            this.availableTopics.push(
              new FormGroup({
                topic: new FormControl(
                  questionData["topic_subtopic"][i]["topic"],
                  Validators.required
                ),
                subTopic: new FormControl(
                  questionData["topic_subtopic"][i]["subtopic"],
                  Validators.required
                ),
              })
            );
            // console.log([...this.availableTopics.controls]);
          }
          if (questionData["topic_subtopic"].length === 0) {
            console.log("addTopic called from getquestion");
            this.addTopic();
          }
          // console.log([...this.availableTopics.controls]);
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to Fetch Question Data");
        }
      );
  }

  saveQuestion(status) {
    if (!this.saveQuestionClicked) {
      this.saveQuestionClicked = true;
      let errorOccurred = false;
      console.log(this.numbers, this.answerMaxVal, this.answerMinVal);
      if (this.answerType === "char" && this.selectedCharacter === "") {
        errorOccurred = true;
      } else if (this.answerType === "num" && this.numbers.invalid) {
        errorOccurred = true;
      } else if (
        this.answerType === "range" &&
        (this.answerMaxVal.invalid || this.answerMinVal.invalid)
      ) {
        errorOccurred = true;
      }
      this.error = errorOccurred;
      console.log(errorOccurred);
      if (!errorOccurred) {
        console.log("inside");
        const numbers = [];
        if (this.answerType === "num") {
          for (let i = 0; i < this.numbers.controls.length; i++) {
            numbers.push(this.numbers.controls[i]["value"]);
          }
        }
        const data = {};
        data["test_id"] = parseInt(this.testId);
        data["tst_id"] = this.sections[this.selectedSection]["testSectionId"];
        data["qid"] = this.selectedQuestionNumber;
        data["question"] = {
          difficulty_level: this.selectedLevel,
        };
        if (this.sections[this.selectedSection]["isPassageType"]) {
          data["question"]["passage_type"] = this.selectedPassage;
        }
        data["topics"] = [];
        for (let i = 0; i < this.availableTopics.controls.length; i++) {
          console.log(this.availableTopics.controls[i]);
          if (this.availableTopics.controls[i]["valid"]) {
            data["topics"].push({
              topic_id: this.availableTopics.controls[i]["controls"]["topic"][
                "value"
              ],
              subtopic_id: this.availableTopics.controls[i]["controls"][
                "subTopic"
              ]["value"],
            });
          }
        }
        data["question_answer"] = {};
        if (this.answerType === "char") {
          data["question_answer"]["is_char"] = 1;
          data["question_answer"]["answerType"] = 1;
          data["question_answer"]["direct_answer"] = this.selectedCharacter;
        } else {
          data["question_answer"]["is_char"] = 0;
          if (this.answerType === "range") {
            data["question_answer"]["answerType"] = 3;
            data["question_answer"]["is_min_inclusive"] = this.answerMinInc
              ? 1
              : 0;
            data["question_answer"]["range_min"] = this.answerMinVal.value;
            data["question_answer"]["is_max_inclusive"] = this.answerMaxInc
              ? 1
              : 0;
            data["question_answer"]["range_max"] = this.answerMaxVal.value;
          } else {
            data["question_answer"]["answerType"] = 2;
            data["question_answer"]["direct_answer"] = numbers;
          }
        }
        console.log(data);
        this.httpClient
          .post("/api/save_answer", data, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
              responseType: "json",
            },
          })
          .subscribe(
            (response) => {
              console.log(response);
              this.saveQuestionClicked = false;
              this.notifier.notify(
                "success",
                "Successfully saved the question"
              );
              // if (
              //   this.answeredQuestions.indexOf(this.selectedQuestionNumber) < 0
              // ) {
              //   this.answeredQuestions.push(this.selectedQuestionNumber);
              // }
              const doesQuestionAlreadyExists = this.isQuestionAnswered(
                this.selectedQuestionNumber
              );
              if (!doesQuestionAlreadyExists) {
                this.answeredQuestions.push({
                  qid: this.selectedQuestionNumber,
                  isChar: this.answerType === "char" ? 1 : 0,
                });
              }
              if (status === "next") {
                this.sections[this.selectedSection]["sectionQuestionIds"] = [
                  ...this.answeredQuestions,
                ];
                if (this.selectedQuestionNumber === this.questions.length) {
                  this.selectQuestion(1);
                } else {
                  this.selectQuestion(this.selectedQuestionNumber + 1);
                }
              } else if (status === "exit") {
                this.router.navigate(["/tests"]);
              }
            },
            (error) => {
              console.log(error);
              this.saveQuestionClicked = false;
              this.notifier.notify("error", "Unable to save question");
            }
          );
      } else {
        console.log("enabling save button");
        this.saveQuestionClicked = false;
      }
    }
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }
}
