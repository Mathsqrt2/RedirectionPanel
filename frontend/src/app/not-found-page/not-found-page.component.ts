import { AuthService } from '../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss'
})

export class NotFoundPageComponent implements OnInit {

  protected isLoggedIn: boolean;
  constructor(private readonly auth: AuthService) { }


  async ngOnInit(): Promise<void> {
    this.isLoggedIn = await this.auth.isAuthenticated();
  }
}
