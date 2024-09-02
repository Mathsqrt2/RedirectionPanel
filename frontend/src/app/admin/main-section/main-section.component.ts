import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { RouteModel } from '../../models/route.model';
import { AuthService, Permissions } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-main-section',
  templateUrl: './main-section.component.html',
  styleUrl: './main-section.component.scss'
})
export class MainSectionComponent implements OnInit {

  menuRoutes: RouteModel[] = [];
  admin: string;
  permissions: Permissions;

  constructor(
    private routes: AdminService,
    private router: Router,
    private authService: AuthService,
    private userService: UsersService,
  ) { }

  ngOnInit(): void {
    this.admin = this.userService.getCurrentUserName()
    this.permissions = this.userService.getCurrentUserPermissions();
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
  }

  onLogout = async () => {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
