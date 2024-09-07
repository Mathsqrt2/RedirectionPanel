import { Component, OnInit } from '@angular/core';
import { Redirection, RedirectionsService } from '../../services/redirections.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Permissions } from '../../services/auth.service';

@Component({
  selector: 'app-manage-redirections',
  templateUrl: './manage-redirections.component.html',
  styleUrl: './manage-redirections.component.scss'
})

export class ManageRedirectionsComponent implements OnInit {

  private refreshColspan = () => {
    let colspan = 0;
    if (this.permissions.canDelete) {
      colspan++;
    }

    if (this.permissions.canUpdate) {
      colspan++;
    }
    return colspan;
  }

  newRedirection: FormGroup;
  redirections: Redirection[] = [];
  categories: string[] = [];
  permissions: Permissions = this.userService.getCurrentUserPermissions();

  sortByOptions: string[] = ['id (asc)', 'id (desc)', 'clicks (asc)', 'clicks (desc)', 'route (asc)', 'route (desc)'];
  currentSortMode: string = this.sortByOptions[0];
  colspan: number = this.refreshColspan();

  showSensitiveData: boolean = true;
  currentCategory: string = 'all';
  togglerText = !this.showSensitiveData ? 'show' : 'hide';
  minValue: number | null = null;
  maxValue: number | null = null;

  constructor(
    private redirectionsService: RedirectionsService,
    private userService: UsersService,
  ) {
  }

  private isUnique = (control: FormControl): { [s: string]: boolean } => {

    if (this.redirections.findIndex((item: Redirection) => item.route === control.value) >= 0) {
      return { 'routeMustBeUnique': true }
    } else {
      null
    }
  }

  ngOnInit(): void {

    if (localStorage.getItem(`visibilitySettings`)) {
      const data = JSON.parse(localStorage.getItem(`visibilitySettings`));
      this.showSensitiveData = data.showSensitiveData;
      this.togglerText = !this.showSensitiveData ? 'show' : 'hide';
    }

    this.redirectionsService.redirections.subscribe(
      (response: Redirection[]) => {
        this.redirections = response;
        this.sortBy();
      });

    this.newRedirection = new FormGroup({
      route: new FormControl(null, [Validators.required, Validators.minLength(3), this.isUnique.bind(this)]),
      targetUrl: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      category: new FormControl(null),
    })

    this.redirectionsService.categories.subscribe((data) => {
      this.categories = data;
    })
  }

  sortBy() {
    const mode = this.currentSortMode.split(" ");
    const direction = mode[1] === "(asc)" ? 1 : -1;
    if (mode[0] === 'id') {
      this.redirections = this.redirections.sort((a: Redirection, b: Redirection) => direction * (a.id - b.id));
    }

    else if (mode[0] === 'clicks') {
      this.redirections = this.redirections.sort((a: Redirection, b: Redirection) => direction * (a.clicksTotal - b.clicksTotal));
    }

    else if (mode[0] === 'route') {
      this.redirections = this.redirections.sort((a: Redirection, b: Redirection) => direction * a.route.localeCompare(b.route));
    }

  }

  onMaxReset() {
    this.maxValue = null;
    this.onFilterResults();
  }

  onMinReset() {
    this.minValue = null;
    this.onFilterResults();
  }

  onCategoryReset() {
    this.currentCategory = 'all';
    this.onFilterResults();
  }

  onFilterResults() {
    this.redirections = this.redirectionsService.redirections.getValue();

    if (this.minValue) {
      this.redirections = this.redirections.filter((r: Redirection) => r.clicksTotal >= this.minValue);
    }

    if (this.maxValue) {
      this.redirections = this.redirections.filter((r: Redirection) => r.clicksTotal <= this.maxValue);
    }

    if (this.currentCategory !== 'all') {
      this.redirections = this.redirections.filter(
        (item: Redirection) => {
          if (this.currentCategory === '') {
            return item.category === null || item.category === undefined;
          }
          return item.category === this.currentCategory
        });
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