import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService, Permissions } from "./auth.service";
import { UsersService } from "./users.service";

@Injectable()

export class AuthGuard implements CanActivate, CanActivateChild {

    private permissions: Permissions = this.userService.getCurrentUserPermissions();

    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) {
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

                    if (route.routeConfig.path === 'logs' && !this.permissions.canManage) {
                        return false;
                    }

                    if (route.routeConfig.path === 'users' && !this.permissions.canManage) {
                        return false;
                    }

                    return true;
                }

                return false;
            }))
    }
}