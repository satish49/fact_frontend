import { Component, OnInit, HostListener, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs";
import { NotifierService } from "angular-notifier";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-user-details",
  templateUrl: "./user-details.component.html",
  styleUrls: ["./user-details.component.scss"],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  paramSubmscription: Subscription;
  firstName = "";
  lastName = "";
  email = "";
  mobile = "";
  skype = "";
  zip = "";
  address = "";
  myChildren = <any>[];
  gender: number;
  role: number;
  addNewChild = false;
  userId: any;
  students = <any>[];
  parentChildren = <any>[];
  studentParents = <any>[];
  selectedChildren = <any>[];
  defaultSelectedChildren = <any>[];
  users = [];
  courses = [];
  selectedCourses = [];
  requestedCourses = [];
  saveCoursesClicked = false;
  // children = new FormControl();
  addingChildren = false;
  error = false;
  mobileNav = false;
  private readonly notifier: NotifierService;
  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.notifier = notifierService;
    this.paramSubmscription = this.route.params.subscribe((params: Params) => {
      this.userId = params.userId;
    });
  }

  ngOnInit() {
    this.httpClient
      .get(`/api/get_user_by_userid?user_id=${this.userId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response) => {
          console.log(response);
          this.firstName = response["first_name"] ? response["first_name"] : "";
          this.lastName = response["last_name"] ? response["last_name"] : "";
          this.email = response["email"] ? response["email"] : "";
          this.mobile = response["mobile"]
            ? `${response["country"]} ${response["mobile"]}`
            : "";
          this.skype = response["skype"] ? response["skype"] : "";
          this.zip = response["zipcode"] ? response["zipcode"] : "";
          this.address = response["address"] ? response["address"] : "";
          this.gender = response["gender"] ? response["gender"] : "";
          this.role = response["role_id"] ? response["role_id"] : "";
          if (response["role_id"] === 4) {
            this.parentChildren = response["childrens"]
              ? response["childrens"]
              : [];
            // this.parentChildren = [];
            // if (response["childrens"]) {
            //   for (let i = 0; i < response["childrens"].length; i++) {
            //     this.parentChildren.push({ value: response["childrens"][i] });
            //   }
            // }
            // this.children.setValue(
            //   response["childrens"] ? response["childrens"] : []
            // );
            this.defaultSelectedChildren = response["childrens"]
              ? response["childrens"]
              : [];
            this.selectedChildren = [...this.defaultSelectedChildren];
          } else if (response["role_id"] === 3) {
            this.studentParents = response["parents"]
              ? response["parents"]
              : [];
          }
          if (response["role_id"] === 3 || response["role_id"] === 4) {
            this.myChildren = response["childs"]
              ? JSON.parse(response["childs"])
              : [];
              console.log(this.myChildren)
          }
          this.requestedCourses = response["requested_courses"];
          this.fetchUsers();
          this.fetchCourses();
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch data");
          this.fetchUsers();
        }
      );
  }

  fetchUsers() {
    this.httpClient
      .get("/api/users", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          this.users = response;
          for (let i = 0; i < response.length; i++) {
            if (response[i]["role_id"] === 3) {
              this.students.push(response[i]);
            }
          }
          console.log(this.students);
          const studentParents = this.studentParents.map(studentParent => this.users[this.users.findIndex(user => user.email === studentParent)]);
          this.studentParents = studentParents;

          const parentChildren = this.parentChildren.map(parentChild => this.users[this.users.findIndex(user => user.email === parentChild)]);
          this.parentChildren = parentChildren;
        },
        (error) => {
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
          this.selectedCourses = this.requestedCourses.sort((current, next) => current.courseId - next.courseId);
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch courses");
        }
      );
  }

  setCoursesForUser() {
    this.saveCoursesClicked = true;
    if(!(this.role === 4 && this.selectedCourses.length === 0)) {
      this.httpClient.post("/api/update_requested_courses", 
      {
        requested_courses: this.selectedCourses.map(course => course.courseId).sort(),
        user_id: this.userId
      },{
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        }
      }).subscribe(response=> {
        this.notifier.notify("success", "Successfully updated courses");
        this.saveCoursesClicked = false;
      }, error => {
        console.log(error);
        this.saveCoursesClicked = false;
        this.notifier.notify("error", "Unable to update courses");
      })
    } else {
    this.saveCoursesClicked = false;
    }
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    let element = document.querySelector(".common-header");
    if (window.pageYOffset > element.clientHeight / 3) {
      element.classList.add("user-details__header__whiteBackground");
    } else {
      element.classList.remove("user-details__header__whiteBackground");
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate([""]);
  }

  getSelectedChildren = (selected) => {
    this.selectedChildren = selected;
  };

  toggleAddNewChild = () => {
    this.addNewChild = !this.addNewChild;
    if (this.addNewChild) {
      this.selectedChildren = this.parentChildren.map((parentChild)=> parentChild.email);
      this.defaultSelectedChildren = this.selectedChildren;
    }
  };

  addChildToParent = () => {
    if (!this.addingChildren) {
      this.addingChildren = true;
      console.log(this.selectedChildren);
      this.error = false;
      if (this.selectedChildren.length === 0) {
        this.error = true;
      }
      if (!this.error) {
        this.httpClient
          .post(
            "/api/add_parent_student",
            {
              parent_email: this.email,
              add_student: this.selectedChildren,
            },
            {
              headers: {
                Authorization: "Bearer " + localStorage.accessToken,
              },
            }
          )
          .subscribe(
            (response) => {
              console.log(response);
              // this.parentChildren = this.selectedChildren;
              console.log([...this.parentChildren]);
              const parentChildren = this.parentChildren.map(parentChild => parentChild.email);
              for (let i = 0; i < this.selectedChildren.length; i++) {
                if (parentChildren.indexOf(this.selectedChildren[i]) < 0) {
                  parentChildren.push(this.selectedChildren[i]);
                }
              }
              console.log([...parentChildren]);
              this.defaultSelectedChildren = parentChildren;
              this.selectedChildren = parentChildren;
              this.parentChildren = this.users.filter(user => parentChildren.indexOf(user.email) >= 0);
              // this.children.setValue([]);
              this.toggleAddNewChild();
              this.notifier.notify(
                "success",
                "Successfully added children to parent"
              );
              this.addingChildren = false;
            },
            (error) => {
              console.log(error);
              this.notifier.notify("error", "Unable to add children to parent");
              this.addingChildren = false;
            }
          );
      } else {
        this.notifier.notify("warning", "Select Children to add");
        this.addingChildren = false;
      }
    }
  };

  onMobileNav() {
    this.mobileNav = !this.mobileNav;
  }

  ngOnDestroy() {
    this.paramSubmscription.unsubscribe();
  }

}
