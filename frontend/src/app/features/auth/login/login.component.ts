import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-wrap">
      <div class="auth-card">
        <button class="back-link" (click)="back()">Back to role selection</button>

        <div class="auth-role-badge" [class.admin]="role === 'ADMIN'">
          Signing in as <strong>{{ role === 'ADMIN' ? 'Admin' : 'Employee' }}</strong>
        </div>

        <h2>{{ mode === 'login' ? 'Sign in' : 'Create account' }}</h2>
        <p class="auth-sub">
          {{ mode === 'login' ? 'Welcome back.' : 'Sign up to get started.' }}
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <ng-container *ngIf="mode === 'register'">
            <div class="form-row">
              <div class="form-col">
                <label>Name</label>
                <input type="text" placeholder="Jane" formControlName="name" autocomplete="given-name" />
              </div>
              <div class="form-col">
                <label>Surname</label>
                <input type="text" placeholder="Doe" formControlName="surname" autocomplete="family-name" />
              </div>
            </div>
          </ng-container>

          <label>Email</label>
          <input type="email" placeholder="you@company.com" formControlName="email" autocomplete="email" />

          <label>Password</label>
          <input type="password" placeholder="At least 8 characters" formControlName="password" autocomplete="current-password" />

          <div class="error" *ngIf="error">{{ error }}</div>
          <div class="loading" *ngIf="loading">Please wait…</div>

          <button type="submit" class="primary-btn" [disabled]="form.invalid || loading">
            {{ mode === 'login' ? 'Sign in' : 'Create account' }}
          </button>
        </form>

        <div class="auth-switch">
          {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
          <a href="javascript:void(0)" (click)="toggleMode()">
            {{ mode === 'login' ? 'Register' : 'Sign in' }}
          </a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  mode: 'login' | 'register' = 'login';
  role: 'ADMIN' | 'EMPLOYEE' = 'EMPLOYEE';
  loading = false;
  error: string | null = null;

  form = this.fb.group({
    name: [''],
    surname: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const r = this.route.snapshot.queryParamMap.get('role');
    if (r === 'ADMIN' || r === 'EMPLOYEE') this.role = r;
  }

  back(): void {
    this.router.navigate(['/']);
  }

  toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = null;
    const nameCtrl = this.form.get('name');
    const surnameCtrl = this.form.get('surname');
    if (this.mode === 'register') {
      nameCtrl?.addValidators(Validators.required);
      surnameCtrl?.addValidators(Validators.required);
    } else {
      nameCtrl?.clearValidators();
      surnameCtrl?.clearValidators();
    }
    nameCtrl?.updateValueAndValidity();
    surnameCtrl?.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const { email, password, name, surname } = this.form.value;
    const obs = this.mode === 'login'
      ? this.authService.login(email!, password!)
      : this.authService.register({
          email: email!,
          password: password!,
          fullName: `${(name ?? '').trim()} ${(surname ?? '').trim()}`.trim(),
          role: this.role,
        });

    obs.subscribe({
      next: (res) => {
        this.loading = false;
        if (this.mode === 'login' && res.role !== this.role) {
          this.error = `This account is registered as ${res.role}. Please go back and pick the right role.`;
          this.authService.logout();
          return;
        }
        this.router.navigate([res.role === 'ADMIN' ? '/admin/leaves' : '/leaves']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Authentication failed';
      },
    });
  }
}
