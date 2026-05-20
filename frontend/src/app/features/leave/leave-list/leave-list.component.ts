import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeaveResponse, LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leave-list',
  template: `
    <div class="container">
      <div class="card">
        <h2>{{ adminMode ? 'All leave requests' : 'My leave history' }}</h2>

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
                <a *ngIf="l.documentUrl" [href]="l.documentUrl" target="_blank" rel="noopener">View</a>
                <span *ngIf="!l.documentUrl">—</span>
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
        this.error = err?.error?.message ?? 'Failed to load leaves';
      },
    });
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
