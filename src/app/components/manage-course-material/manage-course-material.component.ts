import { Component, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { NotifierService } from "angular-notifier";
import { forkJoin } from "rxjs";
import { GlobalApiService } from "src/app/global-api.service";

@Component({
  selector: "app-manage-course-material",
  templateUrl: "./manage-course-material.component.html",
  styleUrls: ["./manage-course-material.component.scss"],
})
export class ManageCourseMaterialComponent implements OnInit {
  role = localStorage.roleId;
  files = null;
  uploadFilesError = false;
  documentDialog = false;
  uploadClicked = false;
  fileUrl = "";
  fileUrlExtension = "";
  fileTypes = [
    {
      id: 1,
      name: "Public"
    },
    {
      id: 2,
      name: "Private"
    },
    {
      id: 3,
      name: "Protected"
    }
  ];
  treeSelection = null;

  myTree: any = [];

  uploadSections = new FormArray([]);

  private readonly notifier: NotifierService;
  constructor(notifierService: NotifierService, private globalApiService: GlobalApiService) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.addUploadSection();
    this.getAllFiles();
  }

  getAllFiles() {
    this.globalApiService.getAllFiles().subscribe(
      (response: any) => {
        console.log(response);
        console.log(this.myTree)
        const treeData = response.data ? response.data : [];
        treeData.sort((first,second) => {
          const firstArray = first.objecyKey.split("/");
          const secondArray = second.objecyKey.split("/");
          return secondArray.length - firstArray.length;
        });
        for(let i=0; i<treeData.length; i++){
          this.recursiveTree(this.myTree, treeData[i].fileId, treeData[i]["objecyKey"].split(["/"]));
        }
      }, error => {
        console.log(error);
      }
    )
  }

  recursiveTree(tree, fileId, path) {
    let existingIndex = tree.findIndex(el => el.label === path[0]);
    const newPath = [...path];
    if(existingIndex >= 0) {
        if(tree[existingIndex]["children"]){
          this.recursiveTree(tree[existingIndex]["children"], fileId, newPath.splice(1))
        }
    } else {
        const object = {
            label: path[0],
            selectable: newPath.length > 1,
            fileId: newPath.length > 1 ? null : fileId
        }
        tree.push(object)
        if(newPath.length > 1) {
      tree[tree.length - 1]["children"] = [];
      this.recursiveTree(tree[tree.length - 1]["children"], fileId, newPath.splice(1))
        }      
    }
  }

  addUploadSection() {
    this.uploadSections.push(
      new FormGroup({
        nodeName: new FormControl(""),
        uploadFiles: new FormControl([]),
        uploadPath: new FormControl("", [Validators.required]),
        type: new FormControl({id:2, name: "Private"})
      })
    );
  }

  deleteUploadSection(uploadItemIndex) {
    this.uploadSections.removeAt(uploadItemIndex)
  }

  getfiles(event, uploadSectionIndex) {
    console.log(uploadSectionIndex, " triggered")
    const files = [];
    for(let i=0; i<event.target.files.length; i++) {
        files.push(event.target.files[i])
    }
    let uploadSectionFiles = this.uploadSections.value[uploadSectionIndex].uploadFiles;
    uploadSectionFiles = uploadSectionFiles.concat(files);
    const uniqueFiles = [];
    uploadSectionFiles = uploadSectionFiles.filter(file => {
      const isFilePresent = uniqueFiles.indexOf(file.name);
      if(isFilePresent >= 0) {
        return false;
      } else {
        uniqueFiles.push(file.name);
        return true;
      }
    })
    console.log(files, uploadSectionFiles)
    this.uploadSections.controls[uploadSectionIndex]['controls']['uploadFiles'].setValue(uploadSectionFiles);
    event.target.value = "";
  }

  deleteFile(uploadSectionIndex, fileIndex) {
    const uploadSectionFiles = this.uploadSections.value[uploadSectionIndex]['uploadFiles'];
    uploadSectionFiles.splice(fileIndex, 1);
    this.uploadSections.controls[uploadSectionIndex]['controls']['uploadFiles'].setValue(uploadSectionFiles);
  }

  uploadFiles() {
    console.log(this.uploadSections);
    if(!this.uploadClicked) {
      this.uploadClicked = true;
    this.uploadFilesError = false;
    if(this.uploadSections.valid) {
      for(let i=0; i< this.uploadSections.value.length; i++) {
        if(this.uploadSections.value[i].uploadFiles.length === 0) {
          this.uploadFilesError = true;
          break;
        }
      }
      if(!this.uploadFilesError) {
        const uploadApi = [];
        for(let i=0; i<this.uploadSections.value.length; i++) {
          const formData =  new FormData();
          const uploadSection = this.uploadSections.value[i]
          formData.append("path", uploadSection["uploadPath"]);
          formData.append("accessType", uploadSection["type"]["id"].toString());
          for(let j=0; j<uploadSection.uploadFiles.length; j++) {
            formData.append("files", uploadSection.uploadFiles[j])
          }
          uploadApi.push(this.globalApiService.uploadFiles(formData));
        }
        forkJoin(uploadApi).subscribe((response) => {
          console.log(response);
          this.uploadClicked = false;
          this.notifier.notify("success", "Successfully uploaded files");
          // this.uploadSections.setValue([]);
          for(let i=this.uploadSections.controls.length -1; i >= 0; i--) {
            this.uploadSections.removeAt(i);
          }
          this.addUploadSection();
          this.myTree = [];
          this.getAllFiles();
        }, error => {
          console.log(error);
          this.uploadClicked = false;
          this.notifier.notify("error", "Unable to upload files");
        })
      }
    } else {
      this.uploadFilesError = true;
      this.uploadClicked = false;
    }
  }
  }

  toggleTree(event, treeDropDown) {
    treeDropDown.toggle(event);
    this.treeSelection = null;
    this.triggerCollapseRecursive(null);
  }

  triggerCollapseRecursive(event) {
    console.log(event)
    setTimeout(() => {
      this.myTree.forEach(node => {
        this.collapseRecursive(node)
      })
      }, 1000
    )
  }

  collapseRecursive(node){
    node.expanded = false;
    if (node.children){
        node.children.forEach( childNode => {
            this.collapseRecursive(childNode);
        } );
    }
  }

  addNode(uploadSectionIndex) {
    console.log(this.uploadSections);
    console.log(this.treeSelection);
    const nodeName = this.uploadSections.value[uploadSectionIndex]['nodeName'];
    const node = {
      label: nodeName,
      children: []
    }
    if(this.treeSelection && nodeName) {
      let fileIndex = -1;
      const treeNodeIndex = this.treeSelection.children.findIndex((treeNode, index) => {
        console.log(treeNode)
        if(!treeNode.children && fileIndex === -1) {
          fileIndex = index;
        }
        return treeNode.label === nodeName;
      });
      if(treeNodeIndex < 0) {
        if(fileIndex >= 0) {
          console.log("if", fileIndex)
          this.treeSelection.children.splice(fileIndex, 0, node)
        }else {
          console.log("else")
        this.treeSelection.children.push(node)
        }
        console.log(this.treeSelection)
        this.treeSelection.expanded = true;
      }
    } else if(nodeName) {
      if(this.myTree.findIndex(treeNode => treeNode.label === nodeName) < 0)
      this.myTree.push(node)
    }
  }

  nodeSelected(event, uploadItemIndex) {
    console.log(event);
    event.node.expanded = true;
    const path = (event.node.parent ? this.constructNodePath(event.node.parent) + "/" : "") + event.node.label;
    console.log("node selected ", path);
    this.uploadSections.controls[uploadItemIndex]['controls']['uploadPath'].setValue(path)
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

  constructNodePath(node) {
    let path = node.label;
    if(node.parent) {
      path = this.constructNodePath(node.parent) + "/" + path;
    }
    console.log(path);
    return path;
  }

}
