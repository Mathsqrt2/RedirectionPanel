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
  protected accessLocked: BanTime = { status: false }
  protected counter = 3;

  protected changeProcess = false;
  protected deleteProcess = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.usersService.getCurrentUser().subscribe((state: User) => this.currentUser = state);
    this.usersService.deleteEmailProcess.subscribe((state: boolean) => {
      if (state) { this.usersService.changeEmailProcess.next(false) };
      this.deleteProcess = state;
    }
    );
    this.usersService.changeEmailProcess.subscribe((state: boolean) => {
      if (state) { this.usersService.deleteEmailProcess.next(false) };
      this.changeProcess = state;
    });
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
  }

  public ngOnInit(): void {
    if (localStorage.accessLocked) {
      const data = JSON.parse(localStorage.accessLocked);
      if (Date.now() > data?.banExpires) {
        this.accessLocked.status = false;
      } else {
        this.accessLocked = data;
      }
    }
  }

  protected checkBanStatus = (): boolean => {
    if (this.accessLocked.status) {
      if (Date.now() > this.accessLocked.banExpires) {
        this.counter = 3;
        this.accessLocked.status = false;
        this.accessLocked.banExpires = null;
        return false;
      }
    }
    return true;
  }

  private setBanStatus = (banTimeInMinutes: number) => {
    this.accessLocked.status = true;
    this.accessLocked.banExpires = Date.now() + 1000 * 60 * banTimeInMinutes;
    setTimeout(this.checkBanStatus, 1000 * 60 * banTimeInMinutes + 1);
    localStorage.accessLocked = JSON.stringify(this.accessLocked);
  }

}

export type BanTime = {
  banExpires?: number,
  status: boolean
}