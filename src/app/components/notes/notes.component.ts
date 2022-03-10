import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NotifierService } from "angular-notifier";
import { MatPaginator } from "@angular/material/paginator";
import { GlobalApiService } from "src/app/global-api.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { MatSort } from "@angular/material";

@Component({
  selector: "app-notes",
  templateUrl: "./notes.component.html",
  styleUrls: ["./notes.component.scss"],
})
export class NotesComponent implements OnInit {
  users = [];
  userSuggestions = [];
  addNoteForm: FormGroup = null;
  addNoteClicked = false;
  addNoteError = false;
  noteType = "opened";
  needByFilter = "desc";
  role = localStorage.roleId;
  searchUser = "";
  notes = new MatTableDataSource(<any>[]);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  updateNotesClicked = false;
  selectedNotes = [];
  addNoteVisible = false;
  columnsToDisplay = [
    "action",
    "username",
    "description",
    "showToUser",
    "completedBy",
    "status",
  ];
  private readonly notifier: NotifierService;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(
    private globalApiService: GlobalApiService,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.notes.paginator = this.paginator;
    this.noteFormInit();
    this.getUsers();
    this.getNotes();
  }

  getUsers() {
    this.globalApiService.getAllUsers().subscribe(
      (response: any) => {
        console.log(response);
        const users = response || [];
        this.users = users.map((user) => {
          user.username = `${user.first_name} ${user.last_name}`;
          return user;
        });
      },
      (error) => {}
    );
  }

  openNewNote(event, newNote) {
    this.addNoteError = false;
    newNote.show(event);
  }

  noteFormInit() {
    this.addNoteForm = new FormGroup({
      user: new FormControl(null, [Validators.required]),
      notes: new FormControl("", [Validators.required]),
      needBy: new FormControl(null, [Validators.required]),
      status: new FormControl(true, [Validators.required]),
      showToUser: new FormControl(false, [Validators.required]),
    });
  }

  getNotes() {
    const status =
      this.noteType === "closed" ? "0" : this.noteType === "opened" ? "1" : "";
    this.globalApiService
      .getNotes(this.searchUser, status, this.needByFilter)
      .subscribe(
        (response: any) => {
          console.log(response);
          let notes = response;
          notes = notes.map((note) => {
            note.username = `${note.firstName} ${note.lastName}`;
            note.completedBy = moment(note.completedBy).format("MM-DD-YYYY");
            return note;
          });
          console.log(notes);
          this.selectedNotes = [];
          this.notes = new MatTableDataSource(notes);
          this.notes.paginator = this.paginator;
          this.notes.sort = this.sort;
        },
        (error) => {}
      );
  }

  filterUsers(event) {
    this.userSuggestions = this.users.filter(
      (user) =>
        user.first_name ? user.first_name.toLowerCase().includes(event.query.toLowerCase()) : false ||
        user.last_name ? user.last_name.toLowerCase().includes(event.query.toLowerCase()) : false ||
        user.email ? user.email.toLowerCase().includes(event.query.toLowerCase()) : false
    );
  }

  setNoteStatus(status) {
    this.addNoteForm.controls.status.setValue(status);
  }

  addNote(newNote) {
    console.log(newNote, this.addNoteForm);
    this.addNoteClicked = true;
    if (this.addNoteForm.valid) {
      this.addNoteError = false;
      const noteForm = this.addNoteForm.value;
      const noteData = {
        description: noteForm.notes,
        user_id: noteForm.user.user_id,
        show_to_user: noteForm.showToUser ? 1 : 0,
        completed_by: moment(noteForm.needBy).format("MM-DD-YYYY"),
        status: noteForm.status ? 1 : 0,
      };
      console.log(noteData);
      this.globalApiService.createNote(noteData).subscribe(
        (response) => {
          this.notifier.notify("success", "Successfully created the note");
          this.addNoteClicked = false;
          // newNote.hide();
          this.toggleNewNote();
          this.noteFormInit();
          this.getNotes();
        },
        (error) => {
          this.notifier.notify("error", "Unable to create the note");
          this.addNoteClicked = false;
        }
      );
    } else {
      this.addNoteError = true;
      this.addNoteClicked = false;
    }
  }

  selectNote(noteId) {
    const noteIndex = this.selectedNotes.indexOf(noteId);
    if (noteIndex >= 0) {
      this.selectedNotes.splice(noteIndex, 1);
    } else {
      this.selectedNotes.push(noteId);
    }
    console.log(this.selectedNotes);
  }

  updateSingleNote(noteid, status, showToUser) {
    const noteIndex = this.notes.data.findIndex(
      (note: any) => note.notesId === noteid
    );
    if (noteIndex >= 0) {
      this.notes.data[noteIndex]["status"] = status;
    }
    const notes = {
      notes: [
        {
          note_id: noteid,
          status: status ? 1 : 0,
          show_to_user: showToUser ? 1 : 0,
        },
      ],
    };
    console.log(notes, this.notes.data);
    this.updateNotes(notes);
  }

  updateMultipleNotes(status) {
    const updateableNotes = this.notes.data.filter(
      (note: any) => this.selectedNotes.indexOf(note.notesId) >= 0
    );
    console.log(updateableNotes);
    const notes = { notes: [] };
    for (let i = 0; i < updateableNotes.length; i++) {
      notes.notes.push({
        note_id: updateableNotes[i]["notesId"],
        status: status ? 1 : 0,
        show_to_user: updateableNotes[i]["showToUser"] ? 1 : 0,
      });
    }
    console.log(notes);
    this.updateNotes(notes);
  }

  updateNotes(notes) {
    this.updateNotesClicked = true;
    this.globalApiService.updateNotes(notes).subscribe(
      (response) => {
        this.notifier.notify("success", "Successfully updated Status");
        this.updateNotesClicked = false;
        this.selectedNotes = [];
        this.getNotes();
      },
      (error) => {
        this.updateNotesClicked = false;
        this.notifier.notify("error", error.msg || "Unable to update status");
      }
    );
  }

  toggleNewNote() {
    this.addNoteVisible = !this.addNoteVisible;
  }
}
