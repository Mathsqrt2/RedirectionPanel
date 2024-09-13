import { Component, Input } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-email-display',
  templateUrl: './email-display.component.html',
  styleUrl: './email-display.component.scss'
})
export class EmailDisplayComponent {

  @Input('currentUser') protected currentUser: User;
  constructor(
    private readonly usersService: UsersService
  ) {
  }
}
