import { Component, OnInit, HostListener } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";
import { Router, NavigationEnd } from "@angular/router";
import { SearchCountryField, CountryISO } from "ngx-intl-tel-input";
import { FormControl, Validators, FormArray, FormGroup } from "@angular/forms";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  isProfilePage = false;
  first_name = "";
  last_name = "";
  email = new FormControl("", [Validators.email, Validators.required]);
  emailValid = false;
  firstChildEmailValid = false;
  secondChildEmailValid = false;
  firstChildFormControl = new FormControl("", [Validators.email]);
  secondChildFormControl = new FormControl("", [Validators.email]);
  // childrenEmail = new FormArray([
  //   new FormControl("", [Validators.email, Validators.required]),
  // ]);
  childrenEmail = new FormArray([]);
  gender = "";
  role = "";
  notes = "";
  children = [];
  zip = "";
  address = "";
  error = false;
  submitClicked = false;
  updatedProfile = false;
  emailDisabled = false;
  mobileNumber: any;
  skypeId = "";
  apiCountryCode = "";
  apiMobileNumber = "";
  apiConstructedMobileNumber = "";
  mobileNumberError = "";
  profileAddChild = false;
  profileEnableMobile = false;
  courses = [];
  selectedCourses = [];
  otherCoursesSelected = false;
  requestedCourses = [];
  private readonly notifier: NotifierService;
  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService,
    private router: Router
  ) {
    this.notifier = notifierService;
    this.router.events.subscribe((eves) => {
      if (eves instanceof NavigationEnd) {
        this.isProfilePage = /^#[/]profile/.test(window.location.hash);
        if (this.isProfilePage) {
          this.email.disable();
        }
      }
    });
  }

  ngOnInit() {
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
          this.first_name = response["first_name"]
            ? response["first_name"]
            : "";
          this.last_name = response["last_name"] ? response["last_name"] : "";
          // this.email = response["email"] ? response["email"] : "";
          if (response["email"]) {
            this.emailDisabled = true;
            this.email.setValue(response["email"]);
            this.email.disable();
          }
          this.gender = response["gender"] ? response["gender"] : "";
          this.role = response["role_id"]
            ? JSON.stringify(response["role_id"])
            : "";
          this.notes = response["registration_request_note"]
            ? response["registration_request_note"]
            : "";
          this.skypeId = response["skype"] ? response["skype"] : "";
          this.zip = response["zipcode"] ? response["zipcode"] : "";
          this.address = response["address"] ? response["address"] : "";
          // console.log(JSON.parse(response["childs"]));
          this.children = response["childs"]
            ? JSON.parse(response["childs"])
            : [];
          if (response["mobile"]) {
            this.apiMobileNumber = response["mobile"];
            this.apiCountryCode = response["country"];
            this.apiConstructedMobileNumber = `${this.apiCountryCode} ${this.apiMobileNumber}`;
          }
          this.requestedCourses = response["requested_courses"];
          this.fetchCourses();
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch data");
        }
      );
  }

  fetchCourses() {
    this.httpClient
      .get("/api/get_courses", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
        responseType: "json",
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          this.courses = response.data ? response.data : [];
          this.selectedCourses = this.requestedCourses;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch courses");
        }
      );
  }

  // @HostListener("window:scroll", ["$event"])
  // onWindowScroll(e) {
  //   let element = document.querySelector("#role-select__header");
  //   if (window.pageYOffset > element.clientHeight / 3) {
  //     element.classList.add("role-select__header__whiteBackground");
  //   } else {
  //     element.classList.remove("role-select__header__whiteBackground");
  //   }
  // }

  validateEmail = () => {
    this.emailValid = (<HTMLInputElement>(
      document.getElementById("email")
    )).checkValidity();
  };

  onRoleUpdate = () => {
    for (let i = this.childrenEmail.controls.length - 1; i >= 0; i--) {
      console.log(i);
      this.childrenEmail.removeAt(i);
    }
    if ((this.role === "3" || this.role === "4") && !this.isProfilePage) {
      this.addChild();
    }
  };

  validateMobileNumber = (mobileNumber) => {
    if (mobileNumber) {
      let constructedMobileNumber = mobileNumber.number;
      if (constructedMobileNumber.indexOf(" ") > -1) {
        const newArray = constructedMobileNumber.split(" ");
        constructedMobileNumber = newArray.join("");
      }
      if (constructedMobileNumber.indexOf("-") > -1) {
        const newArray = constructedMobileNumber.split("-");
        constructedMobileNumber = newArray.join("");
      }
      if (
        constructedMobileNumber.length < 7 ||
        constructedMobileNumber === ""
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  constructMobileNumber = (mobileNumber) => {
    let constructedMobileNumber = mobileNumber.number;
    if (constructedMobileNumber.indexOf(" ") > -1) {
      const newArray = constructedMobileNumber.split(" ");
      constructedMobileNumber = newArray.join("");
    }
    if (constructedMobileNumber.indexOf("-") > -1) {
      const newArray = constructedMobileNumber.split("-");
      constructedMobileNumber = newArray.join("");
    }
    return constructedMobileNumber;
  };

  addChild = () => {
    console.log(this.children.length + this.childrenEmail.controls.length);
    this.childrenEmail.push(
      new FormGroup({
        firstName: new FormControl("", [Validators.required]),
        lastName: new FormControl("", [Validators.required]),
        email: new FormControl("", [Validators.email, Validators.required]),
        phone: new FormControl(undefined, [Validators.required]),
      })
    );
  };

  removeChild = (index) => {
    // if (this.children.length === 2) {
    //   this.children.splice(index, 1);
    // }
    this.childrenEmail.removeAt(index);
  };

  trackByIndex = (index) => {
    return index;
  };

  logout() {
    localStorage.clear();
    this.router.navigate([""]);
  }

  spaceValidator = (event: any) => {
    let value = event.target.value.split(" ");
    event.target.value = value.join("");
  };

  zipCodeValidator = (event: any) => {
    let value = /^[0-9]*$/.test(event.target.value);
    console.log(value);
    if (!value) {
      event.target.value = event.target.value.slice(0, -1);
    }
  };

  enableMobile() {
    this.profileEnableMobile = true;
  }

  isOthersSelected(courses) {
    this.otherCoursesSelected = courses.value.findIndex(course => course.courseName.toLowerCase() === "other") >= 0;
  }

  isChildValid = (index) => {
    let isChildEmailValid =
      index === 0
        ? this.firstChildEmailValid
        : index === 1
        ? this.secondChildEmailValid
        : false;
    if (
      this.error &&
      (this.children[index] === "" ||
        this.children[index].trim() === "" ||
        !isChildEmailValid)
    ) {
      return true;
    }
    return false;
  };

  onSubmit = () => {
    let constructedMobileNumber = "";
    let countryCode = "";
    if (!this.submitClicked) {
      this.submitClicked = true;
      this.error = false;
      this.mobileNumberError = "";
      let errorOccurred = false;
      if (!this.mobileNumber && !this.isProfilePage) {
        errorOccurred = true;
        this.mobileNumberError = "(Phone Number required)";
      } else if (!this.isProfilePage) {
        constructedMobileNumber = this.mobileNumber.number;
        countryCode = this.mobileNumber.dialCode;
        if (constructedMobileNumber.indexOf(" ") > -1) {
          const newArray = constructedMobileNumber.split(" ");
          constructedMobileNumber = newArray.join("");
        }
        if (constructedMobileNumber.indexOf("-") > -1) {
          const newArray = constructedMobileNumber.split("-");
          constructedMobileNumber = newArray.join("");
        }
        if (constructedMobileNumber.length < 7) {
          errorOccurred = true;
          this.mobileNumberError = "(Phone Number is too short)";
        }
        if (constructedMobileNumber === "") {
          errorOccurred = true;
          this.mobileNumberError = "(Phone Number required)";
        }
      }
      console.log(errorOccurred);
      if (!this.mobileNumber && this.profileEnableMobile) {
        // errorOccurred = true;
        // this.mobileNumberError = "(Phone Number required)";
        console.log("No Error");
      } else if (this.profileEnableMobile) {
        constructedMobileNumber = this.mobileNumber.number;
        countryCode = this.mobileNumber.dialCode;
        if (constructedMobileNumber.indexOf(" ") > -1) {
          const newArray = constructedMobileNumber.split(" ");
          constructedMobileNumber = newArray.join("");
        }
        if (constructedMobileNumber.indexOf("-") > -1) {
          const newArray = constructedMobileNumber.split("-");
          constructedMobileNumber = newArray.join("");
        }
        if (constructedMobileNumber.length < 7) {
          errorOccurred = true;
          this.mobileNumberError = "(Phone Number is too short)";
        }
        if (constructedMobileNumber === "") {
          errorOccurred = false;
          this.mobileNumberError = "";
        }
      }
      console.log(errorOccurred);
      if (this.email.invalid) {
        errorOccurred = true;
      } else if (this.last_name === "" || this.last_name.trim() === "") {
        errorOccurred = true;
      } else if (this.first_name === "" || this.first_name.trim() === "") {
        errorOccurred = true;
      } else if (this.gender === "") {
        errorOccurred = true;
      } else if (this.role === "") {
        errorOccurred = true;
      } else if (
        this.notes === "" ||
        (this.notes.trim() === "" && !this.isProfilePage)
      ) {
        errorOccurred = true;
      }
      // else if (this.role === "4") {
      //   if (
      //     this.isProfilePage &&
      //     this.profileAddChild &&
      //     this.childrenEmail.invalid
      //   ) {
      //     errorOccurred = true;
      //   } else if (!this.isProfilePage && this.childrenEmail.invalid) {
      //     errorOccurred = true;
      //   }
      //   // if (
      //   //   !this.firstChildEmailValid ||
      //   //   this.children[0] === "" ||
      //   //   this.children[0].trim() === "" ||
      //   //   (this.children.length > 1 &&
      //   //     (!this.secondChildEmailValid ||
      //   //       this.children[0] === "" ||
      //   //       this.children[0].trim() === ""))
      //   // ) {
      //   //   errorOccurred = true;
      //   // }
      // }
      if (this.role === "3" || this.role === "4") {
        if(this.role === "3" && this.selectedCourses.length === 0) {
          errorOccurred = true;
        }
        for (let i = 0; i < this.childrenEmail.controls.length; i++) {
          if (
            this.childrenEmail.controls[i]["controls"]["firstName"].invalid ||
            this.childrenEmail.controls[i]["controls"][
              "firstName"
            ].value.trim() === ""
          ) {
            errorOccurred = true;
            break;
          } else if (
            this.childrenEmail.controls[i]["controls"]["lastName"].invalid ||
            this.childrenEmail.controls[i]["controls"][
              "lastName"
            ].value.trim() === ""
          ) {
            errorOccurred = true;
            break;
          } else if (
            this.childrenEmail.controls[i]["controls"]["email"].invalid
          ) {
            errorOccurred = true;
            break;
          } else if (
            !this.validateMobileNumber(
              this.childrenEmail.controls[i]["controls"]["phone"].value
            )
          ) {
            errorOccurred = true;
            break;
          }
        }
      }
      console.log(errorOccurred);
      if (!errorOccurred) {
        const constructedChildren = [...this.children];
        if (this.role === "3" || this.role === "4") {
          for (let i = 0; i <= this.childrenEmail.controls.length - 1; i++) {
            constructedChildren.push({
              first_name: this.childrenEmail.controls[i]["controls"][
                "firstName"
              ].value.trim(),
              last_name: this.childrenEmail.controls[i]["controls"][
                "lastName"
              ].value.trim(),
              email: this.childrenEmail.controls[i]["controls"]["email"].value,
              mobile: this.constructMobileNumber(
                this.childrenEmail.controls[i]["controls"]["phone"].value
              ),
              country: this.childrenEmail.controls[i]["controls"]["phone"].value
                .dialCode,
            });
          }
        }
        console.log(constructedChildren);
        const requestedCourses = [];
          if(this.role !== "2") {
            console.log(this.selectedCourses)
            this.selectedCourses.map(course => requestedCourses.push(course.courseId));
            console.log(requestedCourses);
          }
        const data = {
          first_name: this.first_name.trim(),
          last_name: this.last_name.trim(),
          gender: parseInt(this.gender),
          skype: this.skypeId ? this.skypeId : "",
          email: this.email.value.trim(),
          role_id: parseInt(this.role),
          registration_request_note: this.notes.trim(),
          zipcode: this.zip,
          address: this.address,
          childs:
            (this.role === "3" || this.role === "4") &&
            constructedChildren.length > 0
              ? constructedChildren
              : "",
          requested_courses: requestedCourses.sort()
        };
        if (constructedMobileNumber) {
          data["mobile"] = constructedMobileNumber;
          data["country"] = countryCode;
        } else {
          data["mobile"] = this.apiMobileNumber;
          data["country"] = this.apiCountryCode;
        }
        console.log(data);
        this.httpClient
          .put(
            this.isProfilePage ? "/api/update_profile" : "/api/update_user",
            data,
            {
              headers: {
                Authorization: "Bearer " + localStorage.accessToken,
              },
              responseType: "json",
            }
          )
          .subscribe(
            (response) => {
              // console.log(response);
              // localStorage.roleId = this.role;
              // localStorage.status = "2";
              this.submitClicked = false;
              // this.router.navigate(["/dashboard"]);
              if (!this.isProfilePage) {
                localStorage.clear();
                this.updatedProfile = true;
              } else {
                this.children = constructedChildren;
                for (
                  let i = this.childrenEmail.controls.length - 1;
                  i >= 0;
                  i--
                ) {
                  console.log(i);
                  this.childrenEmail.removeAt(i);
                }
                // this.childrenEmail.controls.push(
                //   new FormControl("", [Validators.email, Validators.required])
                // );
                // this.profileAddChild = false;
                this.notifier.notify("success", "Successfully Updated profile");
              }
            },
            (error) => {
              console.log(error);
              this.submitClicked = false;
              let errorSent = false;
              console.log(error["error"]);
              if (error["error"]) {
                console.log(error["error"]["msg"]);
                if (error["error"]["msg"] === "email_id_should_be_unique") {
                  errorSent = true;
                  this.notifier.notify("error", "Email ID already exists");
                }
              }
              if (!errorSent) {
                this.notifier.notify("error", "Unable to update profile");
              }
            }
          );
      } else {
        this.error = errorOccurred;
        this.submitClicked = false;
      }
    }
  };

}
