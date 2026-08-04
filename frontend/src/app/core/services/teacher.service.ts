import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Teacher {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  assignedClass?: string;
  status?: 'Active' | 'Inactive';
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/teachers`;

  constructor(private http: HttpClient) {}

  getTeachers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createTeacher(data: Partial<Teacher>): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateTeacher(id: string, data: Partial<Teacher>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteTeacher(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
