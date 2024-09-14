import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { RouteModel } from '../../models/route.model';
import { AuthService, Permissions } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User, UsersService } from '../../services/users.service';

@Component({
  selector: 'app-main-section',
  templateUrl: './main-section.component.html',
  styleUrl: './main-section.component.scss'
})
export class MainSectionComponent {

  protected menuRoutes: RouteModel[] = [];
  protected admin: string;
  protected permissions: Permissions;

  constructor(
    private routes: AdminService,
    private router: Router,
    private authService: AuthService,
    private userService: UsersService,
  ) {
    this.userService.getCurrentUser().subscribe(
      (newValue: User) => {
        this.permissions = newValue.permissions;
        this.admin = newValue.login;
        this.menuRoutes = this.routes.getRoutes().filter(
          (route: RouteModel) => {
            if (route.getRoute() === 'logs') {
              if (!this.permissions.canManage) {
                return false;
              }
            }
            if (route.getRoute() === 'users') {
              if (!this.permissions.canManage) {
                return false;
              }
            }
            return true;
          });
      })

  }

  protected onLogout = async (): Promise<void> => {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
