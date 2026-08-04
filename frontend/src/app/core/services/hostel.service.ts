import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HostelService {
  private apiUrl = `${environment.apiUrl}/hostel`;

  constructor(private http: HttpClient) {}

  getHostelAllocation(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  allocateHostel(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  vacateHostel(studentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/student/${studentId}`);
  }
}
