import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PtmService {
  private apiUrl = `${environment.apiUrl}/ptm`;

  constructor(private http: HttpClient) {}

  schedulePTM(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getStudentPTMs(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  updatePTM(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deletePTM(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
