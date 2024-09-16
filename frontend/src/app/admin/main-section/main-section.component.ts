import { User, Permissions } from '../../../../../types/property.types';
import { AdminService } from '../../services/admin.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { RouteModel } from '../../models/route.model';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
