import { Component, OnInit } from '@angular/core';
import { Redirection, RedirectionsService } from '../../services/redirections.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-manage-redirections',
  templateUrl: './manage-redirections.component.html',
  styleUrl: './manage-redirections.component.scss'
})

export class ManageRedirectionsComponent implements OnInit {

  newRedirection: FormGroup;
  redirections: any[] = [];

  constructor(
    private redirectionsService: RedirectionsService,
    private userService: UsersService,
  ) { }

  ngOnInit(): void {
    this.redirectionsService.redirections.subscribe(
      (response: Redirection[]) => {
        this.redirections = response;
      });

    this.newRedirection = new FormGroup({
      route: new FormControl(null, [Validators.required]),
      targetUrl: new FormControl(null, [Validators.required]),
      tags: new FormControl(null),
    })
  }

  onEdit(index: number) {
    this.redirectionsService.editRedirection(index);
  }
  onDelete(index: number) {
    this.redirectionsService.deleteRedirection(index);
  }

  onCreate() {
    const body = {
      targetUrl: this.newRedirection.value.targetUrl,
      route: this.newRedirection.value.route,
      userId: this.userService.getCurrentUserId(),
    }

    this.redirectionsService.createRedirection(body);
    this.newRedirection.reset();
  }


}
