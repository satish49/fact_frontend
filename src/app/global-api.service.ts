import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GlobalApiService {
  constructor(public http: HttpClient) {}

  getAllUsers() {
    return this.http.get("/api/users", {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
  }

  getNotes(name, status, orderType) {
    return this.http.get(
      `/api/get_notes?status=${status}&name=${name}&order=${orderType}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      }
    );
  }

  createNote(data) {
    return this.http.post("/api/create_note", data, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
  }

  updateNotes(data) {
    return this.http.put("/api/batch_update_note_status", data, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
  }

  getAllFiles() {
    return this.http.get("/api/s3/get_all_files", {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
  }

  uploadFiles(formData) {
    return this.http.post("/api/upload_files", formData, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
  }

  getFileUrl(fileId) {
    return this.http.get(`/api/s3/getfile?file_id=${fileId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    })
  }

  getAllStudents() {
    return this.http.get("/api/get_all_students", {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    })
  }

  getAllBatches() {
    return this.http.get("/api/get_all_batch", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
  }

  getUserFiles(userId, recentDate) {
    return this.http.get(`/api/get_assigned_files?user_id=${userId}&recent_date=${recentDate}`, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    })
  }

  assignFiles(data) {
    return this.http.post("/api/assign_files", data, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    })
  }
}
