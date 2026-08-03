import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private apiUrl = 'http://localhost:3000/api/library';

  constructor(private http: HttpClient) {}

  getStudentBooks(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  issueBook(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  returnBook(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/return`, {});
  }

  deleteLibraryLog(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
