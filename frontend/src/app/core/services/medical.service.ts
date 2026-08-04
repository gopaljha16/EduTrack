import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicalService {
  private apiUrl = `${environment.apiUrl}/medical`;

  constructor(private http: HttpClient) {}

  getStudentMedical(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  updateMedical(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  recordClinicVisit(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/visit`, data);
  }

  deleteClinicVisit(studentId: string, visitId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${studentId}/visit/${visitId}`);
  }
}
