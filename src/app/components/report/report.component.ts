import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonService } from "src/app/services/common.service";
import { Subscription } from "rxjs";
import { ActivatedRoute, Params } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
})
export class ReportComponent implements OnInit, OnDestroy {
  role = localStorage.roleId;
  student_id = "";
  test_id = "";
  test_date = "";
  test_details = null;
  studentTestId = "";
  testDetailsLoading = true;
  testDetailsLoaded = false;
  analysisLoaded = false;
  scoringSections = [];
  paramSubscription: Subscription;
  private readonly notifier: NotifierService;
  constructor(
    public commonService: CommonService,
    public route: ActivatedRoute,
    public httpClient: HttpClient,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.paramSubscription = this.route.params.subscribe((params: Params) => {
      this.studentTestId = params.studentTestId;
    });
  }

  ngOnInit() {
    this.httpClient
      .get(`/api/get_each_test_score?student_test_id=${this.studentTestId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          console.log(JSON.parse(response.data));
          this.testDetailsLoading = false;
          this.testDetailsLoaded = true;
          this.test_details = JSON.parse(response.data);
          for (
            let i = 0;
            i < this.test_details["detailed_report"]["length"];
            i++
          ) {
            for (
              let j = 0;
              j < this.test_details["detailed_report"][i]["sections"]["length"];
              j++
            ) {
              const range = [];
              for (
                let k = 0;
                k <
                this.test_details["detailed_report"][i]["sections"][j][
                  "detail_report"
                ]["length"] /
                  25;
                k++
              ) {
                range.push({
                  elements: [
                    ...this.test_details["detailed_report"][i]["sections"][j][
                      "detail_report"
                    ].slice(k * 25, k * 25 + 25),
                  ],
                });
              }
              this.test_details["detailed_report"][i]["sections"][j][
                "range"
              ] = range;
            }
          }
          console.log(this.test_details);
        },
        (error) => {
          this.notifier.notify("error", "Unable to fetch report data");
          console.log(error);
          this.testDetailsLoading = false;
        }
      );
    this.httpClient
      .get(`/api/analysis?student_test_id=${this.studentTestId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          console.log(JSON.parse(response["data"]));
          const data = JSON.parse(response["data"]);
          const uniqueScoringSectionIds = []; //[1]
          const uniqueTopicIds = []; //[[1,2]]
          const uniqueSubTopicIds = []; //[[[1,2], [1]]]
          const scoringSections = [];
          for (let i = 0; i < data["length"]; i++) {
            if (
              uniqueScoringSectionIds.indexOf(data[i]["scoring_section_id"]) < 0
            ) {
              uniqueScoringSectionIds.push(data[i]["scoring_section_id"]);
              uniqueTopicIds.push([]);
              uniqueTopicIds[
                uniqueScoringSectionIds.indexOf(data[i]["scoring_section_id"])
              ].push(data[i]["topic_id"]);
              uniqueSubTopicIds.push([[]]);
              // uniqueSubTopicIds[uniqueTopicIds[uniqueScoringSectionIds.indexOf(data[i]['scoring_section_id'])]].push(data[i]['subtopic_id']);
              uniqueSubTopicIds[
                uniqueScoringSectionIds.indexOf(data[i]["scoring_section_id"])
              ][
                uniqueTopicIds[
                  uniqueScoringSectionIds.indexOf(data[i]["scoring_section_id"])
                ].indexOf(data[i]["topic_id"])
              ].push(data[i]["subtopic_id"]);
              scoringSections.push({
                scoringSectionName: data[i]["scoring_section_name"],
                scoringSectionId: data[i]["scoring_section_id"],
                topics: [
                  {
                    topicId: data[i]["topic_id"],
                    topicName: data[i]["topic_name"],
                    totalQuestions: data[i]["total_q"],
                    totalCorrect:
                      data[i]["c_type"] === "correct" ? data[i]["total_q"] : 0,
                    subTopics: [
                      {
                        subTopicId: data[i]["subtopic_id"],
                        subTopicName: data[i]["subtopic_name"],
                        total: data[i]["total_q"],
                        missed:
                          data[i]["c_type"] === "missed"
                            ? data[i]["total_q"]
                            : 0,
                        correct:
                          data[i]["c_type"] === "correct"
                            ? data[i]["total_q"]
                            : 0,
                        wrong:
                          data[i]["c_type"] === "wrong"
                            ? data[i]["total_q"]
                            : 0,
                        missedQuestions:
                          data[i]["c_type"] === "missed" ? data[i]["ids"] : "",
                        wrongQuestions:
                          data[i]["c_type"] === "wrong" ? data[i]["ids"] : "",
                      },
                    ],
                  },
                ],
              });
            } else {
              const scoringSectionIndex = uniqueScoringSectionIds.indexOf(
                data[i]["scoring_section_id"]
              );
              if (
                uniqueTopicIds[scoringSectionIndex].indexOf(
                  data[i]["topic_id"]
                ) < 0
              ) {
                uniqueTopicIds[scoringSectionIndex].push(data[i]["topic_id"]);
                uniqueSubTopicIds[scoringSectionIndex].push([]);
                uniqueSubTopicIds[scoringSectionIndex][
                  uniqueTopicIds[scoringSectionIndex].indexOf(
                    data[i]["topic_id"]
                  )
                ].push(data[i]["subtopic_id"]);
                scoringSections[scoringSectionIndex]["topics"].push({
                  topicId: data[i]["topic_id"],
                  topicName: data[i]["topic_name"],
                  totalQuestions: data[i]["total_q"],
                  totalCorrect:
                    data[i]["c_type"] === "correct" ? data[i]["total_q"] : 0,
                  subTopics: [
                    {
                      subTopicId: data[i]["subtopic_id"],
                      subTopicName: data[i]["subtopic_name"],
                      total: data[i]["total_q"],
                      missed:
                        data[i]["c_type"] === "missed" ? data[i]["total_q"] : 0,
                      correct:
                        data[i]["c_type"] === "correct"
                          ? data[i]["total_q"]
                          : 0,
                      wrong:
                        data[i]["c_type"] === "wrong" ? data[i]["total_q"] : 0,
                      missedQuestions:
                        data[i]["c_type"] === "missed" ? data[i]["ids"] : "",
                      wrongQuestions:
                        data[i]["c_type"] === "wrong" ? data[i]["ids"] : "",
                    },
                  ],
                });
              } else {
                const topicIndex = uniqueTopicIds[scoringSectionIndex].indexOf(
                  data[i]["topic_id"]
                );
                const topic = {
                  ...scoringSections[scoringSectionIndex]["topics"][topicIndex],
                };
                scoringSections[scoringSectionIndex]["topics"][topicIndex][
                  "totalQuestions"
                ] = topic["totalQuestions"] + data[i]["total_q"];
                scoringSections[scoringSectionIndex]["topics"][topicIndex][
                  "totalCorrect"
                ] =
                  data[i]["c_type"] === "correct"
                    ? topic["totalCorrect"] + data[i]["total_q"]
                    : topic["totalCorrect"];
                if (
                  uniqueSubTopicIds[scoringSectionIndex][topicIndex].indexOf(
                    data[i]["subtopic_id"]
                  ) < 0
                ) {
                  uniqueSubTopicIds[scoringSectionIndex][topicIndex].push(
                    data[i]["subtopic_id"]
                  );
                  scoringSections[scoringSectionIndex]["topics"][topicIndex][
                    "subTopics"
                  ].push({
                    subTopicId: data[i]["subtopic_id"],
                    subTopicName: data[i]["subtopic_name"],
                    total: data[i]["total_q"],
                    missed:
                      data[i]["c_type"] === "missed" ? data[i]["total_q"] : 0,
                    correct:
                      data[i]["c_type"] === "correct" ? data[i]["total_q"] : 0,
                    wrong:
                      data[i]["c_type"] === "wrong" ? data[i]["total_q"] : 0,
                    missedQuestions:
                      data[i]["c_type"] === "missed" ? data[i]["ids"] : "",
                    wrongQuestions:
                      data[i]["c_type"] === "wrong" ? data[i]["ids"] : "",
                  });
                } else {
                  const subTopicIndex = uniqueSubTopicIds[scoringSectionIndex][
                    topicIndex
                  ].indexOf(data[i]["subtopic_id"]);
                  const subtopic = {
                    ...scoringSections[scoringSectionIndex]["topics"][
                      topicIndex
                    ]["subTopics"][subTopicIndex],
                  };
                  scoringSections[scoringSectionIndex]["topics"][topicIndex][
                    "subTopics"
                  ][subTopicIndex]["missed"] =
                    data[i]["c_type"] === "missed"
                      ? subtopic["missed"] + data[i]["total_q"]
                      : subtopic["missed"];
                  scoringSections[scoringSectionIndex]["topics"][topicIndex][
                    "subTopics"
                  ][subTopicIndex]["correct"] =
                    data[i]["c_type"] === "correct"
                      ? subtopic["correct"] + data[i]["total_q"]
                      : subtopic["correct"];
                  scoringSections[scoringSectionIndex]["topics"][topicIndex][
                    "subTopics"
                  ][subTopicIndex]["wrong"] =
                    data[i]["c_type"] === "wrong"
                      ? subtopic["wrong"] + data[i]["total_q"]
                      : subtopic["wrong"];
                  scoringSections[scoringSectionIndex]["topics"][topicIndex][
                    "subTopics"
                  ][subTopicIndex]["missedQuestions"] =
                    data[i]["c_type"] === "missed"
                      ? data[i]["ids"]
                      : subtopic["missedQuestions"];
                  scoringSections[scoringSectionIndex]["topics"][topicIndex][
                    "subTopics"
                  ][subTopicIndex]["wrongQuestions"] =
                    data[i]["c_type"] === "wrong"
                      ? data[i]["ids"]
                      : subtopic["wrongQuestions"];
                  scoringSections[scoringSectionIndex]["topics"][topicIndex][
                    "subTopics"
                  ][subTopicIndex]["total"] =
                    data[i]["total_q"] + subtopic["total"];
                }
              }
            }
          }
          console.log(scoringSections);
          this.scoringSections = scoringSections;
          this.analysisLoaded = true;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to load Analysis report");
        }
      );
  }

  scrollTo(id) {
    // const element = document.getElementById(id);
    // element.scrollIntoView();
    let element = document.getElementById(id);
    if (element) {
      let headerOffset = 100;
      let elementPosition = element.getBoundingClientRect().top;
      let offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }
}
