import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ParentChildrenService {
  selectedChildren = new BehaviorSubject<string>("0");
  children = new BehaviorSubject<any>([]);

  constructor() {}

  getSelectedChildren(): Observable<string> {
    return this.selectedChildren.asObservable();
  }

  setSelectedChildren(index) {
    this.selectedChildren.next(index);
  }

  getChildren(): Observable<any> {
    return this.children.asObservable();
  }

  setChildren(children) {
    this.children.next(children);
  }
}
