import { Permissions, User } from "../../../../types/property.types";
import { UsersService } from "./users.service";
import { AuthService } from "./auth.service";
import { Injectable } from "@angular/core";
import {
    CanActivate, ActivatedRouteSnapshot,
    RouterStateSnapshot, CanActivateChild
} from "@angular/router";
import { Observable } from "rxjs";

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
            }));
    }
}