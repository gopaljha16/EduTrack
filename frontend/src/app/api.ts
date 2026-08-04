import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  apiUrl: string = `${environment.apiUrl}/students/`;
  constructor(private http: HttpClient) {}
  getStudents() {
    return this.http.get(this.apiUrl);
  }
  addStudent(student: any) {
    return this.http.post(this.apiUrl, student);
  }
  deleteStudent(id: string) {
    return this.http.delete(`${this.apiUrl}${id}`);
  }
  updateStudent(id: string, student: any) {
    return this.http.put(`${this.apiUrl}${id}`, student);
  }
}
