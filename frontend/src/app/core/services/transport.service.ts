import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransportService {
  private apiUrl = 'http://localhost:3000/api/transport';

  constructor(private http: HttpClient) {}

  getTransportAllocation(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  allocateTransport(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  cancelTransport(studentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/student/${studentId}`);
  }
}
