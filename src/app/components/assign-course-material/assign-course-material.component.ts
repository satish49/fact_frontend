import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import * as moment from 'moment';
import { categories } from 'src/app/constants/categories';
import { GlobalApiService } from 'src/app/global-api.service';

@Component({
  selector: 'app-assign-course-material',
  templateUrl: './assign-course-material.component.html',
  styleUrls: ['./assign-course-material.component.scss']
})
export class AssignCourseMaterialComponent implements OnInit {
  categories = categories;
  fileTree: any = [];
  studentTree: any = [];
  studentFilesLoading = false;
  selectedFiles = [];
  assignError = false;
  sendToType = "0";
  students = [];
  batches = [];
  selectedStudents = [];
  selectedBatches = [];
  addedStudents = [];
  addedBatches = [];
  openBatches = [];
  noStudentsError = false;
  assignClicked = false;
  filesExistFlag = false;
  documentDialog = false;
  fileUrl = "";
  fileUrlExtension = "";

  private readonly notifier: NotifierService;
  constructor(notifierService: NotifierService, private globalApiService: GlobalApiService) { 
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.getAllFiles();
    this.getAllStudents();
    this.getAllBatches();
  }

  getAllFiles() {
    this.globalApiService.getAllFiles().subscribe(
      (response: any) => {
        console.log(response);
        console.log(this.fileTree)
        const treeData = response.data ? response.data : [];
        treeData.sort((first,second) => {
          const firstArray = first.objecyKey.split("/");
          const secondArray = second.objecyKey.split("/");
          return secondArray.length - firstArray.length;
        });
        for(let i=0; i<treeData.length; i++){
          this.recursiveTree(this.fileTree, treeData[i].fileId, treeData[i]["objecyKey"].split(["/"]), "main");
        }
      }, error => {
        console.log(error);
      }
    )
  }

  recursiveTree(tree, fileId, path, type) {
    let existingIndex = tree.findIndex(el => el.label === path[0]);
    const newPath = [...path];
    if(existingIndex >= 0) {
        if(tree[existingIndex]["children"]){
          this.recursiveTree(tree[existingIndex]["children"], fileId, newPath.splice(1), type)
        }
    } else {
      console.log(newPath, fileId)
        const object = {
            label: path[0],
            fileId: newPath.length > 1 ? null : fileId,
        }
        if(newPath.length === 1 && type === 'main') {
          object['formData'] = new FormGroup({
            fileName: new FormControl(path[0]),
            category: new FormControl(null, [Validators.required]),
            dueDate: new FormControl(null, []),
            expiryDate: new FormControl(null, [Validators.required]),
          })
        }
        tree.push(object)
        if(newPath.length > 1) {
          tree[tree.length - 1]["children"] = [];
          this.recursiveTree(tree[tree.length - 1]["children"], fileId, newPath.splice(1), type)
        }      
    }
  }

  getAllStudents() {
    this.globalApiService.getAllStudents().subscribe(
      (response) => {
        const students = JSON.parse(response["data"]);
        for (let i = 0; i < students.length; i++) {
          students[i]["studentName"] =
            students[i]["first_name"] + " " + students[i]["last_name"];
          students[i]["studentId"] = students[i]["student_id"];
        }
        this.students = students;
        console.log(this.students);
      },
      (error) => {
        console.log(error);
        this.notifier.notify("error", "Unablt to fetch students");
      }
    );
  }
  
  getAllBatches() {
    this.globalApiService.getAllBatches().subscribe(
      (response) => {
        const data = JSON.parse(response["data"]);
        if (data["batches"].length === 0) {
          this.notifier.notify("info", "No batches found");
        }
        this.batches = data["batches"];
        this.batches = this.batches.filter(
          (batch) => batch["isBatchActive"] === 1
        );
        for (let i = 0; i < this.batches.length; i++) {
          this.batches[i]["removedStudents"] = [];
          this.batches[i]["allStudentsSelected"] = true;
        }
        console.log(this.batches);
      },
      (error) => {
        this.notifier.notify("error", "Unable to fetch batches");
      }
    );
  }

  getSelectedStudents(students) {
    this.selectedStudents = students;
  }

  getSelectedBatches(batches) {
    this.selectedBatches = batches;
  }

  addBatchOrStudent() {
    console.log(this.sendToType);
    if (this.sendToType === "0") {
      const newStudents = this.selectedStudents.filter(
        (studentId) => this.addedStudents.indexOf(studentId) < 0
      );
      this.addedStudents = this.addedStudents.concat(newStudents);
    } else {
      const newBatches = this.selectedBatches.filter(
        (batchId) => this.addedBatches.indexOf(batchId) < 0
      );
      this.addedBatches = this.addedBatches.concat(newBatches);
    }
    if (this.assignError) {
      this.noStudentsError = false;
    }
  }

  noStudentsValidation() {
    let noStudents = false;
    if (
      this.addedBatches["length"] === 0 &&
      this.addedStudents["length"] === 0
    ) {
      noStudents = true;
    } else if (
      this.addedStudents["length"] === 0 &&
      this.addedBatches["length"] > 0
    ) {
      let students = [];
      const batches = this.batches.filter(
        (batch) => this.addedBatches.indexOf(batch["batchId"]) > -1
      );
      console.log(batches);
      for (let i = 0; i < batches["length"]; i++) {
        for (let j = 0; j < batches[i]["students"]["length"]; j++) {
          if (
            batches[i]["removedStudents"].indexOf(
              batches[i]["students"][j]["studentId"]
            ) < 0
          ) {
            students.push(batches[i]["students"][j]["studentId"]);
            break;
          }
          console.log(i);
        }
      }
      if (students["length"] === 0) {
        noStudents = true;
      }
    }
    this.noStudentsError = noStudents;
  }

  removeStudent(studentId) {
    this.addedStudents = this.addedStudents.filter(
      (student) => student !== studentId
    );
    if (this.assignError) {
      this.noStudentsValidation();
    }
  }

  removeBatch(batchId, batchIndex) {
    this.addedBatches = this.addedBatches.filter((batch) => batch !== batchId);
    this.batches[batchIndex]["removedStudents"] = [];
    this.batches[batchIndex]["allStudentsSelected"] = true;
    this.openBatches = this.openBatches.filter((batch) => batch !== batchId);
    if (this.assignError) {
      this.noStudentsValidation();
    }
  }

  toggleBatchDrillDown(batchId) {
    console.log(batchId);
    const batchIndex = this.openBatches.indexOf(batchId);
    if (batchIndex < 0) {
      this.openBatches.push(batchId);
    } else {
      this.openBatches.splice(batchIndex, 1);
    }
  }

  toggleStudentInBatch(batchIndex, studentId) {
    const studentIndex = this.batches[batchIndex]["removedStudents"].indexOf(
      studentId
    );
    if (studentIndex < 0) {
      this.batches[batchIndex]["removedStudents"].push(studentId);
    } else {
      this.batches[batchIndex]["removedStudents"].splice(studentIndex, 1);
    }
    if (this.batches[batchIndex]["removedStudents"]["length"] === 0) {
      this.batches[batchIndex]["allStudentsSelected"] = true;
    } else {
      this.batches[batchIndex]["allStudentsSelected"] = false;
    }
    if (this.assignError) {
      this.noStudentsValidation();
    }
  }

  selectAllStudents(checked, batchIndex) {
    if (checked) {
      this.batches[batchIndex]["removedStudents"] = [];
      console.log([...this.batches[batchIndex]["removedStudents"]]);
    } else {
      const removedStudents = [];
      for (let i = 0; i < this.batches[batchIndex]["students"]["length"]; i++) {
        removedStudents.push(
          this.batches[batchIndex]["students"][i]["studentId"]
        );
      }
      this.batches[batchIndex]["removedStudents"] = removedStudents;
    }
    this.batches[batchIndex]["allStudentsSelected"] = checked;
    if (this.assignError) {
      this.noStudentsValidation();
    }
  }

  getStudentFiles(studentId, studentTree, event) {
    this.studentTree = [];
    this.studentFilesLoading = true;
    this.globalApiService.getUserFiles(studentId, '').subscribe(
      (response: any) => {
        console.log(response);
        this.studentFilesLoading = false;
        const treeData = response.data ? response.data : [];
        treeData.sort((first,second) => {
          const firstArray = first.object_key.split("/");
          const secondArray = second.object_key.split("/");
          return secondArray.length - firstArray.length;
        });
        for(let i=0; i<treeData.length; i++){
          console.log(treeData[i]);
          this.recursiveTree(this.studentTree, treeData[i].file_id, treeData[i]["object_key"].split(["/"]), "sub");
        }
        console.log(this.studentTree);
        studentTree.toggle(event);
      }, error => {
        this.notifier.notify("error", "Unable to fetch user details");
        this.studentFilesLoading = false;
      }
    )
  }

  nodeSelected(node) {
    node.expanded = true;
  }

  filesExist() {
    let files = [];
    for(let i=0; i< this.selectedFiles.length; i++) {
      if(this.selectedFiles[i].fileId) {
        files.push(this.selectedFiles[i]);
        break;
      }
    }
    this.filesExistFlag = files.length > 0;
  }

  assignFiles() {
    this.assignClicked = true;
    this.assignError = false;
    let files = [];
    this.noStudentsError = false;
    let users = [...this.addedStudents];
    const batches = this.batches.filter(
      (batch) => this.addedBatches.indexOf(batch["batchId"]) > -1
    );
    this.filesExist();
    for (let i = 0; i < batches["length"]; i++) {
      const batch = { ...batches[i] };
      let batchStudents = [];
      if (
        batch["students"]["length"] !== batch["removedStudents"]["length"]
      ) {
        batchStudents = batch["students"].filter((student) => {
          return batch["removedStudents"].indexOf(student["studentId"]) < 0;
        });
        batchStudents = batchStudents.map((student) => student["studentId"]);
      }
      users = users.concat(
        batchStudents.filter((studentId) => users.indexOf(studentId) < 0)
      );
    }
    this.noStudentsError = users.length === 0;
    this.selectedFiles.forEach(file => {
      if(file.fileId) {
        if(file.formData.invalid) {
          this.assignError = true;
        }
        const fileObj = {
          file_id: file.fileId, category: file.formData.value.category, expiry_date: moment(file.formData.value.expiryDate).format("MM-DD-YYYY"),
        }
        if(file.formData.value.dueDate) {
          fileObj["due_date"] = moment(file.formData.value.dueDate).format("MM-DD-YYYY");
        }
        files.push(fileObj)
      }
    })
    if(!this.assignError) {
    this.assignError = files.length === 0 || this.noStudentsError;
    }
    if(!this.assignError) {
      const data = {users, files};
      this.globalApiService.assignFiles(data).subscribe(
        (response: any) => {
          this.assignClicked = false;
          this.notifier.notify("success", "Successfully assigned files");
          this.fileTree = [];
          this.selectedFiles = [];
          this.addedStudents = [];
          this.addedBatches = [];
          this.getAllBatches();
          this.getAllStudents();
          this.getAllFiles();
        }, error => {
          this.assignClicked = false;
          this.notifier.notify("error", "Unable to assign files");
        })
    } else {
      this.assignClicked = false;
      this.notifier.notify("error", "Fill all mandatory fields")
    }
  }

  displayDocumentDialog(fileId, fileName) {
    console.log(fileId);
    this.fileUrl = "";
    this.fileUrlExtension = "";
    this.globalApiService.getFileUrl(fileId).subscribe(
      response => {
        console.log(response);
        const pathArray = fileName.split(".");
        this.fileUrlExtension = pathArray[pathArray.length - 1] ? pathArray[pathArray.length - 1].toLowerCase() : '';
        this.fileUrl = response['data']['url'] || '';
        this.documentDialog = true;
      }, error => {
        this.notifier.notify("error", "Unable to load the url");
      }
    )
  }

}
