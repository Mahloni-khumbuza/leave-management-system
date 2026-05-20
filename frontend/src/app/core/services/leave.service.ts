import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  documentUrl: string | null;
  createdAt: string;
  decisionAt: string | null;
  decidedByName: string | null;
}

export interface CreateLeavePayload {
  startDate: string;
  endDate: string;
  reason: string;
  documentUrl?: string | null;
}

const DEMO_LEAVES_KEY = 'lms_demo_leaves';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  myHistory(): Observable<LeaveResponse[]> {
    if (this.authService.isDemo()) {
      const all = this.getDemoLeaves();
      const me = this.authService.currentUser();
      return of(all.filter((l) => l.employeeName === me?.fullName)).pipe(delay(200));
    }
    return this.http.get<LeaveResponse[]>(`${environment.apiUrl}/leaves/me`);
  }

  all(): Observable<LeaveResponse[]> {
    if (this.authService.isDemo()) {
      return of(this.getDemoLeaves()).pipe(delay(200));
    }
    return this.http.get<LeaveResponse[]>(`${environment.apiUrl}/leaves`);
  }

  create(payload: CreateLeavePayload): Observable<LeaveResponse> {
    if (this.authService.isDemo()) {
      const me = this.authService.currentUser()!;
      const all = this.getDemoLeaves();
      const created: LeaveResponse = {
        id: Date.now(),
        employeeId: 1,
        employeeName: me.fullName,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
        status: 'PENDING',
        documentUrl: payload.documentUrl ?? null,
        createdAt: new Date().toISOString(),
        decisionAt: null,
        decidedByName: null,
      };
      this.saveDemoLeaves([created, ...all]);
      return of(created).pipe(delay(200));
    }
    return this.http.post<LeaveResponse>(`${environment.apiUrl}/leaves`, payload);
  }

  decide(id: number, status: 'APPROVED' | 'REJECTED'): Observable<LeaveResponse> {
    if (this.authService.isDemo()) {
      const me = this.authService.currentUser()!;
      const all = this.getDemoLeaves();
      const idx = all.findIndex((l) => l.id === id);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          status,
          decisionAt: new Date().toISOString(),
          decidedByName: me.fullName,
        };
        this.saveDemoLeaves(all);
        return of(all[idx]).pipe(delay(200));
      }
    }
    return this.http.patch<LeaveResponse>(`${environment.apiUrl}/leaves/${id}/decision`, { status });
  }

  uploadFile(file: File): Observable<{ url: string }> {
    if (this.authService.isDemo()) {
      return of({ url: `demo://uploaded/${encodeURIComponent(file.name)}` }).pipe(delay(300));
    }
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/files/upload`, form);
  }

  private getDemoLeaves(): LeaveResponse[] {
    const raw = localStorage.getItem(DEMO_LEAVES_KEY);
    if (raw) return JSON.parse(raw) as LeaveResponse[];
    const seed = this.seedDemoLeaves();
    this.saveDemoLeaves(seed);
    return seed;
  }

  private saveDemoLeaves(rows: LeaveResponse[]): void {
    localStorage.setItem(DEMO_LEAVES_KEY, JSON.stringify(rows));
  }

  private seedDemoLeaves(): LeaveResponse[] {
    const now = Date.now();
    const day = 86400000;
    const iso = (ms: number) => new Date(ms).toISOString();
    const date = (ms: number) => iso(ms).slice(0, 10);
    return [
      {
        id: 1,
        employeeId: 1,
        employeeName: 'Demo Employee',
        startDate: date(now + 7 * day),
        endDate: date(now + 10 * day),
        reason: 'Family wedding out of town.',
        status: 'PENDING',
        documentUrl: null,
        createdAt: iso(now - 2 * day),
        decisionAt: null,
        decidedByName: null,
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: 'Alex Morgan',
        startDate: date(now + 14 * day),
        endDate: date(now + 16 * day),
        reason: 'Medical appointment + recovery.',
        status: 'APPROVED',
        documentUrl: 'demo://uploaded/doctor-note.pdf',
        createdAt: iso(now - 5 * day),
        decisionAt: iso(now - 3 * day),
        decidedByName: 'Demo Admin',
      },
      {
        id: 3,
        employeeId: 3,
        employeeName: 'Priya Patel',
        startDate: date(now - 14 * day),
        endDate: date(now - 12 * day),
        reason: 'Personal time.',
        status: 'REJECTED',
        documentUrl: null,
        createdAt: iso(now - 20 * day),
        decisionAt: iso(now - 18 * day),
        decidedByName: 'Demo Admin',
      },
      {
        id: 4,
        employeeId: 1,
        employeeName: 'Demo Employee',
        startDate: date(now - 30 * day),
        endDate: date(now - 25 * day),
        reason: 'Vacation.',
        status: 'APPROVED',
        documentUrl: null,
        createdAt: iso(now - 45 * day),
        decisionAt: iso(now - 40 * day),
        decidedByName: 'Demo Admin',
      },
    ];
  }
}
