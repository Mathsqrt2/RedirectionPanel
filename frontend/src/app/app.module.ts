import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";

import { AuthGuard } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { AdminService } from './services/admin.service';
import { UsersService } from './services/users.service';
import { RedirectionsService } from './services/redirections.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { LogBarComponent } from './admin/display-logs/log-bar/log-bar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LoginComponent } from './layout/login/login.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { MainSectionComponent } from './admin/main-section/main-section.component';
import { RegisterComponent } from './layout/register/register.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { ManageRedirectionsComponent } from './admin/manage-redirections/manage-redirections.component';
import { DisplayLogsComponent } from './admin/display-logs/display-logs.component';
import { RedirectionBarComponent } from './admin/manage-redirections/redirection-bar/redirection-bar.component';
import { UserProfileComponent } from './admin/user-profile/user-profile.component';
import { ManagePermissionsComponent } from './admin/user-profile/manage-permissions/manage-permissions.component';
import { ChangePasswordComponent } from './admin/user-profile/change-password/change-password.component';
import { CanDeactivateService } from './services/can-deactivate-guard.service';
import { DeleteAccountComponent } from './admin/user-profile/delete-account/delete-account.component';
import { LogsService } from './services/logs.service';
import { EmailDeleteComponent } from './admin/user-profile/email-delete/email-delete.component';
import { EmailConfirmComponent } from './admin/user-profile/email-confirm/email-confirm.component';
import { EmailDisplayComponent } from './admin/user-profile/email-display/email-display.component';
import { EmailChangeComponent } from './admin/user-profile/email-change/email-change.component';
import { UserBarComponent } from './admin/manage-users/user-bar/user-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    NotFoundPageComponent,
    MainSectionComponent,
    RegisterComponent,
    ManageUsersComponent,
    ManageRedirectionsComponent,
    DisplayLogsComponent,
    RedirectionBarComponent,
    UserProfileComponent,
    LogBarComponent,
    ManagePermissionsComponent,
    ChangePasswordComponent,
    DeleteAccountComponent,
    EmailDeleteComponent,
    EmailConfirmComponent,
    EmailDisplayComponent,
    EmailChangeComponent,
    UserBarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    AuthGuard,
    AuthService,
    AdminService,
    RedirectionsService,
    UsersService,
    LogsService,
    CanDeactivateService,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
