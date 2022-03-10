import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: 'app-student-classes',
  templateUrl: './student-classes.component.html',
  styleUrls: ['./student-classes.component.scss']
})
export class StudentClassesComponent implements OnInit {
  role = localStorage.roleId;
  private readonly notifier: NotifierService;
  student_classes = [];

  constructor(private httpClient: HttpClient,
    notifierService: NotifierService
    ) { 
      this.notifier = notifierService;
    }

  ngOnInit() {
    this.httpClient
        .get("/api/get_student_classes?studentId="+localStorage.userId, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken
          }
        })
        .subscribe(
          (response: any) => {
            console.log(response);
            this.student_classes = JSON.parse(response["data"]);
          },
          error => {
            console.log(error);
            this.notifier.notify("error", "Unable to fetch student class details");
          }
        );
  }

}
