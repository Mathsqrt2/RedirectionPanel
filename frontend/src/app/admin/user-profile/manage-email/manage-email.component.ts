import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'manage-email',
  templateUrl: './manage-email.component.html',
  styleUrls: ['./manage-email.component.scss', './../user-profile.component.scss']
})
export class ManageEmailComponent implements OnInit {

  @Input('currentUser') currentUser: User;

  public showEmailChangeForm: boolean = false;
  public changeEmailForm: FormGroup;

  constructor(
    private readonly http: HttpClient,
  ) {

  }

  ngOnInit(): void {
    this.changeEmailForm = new FormGroup({
      updateEmail: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    })
  }

  public startEmailChange = (): void => {
    this.showEmailChangeForm = true;
  }

  public onRejectEdit = (): void => {

    this.showEmailChangeForm = false;
  }

  public onConfirmEdit = (): void => {

  }
}
