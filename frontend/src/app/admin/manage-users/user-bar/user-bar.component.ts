import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormGroup } from '@angular/forms';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
  selector: '[user-bar]',
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss', '../../manage-redirections/manage-redirections.component.scss']
})
export class UserBarComponent implements OnChanges, OnInit {

  @Input('user') protected user: UserFromResponse;
  @Input('index') protected index: number;

  protected canCreate: boolean;
  protected canUpdate: boolean;
  protected canDelete: boolean;
  protected canManage: boolean;

  protected loginInput: string;
  protected passwordInput: string;
  protected emailInput: string;
  protected emailSentInput: boolean;

  protected editMode: boolean = false;

  constructor(
    private readonly canLeave: CanDeactivateService,
    private readonly usersService: UsersService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {

  }

  public ngOnInit(): void {
    this.canCreate = this.user.canCreate;
    this.canUpdate = this.user.canUpdate;
    this.canDelete = this.user.canDelete;
    this.canManage = this.user.canManage;
  }

  protected onEdit = async (): Promise<void> => {
    this.editMode = true;
  }

  protected onRejectEdit = async (): Promise<void> => {
    this.editMode = false;
    this.loginInput = this.user.login;
    this.passwordInput = this.user.password;
    this.emailInput = this.user.email;
    this.emailSentInput = this.user.emailSent;
  }

  protected onConfirmEdit = async (): Promise<void> => {

  }

  protected onDelete = async (): Promise<void> => {

    const confirmDelete = window.confirm(`This action is permanent, are you sure?`)
    if (confirmDelete) {

    }

  }

  protected onCopyToClipboard = (property?: Property): void => {
    let response
    switch (property) {
      case 'id': response = `${this.user.id}`;
        break;
      case 'login': response = `${this.user.login}`;
        break;
      case 'password': response = `${this.user.password}`;
        break;
      case `email`: response = `${this.user.email}`;
        break;
      case `emailSent`: response = `${this.user.emailSent}`;
        break;
      default:
        response = JSON.stringify(this.user);
    }
    navigator.clipboard.writeText(response);
  }

  protected refreshGuard = (): void => {
    let users: User[] = this.canLeave.modifiedUsers.getValue();

    if ((this.loginInput !== this.user.login
      || this.passwordInput !== this.user.password
      || this.emailInput !== this.user.email
      || this.emailSentInput !== this.user.emailSent)
    ) {
      if (users.findIndex((r: User) => r.id === this.user.id) < 0) {
        users = [...users, this.user];
        this.canLeave.modifiedUsers.next(users);
      }
    } else {
      users = users.filter((r: User) => r.id !== this.user.id);
      this.canLeave.modifiedUsers.next(users);
    }
  }

  protected onUpdatePermissions = async (): Promise<void> => {
    
    const permissions = {
      canCreate: this.canCreate,
      canUpdate: this.canUpdate,
      canDelete: this.canDelete,
      canManage: this.canManage,
    }

    await this.usersService.setUserPermissions(permissions, this.user.id);
  }

}

type UserFromResponse = User & {
  canCreate: boolean,
  canUpdate: boolean,
  canDelete: boolean,
  canManage: boolean,
}

type Property = `id` | `login` | `password` | `email` | `emailSent`;