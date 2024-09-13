import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
  selector: 'confirm-email',
  template: '',
  styleUrls: ['./../user-profile.component.scss'],
})

export class ConfirmEmailComponent implements OnInit {

  @Input('currentUser') currentUser: User;
  @Input('baseUrl') baseUrl: string;

  private isUserSynced = false;
  
  public confirmEmailWithCodeForm: FormGroup;
  
  public wrongCode: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
    private readonly http: HttpClient,
  ) { }



  ngOnInit(): void {


    this.confirmEmailForm.valueChanges.subscribe((value) => {
      if (value.newEmail !== null && value.newEmail !== '') {
        this.canLeave.getSubject('emailValidation').next(true);
      } else {
        this.canLeave.getSubject('emailValidation').next(false);
      }
    })

    this.usersService.getCurrentUser().subscribe((newValue: User) => {

      this.currentUser = newValue;
      if (this.currentUser) {
        this.isUserSynced = true;
      }

      if (!this.currentUser.email && this.currentUser.emailSent && this.isUserSynced) {


      }
    });
  }

  public onEmailConfirm = (): void => {

    if (this.confirmEmailWithCodeForm.status === 'VALID') {
      const code = this.confirmEmailWithCodeForm.value.confirmationCode;
      
    }
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

  

  onChangeEmail() {
    this.emailSent = false;
    this.confirmEmailForm.value.newEmail = null;

    const body = {
      userId: this.currentUser.userId,
      email: null,
    }


  }
}

export type CodeResponse = {
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

