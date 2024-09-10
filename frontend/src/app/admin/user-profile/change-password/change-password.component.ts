import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss', './../user-profile.component.scss'],
})
export class ChangePasswordComponent implements OnInit {

  @Input(`currentUser`) currentUser: User;
  @Input(`baseUrl`) baseUrl: string;

  public unauthorizedResponse: boolean = false;
  public changePasswordForm: FormGroup;

  public showCurrentPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showConfirmNewPassword: boolean = false;

  public currentPassword: string = null;
  public newPassword: string = null;
  public confirmNewPassword: string = null;

  constructor(
    private readonly http: HttpClient,
    private readonly canLeave: CanDeactivateService,
  ) { }

  private areEquals(control: FormControl): { [s: string]: boolean } {
    if (control?.value !== this.changePasswordForm?.value?.newPassword) {
      return { 'passwordMustMatch': true }
    }
    return null;
  }

  ngOnInit(): void {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl(null, [Validators.required]),
      newPassword: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      confirmPassword: new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
    });

    this.changePasswordForm.valueChanges.subscribe((value) => {

      if (value.currentPassword !== null && value.currentPassword !== '' ||
        value.newPassword !== null && value.newPassword !== '' ||
        value.confirmPassword !== null && value.confirmPassword !== ''
      ) {
        this.canLeave.getSubject('changePassword').next(true);
      } else {
        this.canLeave.getSubject('changePassword').next(false);
      }
    })
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

  public onPasswordChange = (): void => {
    if (this.changePasswordForm.status === 'VALID') {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
      const body = {
        password: currentPassword,
        newPassword,
        confirmPassword,
        userId: this.currentUser.userId
      }

      this.http.patch(`${this.baseUrl}/password`, body, { withCredentials: true })
        .pipe(first())
        .subscribe(
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

}
