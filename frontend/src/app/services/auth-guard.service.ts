import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService, Permissions } from "./auth.service";
import { UsersService } from "./users.service";

@Injectable()

export class AuthGuard implements CanActivate, CanActivateChild {

    private permissions: Permissions = this.userService.getCurrentUserPermissions();

    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private router: Router,
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