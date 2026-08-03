import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = 'http://localhost:3000/api/invoices';

  constructor(private http: HttpClient) {}

  getStudentInvoices(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  generateInvoice(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
