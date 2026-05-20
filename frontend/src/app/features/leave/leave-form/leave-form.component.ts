import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';

@Component({
  selector: 'app-leave-form',
  template: `
    <div class="container">
      <div class="card">
        <h2>New leave request</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Start date</label>
          <input type="date" formControlName="startDate" />

          <label>End date</label>
          <input type="date" formControlName="endDate" />

          <label>Reason</label>
          <textarea formControlName="reason" rows="4"></textarea>

          <label>Supporting document (PDF, JPG, PNG — max 5MB)</label>
          <input type="file" (change)="onFileSelected($event)" accept="application/pdf,image/jpeg,image/png" />
          <div class="loading" *ngIf="uploading">Uploading file…</div>
          <div *ngIf="documentUrl">Uploaded: <a [href]="documentUrl" target="_blank" rel="noopener">View</a></div>

          <div class="error" *ngIf="error">{{ error }}</div>
          <div class="loading" *ngIf="submitting">Submitting…</div>

          <button type="submit" [disabled]="form.invalid || submitting || uploading">Submit request</button>
          <button type="button" class="secondary" (click)="cancel()">Cancel</button>
        </form>
      </div>
    </div>
  `,
})
export class LeaveFormComponent {
  uploading = false;
  submitting = false;
  error: string | null = null;
  documentUrl: string | null = null;

  form = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private router: Router,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.error = null;
    this.leaveService.uploadFile(file).subscribe({
      next: (res) => {
        this.documentUrl = res.url;
        this.uploading = false;
      },
      error: (err) => {
        this.uploading = false;
        this.error = err?.error?.message ?? 'Upload failed';
      },
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = null;
    const { startDate, endDate, reason } = this.form.value;
    this.leaveService.create({
      startDate: startDate!,
      endDate: endDate!,
      reason: reason!,
      documentUrl: this.documentUrl,
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/leaves']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message ?? 'Submission failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/leaves']);
  }
}
