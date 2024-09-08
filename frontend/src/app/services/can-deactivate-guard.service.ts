import {
    ActivatedRouteSnapshot, CanDeactivateFn,
    RouterStateSnapshot
} from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";

export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {

    return component.canDeactivate();
};

export class CanDeactivateService {

    private isCreateRedirectionFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private isAnyOfRedirectionsEditFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private areLogsStillLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private isPasswordChangeFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private isEmailVerificationFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private isEmailChangeFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)


}
