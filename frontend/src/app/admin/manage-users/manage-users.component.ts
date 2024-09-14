import { Component } from '@angular/core';
import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';
import { Observable } from 'rxjs';
import { UsersService, User } from '../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss', '../manage-redirections/manage-redirections.component.scss']
})
export class ManageUsersComponent implements CanComponentDeactivate {

  protected users: User[] = []
  protected createNewUser: FormGroup;

  constructor(
    private readonly canLeave: CanDeactivateService,
    private readonly usersService: UsersService,
  ) {
    this.createNewUser = new FormGroup({
      login: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      password: new FormControl(null, [Validators.required, , Validators.minLength(3)]),
      email: new FormControl(null),
      canCreate: new FormControl(false, [Validators.required]),
      canUpdate: new FormControl(false, [Validators.required]),
      canDelete: new FormControl(false, [Validators.required]),
      canManage: new FormControl(false, [Validators.required]),
    })

    this.usersService.users.subscribe((state: User[]) => console.log(state));
    this.usersService.users.subscribe((state: User[]) => this.users = state);
    this.usersService.updateUsersList();
  }

  private confirm = (): boolean => {
    return window.confirm(`There are unfinished processes. Are you sure you want to leave now?`);
  }

  public canDeactivate = (): Observable<boolean> | Promise<boolean> | boolean => {

    if (this.canLeave.getValue('createUser')) {
      return this.confirm();
    }

    if (this.canLeave.modifiedUsers.getValue().length) {
      return this.confirm();
    }

    return true;
  };

  protected onUserCreate = async (): Promise<void> => {

  }
}
