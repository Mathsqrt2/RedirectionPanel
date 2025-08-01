import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../../../types/property.types';
import { Component, Input, OnInit } from '@angular/core';

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

    this.usersService.changeEmailProcess.next(false);

    if (this.setNewEmailForm.status !== 'VALID') {
      return;
    }
    
    const body = {
      id: this.currentUser.id,
      email: this.setNewEmailForm.value.newEmail,
    }

    if (this.currentUser.email) {
      const canRemove = window.confirm(`This action will remove the existing email. Are you sure?`);
      if (canRemove) {
        await this.usersService.sendVerificationEmail(body);
        this.usersService.pendingEmail.next(body.email);
        this.usersService.getCurrentUser().next({ ...this.currentUser, emailSent: true })
        this.setNewEmailForm.reset();
      }
    } else {
      await this.usersService.sendVerificationEmail(body);
      this.usersService.pendingEmail.next(body.email);
      this.usersService.getCurrentUser().next({ ...this.currentUser, emailSent: true })
      this.setNewEmailForm.reset();
    }

  }

  protected onCancel = async (): Promise<void> => {

    const leaveLock = this.canLeave.getSubject('emailValidation').getValue();

    if (this.currentUser.email) {
      if (leaveLock) {
        const canCancel = window.confirm(`There are unsaved values, Are you sure?`);
        if (canCancel) {
          this.usersService.changeEmailProcess.next(false);
        }
      } else {
        this.usersService.changeEmailProcess.next(false);
      }
    } else if (this.currentUser.emailSent) {
      if (await this.usersService.updateEmailValue({ emailSent: false })) {
        this.usersService.changeEmailProcess.next(false);
      }
    } else {
      this.usersService.changeEmailProcess.next(false);
    }
  }
}
