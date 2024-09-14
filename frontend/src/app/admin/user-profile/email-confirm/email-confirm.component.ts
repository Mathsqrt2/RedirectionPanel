import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService, Code } from '../../../services/users.service';
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
  protected emailFromCode: string = null;
  protected wrongCode: boolean = false;
  private codeChecked: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.usersService.getCurrentUser().subscribe(async (state: User) => {
      this.currentUser = state

      if (!this.codeChecked) {
        const code = await this.usersService.checkIfActiveCodeExists();
        this.codeChecked = true;
        if (code.email) {
          this.confirmEmailWithCodeForm.patchValue({ newEmail: code.email });
        }
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
    const response = await this.usersService.updateEmailValue({ emailSent: false });
    if (response) {
      this.usersService.changeEmailProcess.next(false);
    }
  }
}