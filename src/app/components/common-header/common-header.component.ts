import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  Input,
} from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from "src/app/services/common.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-common-header",
  templateUrl: "./common-header.component.html",
  styleUrls: ["./common-header.component.scss"],
})
export class CommonHeaderComponent implements OnInit, OnDestroy {
  dropDownOpen = false;
  mobileDropDownOpen = false;
  mobileNav = false;
  userName = "";
  userNameSubscription: Subscription;
  @Input("isRoleSelectPage") isRoleSelectPage;
  @Input("isAdminOrTutor") isAdminOrTutor;

  constructor(private router: Router, private commonService: CommonService) {}

  ngOnInit() {
    console.log(this.isRoleSelectPage);
    this.userNameSubscription = this.commonService
      .getUserName()
      .subscribe((name) => {
        this.userName = name;
      });
  }

  onMobileNav() {
    this.mobileNav = !this.mobileNav;
    this.mobileDropDownOpen = false;
  }

  @HostListener("document:click", ["$event"])
  onClickEvent(event: MouseEvent) {
    if (event.target["id"] !== "common-header__dropDown") {
      this.dropDownOpen = false;
    }
  }

  toggleDropdown = () => {
    this.dropDownOpen = !this.dropDownOpen;
  };

  toggleMobileDropdown = () => {
    this.mobileDropDownOpen = !this.mobileDropDownOpen;
  };

  logout() {
    localStorage.clear();
    this.router.navigate([""]);
  }

  ngOnDestroy() {
    this.userNameSubscription.unsubscribe();
  }
}
