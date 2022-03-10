import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"]
})
export class UsersComponent implements OnInit {
  private readonly notifier: NotifierService;
  // status = 0;
  role = "0";
  roles = [];
  users = new MatTableDataSource(<any>[]);
  editArray = [];
  updateArray = [];
  columnsToDisplay = [
    "first_name",
    "email",
    "gender",
    "role_id",
    "registration_request_note",
    "user_status",
    "actions"
  ];

  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    // this.status = localStorage.status;
    this.role = localStorage.roleId;
  }

  applyFilter(filterValue: string) {
    this.users.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    if (localStorage.roleId === "1") {
      this.httpClient
        .get("/api/users", {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken
          }
        })
        .subscribe(
          (response: any) => {
            this.users = new MatTableDataSource(response);
          },
          error => {
            this.notifier.notify("error", "Unable to fetch data");
          }
        );
      this.httpClient
        .get("/api/roles", {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken
          }
        })
        .subscribe(
          (response: any) => {
            console.log(response);
            this.roles = response;
          },
          error => {
            console.log(error);
            this.notifier.notify("error", "Unable to fetch roles");
          }
        );
    }
  }

  // editFunction = index => {
  //   if (this.editArray.indexOf(index) < 0) {
  //     this.editArray.push(index);
  //   }
  // };

  // cancelEdit = index => {
  //   this.editArray.splice(this.editArray.indexOf(index), 1);
  //   // this.users[index] = {
  //   //   first_name: "abc",
  //   //   last_name: "bca",
  //   //   user_status: 2,
  //   //   role_id: 1,
  //   //   gender: 1,
  //   //   registration_request_note: "bla"
  //   // };
  //   console.log(this.users);
  // };

  changeInitiated = index => {
    if (this.editArray.indexOf(index) < 0) {
      this.editArray.push(index);
    }
  };

  saveUserData = index => {
    console.log("save clicked");
    if (this.updateArray.indexOf(index) < 0) {
      console.log("reached inside");
      this.updateArray.push(index);
      console.log(index);
      console.log(this.users.data[index]);
      const userData: any = this.users.data[index];
      console.log(userData);
      this.httpClient
        .put(
          "/api/admin_user_status_change",
          {
            user_id: userData.user_id,
            user_status: parseInt(userData.user_status),
            role_id: parseInt(userData.role_id)
          },
          {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken
            }
          }
        )
        .subscribe(
          response => {
            console.log(response);
            this.editArray.splice(this.editArray.indexOf(index), 1);
            this.updateArray.splice(this.updateArray.indexOf(index), 1);
            this.notifier.notify(
              "success",
              "Successfully updated user details"
            );
          },
          error => {
            this.updateArray.splice(this.updateArray.indexOf(index));
            this.notifier.notify("error", "Unable to update user details");
          }
        );
    }
  };
}
