import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';

@Component({
  selector: 'manage-permissions',
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss', './../user-profile.component.scss'],
})
export class ManagePermissionsComponent implements OnInit {

  @Input(`baseUrl`) baseUrl: string;

  protected permissions: { key: string, value: string }[] = []
  protected currentUser: User;
  protected permissionsForm: FormGroup;

  constructor(
    private readonly http: HttpClient,
    private readonly usersService: UsersService,
  ) {
    usersService.getCurrentUser().subscribe(
      (newValue: User) => {
        this.currentUser = newValue;

        if (this.currentUser?.permissions) {
          const keys = Object.keys(this.currentUser.permissions);
          this.permissions = [];
          for (let key of keys) {
            this.permissions.push({ key, value: this.currentUser.permissions[key] });
          }
        }
      })
  }

  ngOnInit(): void {
    const { canUpdate, canDelete, canManage, canCreate } = this.currentUser?.permissions;
    this.permissionsForm = new FormGroup({
      canUpdate: new FormControl({ value: canUpdate, disabled: !canManage }, [Validators.required]),
      canDelete: new FormControl({ value: canDelete, disabled: !canManage }, [Validators.required]),
      canManage: new FormControl({ value: canManage, disabled: !canManage }, [Validators.required]),
      canCreate: new FormControl({ value: canCreate, disabled: !canManage }, [Validators.required]),
    });
  }

  public onPermissionsUpdate = (key: string): void => {
    let canContinue = true;
    if (key === 'canManage') {
      canContinue = window.confirm(`This change might be difficult to reverse. Are you sure?`);
      if (!canContinue) {
        this.permissionsForm.patchValue({ canManage: true });
      }
    }

    if (this.permissionsForm.status === 'VALID' && canContinue) {
      const { canDelete, canUpdate, canCreate, canManage } = this.permissionsForm.value;
      const body = { canDelete, canUpdate, canCreate, canManage };

      this.http.patch(`${this.baseUrl}/permissions`, { ...body, userId: this.currentUser.userId }, { withCredentials: true })
        .pipe(first())
        .subscribe(
          (response: { status: number, message: string }) => {
            if (response.status === 200) {
              this.usersService.setCurrentUserPermissions(body);
              const accessToken = localStorage.getItem(`accessToken`);
              if (accessToken) {
                const data = JSON.parse(accessToken);
                localStorage.accessToken = JSON.stringify({ ...data, permissions: body });
              }
            }
          });
    }
  }

}
