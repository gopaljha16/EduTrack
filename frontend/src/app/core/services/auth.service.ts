import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): AuthUser | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.getToken(); }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => this.handleAuthSuccess(res))
    );
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => this.handleAuthSuccess(res))
    );
  }

  updatePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-password`, data);
  }

  logout(): void {
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('edutrack_token');
  }

  private handleAuthSuccess(res: any): void {
    if (res.token) {
      localStorage.setItem('edutrack_token', res.token);
      localStorage.setItem('edutrack_user', JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
    }
  }

  private getStoredUser(): AuthUser | null {
    try {
      const u = localStorage.getItem('edutrack_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }
}
