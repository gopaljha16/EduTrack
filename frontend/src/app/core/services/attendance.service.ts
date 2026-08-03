import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = 'http://localhost:3000/api/attendance';

  constructor(private http: HttpClient) {}

  markAttendance(date: string, records: any[]): Observable<any> {
    return this.http.post(this.apiUrl, { date, records });
  }

  getClassAttendance(date: string, studentClass: string): Observable<any> {
    const params = new HttpParams()
      .set('date', date)
      .set('studentClass', studentClass);
    return this.http.get(`${this.apiUrl}/class`, { params });
  }

  getStudentAttendance(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }
}
