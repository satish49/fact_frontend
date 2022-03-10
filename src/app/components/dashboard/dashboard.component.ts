import { Component, OnInit, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { Router } from "@angular/router";
import { CommonService } from "src/app/services/common.service";
import { Subscription } from "rxjs";
import { ParentChildrenService } from "src/app/services/parent-children.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  status = "0";
  role = "0";
  name = "";
  childrenLoading = true;
  children = <any>[];
  selectedChild = 0;
  private readonly notifier: NotifierService;
  private parentChildrenArraySubscription: Subscription;
  private parentChildrenIndexSubscription: Subscription;

  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService,
    private router: Router,
    private commonService: CommonService,
    private parentChildrenServcie: ParentChildrenService
  ) {
    this.status = localStorage.status;
    this.role = localStorage.roleId;
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.childrenLoading = true;
    this.httpClient
      .get("/api/get_user", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
        responseType: "json",
      })
      .subscribe(
        (response) => {
          console.log(response);
          this.name = `${response["first_name"]} ${response["last_name"]}`;
          this.commonService.setUserName(
            response["first_name"] ? response["first_name"] : ""
          );
          localStorage.userName = response["first_name"]
            ? response["first_name"]
            : "";
          if (response["role_id"]) {
            localStorage.roleId = response["role_id"];
          }
          if (response["user_id"]) {
            localStorage.userId = response["user_id"];
          }
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch data");
        }
      );
    if (localStorage.roleId === "4") {
      this.parentChildrenIndexSubscription = this.parentChildrenServcie.selectedChildren.subscribe(
        (index) => {
          this.selectedChild = parseInt(index);
        }
      );
      this.httpClient
        .get("/api/get_childrens", {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
          responseType: "json",
        })
        .subscribe(
          (response) => {
            console.log(response);
            this.childrenLoading = false;
            this.parentChildrenServcie.setChildren(response);
            this.parentChildrenArraySubscription = this.parentChildrenServcie.children.subscribe(
              (children) => {
                this.children = children;
              }
            );
            // this.children = response;
            console.log(this.children);
          },
          (error) => {
            console.log(error);
            this.notifier.notify("error", "Unable to load children");
            this.childrenLoading = false;
          }
        );
    }
  }

  setchildren() {
    console.log(this.selectedChild);
    this.parentChildrenServcie.setSelectedChildren(this.selectedChild);
  }
  logout() {
    localStorage.clear();
    this.router.navigate([""]);
  }

  ngOnDestroy() {
    console.log("Destroy reached");
    if (this.parentChildrenArraySubscription) {
      this.parentChildrenArraySubscription.unsubscribe();
    }
    if (this.parentChildrenIndexSubscription) {
      this.parentChildrenIndexSubscription.unsubscribe();
    }
  }
}
