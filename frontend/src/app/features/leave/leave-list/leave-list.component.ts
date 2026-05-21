import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeaveResponse, LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leave-list',
  template: `
    <div class="container">
      <div class="card">
        <header class="section-header">
          <h2 class="section-title">{{ adminMode ? 'All leave requests' : 'My leave history' }}</h2>
          <p class="section-sub">
            {{ adminMode ? 'Every submission across the organisation.' : 'Every request you have submitted.' }}
          </p>
        </header>

        <div class="loading" *ngIf="loading">Loading…</div>
        <div class="error" *ngIf="error">{{ error }}</div>

        <table *ngIf="!loading && leaves.length > 0">
          <thead>
            <tr>
              <th *ngIf="adminMode">Employee</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Document</th>
              <th *ngIf="adminMode">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of leaves">
              <td *ngIf="adminMode">{{ l.employeeName }}</td>
              <td>{{ l.startDate }}</td>
              <td>{{ l.endDate }}</td>
              <td>{{ l.reason }}</td>
              <td><span [class]="'status-' + l.status">{{ l.status }}</span></td>
              <td>
                <ng-container *ngIf="docLinks(l.documentUrl) as urls; else noDocs">
                  <a
                    *ngFor="let url of urls; let i = index"
                    [href]="url"
                    target="_blank"
                    rel="noopener"
                    class="doc-link"
                  >Doc {{ i + 1 }}</a>
                </ng-container>
                <ng-template #noDocs>—</ng-template>
              </td>
              <td *ngIf="adminMode">
                <ng-container *ngIf="l.status === 'PENDING'; else decided">
                  <button (click)="decide(l, 'APPROVED')" [disabled]="actingId === l.id">Approve</button>
                  <button class="danger" (click)="decide(l, 'REJECTED')" [disabled]="actingId === l.id">Reject</button>
                </ng-container>
                <ng-template #decided>
                  <span class="loading">by {{ l.decidedByName }}</span>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>

        <p *ngIf="!loading && leaves.length === 0">No leave requests found.</p>
      </div>
    </div>
  `,
})
export class LeaveListComponent implements OnInit {
  leaves: LeaveResponse[] = [];
  loading = false;
  error: string | null = null;
  adminMode = false;
  actingId: number | null = null;

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.adminMode = this.route.snapshot.data['mode'] === 'admin' && this.authService.isAdmin();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const obs = this.adminMode ? this.leaveService.all() : this.leaveService.myHistory();
    obs.subscribe({
      next: (rows) => {
        this.leaves = rows;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 401) {
          this.error = 'Your session expired or the backend rejected your token. Please sign out and sign in again.';
          return;
        }
        this.error = err?.error?.message ?? `Failed to load leaves (status ${err?.status ?? 'unknown'})`;
      },
    });
  }

  docLinks(documentUrl: string | null): string[] | null {
    if (!documentUrl) return null;
    const urls = documentUrl.split('\n').map((u) => u.trim()).filter((u) => u.length > 0);
    return urls.length > 0 ? urls : null;
  }

  decide(leave: LeaveResponse, status: 'APPROVED' | 'REJECTED'): void {
    this.actingId = leave.id;
    this.leaveService.decide(leave.id, status).subscribe({
      next: (updated) => {
        const idx = this.leaves.findIndex((x) => x.id === updated.id);
        if (idx >= 0) this.leaves[idx] = updated;
        this.actingId = null;
      },
      error: (err) => {
        this.actingId = null;
        this.error = err?.error?.message ?? 'Decision failed';
      },
    });
  }
}
