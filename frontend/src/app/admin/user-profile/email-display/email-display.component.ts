import { Component, Input } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { BanTime } from '../user-profile.component';

@Component({
  selector: 'app-email-display',
  templateUrl: './email-display.component.html',
  styleUrls: ['./email-display.component.scss', '../user-profile.component.scss']
})
export class EmailDisplayComponent {

  @Input('currentUser') protected currentUser: User;
  @Input('accessLocked') protected accessLocked: BanTime = null;
  
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
