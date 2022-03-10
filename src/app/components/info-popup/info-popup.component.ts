import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-info-popup",
  templateUrl: "./info-popup.component.html",
  styleUrls: ["./info-popup.component.scss"],
})
export class InfoPopupComponent implements OnInit {
  @Input() title: string;
  @Input() innerContent: string;
  @Input() className: string;
  @Input() text: string;
  @Input() students: string;

  constructor() {}

  ngOnInit() {}
}
