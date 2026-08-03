import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BehaviorService {
  private apiUrl = 'http://localhost:3000/api/behavior';

  constructor(private http: HttpClient) {}

  addLog(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getStudentLogs(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  deleteLog(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
