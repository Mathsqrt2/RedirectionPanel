import { Component } from '@angular/core';
import { User, UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {

  currentUser: User;
  permissions: { key: string, value: string }[] = []



  constructor(
    private readonly usersService: UsersService
  ) {
    this.usersService.getCurrentUser().subscribe((newValue: User) => {
      this.currentUser = newValue;
      if (this.currentUser?.permissions) {
        const keys = Object.keys(this.currentUser.permissions);

        for (let key of keys) {
          this.permissions.push({ key, value: this.currentUser.permissions[key] });
        }

      }
    });
  }

}
