import { Component, OnInit, HostListener, OnDestroy } from "@angular/core";

@Component({
  selector: "app-landing-page",
  templateUrl: "./landing-page.component.html",
  styleUrls: ["./landing-page.component.scss"],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  mobileNav = false;
  carouselIndex = 0;
  carouselTimer;
  carouselDirection = "increment";
  carouselContent = [
    {
      title:
        "<p><span class='landingPage__body__right__top--title--bold'>Srivani</span> went from <span class='landingPage__body__right__top--title--lowMark'>1250</span> on <span class='landingPage__body__right__top--title--bold'>PSAT</span> to a <span class='landingPage__body__right__top--title--highMark'>1550</span> on the <span class='landingPage__body__right__top--title--bold'>SAT</span></p>",
      body:
        "Ravi's Academy goes out of their way to make sure every student understands the solution to every problem",
    },
    {
      title:
        "<p><span class='landingPage__body__right__top--title--bold'>Aarti</span> went from <span class='landingPage__body__right__top--title--lowMark'>1220</span> on <span class='landingPage__body__right__top--title--bold'>PSAT</span> to a <span class='landingPage__body__right__top--title--highMark'>1520</span> on the <span class='landingPage__body__right__top--title--bold'>SAT</span></p>",
      body:
        "Although the classes are in small group settings, everyone's voice and questions are heard and addressed, which made it very personal to me",
    },
    {
      title:
        "<p><span class='landingPage__body__right__top--title--bold'>Ryan</span> went from <span class='landingPage__body__right__top--title--lowMark'>1300</span> on <span class='landingPage__body__right__top--title--bold'>PSAT</span> to <span class='landingPage__body__right__top--title--highMark'>1590</span> on the <span class='landingPage__body__right__top--title--bold'>SAT</span></p>",
      body:
        "Trying to find a solution to improve my score, I came to Ravi, who guided me in not just problem practice, but also the mindset and focus with which I approached questions. I finally started seeing the results I had hoped to see, and this effect spread beyond my SAT’s to my school grades as well",
    },
    {
      title:
        "<p><span class='landingPage__body__right__top--title--bold'>Sameer</span> went from <span class='landingPage__body__right__top--title--lowMark'>28</span> to <span class='landingPage__body__right__top--title--highMark'>35</span> on <span class='landingPage__body__right__top--title--bold'>ACT</span></p>",
      body:
        "His teachings on how to manipulate and work through logic problems and other math problems was invaluable to me, and I still utilize the skills he taught me to this day in college",
    },
  ];

  constructor() {}

  ngOnInit() {
    this.setTimer();
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    let element = document.querySelector("#landingPage__header");
    if (window.pageYOffset > element.clientHeight / 3) {
      element.classList.add("landingPage__header__whiteBackground");
    } else {
      element.classList.remove("landingPage__header__whiteBackground");
    }
  }

  previousSlide = () => {
    if (this.carouselIndex > 0) {
      this.carouselIndex--;
      clearInterval(this.carouselTimer);
      this.setTimer();
    }
  };

  nextSlide = () => {
    if (this.carouselIndex < this.carouselContent.length - 1) {
      this.carouselIndex++;
      clearInterval(this.carouselTimer);
      this.setTimer();
    }
  };

  gotoSlide = (index) => {
    this.carouselIndex = index;
  };

  onMobileNav() {
    this.mobileNav = !this.mobileNav;
  }

  setTimer() {
    this.carouselTimer = setInterval(() => this.rotateCarousel(), 10000);
  }

  rotateCarousel() {
    if (
      this.carouselDirection === "increment" &&
      this.carouselIndex < this.carouselContent.length - 1
    ) {
      this.carouselIndex++;
    } else if (
      this.carouselDirection === "decrement" &&
      this.carouselIndex > 0
    ) {
      this.carouselIndex--;
    } else if (this.carouselDirection === "increment") {
      this.carouselDirection = "decrement";
      this.carouselIndex--;
    } else if (this.carouselDirection === "decrement") {
      this.carouselDirection = "increment";
      this.carouselIndex++;
    }
  }

  ngOnDestroy() {
    clearInterval(this.carouselTimer);
  }
}
