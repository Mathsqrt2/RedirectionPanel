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
  categories: string[] = [];

  showSensitiveData: boolean = true;
  currentCategory: string = 'all';
  togglerText = !this.showSensitiveData ? 'show' : 'hide';
  minValue: number | null = null;
  maxValue: number | null = null;

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

  onMaxReset() {
    this.maxValue = null;
  }

  onMinReset() {
    this.minValue = null;
  }

  onCategoryReset() {
    this.currentCategory = 'all';
  }

  onFilterResults() {
    this.redirections = this.redirectionsService.redirections.getValue();

    if (this.minValue) {
      this.redirections = this.redirections.filter((i: Redirection) => i.clicksTotal >= this.minValue);
    }

    if (this.maxValue) {
      this.redirections = this.redirections.filter((i: Redirection) => i.clicksTotal <= this.maxValue);
    }

    if (this.currentCategory !== 'all') {
      this.redirections = this.redirections.filter(
        (item: Redirection) => item.category === this.currentCategory);
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