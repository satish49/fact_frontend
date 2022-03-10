import { Component, OnInit, HostListener, OnDestroy } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-terms",
  templateUrl: "./terms.component.html",
  styleUrls: ["./terms.component.scss"]
})
export class TermsComponent implements OnInit, OnDestroy {
  routeSubsciption: Subscription;
  isPrivacyPolicy = false;
  constructor(public route: ActivatedRoute) {
    this.routeSubsciption = this.route.params.subscribe((params: Params) => {
      if (window.location.hash === "#/terms") {
        this.isPrivacyPolicy = false;
      } else if (window.location.hash === "#/privacy-policy") {
        this.isPrivacyPolicy = true;
      }
    });
  }

  ngOnInit() {}

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    let element = document.querySelector("#terms__header");
    if (window.pageYOffset > element.clientHeight / 3) {
      element.classList.add("terms__header__whiteBackground");
    } else {
      element.classList.remove("terms__header__whiteBackground");
    }
  }

  ngOnDestroy() {
    this.routeSubsciption.unsubscribe();
  }
}
