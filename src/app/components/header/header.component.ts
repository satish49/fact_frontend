import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  mobileNav = false;

  path: string;
  showDropdown = false;
  accessToken = "";
  role = "";
  constructor(public router: Router) {
    this.router.events.subscribe(eves => {
      if (eves instanceof NavigationEnd) {
        this.path = eves.url;
        console.log(window.location);
        this.path = window.location.hash;
        this.accessToken = localStorage.accessToken;
        this.role = localStorage.roleId;
        console.log(this.accessToken, this.role);
      }
    });
    // this.path = "/";
  }

  ngOnInit() {}
  onMobileNav() {
    this.mobileNav = !this.mobileNav;
  }

  logout() {
    localStorage.clear();
    this.router.navigate([""]);
  }

  toggleDropdown = () => {
    this.showDropdown = !this.showDropdown;
  };
}
