import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { RouteModel } from '../../models/route.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-section',
  templateUrl: './main-section.component.html',
  styleUrl: './main-section.component.scss'
})
export class MainSectionComponent implements OnInit {

  menuRoutes: RouteModel[] = [];

  constructor(
    private Routes: AdminService,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.menuRoutes = this.Routes.getRoutes();
  }

  onLogout = async () => {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
