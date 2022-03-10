import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-list-of-tests",
  templateUrl: "./list-of-tests.component.html",
  styleUrls: ["./list-of-tests.component.scss"],
})
export class ListOfTestsComponent implements OnInit {
  testTypes = [];
  role = localStorage.roleId;
  selectedTestType = null;
  selectedTestName = "";
  searchTable = "";
  tests = new MatTableDataSource(<any>[]);
  columnsToDisplay = [
    "test_type",
    "test_code",
    "test_date",
    "status",
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
    this.httpClient
      .get("/api/student_tests", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          // this.testTypes = response;
          this.tests = new MatTableDataSource(
            response.sort((first, second) =>
              first["completeBy"] > second["completeBy"] ? -1 : 1
            )
          );
          this.tests.paginator = this.paginator;
        },
        (error) => {
          console.log(error);
          if (error["status"] !== 404) {
            this.notifier.notify("error", "Unable to fetch tests");
          } else {
            this.notifier.notify("info", "No tests found");
          }
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
        `/api/student_tests_by_test_type_id?testTypeId=${
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
