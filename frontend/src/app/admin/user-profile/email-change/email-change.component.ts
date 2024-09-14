import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
  selector: 'app-email-change',
  templateUrl: './email-change.component.html',
  styleUrls: ['./email-change.component.scss', '../user-profile.component.scss']
})
export class EmailChangeComponent implements OnInit {

  @Input('currentUser') protected currentUser: User;
  protected setNewEmailForm: FormGroup;
  protected changeEmail: boolean;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.setNewEmailForm = new FormGroup({
      newEmail: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        this.matchEmail.bind(this)
      ]),
      confirmNewEmail: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        this.matchEmail.bind(this),
        this.areEquals.bind(this)
      ]),
    })

    this.usersService.changeEmailProcess.subscribe((state: boolean) => this.changeEmail = state);
    this.usersService.getCurrentUser().subscribe((state: User) => this.currentUser = state);
  }

  private matchEmail(control: FormControl): { [s: string]: boolean } {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!pattern.test(control.value)) {
      return { 'emailMustMatchPattern': true }
    }
    return null;
  }

  private areEquals(control: FormControl): { [s: string]: boolean } {
    if (control?.value !== this.setNewEmailForm?.value?.newEmail) {
      return { 'emailsMustMatch': true };
    }
    return null;
  }

  public ngOnInit(): void {
    this.setNewEmailForm.valueChanges.subscribe((value) => {
      if (value.newEmail !== null && value.newEmail !== '' ||
        value.confirmNewEmail !== null && value.confirmNewEmail !== ''
      ) {
        this.canLeave.getSubject('emailValidation').next(true);
      } else {
        this.canLeave.getSubject('emailValidation').next(false);
      }
    });
  }

  public onSendVerificationCode = async (): Promise<void> => {

    const canRemove = window.confirm(`This action will remove the existing email. Are you sure?`);
    this.usersService.changeEmailProcess.next(false);

    if (this.setNewEmailForm.status === 'VALID') {
      const body = {
        userId: this.currentUser.userId,
        email: this.setNewEmailForm.value.newEmail,
      }


      if (this.currentUser.email) {
        if (canRemove) {
          this.usersService.getCurrentUser().next({ ...this.currentUser, emailSent: true })
          await this.usersService.sendVerificationEmail(body);
          this.setNewEmailForm.reset();
        }
      } else {
        this.usersService.getCurrentUser().next({ ...this.currentUser, emailSent: true })
        await this.usersService.sendVerificationEmail(body);
        this.setNewEmailForm.reset();
      }

    }
  }

  protected onCancel = async (): Promise<void> => {

    const canLeave = this.canLeave.getSubject('emailValidation').getValue();

    if (this.currentUser.email) {
      if (canLeave) {
        const canCancel = window.confirm(`There are unsaved values, Are you sure?`);
        if (canCancel) {
          this.usersService.changeEmailProcess.next(false);
        }
      } else {
        this.usersService.changeEmailProcess.next(false);
      }

      this.usersService.changeEmailProcess.next(false);
    } else {
      const response = await this.usersService.updateEmailValue({ emailSent: false });
      if (response) {
        this.usersService.changeEmailProcess.next(false);
        this.usersService.getCurrentUser().next({ ...this.currentUser, emailSent: false })
      }
    }
  }
}
