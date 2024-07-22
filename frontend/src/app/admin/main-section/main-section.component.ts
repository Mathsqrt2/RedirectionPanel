import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { RouteModel } from '../../models/route.model';

@Component({
  selector: 'app-main-section',
  templateUrl: './main-section.component.html',
  styleUrl: './main-section.component.scss'
})
export class MainSectionComponent implements OnInit {

  menuRoutes: RouteModel[] = [];

  constructor(private Routes: AdminService) { }

  ngOnInit(): void {
    this.menuRoutes = this.Routes.getRoutes();
  }
}
