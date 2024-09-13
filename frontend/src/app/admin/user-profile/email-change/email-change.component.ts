import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
  selector: 'app-email-change',
  templateUrl: './email-change.component.html',
  styleUrl: './email-change.component.scss'
})
export class EmailChangeComponent implements OnInit {

  @Input('currentUser') protected setNewEmailForm: FormGroup;

  protected currentUser: User;
  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,

  ) { }

  private matchEmail(control: FormControl): { [s: string]: boolean } {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!pattern.test(control.value)) {
      return { 'emailMustMatchPattern': true }
    }
    return null;
  }

  public ngOnInit(): void {
    this.setNewEmailForm = new FormGroup({
      newEmail: new FormControl(null, [Validators.required, Validators.minLength(3), this.matchEmail.bind(this)]),
      confirmNewEmail: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    })

    this.setNewEmailForm.valueChanges.subscribe((value) => {
      if (value.newEmail !== null && value.newEmail !== '') {
        this.canLeave.getSubject('emailValidation').next(true);
      } else {
        this.canLeave.getSubject('emailValidation').next(false);
      }
    });
  }

  public onSendVerificationCode = async (): Promise<void> => {

    if (this.setNewEmailForm.status === 'VALID') {
      const body = {
        userId: this.currentUser.userId,
        email: this.setNewEmailForm.value.newEmail,
      }

      await this.usersService.sendVerificationEmail(body);
      this.setNewEmailForm.reset();
    }
  }

  protected onChangeEmail() {
    this.currentUser.emailSent = false;
    this.setNewEmailForm.value.newEmail = null;

    const body = {
      userId: this.currentUser.userId,
      newEmail: this.setNewEmailForm.value.newEmail,
      password: this.setNewEmailForm.value.confirmNewEmail,
    }


  }

  public onEmailChange = (): void => {

    let canChange = window.confirm(`Are you sure you want to remove email?`)
    if (canChange) {




    }
  }
}
