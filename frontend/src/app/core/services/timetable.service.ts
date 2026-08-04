import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TimetableService {
  private apiUrl = `${environment.apiUrl}/timetable`;

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
