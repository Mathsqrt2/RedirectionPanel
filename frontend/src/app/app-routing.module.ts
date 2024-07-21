import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './layout/login/login.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { AuthGuard } from './services/auth-guard.service';
import { MainSectionComponent } from './admin/main-section/main-section.component';
import { CurrentPanelComponent } from './admin/current-panel/current-panel.component';

const routes: Routes = [
  { path: "", component: LoginComponent },
  {
    path: "admin", canActivate: [AuthGuard], component: MainSectionComponent, children: [
      { path: ":panelid", canActivate: [AuthGuard], component: CurrentPanelComponent }
    ],
  },
  { path: "login", component: LoginComponent },

  { path: "not-found", component: NotFoundPageComponent },
  { path: "**", redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
