import { Component, OnInit } from '@angular/core';
import { User, UsersService } from '../../services/users.service';
import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit, CanComponentDeactivate {

  private domain: string = `http://localhost:3000`;
  protected baseUrl: string = `${this.domain}/api/auth`;
  protected currentUser: User;
  protected counter = 3;
  protected accessLocked: BanTime = { status: false }
  protected emailSent = false;
  protected changeProcess = false;
  protected deleteProcess = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.usersService.getCurrentUser().subscribe((newValue: User) => {
      this.currentUser = newValue;
    })
  }

  public ngOnInit(): void {
    this.usersService.updateCurrentUser();

    if (localStorage.accessLocked) {
      const data = JSON.parse(localStorage.accessLocked);
      if (Date.now() > data?.banExpires) {
        this.accessLocked.status = false;
      } else {
        this.accessLocked = data;
      }
    }

  }

  private confirm = (): boolean => {
    return window.confirm(`There are unfinished processes. Are you sure you want to leave now?`);
  }

  public canDeactivate = (): Observable<boolean> | Promise<boolean> | boolean => {

    if (this.canLeave.getValue('changePassword')) {
      return this.confirm();
    }

    if (this.canLeave.getValue('emailChange')) {
      return this.confirm();
    }

    if (this.canLeave.getValue('emailValidation')) {
      return this.confirm();
    }

    return true;
  };
}

export type BanTime = {
  banExpires?: number,
  status: boolean
}