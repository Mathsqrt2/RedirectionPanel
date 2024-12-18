import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../../../types/property.types';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-email-delete',
  templateUrl: './email-delete.component.html',
  styleUrls: ['./email-delete.component.scss', '../user-profile.component.scss']
})
export class EmailDeleteComponent implements OnInit {

  @Input('currentUser') protected currentUser: User;
  protected isPasswordVisible = false;
  protected removeEmailForm: FormGroup;
  protected wrongPassword: boolean = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) { }

  public ngOnInit(): void {
    this.removeEmailForm = new FormGroup({
      confirmRemoveEmail: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    })

    this.removeEmailForm.valueChanges.subscribe(value => {
      if (value.confirmRemoveEmail !== null && value.confirmRemoveEmail !== '') {
        this.canLeave.getSubject('emailChange').next(true);
      } else {
        this.canLeave.getSubject('emailChange').next(false);
      }
    })
  }

  protected onVisibilityToggle = (): void => {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  protected onEmailRemove = (): void => {

    let canRemove = window.confirm(`Are you sure you want to remove email?`)
    if (canRemove) {

      const body = {
        password: this.removeEmailForm.value.confirmRemoveEmail || ``,
      }
      this.usersService.removeEmailValue(body);
      this.removeEmailForm.reset();

    }
  }

  protected onCancel = (): void => {
    this.usersService.deleteEmailProcess.next(false);
    this.removeEmailForm.reset();
  }
}
