import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) {}

  addPayment(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getStudentPayments(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
