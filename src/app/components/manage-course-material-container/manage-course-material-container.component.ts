import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-course-material-container',
  templateUrl: './manage-course-material-container.component.html',
  styleUrls: ['./manage-course-material-container.component.scss']
})
export class ManageCourseMaterialContainerComponent implements OnInit {
  role = localStorage.roleId;
  display = "upload"
  constructor() { }

  ngOnInit() {
  }

}
