import { Component, OnInit } from '@angular/core';
import { Redirection, RedirectionsService } from '../../services/redirections.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService, User } from '../../services/users.service';
import { Permissions } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { CanComponentDeactivate, CanDeactivateService } from '../../services/can-deactivate-guard.service';

@Component({
  selector: 'app-manage-redirections',
  templateUrl: './manage-redirections.component.html',
  styleUrl: './manage-redirections.component.scss'
})

export class ManageRedirectionsComponent implements OnInit, CanComponentDeactivate {

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

  private currentUser: User;
  protected newRedirection: FormGroup;
  protected redirections: Redirection[] = [];
  protected categories: string[] = [];
  protected permissions: Permissions = this.userService.getCurrentUser().getValue().permissions;

  protected sortByOptions: string[] = ['id (asc)', 'id (desc)', 'clicks (asc)', 'clicks (desc)', 'route (asc)', 'route (desc)'];
  protected currentSortMode: string = this.sortByOptions[0];
  protected colspan: number = this.refreshColspan();

  protected showSensitiveData: boolean = true;
  protected currentCategory: string = 'all';
  protected togglerText = !this.showSensitiveData ? 'show' : 'hide';
  private minValue: number | null = null;
  private maxValue: number | null = null;

  constructor(
    private readonly redirectionsService: RedirectionsService,
    private readonly userService: UsersService,
    private readonly canLeave: CanDeactivateService,
  ) {
    this.userService.getCurrentUser().subscribe((state: User) => {
      this.currentUser = state;
    })
  }

  private isUnique = (control: FormControl): { [s: string]: boolean } => {

    if (this.redirections.findIndex((item: Redirection) => item.route === control.value) >= 0) {
      return { 'routeMustBeUnique': true }
    } else {
      null
    }
  }

  public ngOnInit(): void {

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

    this.newRedirection.valueChanges.subscribe((newState) => {

      if (newState.route !== null && newState.route !== '' ||
        newState.targetUrl !== null && newState.targetUrl !== '' ||
        newState.category !== null && newState.category !== ''
      ) {

        this.canLeave.getSubject('createRedirection').next(true);

      } else {

        this.canLeave.getSubject('createRedirection').next(false);

      }
    })
  }

  private confirm = (): boolean => {
    return window.confirm(`There are unfinished processes. Are you sure you want to leave now?`);
  }

  public canDeactivate = (): Observable<boolean> | Promise<boolean> | boolean => {

    if (this.canLeave.getValue('createRedirection')) {
      return this.confirm();
    }

    if (this.canLeave.modifiedRedirectionEdits.getValue().length) {
      return this.confirm();
    }

    return true;
  };

  private sortBy = (): void => {
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

  protected onMaxReset(): void {
    this.maxValue = null;
    this.onFilterResults();
  }

  protected onMinReset(): void {
    this.minValue = null;
    this.onFilterResults();
  }

  protected onCategoryReset(): void {
    this.currentCategory = 'all';
    this.onFilterResults();
  }

  protected onFilterResults(): void {
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

  protected onCreate(): void {
    const body = {
      targetUrl: this.newRedirection.value.targetUrl,
      route: this.newRedirection.value.route,
      category: this.newRedirection.value.category,
      userId: this.currentUser.userId,
    }

    this.redirectionsService.createRedirection(body);
    this.newRedirection.reset();
  }

  protected onToggleSensitiveDataDisplay(ref: HTMLInputElement): void {
    this.showSensitiveData = !this.showSensitiveData;
    ref.value = !this.showSensitiveData ? 'show' : 'hide';
    localStorage.visibilitySettings = JSON.stringify({ showSensitiveData: this.showSensitiveData })
  }

}