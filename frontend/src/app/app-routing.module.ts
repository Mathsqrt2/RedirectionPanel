import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './layout/login/login.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { AuthGuard } from './services/auth-guard.service';
import { MainSectionComponent } from './admin/main-section/main-section.component';
import { RegisterComponent } from './layout/register/register.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { ManageRedirectionsComponent } from './admin/manage-redirections/manage-redirections.component';
import { DisplayLogsComponent } from './admin/display-logs/display-logs.component';
import { UserProfileComponent } from './admin/user-profile/user-profile.component';

const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "admin", canActivate: [AuthGuard], component: MainSectionComponent, children: [
      { path: "users", canActivate: [AuthGuard], component: ManageUsersComponent },
      { path: "redirections", canActivate: [AuthGuard], component: ManageRedirectionsComponent },
      { path: "logs", canActivate: [AuthGuard], component: DisplayLogsComponent },
      { path: "profile", canActivate: [AuthGuard], component: UserProfileComponent },
    ],
  },
  { path: "register", component: RegisterComponent },
  { path: "login", component: LoginComponent },

  { path: "not-found", component: NotFoundPageComponent },

  { path: "redirections", redirectTo: 'login' },
  { path: "", redirectTo: 'login', pathMatch: "full" },
  { path: "**", redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
