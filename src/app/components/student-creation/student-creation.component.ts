import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { SearchCountryField, CountryISO } from "ngx-intl-tel-input";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "app-student-creation",
  templateUrl: "./student-creation.component.html",
  styleUrls: ["./student-creation.component.scss"],
})
export class StudentCreationComponent implements OnInit {
  role = localStorage.roleId;
  searchCountryField = SearchCountryField;
  selectedParents = [];
  countryISO = CountryISO;
  studentDetails = new FormGroup({
    firstName: new FormControl("", [Validators.required]),
    lastName: new FormControl("", [Validators.required]),
    gender: new FormControl("", [Validators.required]),
    phoneNumber: new FormControl(null, [Validators.required]),
    email: new FormControl("", [Validators.email, Validators.required]),
    skypeId: new FormControl(""),
    address: new FormControl("", [Validators.required]),
    zipCode: new FormControl("", [Validators.required]),
  });
  parentList = new FormControl([]);
  // totalParents = [
  //   {
  //     display: "Murali Vutti",
  //     value: 1,
  //   },
  //   {
  //     display: "Venkatesh Vutti",
  //     value: 2,
  //   },
  // ];
  totalParents = [];

  parents = new FormArray([]);
  error = false;
  createStudentClicked = false;
  private readonly notifier: NotifierService;

  constructor(
    private httpClient: HttpClient,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    console.log(this.parents["length"]);
    this.httpClient
      .get("/api/users", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          const parents = [];
          for (let i = 0; i < response.length; i++) {
            if (response[i]["role_id"] === 4) {
              const parent = { ...response[i] };
              parent["display"] =
                parent["first_name"] + " " + parent["last_name"];
              parent["value"] = parent["user_id"];
              parents.push(parent);
            }
          }
          this.totalParents = parents;
          console.log(parents, this.totalParents);
        },
        (error) => {
          this.notifier.notify("error", "Unable to fetch data");
        }
      );
  }

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

  addParent() {
    if (this.parents["controls"]["length"] < 2) {
      this.parents.push(
        new FormGroup({
          firstName: new FormControl("", [Validators.required]),
          lastName: new FormControl("", [Validators.required]),
          phoneNumber: new FormControl(null, [Validators.required]),
          email: new FormControl("", [Validators.email, Validators.required]),
        })
      );
    }
    console.log(this.parents["length"]);
  }

  removeParent(parentIndex) {
    this.parents.removeAt(parentIndex);
  }

  getSelectedParents(parents) {
    this.selectedParents = parents;
  }

  getParentName(parentId) {
    return this.totalParents[
      this.totalParents.findIndex((parent) => parent["value"] === parentId)
    ]["display"];
  }

  removeFromParentList(parentListIndex) {
    const parents = [...this.parentList["value"]];
    parents.splice(parentListIndex, 1);
    this.parentList.setValue(parents);
  }

  print(el) {
    console.log(el);
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

  clearContent() {
    this.studentDetails.controls.firstName.setValue("");
    this.studentDetails.controls.lastName.setValue("");
    this.studentDetails.controls.gender.setValue("");
    this.studentDetails.controls.phoneNumber.setValue(null);
    this.studentDetails.controls.email.setValue("");
    this.studentDetails.controls.skypeId.setValue("");
    this.studentDetails.controls.address.setValue("");
    this.studentDetails.controls.zipCode.setValue("");
    this.parentList.setValue([]);
    this.parents = new FormArray([]);
  }

  createStudent() {
    if (!this.createStudentClicked) {
      this.createStudentClicked = true;
      this.error = false;
      let errorOccurred = false;
      if (
        !this.validateMobileNumber(
          this.studentDetails["controls"]["phoneNumber"]["value"]
        )
      ) {
        errorOccurred = true;
      } else if (
        this.parents["length"] + this.selectedParents["length"] ===
        0
      ) {
        errorOccurred = true;
      } else if (
        this.studentDetails["controls"]["firstName"]["invalid"] ||
        this.studentDetails["controls"]["firstName"]["value"].trim() === ""
      ) {
        errorOccurred = true;
      } else if (
        this.studentDetails["controls"]["lastName"]["invalid"] ||
        this.studentDetails["controls"]["lastName"]["value"].trim() === ""
      ) {
        errorOccurred = true;
      } else if (this.studentDetails["controls"]["gender"]["invalid"]) {
        errorOccurred = true;
      } else if (this.studentDetails["controls"]["email"]["invalid"]) {
        errorOccurred = true;
      } else if (
        this.studentDetails["controls"]["address"]["invalid"] ||
        this.studentDetails["controls"]["address"]["value"].trim() === ""
      ) {
        errorOccurred = true;
      } else if (this.studentDetails["controls"]["zipCode"]["invalid"]) {
        errorOccurred = true;
      } else {
        for (let i = 0; i < this.parents["controls"]["length"]; i++) {
          if (
            !this.validateMobileNumber(
              this.parents["controls"][i]["controls"]["phoneNumber"]["value"]
            )
          ) {
            errorOccurred = true;
            break;
          } else if (
            this.parents["controls"][i]["controls"]["firstName"]["invalid"] ||
            this.parents["controls"][i]["controls"]["firstName"][
              "value"
            ].trim() === ""
          ) {
            errorOccurred = true;
            break;
          } else if (
            this.parents["controls"][i]["controls"]["lastName"]["invalid"] ||
            this.parents["controls"][i]["controls"]["lastName"][
              "value"
            ].trim() === ""
          ) {
            errorOccurred = true;
            break;
          } else if (
            this.parents["controls"][i]["controls"]["email"]["invalid"]
          ) {
            errorOccurred = true;
            break;
          }
        }
      }
      this.error = errorOccurred;
      if (!errorOccurred) {
        const data = {};
        data["student"] = {
          first_name: this.studentDetails.controls["firstName"]["value"],
          last_name: this.studentDetails.controls["lastName"]["value"],
          email: this.studentDetails.controls["email"]["value"],
          gender: this.studentDetails.controls["gender"]["value"],
          address: this.studentDetails.controls["address"]["value"],
          pincode: this.studentDetails.controls["zipCode"]["value"],
          phonenumber: this.constructMobileNumber(
            this.studentDetails.controls["phoneNumber"]["value"]
          ),
          country: this.studentDetails.controls["phoneNumber"]["value"][
            "dialCode"
          ],
          skype_id: this.studentDetails.controls["skypeId"]["value"],
          is_parent_existed: this.parentList.value.length > 0 ? true : false,
          parents_id: this.parentList.value,
        };
        const parents = [];
        for (let i = 0; i < this.parents.controls.length; i++) {
          const parent = {
            first_name: this.parents.controls[i]["controls"]["firstName"][
              "value"
            ],
            last_name: this.parents.controls[i]["controls"]["lastName"][
              "value"
            ],
            email: this.parents.controls[i]["controls"]["email"]["value"],
            phonenumber: this.constructMobileNumber(
              this.parents.controls[i]["controls"]["phoneNumber"]["value"]
            ),
            country: this.parents.controls[i]["controls"]["phoneNumber"][
              "value"
            ]["dialCode"],
          };
          parents.push(parent);
        }
        data["parents"] = parents;
        console.log(data);
        this.httpClient
          .post("/api/create_student", data, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          })
          .subscribe(
            (response) => {
              console.log(response);
              this.createStudentClicked = false;
              this.notifier.notify("success", "Succesfully created student");
              this.clearContent();
            },
            (error) => {
              console.log(error);
              this.notifier.notify("error", "Unable to create student");
              this.createStudentClicked = false;
            }
          );
      } else {
        this.createStudentClicked = false;
      }
    }
  }
}
