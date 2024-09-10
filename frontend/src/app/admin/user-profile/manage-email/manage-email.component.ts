import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, first } from 'rxjs';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
  selector: 'manage-email',
  templateUrl: './manage-email.component.html',
  styleUrls: ['./manage-email.component.scss', './../user-profile.component.scss']
})
export class ManageEmailComponent implements OnInit {

  @Input(`baseUrl`) baseUrl: string;
  @Input('currentUser') currentUser: User;
  private user: BehaviorSubject<User>

  public showEmailChangeForm: boolean = false;
  public showEmailRemoveForm: boolean = false;
  public isPasswordVisible = false;
  public wrongPassword = false;
  public counter = 3;
  public changeEmailForm: FormGroup;
  public removeEmailForm: FormGroup;

  constructor(
    private readonly http: HttpClient,
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.user = this.usersService.getCurrentUser();
    this.user.subscribe(
      (newValue: User) => {
        this.currentUser = newValue;
      }
    )
  }

  private matchEmail(control: FormControl): { [s: string]: boolean } {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!pattern.test(control.value)) {
      return { 'emailMustMatchPattern': true }
    }
    return null;
  }

  ngOnInit(): void {

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
  }

  public onEmailChange = (): void => {

  }

  public onStartEmailRemove = (): void => {
    this.showEmailChangeForm = false;
    this.showEmailRemoveForm = true;
  }

  public onEmailRemove = (): void => {

    let canRemove = window.confirm(`Are you sure you want to remove email?`)
    if (canRemove) {

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
              this.counter--
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

}