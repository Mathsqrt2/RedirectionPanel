import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';
import { UsersService } from '../../services/users.service';
import { User } from '../../../../../types/property.types';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements CanComponentDeactivate {

  private domain: string = `http://localhost:3000`;
  protected baseUrl: string = `${this.domain}/api/auth`;
  protected currentUser: User;
  protected image: any;

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

    this.getImage();
  }

  private createImageFromBlob = (image: Blob) => {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.image = reader.result;
    }, false)

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  private getImage = async (): Promise<void> => {
    const response = await this.usersService.getUserImage();
    if (response) {
      this.createImageFromBlob(response);
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
  }

}