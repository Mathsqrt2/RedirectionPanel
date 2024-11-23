import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { User } from '../../../../types/property.types';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss', '../manage-redirections/manage-redirections.component.scss']
})
export class ManageUsersComponent implements CanComponentDeactivate, OnInit {

  protected users: User[] = []
  protected createNewUser: FormGroup;
  protected createUserError: boolean;

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
    this.usersService.users.subscribe((state: User[]) => this.users = state);
    this.usersService.updateUsersList();
  }

  ngOnInit(): void {
    this.createNewUser.valueChanges.subscribe((newState) => {

      if (newState.login !== null && newState.login !== '' ||
        newState.password !== null && newState.password !== '' ||
        newState.email !== null && newState.email !== ''
      ) {
        this.canLeave.getSubject('createUser').next(true);
      } else {
        this.canLeave.getSubject('createUser').next(false);
      }
    });
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

    if (this.createNewUser.status === 'VALID') {
      this.createUserError = await this.usersService.createUserInPanel(this.createNewUser.value);
      this.createNewUser.reset();
    }

  }
}
