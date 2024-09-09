import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Redirection, RedirectionsService } from '../../../services/redirections.service';
import { Permissions } from '../../../services/auth.service';
import { CanDeactivateService } from '../../../services/can-deactivate-guard.service';

@Component({
    selector: '[redirectionBar]',
    templateUrl: './redirection-bar.component.html',
    styleUrls: ['../manage-redirections.component.scss', './redirection-bar.component.scss'],
})

export class RedirectionBarComponent implements OnChanges {

    @Input('instance') redirection: Redirection;
    @Input('index') index: number;
    @Input('secret') secret: boolean = false;
    @Input('permissions') permissions: Permissions;

    routeInput: string;
    targetPathInput: string;
    categoryInput: string;
    displayData: boolean = this.secret;
    editMode = false;

    @HostListener('mouseover') show = () => {
        this.displayData = true;
    }
    @HostListener(`mouseleave`) hide = () => {
        this.displayData = this.secret ? true : false;
    }

    constructor(
        private redirectionsService: RedirectionsService,
        private canLeave: CanDeactivateService,
    ) { }

    public ngOnChanges(changes: SimpleChanges): void {
        this.displayData = this.secret;
    }

    protected refreshGuard = (): void => {
        let redirections: Redirection[] = this.canLeave.modifiedRedirectionEdits.getValue();

        if ((this.routeInput !== this.redirection.route
            || this.categoryInput !== this.redirection.category
            || this.targetPathInput !== this.redirection.targetUrl)
        ) {
            if (redirections.findIndex((r: Redirection) => r.id === this.redirection.id) < 0) {
                redirections = [...redirections, this.redirection];
                this.canLeave.modifiedRedirectionEdits.next(redirections);
            }
        } else {
            redirections = redirections.filter((r: Redirection) => r.id !== this.redirection.id);
            this.canLeave.modifiedRedirectionEdits.next(redirections);
        }
    }

    protected onCopyToClipboard = (): void => {
        navigator.clipboard.writeText(this.redirection.targetUrl);
    }

    protected onRedirectTo = (): void => {
        this.redirection.clicksTotal++;
        window.open(`${this.redirectionsService.domain}/${this.redirection.route}`, '_blank');
    }

    protected onDelete = (): void => {
        this.refreshGuard();
        this.redirectionsService.deleteRedirection(this.redirection.id);
    }

    private assignDefaultValues = (): void => {
        this.routeInput = this.redirection.route;
        this.targetPathInput = this.redirection.targetUrl;
        this.categoryInput = this.redirection.category;
    }

    protected onEdit = (): void => {
        this.assignDefaultValues();
        this.editMode = true;
    }

    protected onConfirmEdit = (): void => {
        this.refreshGuard();
        this.editMode = false;
        this.redirectionsService.editRedirection({
            ...this.redirection,
            route: this.routeInput,
            targetUrl: this.targetPathInput,
            category: this.categoryInput,
        });
    }

    protected onRejectEdit = (): void => {
        this.assignDefaultValues();
        this.refreshGuard();
        this.editMode = false;
    }
}
