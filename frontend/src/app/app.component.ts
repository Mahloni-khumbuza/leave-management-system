import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <nav *ngIf="authService.isAuthenticated()">
      <a routerLink="/leaves">Leave Requests</a>
      <a routerLink="/leaves/new">New Request</a>
      <a *ngIf="authService.isAdmin()" routerLink="/admin/leaves">Admin Queue</a>
      <span class="spacer"></span>
      <span class="user-badge">{{ authService.currentUser()?.fullName }} · {{ authService.currentUser()?.role }}</span>
      <button class="secondary" (click)="logout()">Logout</button>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
