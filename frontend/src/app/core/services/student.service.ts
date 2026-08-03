import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  _id?: string;
  name: string;
  age: number;
  email: string;
  studentClass: string;
  address: string;
  phone: string;
  gender?: 'Male' | 'Female' | 'Other';
  status?: 'Active' | 'Inactive' | 'Graduated';
  feeStatus?: 'Paid' | 'Pending' | 'Overdue';
  admissionDate?: string;
  rollNumber?: string;
  parentName?: string;
  parentPhone?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = 'http://localhost:3000/api/students';

  constructor(private http: HttpClient) {}

  getStudents(filters?: {
    search?: string;
    studentClass?: string;
    status?: string;
    feeStatus?: string;
  }): Observable<any> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.studentClass) params = params.set('studentClass', filters.studentClass);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.feeStatus) params = params.set('feeStatus', filters.feeStatus);
    return this.http.get(this.apiUrl, { params });
  }

  getStudentById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createStudent(data: Partial<Student>): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateStudent(id: string, data: Partial<Student>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  exportCsv(students: Student[]): void {
    const headers = ['Name', 'Age', 'Email', 'Class', 'Status', 'Fee Status', 'Phone', 'Address', 'Admission Date'];
    const rows = students.map(s => [
      s.name, s.age, s.email, s.studentClass, s.status || 'Active',
      s.feeStatus || 'Pending', s.phone, `"${s.address}"`,
      s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
