import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-report-analysis",
  templateUrl: "./report-analysis.component.html",
  styleUrls: ["./report-analysis.component.scss"],
})
export class ReportAnalysisComponent implements OnInit {
  @Input("scoringSections") scoringSections;
  constructor() {}

  ngOnInit() {
    console.log(this.scoringSections);
  }
  calculatePercentage(correct, total) {
    return Math.round((correct / total) * 100);
  }
}
