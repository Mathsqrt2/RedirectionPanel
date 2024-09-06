import { Component, OnInit } from '@angular/core';
import { User, UsersService } from '../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {

  private domain: string = `http://localhost:3000`;
  private baseUrl: string = `${this.domain}/api/auth`;

  public permissionsForm: FormGroup;
  public confirmEmailForm: FormGroup;
  public confirmEmailWithCodeForm: FormGroup;
  public changePasswordForm: FormGroup

  public currentUser: User;
  public permissions: { key: string, value: string }[] = []

  public showCurrentPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showConfirmNewPassword: boolean = false;

  public currentPassword: string = null;
  public newPassword: string = null;
  public confirmNewPassword: string = null;

  public hasBeenEmailSend: boolean = false;
  public isEmailConfirmed: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly http: HttpClient,
  ) {
    this.usersService.getCurrentUser().subscribe((newValue: User) => {
      this.currentUser = newValue;
      if (this.currentUser?.permissions) {
        const keys = Object.keys(this.currentUser.permissions);

        for (let key of keys) {
          this.permissions.push({ key, value: this.currentUser.permissions[key] });
        }
      }
    });
  }

  private areEquals(control: FormControl): { [s: string]: boolean } {
    if (control?.value !== this.changePasswordForm?.value?.newPassword) {
      return { 'passwordMustMatch': true }
    }
    return null;
  }

  ngOnInit(): void {
    const { canUpdate, canDelete, canManage, canCreate } = this.currentUser.permissions;
    this.permissionsForm = new FormGroup({
      canUpdate: new FormControl({ value: canUpdate, disabled: !canManage }, [Validators.required]),
      canDelete: new FormControl({ value: canDelete, disabled: !canManage }, [Validators.required]),
      canManage: new FormControl({ value: canManage, disabled: !canManage }, [Validators.required]),
      canCreate: new FormControl({ value: canCreate, disabled: !canManage }, [Validators.required]),
    });

    this.confirmEmailForm = new FormGroup({
      newEmail: new FormControl(null, [Validators.required])
    });

    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl(null, [Validators.required]),
      newPassword: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      confirmPassword: new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
    });
  }

  onPasswordChange = () => {
    console.log(this.changePasswordForm.status)
    if (this.changePasswordForm.status === 'VALID') {
      const { password, newPassword, confirmPassword } = this.changePasswordForm.value;
      const body = {
        password,
        newPassword,
        confirmPassword,
        userId: this.currentUser.userId
      }

      this.http.post(`${this.baseUrl}/updatepassword/${this.currentUser.userId}`, body, { withCredentials: true }).subscribe((response) => { console.log(response) });
      this.changePasswordForm.reset();
    }
  }

  onPermissionsUpdate = () => {

  }

  onEmailConfirm = () => {

  }

  onSendVerificationCode = () => {
    this.hasBeenEmailSend = true;
    this.confirmEmailWithCodeForm = new FormGroup({
      newEmail: new FormControl({ value: this.confirmEmailForm.value.newEmail, disabled: true }),
      confirmationCode: new FormControl(null, [Validators.required, Validators.minLength(9)])
    })
  }

  onToggleVisibility = (field: string) => {

    if (field === 'currentPassword') {
      this.showCurrentPassword = !this.showCurrentPassword;
    }
    if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    }
    if (field === 'confirmPassword') {
      this.showConfirmNewPassword = !this.showConfirmNewPassword;
    }

  }

}
