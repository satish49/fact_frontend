import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import * as moment from "moment";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  userName = new BehaviorSubject<string>(
    localStorage.userName ? localStorage.userName : ""
  );

  constructor() {}

  setUserName(name) {
    this.userName.next(name);
  }

  getUserName(): Observable<string> {
    return this.userName.asObservable();
  }

  getDate(date) {
    if (moment(date).format("MMMM DD, YYYY") !== "Invalid date") {
      return moment(date).format("MMMM DD, YYYY");
    } else {
      return moment(date, "DD-MM-YYYY").format("MMMM DD, YYYY");
    }
  }
}
