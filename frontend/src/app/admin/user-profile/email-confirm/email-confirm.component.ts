import { Component, Input } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrl: './email-confirm.component.scss'
})
export class EmailConfirmComponent {

  @Input('currentUser') protected currentUser: User;
  constructor(
    private readonly usersService: UsersService
  ) { }
}
