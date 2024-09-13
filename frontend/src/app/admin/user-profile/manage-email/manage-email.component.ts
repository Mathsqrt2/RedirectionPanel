import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, first } from 'rxjs';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';
import { CodeResponse } from '../confirm-email/confirm-email.component';

@Component({
  selector: 'manage-email',
  templateUrl: './manage-email.component.html',
  styleUrls: ['./manage-email.component.scss', './../user-profile.component.scss']
})
export class ManageEmailComponent implements OnInit {

  @Input(`baseUrl`) baseUrl: string;
  @Input('currentUser') currentUser: User;
  private user: BehaviorSubject<User>

  protected showEmailChangeForm: boolean = false;
  protected showEmailRemoveForm: boolean = false;
  protected emailsent: boolean = false;
  protected isPasswordVisible = false;
  protected wrongPassword = false;
  protected wrongCode = false;

  protected changeEmailForm: FormGroup;
  protected removeEmailForm: FormGroup;
  protected confirmEmailWithCodeForm: FormGroup;

  constructor(
    private readonly http: HttpClient,
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.user = this.usersService.getCurrentUser();
    this.user.subscribe(
      (newValue: User) => {
        this.currentUser = newValue;
      })

    if (localStorage.accessLocked) {
      const data = JSON.parse(localStorage.accessLocked);
      if (Date.now() > data?.banExpires) {
        this.accessLocked.status = false;
      } else {
        this.accessLocked = data;
      }
    }
  }

  private matchEmail(control: FormControl): { [s: string]: boolean } {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!pattern.test(control.value)) {
      return { 'emailMustMatchPattern': true }
    }
    return null;
  }

  protected checkBanStatus = (): boolean => {
    if (this.accessLocked.status) {
      if (Date.now() > this.accessLocked.banExpires) {
        this.counter = 3;
        this.accessLocked.status = false;
        this.accessLocked.banExpires = null;
        return false;
      }
    }
    return true;
  }

  private setBanStatus = (banTimeInMinutes: number) => {
    this.accessLocked.status = true;
    this.accessLocked.banExpires = Date.now() + 1000 * 60 * banTimeInMinutes;
    setTimeout(this.checkBanStatus, 1000 * 60 * banTimeInMinutes + 1);
    localStorage.accessLocked = JSON.stringify(this.accessLocked);
  }

  ngOnInit(): void {

    this.http.get(`${this.baseUrl}/activecode/${this.currentUser.userId}`, { withCredentials: true })
      .pipe(first())
      .subscribe(
        (response: CodeResponse) => {
          if (response.status === 200) {
            const code = response.content;
            if (Date.now() <= code.expireDate) {
              this.initializeConfirmationForm(code.email);
              this.confirmEmailWithCodeForm.patchValue({ newEmail: code.email });
              console.log(this.currentUser.emailSent);
              this.emailsent = this.currentUser.emailSent;
              this.wrongCode = false;
            }
          }
        }
      )

    this.changeEmailForm = new FormGroup({
      updateEmail: new FormControl(null, [Validators.required, Validators.minLength(3), this.matchEmail.bind(this)]),
      confirmUpdateEmail: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    })

    this.removeEmailForm = new FormGroup({
      confirmRemoveEmail: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    })

    this.changeEmailForm.valueChanges.subscribe(value => {
      if (value.updateEmail !== null && value.updateEmail !== '' ||
        value.confirmUpdateEmail !== null && value.confirmUpdateEmail !== ''
      ) {
        this.canLeave.getSubject('emailChange').next(true);
      } else {
        this.canLeave.getSubject('emailChange').next(false);
      }
    })

    this.removeEmailForm.valueChanges.subscribe(value => {
      if (value.confirmRemoveEmail !== null && value.confirmRemoveEmail !== '') {
        this.canLeave.getSubject('emailChange').next(true);
      } else {
        this.canLeave.getSubject('emailChange').next(false);
      }
    })
  }

  public onVisibilityToggle = (): void => {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  public onStartEmailChange = (): void => {
    this.showEmailRemoveForm = false;
    this.showEmailChangeForm = true;
    this.isPasswordVisible = false;
  }

  public onEmailChange = (): void => {

    let canChange = window.confirm(`Are you sure you want to remove email?`)
    if (canChange && this.checkBanStatus()) {

      const body = {
        newEmail: this.changeEmailForm.value.updated,
        password: this.changeEmailForm.value.confirmUpdateEmail,
      }

      this.http.patch(`${this.baseUrl}/update/email/${this.currentUser?.userId}`, body, { withCredentials: true })
        .pipe(first())
        .subscribe(
          ((response: { status: number, message: string }) => {
            if (response.status === 202) {
              this.user.next({ ...this.user.getValue(), email: body.newEmail, emailSent: true });
            }
          })
        )
    }
  }

  public onStartEmailRemove = (): void => {
    this.showEmailChangeForm = false;
    this.showEmailRemoveForm = true;
  }

  public onEmailRemove = (): void => {

    let canRemove = window.confirm(`Are you sure you want to remove email?`)
    if (canRemove && this.checkBanStatus()) {

      const body = {
        password: this.removeEmailForm.value.confirmRemoveEmail || ``,
      }

      this.http.patch(`${this.baseUrl}/remove/email/${this.currentUser?.userId}`, body, { withCredentials: true })
        .pipe(first())
        .subscribe(
          (response: { status: number, message?: string }) => {
            if (response.status === 202) {
              this.user.next({ ...this.user.getValue(), email: null, emailSent: null });
              this.showEmailChangeForm = false;
              this.showEmailRemoveForm = false;
              this.wrongPassword = false;
            } else {
              if (this.counter-- <= 0) {
                this.setBanStatus(5);
              }
              this.wrongPassword = true;
            }
            this.removeEmailForm.reset();
          })
    }
  }

  public onReject = (): void => {
    this.showEmailRemoveForm = false;
    this.showEmailChangeForm = false;
    this.changeEmailForm.reset();
  }

  private initializeConfirmationForm = (email?: string): void => {

    this.confirmEmailWithCodeForm = new FormGroup({
      newEmail: new FormControl({ value: email || null, disabled: true }),
      confirmationCode: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })

    this.confirmEmailWithCodeForm.valueChanges.subscribe((value) => {
      if (value.confirmationCode !== null && value.confirmationCode !== '') {
        this.canLeave.getSubject('emailValidation').next(true);
      } else {
        this.canLeave.getSubject('emailValidation').next(false);
      }

    })
  }

}