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
  redirections: Redirection[] = [];
  showSensitiveData: boolean = true;
  togglerText = !this.showSensitiveData ? 'show' : 'hide';

  categories: string[] = [];

  constructor(
    private redirectionsService: RedirectionsService,
    private userService: UsersService,
  ) { }

  ngOnInit(): void {

    if (localStorage.getItem(`visibilitySettings`)) {
      const data = JSON.parse(localStorage.getItem(`visibilitySettings`));
      this.showSensitiveData = data.showSensitiveData;
      this.togglerText = !this.showSensitiveData ? 'show' : 'hide';
    }

    this.redirectionsService.redirections.subscribe(
      (response: Redirection[]) => {
        this.redirections = response;
      });

    this.newRedirection = new FormGroup({
      route: new FormControl(null, [Validators.required]),
      targetUrl: new FormControl(null, [Validators.required]),
      category: new FormControl(null),
    })

    this.redirectionsService.categories.subscribe((data) => {
      this.categories = data;
    })
  }

  onFilterResults(category: string) {
    this.redirections = this.redirectionsService.redirections.getValue();
    if (category !== 'all') {
      this.redirections = this.redirections.filter(
        (item: Redirection) => item.category === category);
    }
  }

  onCreate() {
    const body = {
      targetUrl: this.newRedirection.value.targetUrl,
      route: this.newRedirection.value.route,
      category: this.newRedirection.value.category,
      userId: this.userService.getCurrentUserId(),
    }

    this.redirectionsService.createRedirection(body);
    this.newRedirection.reset();
  }

  onToggleSensitiveDataDisplay(ref: HTMLInputElement) {
    this.showSensitiveData = !this.showSensitiveData;
    ref.value = !this.showSensitiveData ? 'show' : 'hide';
    localStorage.visibilitySettings = JSON.stringify({ showSensitiveData: this.showSensitiveData })
  }

}