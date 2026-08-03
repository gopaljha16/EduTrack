import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicalService {
  private apiUrl = 'http://localhost:3000/api/medical';

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
