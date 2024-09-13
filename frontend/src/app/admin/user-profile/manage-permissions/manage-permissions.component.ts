import { Component, Input, OnInit } from '@angular/core';
import { User, UsersService } from '../../../services/users.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  public ngOnInit(): void {
    const { canUpdate, canDelete, canManage, canCreate } = this.currentUser?.permissions;
    this.permissionsForm = new FormGroup({
      canUpdate: new FormControl({ value: canUpdate, disabled: !canManage }, [Validators.required]),
      canDelete: new FormControl({ value: canDelete, disabled: !canManage }, [Validators.required]),
      canManage: new FormControl({ value: canManage, disabled: !canManage }, [Validators.required]),
      canCreate: new FormControl({ value: canCreate, disabled: !canManage }, [Validators.required]),
    });
  }

  public onPermissionsUpdate = async (key: string): Promise<void> => {
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

      await this.usersService.setCurrentUserPermissions(body);

    }
  }

}
