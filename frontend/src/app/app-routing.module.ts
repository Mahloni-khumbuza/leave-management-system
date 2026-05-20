import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WelcomeComponent } from './features/welcome/welcome.component';
import { LoginComponent } from './features/auth/login/login.component';
import { LeaveListComponent } from './features/leave/leave-list/leave-list.component';
import { LeaveFormComponent } from './features/leave/leave-form/leave-form.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'leaves', component: LeaveListComponent, canActivate: [authGuard], data: { mode: 'me' } },
  { path: 'leaves/new', component: LeaveFormComponent, canActivate: [authGuard] },
  { path: 'admin/leaves', component: LeaveListComponent, canActivate: [authGuard, adminGuard], data: { mode: 'admin' } },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
