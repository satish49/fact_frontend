import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-new-landing-page",
  templateUrl: "./new-landing-page.component.html",
  styleUrls: ["./new-landing-page.component.scss"],
})
export class NewLandingPageComponent implements OnInit, OnDestroy {
  mobileNav = false;
  methodology = "tutoring";
  name = new FormControl("", [Validators.required]);
  email = new FormControl("", [Validators.email, Validators.required]);
  message = new FormControl("", [Validators.required]);
  successMessage = "";
  errorMessage = "";
  error = false;
  submitClicked = false;
  carouselIndex = 0;
  carouselTimer;
  carouselDirection = "increment";
  bubbleAnimationTimer;
  displayBubble;
  successStories = [
    {
      name: "Aarti",
      image: "girl-1",
      firstRow:
        "Aarti is one of our brightest minds. She came to us seeking help to get into her dream college. Aarti excelled in a lot of areas, but she needed special attention in problem-solving. We made sure Aarti was mentored and paid attention to personally in the areas that she needs help. Aarti went on to score from ",
      lowerMark: "1220 in PSAT",
      higherMark: "1520 in SAT",
      secondRow:
        'Aarti says, "Although the classes are in small group settings, everyone\'s voice and questions are heard and addressed, making it very personal to me."',
    },
    {
      name: "Ryan",
      image: "boy-1",
      firstRow:
        "Ryan was seeking help to improve his SAT scores and being already one of the smartest; all we needed to do for Ryan was to help him improve his strategy and approach towards solving problems. With our personalized tutoring, step by step, he went from a score of ",
      lowerMark: "1300 in PSAT",
      higherMark: "1590 in SAT",
      secondRow:
        "Ryan feels, “Ravi and team guided me to approach with a different mindset and sharpen my focus. I started seeing the results I had hoped to see. This effect spread beyond my SAT’s to my school grades as well.”",
    },
    {
      name: "Sameer",
      image: "boy-2",
      firstRow:
        "We at Ravi’s Academy believe that mastering fundamentals are the key to success in any prep test. When Sameer approached us, our tutors ensured that he doesn’t learn shortcuts to solve problems and understand the basics. Ravi gave him the confidence to resolve and work through all kinds of problems, and he went on to score from ",
      lowerMark: "28 in ACT",
      higherMark: "35 in ACT",
      secondRow:
        "In his words, “Ravi’s  teachings on manipulating and working through logic problems and other math problems were invaluable to me, and I still utilize the skills he taught me to this day in college.”",
    },
    {
      name: "Srivani",
      image: "girl-2",
      firstRow:
        "Irrespective of the tutoring formats that our students choose, we at Ravi's Academy believe that each student is unique, and each of them needs special attention. Srivani, like many other students, had her strengths and needs that were to be addressed. Our tutors ensure she plays to her strengths, and she went to a score from ",
      lowerMark: "1250 in PSAT",
      higherMark: "1550 in SAT",
      secondRow:
        'In her own words, "Ravi\'s Academy goes out of their way to ensure every student understands the solution to every problem."',
    },
  ];

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.setTimer();
    // this.bubbleAnimationTimer = setInterval(() => {
    //   const randomNumber = this.getRandomNUmber();
    //   this.displayBubble = randomNumber;
    // }, 3000);
    const valueElement = document.getElementById("new-landing-page__winner");
    const coursesElement = document.getElementById("new-landing-page__courses");
    if (
      window.pageYOffset >= valueElement["offsetTop"] &&
      window.pageYOffset <= coursesElement["offsetTop"]
    ) {
      let bubbleArray = document.querySelectorAll(
        ".new-landing-page__winner__bubbles__bubble"
      );
      for (let i = 0; i < bubbleArray.length; i++) {
        const bubble = bubbleArray[i];
        // console.log(window.screen.availHeight + window.pageYOffset);
        if (
          !bubble.classList.contains(
            "new-landing-page__winner__bubbles__bubble__animation"
          )
        ) {
          bubble.classList.add(
            "new-landing-page__winner__bubbles__bubble__animation"
          );
        }
      }
    }
  }

  onMobileNav() {
    this.mobileNav = !this.mobileNav;
  }

  getRandomNUmber() {
    const randomNumber = Math.floor(Math.random() * (7 - 1) + 1);
    if (randomNumber !== this.displayBubble) {
      return randomNumber;
    } else {
      return this.getRandomNUmber();
    }
  }

  setTimer() {
    this.carouselTimer = setInterval(() => this.rotateCarousel(), 10000);
  }

  previousSlide = () => {
    if (this.carouselIndex > 0) {
      this.carouselIndex--;
    } else {
      this.carouselIndex = this.successStories.length - 1;
    }
    clearInterval(this.carouselTimer);
    this.setTimer();
  };

  nextSlide = () => {
    if (this.carouselIndex < this.successStories.length - 1) {
      this.carouselIndex++;
    } else {
      this.carouselIndex = 0;
    }
    clearInterval(this.carouselTimer);
    this.setTimer();
  };

  rotateCarousel() {
    if (this.carouselIndex < this.successStories.length - 1) {
      this.carouselIndex++;
    } else {
      this.carouselIndex = 0;
    }
  }

  toggleMethodology(methodology) {
    this.methodology = methodology;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  scorllToBottom(mobile) {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
    if (mobile) {
      this.mobileNav = false;
    }
  }

  scrollTo(id, mobile) {
    let element = document.getElementById(id);
    if (element) {
      let headerOffset = 100;
      let elementPosition = element.getBoundingClientRect().top;
      let offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    if (mobile) {
      this.mobileNav = false;
    }
  }

  sendEmail() {
    if (!this.submitClicked) {
      this.submitClicked = true;
      let errorOccurred = false;
      this.successMessage = "";
      this.errorMessage = "";
      if (this.name.invalid || this.name.value.trim() === "") {
        errorOccurred = true;
      } else if (this.name.invalid || this.name.value.trim() === "") {
        errorOccurred = true;
      } else if (this.name.invalid || this.name.value.trim() === "") {
        errorOccurred = true;
      }
      this.error = errorOccurred;
      if (!errorOccurred) {
        this.httpClient
          .post("/api/contact_us", {
            name: this.name.value,
            email: this.email.value,
            message: this.message.value,
          })
          .subscribe(
            (response) => {
              this.submitClicked = false;
              this.successMessage = "Successfully submitted!";
            },
            (error) => {
              console.log(error);
              this.submitClicked = false;
              this.errorMessage = "Please try again";
            }
          );
      } else {
        this.submitClicked = false;
      }
    }
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    let element = document.querySelector("#new-landing-page__header");
    if (window.pageYOffset > element.clientHeight / 3) {
      element.classList.add("new-landing-page__header__whiteBackground");
    } else {
      element.classList.remove("new-landing-page__header__whiteBackground");
    }
    let bubbleArray = document.querySelectorAll(
      ".new-landing-page__winner__bubbles__bubble"
    );
    for (let i = 0; i < bubbleArray.length; i++) {
      const bubble = bubbleArray[i];
      // console.log(window.screen.availHeight + window.pageYOffset);
      const screenPosition = window.screen.availHeight + window.pageYOffset;
      const bubbleBottom = bubble["offsetTop"] + bubble["offsetHeight"];
      if (
        screenPosition >= bubble["offsetTop"] &&
        screenPosition <= bubbleBottom &&
        !bubble.classList.contains(
          "new-landing-page__winner__bubbles__bubble__animation"
        )
      ) {
        bubble.classList.add(
          "new-landing-page__winner__bubbles__bubble__animation"
        );
      }
    }
  }

  ngOnDestroy() {
    clearInterval(this.carouselTimer);
    clearInterval(this.bubbleAnimationTimer);
  }
}
