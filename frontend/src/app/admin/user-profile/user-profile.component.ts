import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';
import { UsersService } from '../../services/users.service';
import { User } from '../../../../../types/property.types';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements CanComponentDeactivate, OnInit {

  @ViewChild('setProfilePicture', { static: true }) setProfilePicRef: ElementRef;

  private domain: string = `http://localhost:3000`;
  protected baseUrl: string = `${this.domain}/api/auth`;
  protected imageForm: FormGroup;
  protected currentUser: User;
  protected image: any;
  protected imageError: boolean = false;

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

  ngOnInit(): void {
    this.imageForm = new FormGroup({
      image: new FormControl(null, [Validators.required]),
    })

    this.imageForm.valueChanges.subscribe(() => {
      if (this.imageForm.valid) {
        this.setImage();
        this.imageForm.reset();
      }
    })
  }

  private setImage = async () => {
    await this.usersService.setAvatar(this.setProfilePicRef.nativeElement?.files[0]);
    await this.getImage();

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

  protected onSetImage = async (): Promise<void> => {
    this.setProfilePicRef.nativeElement.click();
  }

  protected onDeleteImage = async (): Promise<void> => {
    if (await this.usersService.deleteAvatar()) {
      this.imageError = false;
      this.image = null;
    } else {
      this.imageError = true;
    }
  }

}