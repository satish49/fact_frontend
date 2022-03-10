import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { NotifierService } from "angular-notifier";
import { facebookURL } from "../../app-url.config";
import { Subscription } from "rxjs";
import { googleURL } from "../../app-url.config";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly notifier: NotifierService;
  loginRegisterText = "";
  queryParamSubscription: Subscription;
  routeParamSubscription: Subscription;
  profileUpdated = false;
  profileBlocked = false;
  errorPage = false;
  errorMessage = "";
  facebookURL = facebookURL;
  googleURL = googleURL;
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    notifierService: NotifierService,
    private commonService: CommonService
  ) {
    this.notifier = notifierService;
    console.log(this.route);
    this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
      this.profileBlocked = false;
      this.profileUpdated = false;
      this.errorPage = false;
      this.errorMessage = "";
      if (params.status === "1") {
        localStorage.status = params.status;
        localStorage.accessToken = params.token;
        this.router.navigate(["/role-select"]);
      } else if (params.status === "2") {
        this.profileUpdated = true;
      } else if (params.status === "3") {
        localStorage.status = params.status;
        localStorage.roleId = params.role_id;
        localStorage.accessToken = params.token;
        this.commonService.setUserName("");
        this.router.navigate(["/dashboard"]);
      } else if (params.status === "4") {
        this.profileBlocked = true;
      } else if (params.message) {
        this.errorPage = true;
        this.errorMessage = params.message;
      }
    });
    this.routeParamSubscription = this.route.params.subscribe(
      (params: Params) => {
        if (window.location.hash === "#/register") {
          this.loginRegisterText = "Register";
        } else if (window.location.hash === "#/login") {
          this.loginRegisterText = "Login";
        }
      }
    );
  }

  ngOnInit() {}

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    let element = document.querySelector("#login__header");
    if (window.pageYOffset > element.clientHeight / 3) {
      element.classList.add("login__header__whiteBackground");
    } else {
      element.classList.remove("login__header__whiteBackground");
    }
  }

  ngOnDestroy() {
    this.queryParamSubscription.unsubscribe();
  }
}
