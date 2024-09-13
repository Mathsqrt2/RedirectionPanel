import { Component } from '@angular/core';
import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';
import { Observable } from 'rxjs';
import { UsersService, User } from '../../services/users.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent implements CanComponentDeactivate {

  protected users: User[]

  constructor(
    private readonly canLeave: CanDeactivateService,
    private readonly usersService: UsersService,
  ) { 
 
  }

  private confirm = (): boolean => {
    return window.confirm(`There are unfinished processes. Are you sure you want to leave now?`);
  }

  public canDeactivate = (): Observable<boolean> | Promise<boolean> | boolean => {

    if (this.canLeave.getValue('createRedirection')) {
      return this.confirm();
    }

    if (this.canLeave.modifiedRedirectionEdits.getValue().length) {
      return this.confirm();
    }

    return true;
  };
}
