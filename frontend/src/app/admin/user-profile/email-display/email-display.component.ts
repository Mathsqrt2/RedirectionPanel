import { UsersService } from '../../../services/users.service';
import { User } from '../../../../../types/property.types';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-email-display',
  templateUrl: './email-display.component.html',
  styleUrls: ['./email-display.component.scss', '../user-profile.component.scss']
})
export class EmailDisplayComponent {

  @Input('currentUser') protected currentUser: User;
  
  constructor(
    private readonly usersService: UsersService
  ) {
  }

  protected onStartDeleteEmailProcess = (): void => {
    this.usersService.deleteEmailProcess.next(true);
  }
  
  protected onStartChangeEmailProcess = (): void => {
    this.usersService.changeEmailProcess.next(true);
  }
}
