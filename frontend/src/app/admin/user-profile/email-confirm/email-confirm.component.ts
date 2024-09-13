import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.scss', '../user-profile.component.scss']
})
export class EmailConfirmComponent implements OnInit {

  @Input('currentUser') protected currentUser: User;
  protected confirmEmailWithCodeForm: FormGroup;
  public wrongCode: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) { }

  public ngOnInit(): void {
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

  protected onEmailConfirm = (): void => {

    if (this.confirmEmailWithCodeForm.status === 'VALID') {
      const code = this.confirmEmailWithCodeForm.value.confirmationCode;
    }
  }

  protected onChangeEmail = (): void => {

  }
}