import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LoginComponent } from './layout/login/login.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { AuthGuard } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { MainSectionComponent } from './admin/main-section/main-section.component';
import { ShowRedirectionsComponent } from './admin/show-redirections/show-redirections.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { RegisterComponent } from './layout/register/register.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { ManageRedirectionsComponent } from './admin/manage-redirections/manage-redirections.component';
import { DisplayStatsComponent } from './admin/display-stats/display-stats.component';
import { AdminService } from './services/admin.service';
import { UsersService } from './services/users.service';
import { RedirectionsService } from './services/redirections.service';
import { RedirectionBarComponent } from './admin/manage-redirections/redirection-bar/redirection-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    NotFoundPageComponent,
    MainSectionComponent,
    ShowRedirectionsComponent,
    RegisterComponent,
    ManageUsersComponent,
    ManageRedirectionsComponent,
    DisplayStatsComponent,
    RedirectionBarComponent,
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
    UsersService,
    RedirectionsService,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
