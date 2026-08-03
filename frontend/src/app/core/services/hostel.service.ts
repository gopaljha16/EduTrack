import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HostelService {
  private apiUrl = 'http://localhost:3000/api/hostel';

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
