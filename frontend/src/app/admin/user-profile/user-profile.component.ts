import { Component, OnInit } from '@angular/core';
import { User, UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {

  private domain: string = `http://localhost:3000`;
  protected baseUrl: string = `${this.domain}/api/auth`;
  protected currentUser: User;

  constructor(
    private readonly usersService: UsersService,
  ) {
    this.usersService.getCurrentUser().subscribe((newValue: User)=>{
      this.currentUser = newValue;
    })
  }

  ngOnInit(): void {
    this.usersService.updateCurrentUser();
  }
}


