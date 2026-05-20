import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'ADMIN' | 'EMPLOYEE';

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: Role;
}

const STORAGE_KEY = 'lms_auth';
const DEMO_FLAG = 'lms_demo_mode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthResponse | null>(this.load());

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((r) => this.persist(r, false)));
  }

  register(payload: { email: string; password: string; fullName: string; role?: Role }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((r) => this.persist(r, false)));
  }

  demoLogin(role: Role): Observable<AuthResponse> {
    const fake: AuthResponse = {
      token: 'demo-token',
      email: role === 'ADMIN' ? 'demo.admin@example.com' : 'demo.employee@example.com',
      fullName: role === 'ADMIN' ? 'Demo Admin' : 'Demo Employee',
      role,
    };
    this.persist(fake, true);
    return of(fake);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DEMO_FLAG);
    this.currentUser.set(null);
  }

  token(): string | null {
    return this.currentUser()?.token ?? null;
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  isDemo(): boolean {
    return localStorage.getItem(DEMO_FLAG) === '1';
  }

  private persist(r: AuthResponse, demo: boolean): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
    if (demo) localStorage.setItem(DEMO_FLAG, '1');
    else localStorage.removeItem(DEMO_FLAG);
    this.currentUser.set(r);
  }

  private load(): AuthResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  }
}
