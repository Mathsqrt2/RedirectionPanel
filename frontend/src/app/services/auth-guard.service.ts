import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService, Permissions } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./users.service";
@Injectable()

export class AuthGuard implements CanActivate, CanActivateChild {

    private permissions: Permissions = this.userService.getCurrentUser().getValue().permissions;

    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) {
        this.userService.getCurrentUser().subscribe((newUserState: User) => {
            this.permissions = newUserState.permissions;
        })
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(route, state);
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return (this.authService.isAuthenticated().then(
            (authenticated: boolean) => {
                if (authenticated) {

                    if (route.routeConfig.path === 'logs') {
                        return this.permissions.canManage;
                    }

                    if (route.routeConfig.path === 'users') {
                        return this.permissions.canManage;
                    }

                    return true;
                }

                return false;
            }))
    }
}