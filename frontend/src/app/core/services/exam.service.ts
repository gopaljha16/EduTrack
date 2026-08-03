import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exam {
  _id?: string;
  studentClass: string;
  subject: string;
  examType: 'Midterm' | 'Final' | 'Class Test' | 'Practical';
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = 'http://localhost:3000/api/exams';

  constructor(private http: HttpClient) {}

  getExams(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getClassExams(className: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/class/${className}`);
  }

  createExam(data: Partial<Exam>): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateExam(id: string, data: Partial<Exam>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteExam(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
