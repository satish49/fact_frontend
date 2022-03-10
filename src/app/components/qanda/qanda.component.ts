import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-qanda",
  templateUrl: "./qanda.component.html",
  styleUrls: ["./qanda.component.scss"],
})
export class QandaComponent implements OnInit {
  testTypes = [];
  selectedTestType = null;
  selectedTestName = "";
  role = localStorage.roleId;
  searchTable = "";
  tests = new MatTableDataSource(<any>[]);
  columnsToDisplay = [
    "test_type",
    "test_code",
    "status",
    "assign",
    "score",
    "analyze",
    "actions",
  ];
  private readonly notifier: NotifierService;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.tests.paginator = this.paginator;
    this.httpClient
      .get("/api/test_types", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          this.testTypes = response;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch test types");
        }
      );
  }

  applyFilter() {
    console.log(this.searchTable);
    this.tests.filter = this.searchTable.trim().toLowerCase();
  }

  getTests() {
    console.log(this.selectedTestType);
    this.selectedTestName = this.testTypes[this.selectedTestType][
      "testTypeName"
    ];
    console.log(this.selectedTestName);
    this.httpClient
      .get(
        `/api/get_tests_by_test_type_id?testTypeId=${
          this.testTypes[this.selectedTestType]["testTypeId"]
        }`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        }
      )
      .subscribe(
        (response: any) => {
          console.log(response);
          this.tests = new MatTableDataSource(response);
          this.tests.paginator = this.paginator;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to load tests");
        }
      );
  }
}
