import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { User } from '../../../services/users.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: '[user-bar]',
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss', '../../manage-redirections/manage-redirections.component.scss']
})
export class UserBarComponent implements OnChanges, OnInit {

  @Input('user') protected user: UserFromResponse;
  @Input('index') protected index: number;

  protected editUserForm: FormGroup;
  protected editMode: boolean = false;

  public ngOnChanges(changes: SimpleChanges): void {

  }

  public ngOnInit(): void {
    console.log(this.user)
  }

  protected onEdit = async (): Promise<void> => {
    this.editMode = true;
  }

  protected onRejectEdit = async (): Promise<void> => {
    this.editMode = false;
  }

  protected onConfirmEdit = async (): Promise<void> => {

  }

  protected onDelete = async (): Promise<void> => {

  }

}

type UserFromResponse = User & {
  canCreate: boolean,
  canUpdate: boolean,
  canDelete: boolean,
  canManage: boolean,
}