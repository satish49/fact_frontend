import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-error",
  templateUrl: "./error.component.html",
  styleUrls: ["./error.component.scss"]
})
export class ErrorComponent implements OnInit {
  errorMessage = "";
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params.message;
    });
  }

  ngOnInit() {}
}
