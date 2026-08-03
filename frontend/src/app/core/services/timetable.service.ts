import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimetableService {
  private apiUrl = 'http://localhost:3000/api/timetable';

  constructor(private http: HttpClient) {}

  addSchedule(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getClassSchedules(studentClass: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${studentClass}`);
  }

  deleteSchedule(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
