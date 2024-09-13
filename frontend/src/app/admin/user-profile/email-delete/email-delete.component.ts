import { Component, Input } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-email-delete',
  templateUrl: './email-delete.component.html',
  styleUrl: './email-delete.component.scss'
})
export class EmailDeleteComponent {

  @Input('currentUser') protected currentUser: User;
  constructor(
    private readonly usersService: UsersService
  ) { }
}
