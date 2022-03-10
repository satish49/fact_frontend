import { Component, OnInit, HostListener } from "@angular/core";

@Component({
  selector: "app-our-team",
  templateUrl: "./our-team.component.html",
  styleUrls: ["./our-team.component.scss"],
})
export class OurTeamComponent implements OnInit {
  mobileNav = false;

  constructor() {}

  ngOnInit() {}

  onMobileNav() {
    this.mobileNav = !this.mobileNav;
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    let element = document.querySelector("#our-team__header");
    if (window.pageYOffset > element.clientHeight / 3) {
      element.classList.add("our-team__header__whiteBackground");
    } else {
      element.classList.remove("our-team__header__whiteBackground");
    }
  }
}
