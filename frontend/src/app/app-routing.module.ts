import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './layout/login/login.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "admin", component: LoginComponent },
  { path: "login", component: LoginComponent },
  { path: "not-found", component: NotFoundPageComponent },
  { path: "**", redirectTo: 'not-found'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
