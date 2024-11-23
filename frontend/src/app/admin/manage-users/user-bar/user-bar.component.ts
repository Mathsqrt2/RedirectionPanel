import { Permissions, UpdateUserBody, User } from '../../../../../types/property.types';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';
import { UserFromResponse } from '../../../../../types/response.types';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Property } from '../../../../../types/constants.types';
import { UsersService } from '../../../services/users.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: '[user-bar]',
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss', '../../manage-redirections/manage-redirections.component.scss']
})
export class UserBarComponent implements OnInit {

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
  protected permissionsForm: FormGroup;

  protected editMode: boolean = false;

  constructor(
    private readonly canLeave: CanDeactivateService,
    private readonly usersService: UsersService,
  ) { }

  public ngOnInit(): void {
    this.permissionsForm = new FormGroup({
      canCreate: new FormControl(this.user.canCreate, [Validators.required]),
      canUpdate: new FormControl(this.user.canUpdate, [Validators.required]),
      canDelete: new FormControl(this.user.canDelete, [Validators.required]),
      canManage: new FormControl(this.user.canManage, [Validators.required]),
    })
  }

  protected onEdit = async (): Promise<void> => {
    this.editMode = true;
    this.loginInput = this.user.login;
    this.passwordInput = this.user.password;
    this.emailInput = this.user.email ? this.user.email : 'none';
  }

  protected onRejectEdit = async (): Promise<void> => {
    this.editMode = false;
    this.loginInput = this.user.login;
    this.passwordInput = this.user.password;
    this.emailInput = this.user.email;
    this.emailSentInput = this.user.emailSent;

    this.refreshGuard();
  }

  protected onConfirmEdit = async (): Promise<void> => {

    const confirmEdit = window.confirm(`This action is permanent, are you sure?`);

    const body: UpdateUserBody = {
      adminToken: this.usersService.getCurrentUser().getValue().accessToken,
      id: this.user.id,
    };

    if (this.loginInput !== this.user.login) {
      body.newLogin = this.loginInput;
    }

    if (this.passwordInput !== this.user.password) {
      body.newPassword = this.passwordInput;
    }

    if (this.emailInput !== this.user.email && this.emailInput !== 'none') {
      body.newEmail = this.emailInput;
    }

    if (confirmEdit) {
      await this.usersService.updateWholeUser(body);
      this.editMode = false;
    }
  }

  protected onDelete = async (): Promise<void> => {

    const confirmDelete = window.confirm(`This action is permanent, are you sure?`);
    if (confirmDelete) {
      await this.usersService.deactivateUser({ id: this.user.id });
    }

  }

  protected onCopyToClipboard = (property?: Property): void => {
    let response;
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
      || this.emailInput !== this.user.email)
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

  protected onUpdatePermissions = async (mode?: string): Promise<void> => {

    let confirm = true;
    if (mode) {
      confirm = window.confirm(`This change might be sensitive, Are you sure?`)
      if (!confirm) {
        this.permissionsForm.patchValue({ canManage: !this.permissionsForm.value.canManage });
      }
    }

    const { canCreate, canUpdate, canDelete, canManage } = this.permissionsForm.value;
    const permissions: Permissions = { canCreate, canUpdate, canDelete, canManage };

    if (confirm) {
      await this.usersService.setUserPermissions(permissions, this.user.id);
    }
  }

}