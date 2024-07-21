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
import { CurrentPanelComponent } from './admin/current-panel/current-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    NotFoundPageComponent,
    MainSectionComponent,
    ShowRedirectionsComponent,
    CurrentPanelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    AuthGuard,
    AuthService,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
