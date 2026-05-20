import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Role } from '../../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  template: `
    <div class="welcome-wrap">
      <div class="welcome-hero">
        <p class="eyebrow">Leave Management System</p>
        <h1>Welcome aboard</h1>
        <p class="subtitle">Plan your time off and keep your team in sync. Pick how you'd like to continue.</p>

        <div class="role-grid">
          <button class="role-card role-employee" (click)="pick('EMPLOYEE')">
            <div class="role-avatar avatar-employee">E</div>
            <h2>I'm an Employee</h2>
            <p>Request time off and track your leave history.</p>
          </button>

          <button class="role-card role-admin" (click)="pick('ADMIN')">
            <div class="role-avatar avatar-admin">A</div>
            <h2>I'm an Admin</h2>
            <p>Review pending requests and approve or reject team leave.</p>
          </button>
        </div>

        <div class="demo-strip">
          <span>Backend not running yet?</span>
          <button class="demo-link" (click)="demo('EMPLOYEE')">Preview as Employee</button>
          <span class="demo-sep">·</span>
          <button class="demo-link" (click)="demo('ADMIN')">Preview as Admin</button>
        </div>
      </div>
    </div>
  `,
})
export class WelcomeComponent {
  constructor(private router: Router, private authService: AuthService) {}

  pick(role: Role): void {
    this.router.navigate(['/login'], { queryParams: { role } });
  }

  demo(role: Role): void {
    this.authService.demoLogin(role).subscribe(() => {
      this.router.navigate([role === 'ADMIN' ? '/admin/leaves' : '/leaves']);
    });
  }
}
