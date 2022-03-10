import { Component, OnInit } from "@angular/core";
import { NotifierService } from "angular-notifier";
import { GlobalApiService } from "src/app/global-api.service";
import * as moment from "moment";
import { categories } from "src/app/constants/categories";
import { DomSanitizer } from "@angular/platform-browser";
import * as es6printJS from "print-js";
import * as printJS from "print-js";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { saveAs } from "file-saver";
import { stringify } from "querystring";
import { NONE_TYPE } from "@angular/compiler/src/output/output_ast";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { HttpClient } from "@angular/common/http";


@Component({
  selector: "app-student-material",
  templateUrl: "./student-material.component.html",
  styleUrls: ["./student-material.component.scss"],
})
export class StudentMaterialComponent implements OnInit {
  role = localStorage.getItem("roleId");
  dataLoading = true;
  viewAll = false;
  recentType = 1;
  files: any = [];
  categories = categories;
  selectedLabel = "";
  selectedCourse = [];
  fileNames = [];
  selectedCategories = [];
  searchFilter = "";
  documentDialog = false;
  fileUrl: any = "";
  fileName: any = "";
  fileUrlExtension = "";
  filterOptions: any = [];
  options: any = [];
  pdfOpen = false;
  downloadPdfName = "";
  accessType: any = 0;
  pdfData: any = null;
  showLoader: boolean = false;

  responsiveOptions = [
    {
      breakpoint: "2000px",
      numVisible: 7,
      numScroll: 1,
    },
    {
      breakpoint: "1024px",
      numVisible: 5,
      numScroll: 1,
    },
    {
      breakpoint: "768px",
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: "560px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  private readonly notifier: NotifierService;
  pdfViewer: any;
  viewURL: HTMLAnchorElement;
  flag: string;
  constructor(
    notifierService: NotifierService,
    private globalApiService: GlobalApiService,
    protected sanitizer: DomSanitizer,
    private httpClient: HttpClient
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.getMyFiles();
  }

  pdfName = [this.options.file_name];

  title = "pdf";
  printPage() {
    window.print();
  }
  printTest() {
    console.log({
      node_module: printJS,
      es6_module: es6printJS,
    });
    // HTML print with ID
    es6printJS("pdfViewerId", "html");
  }

  downloadPdf(fileUrl: string, pdfName: string) {
    console.log(this.downloadPdfName);
       console.log("no watermark needed");
       saveAs(fileUrl, this.downloadPdfName);   
  };

  generateBlobObject(
    fileUrl: string,
    pdfName: string,
    userId: any,
    userName: string
  ) {
    console.log("save with watermark");
    this.pdfData = null;
    console.log("save pdf in blob object");
    fetch(fileUrl).then(
      (r) =>
        (this.pdfData = r.arrayBuffer().then((a) => {
          this.pdfData = a;
        }))
    );
        
    
    setTimeout(async () => {
      const pdfDoc = await PDFDocument.load(this.pdfData);
      console.log(pdfDoc);
      if(this.accessType == 2){    
        console.log("update with watermark");
        const pages = pdfDoc.getPages();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pages.forEach(function (page) {
          const { width, height } = page.getSize();
          
          // Draw a string of text diagonally across the first page
          const fontSize = 12
          page.drawRectangle({
            x: 25,
            y: height - 4 * fontSize,            
            borderColor: rgb(.5,.5,.5),
            height: 45,
            width: 160,
            opacity: 0.7,
          });
          page.drawText("CopyRight: Ravi's Academy", {
            x: 30,
            y: height - 4 * fontSize+24,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0.5,0.5,0.5),
            opacity: 0.5,
          });
          page.drawText("Student: "+userName+" ID: "+userId, {
            x: 30,
            y: height - 4 * fontSize+8,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0.5,0.5,0.5),
            opacity: 0.5,
          });
        });   
      }else{
        console.log("no watermark");
      }
      const pdfBytes = await pdfDoc.save();

      var blob = new Blob([pdfBytes], { type: "application/pdf" });
      this.viewURL = document.createElement("a");
      this.viewURL.href = window.URL.createObjectURL(blob); 
      this.showLoader = false;     
    }, 3000); 
         
  };

  getMyFiles() {
    const date = !this.viewAll
      ? moment().subtract(this.recentType, "week").format("DD-MM-YYYY")
      : "";
    this.globalApiService
      .getUserFiles(localStorage.getItem("userId"), date)
      .subscribe(
        (response: any) => {
          console.log(response);
          console.log(response["data"]);
          this.options = response["data"];
          // this.filterOptions = [...this.options];
          // console.log(this.filterOptions);
          console.log(this.files);
          this.files = [];
          let treeData = response.data ? response.data : [];
          // console.log(treeData)
          treeData = treeData.map((file) => {
            const categoryIndex = this.categories.findIndex(
              (category) => category.id === file.category
            );
            file.categoryName =
              categoryIndex >= 0 ? this.categories[categoryIndex].name : "";
            file.categoryColor =
              categoryIndex >= 0 ? this.categories[categoryIndex].color : "";
            file.assignedOn = moment(file.updated_on).format("MM-DD-YYYY");
            file.dueBy = file.due_date
              ? moment(file.due_date).format("MM-DD-YYYY")
              : "";
            return file;
          });
          this.fileNames = treeData;
          treeData.sort((first, second) => {
            const firstArray = first.object_key.split("/");
            const secondArray = second.object_key.split("/");
            return secondArray.length - firstArray.length;
          });
          for (let i = 0; i < treeData.length; i++) {
            this.recursiveTree(
              this.files,
              treeData[i],
              treeData[i]["object_key"].split(["/"])
            );
          }
          console.log(this.files);
          if (this.files.length > 0) {
            this.selectedLabel = this.files[0].label;
            this.selectedCourse = this.files[0].children;
            console.log(this.selectedCourse);
          }
          this.dataLoading = false;
        },
        (error) => {
          console.log(error);
          this.notifier.notify("error", "Unable to fetch material");
          this.dataLoading = false;
        }
      );
  }

  recursiveTree(tree, file, path) {
    let existingIndex = tree.findIndex((el) => el.label === path[0]);
    const newPath = [...path];
    if (existingIndex >= 0) {
      if (tree[existingIndex]["children"]) {
        this.recursiveTree(
          tree[existingIndex]["children"],
          file,
          newPath.splice(1)
        );
      }
    } else {
      const object = {
        label: path[0],
        selectable: newPath.length > 1,
        fileId: newPath.length > 1 ? null : file.file_id,
      };
      if (newPath.length === 1) {
        object["categoryName"] = file.categoryName;
        object["categoryColor"] = file.categoryColor;
        object["assignedOn"] = file.assignedOn;
        object["dueBy"] = file.dueBy;
        object["category"] = file.category;
      }
      tree.push(object);
      if (newPath.length > 1) {
        tree[tree.length - 1]["children"] = [];
        this.recursiveTree(
          tree[tree.length - 1]["children"],
          file,
          newPath.splice(1)
        );
      }
    }
  }

  setLabel(label) {
    this.selectedLabel = label;
    if (this.viewAll) {
      const selectedCourseIndex = this.files.findIndex((file) => {
        return file.label.toLowerCase() === label.toLowerCase();
      });
      console.log(selectedCourseIndex, this.files[selectedCourseIndex]);
      this.selectedCourse =
        selectedCourseIndex >= 0
          ? this.files[selectedCourseIndex].children
          : [];
    }
  }

  toggleView(viewAll) {
    this.viewAll = viewAll;
    this.getMyFiles();
  }

  toggleCategories(categoryId) {
    const categoryIndex = this.selectedCategories.indexOf(categoryId);
    if (categoryIndex >= 0) {
      this.selectedCategories.splice(categoryIndex, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
  }

  private downloadFile(url: string): any {
    console.log("in downloadFile");
    console.log(url);
    fetch(url).then(
      (r) =>
        (this.pdfData = r.arrayBuffer().then((a) => {
          this.pdfData = a;
        }))
    );
  }

  public openPdf(url: any) {
    this.documentDialog = true;
    console.log("in openPdf");
    console.log(url);
    this.downloadFile(url);
    console.log("load pdf");
    this.pdfViewer = this.pdfData; // pdfSrc can be Blob or Uint8Array
    // this.pdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
    console.log("enable pdf");    
  };

  displayDocumentDialog(fileId, fileName) {
    console.log(fileId);
    console.log(fileName);
    this.showLoader = true;
    this.fileUrl = "";
    this.fileUrlExtension = "";
    this.accessType = 0;
    this.viewURL = null;
    this.globalApiService.getFileUrl(fileId).subscribe(
      (response) => {
        
        console.log(response);
        console.log(response["data"]);
        this.options = response["data"];        
        const pathArray = fileName.split(".");
        this.fileUrlExtension = pathArray[pathArray.length - 1]
          ? pathArray[pathArray.length - 1].toLowerCase()
          : "";
        this.fileUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(
            response["data"]["url"]
          ) || "";
        this.accessType = response["data"]["accessType"];
        this.downloadPdfName = fileName;
        // this.openPdf(response["data"]["url"]);
        this.generateBlobObject(
          this.options.url,
          this.downloadPdfName,
          localStorage.getItem("userId"),
          localStorage.getItem("userName")
        );  
        this.documentDialog = true;      
      },
      (error) => {
        this.notifier.notify("error", "Unable to load the File");
        this.showLoader = false;
      }
    );
    this.pdfOpen = true;
  }
}
