import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../../../types/property.types';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.scss', '../user-profile.component.scss']
})
export class EmailConfirmComponent implements OnInit {

  @Input('currentUser') protected currentUser: User;
  protected confirmEmailWithCodeForm: FormGroup;
  protected emailFromCode: string = null;
  protected wrongCode: boolean = false;
  private codeChecked: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.usersService.getCurrentUser().subscribe(async (state: User) => {
      this.currentUser = state

      if (!this.codeChecked && this.currentUser.emailSent) {
        this.usersService.pendingEmail.subscribe(value => {
          if (value) {
            this.confirmEmailWithCodeForm.patchValue({ newEmail: value });
          }
        });
        await this.usersService.checkIfActiveCodeExists();
        this.codeChecked = true;
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    this.confirmEmailWithCodeForm = new FormGroup({
      newEmail: new FormControl({ value: this.currentUser.email || null, disabled: true }),
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

  protected onEmailConfirm = async (): Promise<void> => {

    if (this.confirmEmailWithCodeForm.status === 'VALID') {
      const code = this.confirmEmailWithCodeForm.value.confirmationCode;
      this.wrongCode = await this.usersService.verifyByRequest(code);
    }
  }

  protected onCancel = async (): Promise<void> => {

    const canCancel = window.confirm(`Are you sure, you want cancel?`);

    if (canCancel) {
      if (this.currentUser.emailSent) {
        if (await this.usersService.updateEmailValue({ emailSent: false })) {
          this.usersService.changeEmailProcess.next(false);
        }
      } else {
        this.usersService.changeEmailProcess.next(false);
      }
    }
  }
}