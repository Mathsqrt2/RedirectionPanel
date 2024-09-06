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
  public baseUrl: string = `${this.domain}/api/auth`;
  public unauthorizedResponse: boolean = false;

  public permissionsForm: FormGroup;
  public confirmEmailForm: FormGroup;
  public confirmEmailWithCodeForm: FormGroup;
  public changePasswordForm: FormGroup
  public changeEmailForm: FormGroup;

  public currentUser: User;
  public permissions: { key: string, value: string }[] = []

  public showCurrentPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showConfirmNewPassword: boolean = false;

  public currentPassword: string = null;
  public newPassword: string = null;
  public confirmNewPassword: string = null;

  public emailSent: boolean = false;
  public isEmailConfirmed: boolean = false;
  public wrongCode: boolean = false;
  public showEmailChangeForm: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly http: HttpClient,
  ) {
    this.usersService.getCurrentUser().subscribe((newValue: User) => {
      this.currentUser = newValue;

      const { canUpdate, canDelete, canManage, canCreate } = newValue.permissions;
      this.permissionsForm = new FormGroup({
        canUpdate: new FormControl({ value: canUpdate, disabled: !canManage }, [Validators.required]),
        canDelete: new FormControl({ value: canDelete, disabled: !canManage }, [Validators.required]),
        canManage: new FormControl({ value: canManage, disabled: !canManage }, [Validators.required]),
        canCreate: new FormControl({ value: canCreate, disabled: !canManage }, [Validators.required]),
      });

      if (this.currentUser?.permissions) {
        const keys = Object.keys(this.currentUser.permissions);
        this.permissions = [];
        for (let key of keys) {
          this.permissions.push({ key, value: this.currentUser.permissions[key] });
        }
      }

      if (newValue.emailSent) {

        this.http.get(`${this.baseUrl}/activecode/${this.currentUser.userId}`, { withCredentials: true }).subscribe(
          (response: CodeResponse) => {
            const code = response.content;

            if (Date.now() <= code.expireDate) {
              this.initializeConfirmationForm(code.email);
              this.confirmEmailWithCodeForm.value.newEmail = code.email;
              this.emailSent = this.currentUser.emailSent;
            } else {
              this.emailSent = false;
            }
          })

      }
    });

  }

  private areEquals(control: FormControl): { [s: string]: boolean } {
    if (control?.value !== this.changePasswordForm?.value?.newPassword) {
      return { 'passwordMustMatch': true }
    }
    return null;
  }

  private matchEmail(control: FormControl): { [s: string]: boolean } {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!pattern.test(control.value)) {
      return { 'emailMustMatchPattern': true }
    }
    return null;
  }

  ngOnInit(): void {

    this.usersService.updateCurrentUser();

    this.confirmEmailForm = new FormGroup({
      newEmail: new FormControl(null, [Validators.required, Validators.minLength(5), this.matchEmail.bind(this)])
    });

    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl(null, [Validators.required]),
      newPassword: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      confirmPassword: new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
    });

    this.changeEmailForm = new FormGroup({
      updateEmail: new FormControl(null, [Validators.required, this.matchEmail.bind(this)]),
      password: new FormControl(null, [Validators.required]),
    })
  }

  public onPasswordChange = (): void => {
    if (this.changePasswordForm.status === 'VALID') {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
      const body = {
        password: currentPassword,
        newPassword,
        confirmPassword,
        userId: this.currentUser.userId
      }

      this.http.patch(`${this.baseUrl}/password`, body, { withCredentials: true }).subscribe(
        (response: { status: number, message: string }) => {
          if (response.status === 401) {
            this.unauthorizedResponse = true;
          }

          if (response.status === 200) {
            this.unauthorizedResponse = false;
          }
        });

      this.changePasswordForm.reset();
    }
  }

  public onPermissionsUpdate = (): void => {
    if (this.permissionsForm.status === 'VALID') {
      const { canDelete, canUpdate, canCreate, canManage } = this.permissionsForm.value;
      const body = { canDelete, canUpdate, canCreate, canManage };

      this.http.patch(`${this.baseUrl}/permissions`, { ...body, userId: this.currentUser.userId }, { withCredentials: true }).subscribe(
        (response: { status: number, message: string }) => {
          if (response.status === 200) {
            this.usersService.setCurrentUserPermissions(body);
            const accessToken = localStorage.getItem(`accessToken`);
            if (accessToken) {
              const data = JSON.parse(accessToken);
              localStorage.accessToken = JSON.stringify({ ...data, permissions: body });
            }
          }
        });
    }
  }

  public onEmailConfirm = (): void => {

    if (this.confirmEmailWithCodeForm.status === 'VALID') {
      const code = this.confirmEmailWithCodeForm.value.confirmationCode;
      this.http.get(`${this.baseUrl}/verifybyrequest/${code}`, { withCredentials: true }).subscribe(
        (response: EmailCheck) => {
          if (response.status === 200) {
            this.wrongCode = false;
            this.isEmailConfirmed = true;
            this.usersService.updateCurrentUser();
          } else {
            this.wrongCode = true;
          }
        }
      );
    }
  }

  private initializeConfirmationForm = (email?: string): void => {
    this.confirmEmailWithCodeForm = new FormGroup({
      newEmail: new FormControl({ value: email || null, disabled: true }),
      confirmationCode: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  public onSendVerificationCode = (): void => {
    this.initializeConfirmationForm(this.confirmEmailForm.value.newEmail);

    if (this.confirmEmailForm.status === 'VALID') {

      const body = {
        userId: this.currentUser.userId,
        email: this.confirmEmailForm.value.newEmail,
      }

      this.http.post(`${this.baseUrl}/getverificationemail`, body, { withCredentials: true }).subscribe(
        (response: { status: number, message: string }) => {
          if (response.status === 200) {
            this.http.patch(`${this.baseUrl}/emailstatus/${body.userId}`,
              { emailSent: true },
              { withCredentials: true }).subscribe(res => {
                this.emailSent = true;
              });
          } else if (response.status === 400) {
            this.confirmEmailForm.reset();
          }
        })
    }
  }

  public onToggleVisibility = (field: string): void => {

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

  public startEmailChange = (): void => {


    this.showEmailChangeForm = true;
  }

  public onRejectEdit = (): void => {

    this.showEmailChangeForm = false;
  }

}
type CodeResponse = {
  status: number,
  content: Code,
}

type Code = {
  id: number,
  code: number,
  userId: number,
  status: boolean,
  expireDate: number,
  email: string,
}

type EmailCheck = {
  status: number;
  message?: string;
  content?: {
    permissions: Permissions;
    login: string;
    userId: number;
  };
}