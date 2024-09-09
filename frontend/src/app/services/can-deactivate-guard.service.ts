import {
    ActivatedRouteSnapshot, CanDeactivateFn,
    RouterStateSnapshot
} from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { Redirection } from "./redirections.service";

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

    public modifiedRedirectionEdits: BehaviorSubject<Redirection[]> = new BehaviorSubject<Redirection[]>([]);
    private isCreateRedirectionFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private areLogsStillLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private isPasswordChangeFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private isEmailVerificationFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private isEmailChangeFormDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public getObserver(option: ObserverType): BehaviorSubject<boolean> {
        switch (option) {
            case 'createRedirection': return this.isCreateRedirectionFormDirty;
            case 'logsLoading': return this.areLogsStillLoading;
            case 'changePassword': return this.isPasswordChangeFormDirty;
            case 'emailValidation': return this.isEmailVerificationFormDirty;
            case 'emailChange': return this.isEmailChangeFormDirty;
        }
    }

    public getValue(option: ObserverType): Boolean {
        return this.getObserver(option).getValue();
    }

}

type ObserverType = `createRedirection` | `logsLoading` | `changePassword` | `emailValidation` | `emailChange`;