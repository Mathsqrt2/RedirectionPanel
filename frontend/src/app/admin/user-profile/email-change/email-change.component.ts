import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-email-change',
  templateUrl: './email-change.component.html',
  styleUrl: './email-change.component.scss'
})
export class EmailChangeComponent implements OnInit {

  @Input('currentUser') protected confirmEmailForm: FormGroup;

  protected currentUser: User;
  constructor(
    private readonly usersService: UsersService
  ) { }

  private matchEmail(control: FormControl): { [s: string]: boolean } {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!pattern.test(control.value)) {
      return { 'emailMustMatchPattern': true }
    }
    return null;
  }

  public ngOnInit(): void {
    this.confirmEmailForm = new FormGroup({
      newEmail: new FormControl(null, [Validators.required, Validators.minLength(5), this.matchEmail.bind(this)])
    });
  }

  public onSendVerificationCode = async (): Promise<void> => {

    if (this.confirmEmailForm.status === 'VALID') {

      const body = {
        userId: this.currentUser.userId,
        email: this.confirmEmailForm.value.newEmail,
      }

      await this.usersService.sendVerificationEmail(body);
      this.confirmEmailForm.reset();
    }
  }

}
