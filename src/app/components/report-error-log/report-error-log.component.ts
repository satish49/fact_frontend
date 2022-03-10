import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-report-error-log",
  templateUrl: "./report-error-log.component.html",
  styleUrls: ["./report-error-log.component.scss"],
})
export class ReportErrorLogComponent implements OnInit {
  @Input("testDetails") testDetails;
  errorDetails = [];

  constructor() {}

  ngOnInit() {
    for (let i = 0; i < this.testDetails["detailed_report"]["length"]; i++) {
      const scoringSection = {
        scoringSectionName: this.testDetails["detailed_report"][i][
          "scoring_section_name"
        ],
      };
      const errorQuestions = [];
      for (
        let j = 0;
        j < this.testDetails["detailed_report"][i]["sections"]["length"];
        j++
      ) {
        for (
          let k = 0;
          k <
          this.testDetails["detailed_report"][i]["sections"][j][
            "detail_report"
          ]["length"];
          k++
        ) {
          if (
            this.testDetails["detailed_report"][i]["sections"][j][
              "detail_report"
            ][k]["is_correct"] === 0 &&
            this.testDetails["detailed_report"][i]["sections"][j][
              "detail_report"
            ][k]["student_answers"][0] !== null
          ) {
            const eachQuestion = {
              ...this.testDetails["detailed_report"][i]["sections"][j][
                "detail_report"
              ][k],
            };
            eachQuestion["qid"] = k + 1;
            eachQuestion["sectionName"] = this.testDetails["detailed_report"][
              i
            ]["sections"][j]["section_name"];
            const subTopics = [];
            for (
              let l = 0;
              l <
              this.testDetails["detailed_report"][i]["sections"][j][
                "detail_report"
              ][k]["topics"]["length"];
              l++
            ) {
              for (
                let m = 0;
                m <
                this.testDetails["detailed_report"][i]["sections"][j][
                  "detail_report"
                ][k]["topics"][l]["subtopics"]["length"];
                m++
              ) {
                subTopics.push(
                  this.testDetails["detailed_report"][i]["sections"][j][
                    "detail_report"
                  ][k]["topics"][l]["subtopics"][m]
                );
              }
            }
            eachQuestion["subTopics"] = subTopics;
            errorQuestions.push(eachQuestion);
          }
        }
      }
      scoringSection["errorQuestions"] = errorQuestions;
      this.errorDetails.push(scoringSection);
    }
    console.log(this.errorDetails);
  }
}
