import { Component, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormGroup, FormControl, Validators } from "@angular/forms";
import * as moment from "moment";
import { MatTableDataSource, MatPaginator } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "app-payment",
  templateUrl: "./payment.component.html",
  styleUrls: ["./payment.component.scss"],
})
export class PaymentComponent implements OnInit {
  role = localStorage.roleId;
  paymentInfo = new FormArray([]);
  searchTable = "";
  totalPaid = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  columnsToDisplay = [
    "studentName",
    "paidFor",
    "paymentType",
    "dueAmount",
    "paidAmount",
    "transactionDate",
    "notes",
    "lastPaid",
    "actions",
  ];
  students = [];
  filteredStudents = [];

  paymentTypes = [];
  saveClicked = false;
  saveError = false;
  selectMonthClicked = false;
  originalCompeletedPayments = [
    // {
    //   studentName: "Murali",
    //   paymentId: 1,
    //   studentId: 1,
    //   paid: true,
    //   editableData: new FormGroup({
    //     paidFor: new FormControl(new Date("2020-09-01"), [Validators.required]),
    //     paymentType: new FormControl(1, [Validators.required]),
    //     dueAmount: new FormControl(300),
    //     paidAmount: new FormControl(250, [Validators.required]),
    //     transactionDate: new FormControl(new Date("2020-09-02"), [
    //       Validators.required,
    //     ]),
    //     notes: new FormControl("test"),
    //   }),
    //   lastPaid: moment(new Date("2020-09-01".split("-").join("/"))),
    //   edit: false,
    // },
    // {
    //   studentName: "Krishna",
    //   paymentId: null,
    //   studentId: 2,
    //   paid: false,
    //   editableData: new FormGroup({
    //     paidFor: new FormControl(null, [Validators.required]),
    //     paymentType: new FormControl(null, [Validators.required]),
    //     dueAmount: new FormControl(null),
    //     paidAmount: new FormControl(null, [Validators.required]),
    //     transactionDate: new FormControl(null, [Validators.required]),
    //     notes: new FormControl(null),
    //   }),
    //   lastPaid: null,
    //   edit: false,
    // },
  ];
  completedPayments = new MatTableDataSource(this.originalCompeletedPayments);
  filterType = "all";

  searchMonth = new FormControl(null);
  onGoingUpdates = [];
  onGoingErrors = [];
  private readonly notifier: NotifierService;

  constructor(public httpClient: HttpClient, notifierService: NotifierService) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.completedPayments.paginator = this.paginator;
    this.addNewPayment();
    this.httpClient
      .get("/api/get_payment_types", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response: any) => {
          console.log(response);
          this.paymentTypes = response;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch payment types");
        }
      );
    this.httpClient
      .get("/api/get_all_students", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
      .subscribe(
        (response) => {
          const students = JSON.parse(response["data"]);
          for (let i = 0; i < students.length; i++) {
            students[i]["studentName"] =
              students[i]["first_name"] + " " + students[i]["last_name"];
          }
          this.students = students;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch Students");
        }
      );
  }

  applyFilter() {
    console.log(this.searchTable);
    this.completedPayments.filter = this.searchTable.trim().toLowerCase();
  }

  filterPayments(filterType) {
    this.filterType = filterType;
    console.log("paid only");
    const filteredPayments = this.originalCompeletedPayments.filter((payment) =>
      filterType === "paidOnly"
        ? payment["paid"] === true
        : filterType === "unPaidOnly"
        ? payment["paid"] === false
        : true
    );
    console.log(filteredPayments);
    this.completedPayments = new MatTableDataSource(filteredPayments);
    this.completedPayments.paginator = this.paginator;
    this.applyFilter();
  }

  selectStudent(student, index) {
    console.log(student, index);
    console.log(this.paymentInfo.controls[index]);
    this.paymentInfo["controls"][index]["controls"]["studentName"].setValue(
      student
    );
  }

  onChangeSearch(student, index) {
    this.paymentInfo["controls"][index]["controls"]["studentName"].setValue(
      null
    );
  }

  getDate(date, dateType) {
    const modifiedDate = date
      ? dateType === "month"
        ? moment(date).format("MMM-YYYY")
        : moment(date).format("MM-DD-YYYY")
      : "";
    return modifiedDate;
  }

  selectMonth(event, datePicker, index) {
    if (index === "monthSearch") {
      this.searchMonth.setValue(event);
      datePicker.close();
      this.getPayments();
    } else {
      this.paymentInfo["controls"][index]["controls"]["paidFor"].setValue(
        event
      );
      datePicker.close();
    }
  }

  selectEditMonth(event, datePicker, studentId) {
    const paymentIndex = this.completedPayments["data"].findIndex(
      (payment) => payment["studentId"] === studentId
    );
    this.completedPayments["data"][paymentIndex]["editableData"]["controls"][
      "paidFor"
    ].setValue(event);
    datePicker.close();
  }

  addNewPayment() {
    this.paymentInfo.push(
      new FormGroup({
        studentName: new FormControl(null, [Validators.required]),
        paidFor: new FormControl(null, [Validators.required]),
        paymentType: new FormControl("", [Validators.required]),
        dueAmount: new FormControl(""),
        paidAmount: new FormControl("", [Validators.required]),
        transactionDate: new FormControl(new Date(), [Validators.required]),
        notes: new FormControl(""),
      })
    );
    console.log(this.paymentInfo);
  }

  removePayment(index) {
    this.paymentInfo.removeAt(index);
    // this.filteredStudents.splice(index, 1);
  }

  editPayment(studentId, paymentId) {
    console.log(paymentId);
    let paymentIndex = -1;
    if (paymentId !== null) {
      paymentIndex = this.completedPayments["data"].findIndex(
        (payment) => payment["paymentId"] === paymentId
      );
    } else {
      paymentIndex = this.completedPayments["data"].findIndex(
        (payment) => payment["studentId"] === studentId
      );
    }
    if (paymentIndex >= 0) {
      this.completedPayments["data"][paymentIndex]["edit"] = true;
    }
  }

  updatePayment(studentId, paymentId) {
    if (this.onGoingUpdates.indexOf(studentId) < 0) {
      this.onGoingUpdates.push(studentId);
      let error = false;
      console.log(paymentId);
      let paymentIndex = -1;
      if (paymentId !== null) {
        paymentIndex = this.completedPayments["data"].findIndex(
          (payment) => payment["paymentId"] === paymentId
        );
      } else {
        paymentIndex = this.completedPayments["data"].findIndex(
          (payment) => payment["studentId"] === studentId
        );
      }
      console.log(
        this.completedPayments["data"][paymentIndex]["editableData"][
          "controls"
        ],
        paymentIndex
      );
      if (
        this.completedPayments["data"][paymentIndex]["editableData"]["invalid"]
      ) {
        error = true;
      }
      if (!error) {
        const errorIndex = this.onGoingErrors.indexOf(studentId);
        if (errorIndex > -1) {
          this.onGoingErrors.splice(errorIndex, 1);
        }
        this.httpClient
          .post(
            this.completedPayments["data"][paymentIndex]["paymentId"]
              ? "/api/update_payment"
              : "/api/create_payment",
            {
              payments: [
                this.completedPayments["data"][paymentIndex]["paymentId"]
                  ? {
                      paymentId:
                        this.completedPayments["data"][paymentIndex][
                          "paymentId"
                        ],
                      student_id:
                        this.completedPayments["data"][paymentIndex][
                          "studentId"
                        ],
                      paid_for: moment(
                        this.completedPayments["data"][paymentIndex][
                          "editableData"
                        ]["controls"]["paidFor"]["value"]
                      ).format("MM-DD-YYYY"),
                      payment_type_id:
                        this.completedPayments["data"][paymentIndex][
                          "editableData"
                        ]["controls"]["paymentType"]["value"],
                      due_amount: this.completedPayments["data"][paymentIndex][
                        "editableData"
                      ]["controls"]["dueAmount"]["value"]
                        ? parseInt(
                            this.completedPayments["data"][paymentIndex][
                              "editableData"
                            ]["controls"]["dueAmount"]["value"]
                          )
                        : null,
                      paid_amount: this.completedPayments["data"][paymentIndex][
                        "editableData"
                      ]["controls"]["paidAmount"]["value"]
                        ? parseInt(
                            this.completedPayments["data"][paymentIndex][
                              "editableData"
                            ]["controls"]["paidAmount"]["value"]
                          )
                        : null,
                      date_of_transaction: moment(
                        this.completedPayments["data"][paymentIndex][
                          "editableData"
                        ]["controls"]["transactionDate"]["value"]
                      ).format("MM-DD-YYYY"),
                      notes: this.completedPayments["data"][paymentIndex][
                        "editableData"
                      ]["controls"]["notes"]["value"]
                        ? this.completedPayments["data"][paymentIndex][
                            "editableData"
                          ]["controls"]["notes"]["value"]
                        : "",
                    }
                  : {
                      student_id:
                        this.completedPayments["data"][paymentIndex][
                          "studentId"
                        ],
                      paid_for: moment(
                        this.completedPayments["data"][paymentIndex][
                          "editableData"
                        ]["controls"]["paidFor"]["value"]
                      ).format("MM-DD-YYYY"),
                      payment_type_id:
                        this.completedPayments["data"][paymentIndex][
                          "editableData"
                        ]["controls"]["paymentType"]["value"],
                      due_amount: this.completedPayments["data"][paymentIndex][
                        "editableData"
                      ]["controls"]["dueAmount"]["value"]
                        ? parseInt(
                            this.completedPayments["data"][paymentIndex][
                              "editableData"
                            ]["controls"]["dueAmount"]["value"]
                          )
                        : null,
                      paid_amount: this.completedPayments["data"][paymentIndex][
                        "editableData"
                      ]["controls"]["paidAmount"]["value"]
                        ? parseInt(
                            this.completedPayments["data"][paymentIndex][
                              "editableData"
                            ]["controls"]["paidAmount"]["value"]
                          )
                        : null,
                      date_of_transaction: moment(
                        this.completedPayments["data"][paymentIndex][
                          "editableData"
                        ]["controls"]["transactionDate"]["value"]
                      ).format("MM-DD-YYYY"),
                      notes: this.completedPayments["data"][paymentIndex][
                        "editableData"
                      ]["controls"]["notes"]["value"]
                        ? this.completedPayments["data"][paymentIndex][
                            "editableData"
                          ]["controls"]["notes"]["value"]
                        : "",
                    },
              ],
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
              const updateIndex = this.onGoingUpdates.indexOf(studentId);
              if (updateIndex > -1) {
                this.onGoingUpdates.splice(updateIndex, 1);
              }
              this.notifier.notify("success", "Successfully updated payment");
              if (!this.completedPayments["data"][paymentIndex]["paymentId"]) {
                const data = JSON.parse(response["data"]);
                console.log(data);
                this.completedPayments["data"][paymentIndex]["paymentId"] =
                  data[0]["paymentId"];
                this.completedPayments["data"][paymentIndex]["paid"] = true;
                this.completedPayments["data"][paymentIndex]["lastPaid"] =
                  moment(
                    this.completedPayments["data"][paymentIndex][
                      "editableData"
                    ]["controls"]["paidFor"]["value"]
                  );
              }
              this.completedPayments["data"][paymentIndex]["edit"] = false;
              this.getTotalPaidAmount();
              this.filterPayments(this.filterType);
            },
            (error) => {
              console.log(error);
              this.notifier.notify("error", "Unable to update payment");
              const updateIndex = this.onGoingUpdates.indexOf(studentId);
              if (updateIndex > -1) {
                this.onGoingUpdates.splice(updateIndex, 1);
              }
            }
          );
      } else {
        const errorIndex = this.onGoingErrors.indexOf(studentId);
        if (errorIndex < 0) {
          this.onGoingErrors.push(studentId);
        }
        const updateIndex = this.onGoingUpdates.indexOf(studentId);
        if (updateIndex > -1) {
          this.onGoingUpdates.splice(updateIndex, 1);
        }
      }
    }
  }

  getPaymentType(typeId) {
    const paymentIndex = this.paymentTypes.findIndex(
      (type) => type["paymentTypeId"] === typeId
    );
    return paymentIndex > -1
      ? this.paymentTypes[paymentIndex]["paymentTypeName"]
      : "";
  }

  numberValidator = (event: any) => {
    let value = /^[0-9]*$/.test(event.target.value);
    console.log(value);
    if (!value) {
      event.target.value = event.target.value.slice(0, -1);
    }
  };

  savePayment() {
    if (!this.saveClicked) {
      this.saveClicked = true;
      this.saveError = false;
      console.log(this.paymentInfo);
      if (this.paymentInfo["invalid"]) {
        this.saveError = true;
      }
      if (!this.saveError) {
        const data = { payments: [] };
        for (let i = 0; i < this.paymentInfo["controls"]["length"]; i++) {
          data["payments"].push({
            student_id:
              this.paymentInfo["controls"][i]["controls"]["studentName"][
                "value"
              ]["student_id"],
            paid_for: moment(
              this.paymentInfo["controls"][i]["controls"]["paidFor"]["value"]
            ).format("MM-DD-YYYY"),
            payment_type_id:
              this.paymentInfo["controls"][i]["controls"]["paymentType"][
                "value"
              ],
            due_amount: this.paymentInfo["controls"][i]["controls"][
              "dueAmount"
            ]["value"]
              ? parseInt(
                  this.paymentInfo["controls"][i]["controls"]["dueAmount"][
                    "value"
                  ]
                )
              : null,
            paid_amount: this.paymentInfo["controls"][i]["controls"][
              "paidAmount"
            ]["value"]
              ? parseInt(
                  this.paymentInfo["controls"][i]["controls"]["paidAmount"][
                    "value"
                  ]
                )
              : null,
            date_of_transaction: moment(
              this.paymentInfo["controls"][i]["controls"]["transactionDate"][
                "value"
              ]
            ).format("MM-DD-YYYY"),
            notes: this.paymentInfo["controls"][i]["controls"]["notes"]["value"]
              ? this.paymentInfo["controls"][i]["controls"]["notes"]["value"]
              : "",
          });
        }
        console.log(data);
        this.httpClient
          .post("/api/create_payment", data, {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          })
          .subscribe(
            (response) => {
              console.log(response);
              this.saveClicked = false;
              this.notifier.notify("success", "Successfully created payment");
              this.paymentInfo = new FormArray([]);
              this.addNewPayment();
            },
            (error) => {
              console.log(error);
              this.saveClicked = false;
              this.notifier.notify("error", "Unable to save payment");
            }
          );
      } else {
        this.saveClicked = false;
      }
    }
  }

  getTotalPaidAmount() {
    let count = 0;
    for (let i = 0; i < this.originalCompeletedPayments.length; i++) {
      const payment = this.originalCompeletedPayments[i];
      if (payment["editableData"]["controls"]["paidAmount"]["value"]) {
        count += parseInt(
          payment["editableData"]["controls"]["paidAmount"]["value"]
        );
      }
    }
    this.totalPaid = count;
  }

  getPayments() {
    if (!this.selectMonthClicked) {
      this.selectMonthClicked = true;
      this.httpClient
        .get(
          `/api/get_payments?paid_for=${moment(
            this.searchMonth["value"]
          ).format("MM-DD-YYYY")}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.accessToken,
            },
          }
        )
        .subscribe(
          (response) => {
            console.log(response);
            this.selectMonthClicked = false;
            const data = JSON.parse(response["data"])
              ? JSON.parse(response["data"])
              : [];
            console.log(data);
            this.onGoingErrors = [];
            this.onGoingUpdates = [];
            const completedPayments = [];
            for (let i = 0; i < data.length; i++) {
              completedPayments.push({
                studentName: `${data[i]["first_name"]} ${data[i]["last_name"]}`,
                paymentId: data[i]["paymentId"] ? data[i]["paymentId"] : null,
                studentId: data[i]["user_id"],
                paid: data[i]["paidAmount"] ? true : false,
                notesSearch: `${data[i]["notes"]} ${data[i]["notes"]}`,
                editableData: new FormGroup({
                  paidFor: new FormControl(
                    data[i]["paidFor"] ? new Date(data[i]["paidFor"]) : null,
                    [Validators.required]
                  ),
                  paymentType: new FormControl(
                    data[i]["paymentTypeId"] ? data[i]["paymentTypeId"] : null,
                    [Validators.required]
                  ),
                  dueAmount: new FormControl(
                    data[i]["dueAmount"] ? data[i]["dueAmount"] : null
                  ),
                  paidAmount: new FormControl(
                    data[i]["paidAmount"] ? data[i]["paidAmount"] : null,
                    [Validators.required]
                  ),
                  transactionDate: new FormControl(
                    data[i]["dateOfTransaction"]
                      ? new Date(data[i]["dateOfTransaction"])
                      : null,
                    [Validators.required]
                  ),
                  notes: new FormControl(
                    data[i]["notes"] ? data[i]["notes"] : null
                  ),
                }),
                lastPaid: data[i]["last_paid"]
                  ? moment(new Date(data[i]["last_paid"].split("-").join("/")))
                  : null,
                edit: false,
              });
            }
            console.log(completedPayments);
            this.originalCompeletedPayments = completedPayments;
            this.completedPayments = new MatTableDataSource(
              this.originalCompeletedPayments
            );
            console.log(this.completedPayments);
            this.completedPayments.paginator = this.paginator;
            this.getTotalPaidAmount();
            this.filterPayments("all");
          },
          (error) => {
            console.log(error);
            this.notifier.notify("error", "Unable to fetch payments");
            this.selectMonthClicked = false;
          }
        );
    }
  }
}
