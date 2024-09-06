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
  

  public confirmEmailForm: FormGroup;
  public confirmEmailWithCodeForm: FormGroup;
  
  public changeEmailForm: FormGroup;

  public currentUser: User;
  public permissions: { key: string, value: string }[] = []

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

    this.changeEmailForm = new FormGroup({
      updateEmail: new FormControl(null, [Validators.required, this.matchEmail.bind(this)]),
      password: new FormControl(null, [Validators.required]),
    })
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