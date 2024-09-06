import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss', './../user-profile.component.scss'],
})

export class ConfirmEmailComponent implements OnInit {

  @Input('currentUser') currentUser: User;
  @Input('baseUrl') baseUrl: string;

  public confirmEmailForm: FormGroup;
  public confirmEmailWithCodeForm: FormGroup;
  public emailSent: boolean = false;
  public isEmailConfirmed: boolean = false;
  public wrongCode: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly http: HttpClient,
  ) {
    this.usersService.getCurrentUser().subscribe((newValue: User) => {

      this.currentUser = newValue;
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
    this.confirmEmailForm = new FormGroup({
      newEmail: new FormControl(null, [Validators.required, Validators.minLength(5), this.matchEmail.bind(this)])
    });
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