import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatTableDataSource } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import * as moment from "moment";

@Component({
  selector: "app-classes",
  templateUrl: "./classes.component.html",
  styleUrls: ["./classes.component.scss"],
})
export class ClassesComponent implements OnInit {
  role = localStorage.roleId;
  originalBatches = [];
  classes = new MatTableDataSource(<any>[]);
  columnsToDisplay = [
    "batch_name",
    "course",
    "start_date",
    "schedule",
    "students",
    "actions",
  ];
  searchTable = "";
  selectedBatchType = 1;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private readonly notifier: NotifierService;
  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
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
          this.originalBatches = data["batches"];
          console.log(this.originalBatches);
          this.getSelectedBatches();
        },
        (error) => {
          this.notifier.notify("error", "Unable to fetch batches");
        }
      );
  }

  convertDate(date) {
    return moment(date).format("DD MMM, YYYY");
  }

  applyFilter() {
    this.classes.filter = this.searchTable.trim().toLowerCase();
  }

  getSelectedBatches() {
    let batches = [...this.originalBatches];
    if (this.selectedBatchType === 1) {
      batches = batches.filter((batch) => batch["isBatchActive"] === 1);
    } else if (this.selectedBatchType === 2) {
      batches = batches.filter((batch) => batch["isBatchActive"] === 0);
    }
    this.classes = new MatTableDataSource(batches);
    this.classes.paginator = this.paginator;
    this.applyFilter();
  }
}
