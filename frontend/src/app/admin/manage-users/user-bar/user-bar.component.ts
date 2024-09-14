import { Component, Input } from '@angular/core';
import { User } from '../../../services/users.service';

@Component({
  selector: '[user-bar]',
  templateUrl: './user-bar.component.html',
  styleUrl: './user-bar.component.scss'
})
export class UserBarComponent {

  @Input('user') user: User;
  

}
