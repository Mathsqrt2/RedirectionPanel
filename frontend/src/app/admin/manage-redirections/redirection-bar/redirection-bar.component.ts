import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Redirection, RedirectionsService } from '../../../services/redirections.service';
import { Permissions } from '../../../services/auth.service';

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

    ngOnChanges(changes: SimpleChanges): void {
        this.displayData = this.secret;
    }

    constructor(
        private redirectionsService: RedirectionsService,
    ) { }


    onCopyToClipboard = () => {
        navigator.clipboard.writeText(this.redirection.targetUrl);
    }

    onRedirectTo = () => {
        this.redirection.clicksTotal++;
        window.open(`${this.redirectionsService.domain}/${this.redirection.route}`, '_blank');
    }

    onDelete() {
        this.redirectionsService.deleteRedirection(this.redirection.id);
    }

    onEdit() {
        this.routeInput = this.redirection.route;
        this.targetPathInput = this.redirection.targetUrl;
        this.categoryInput = this.redirection.category;
        this.editMode = true;
    }

    onConfirmEdit() {
        this.editMode = false;
        this.redirectionsService.editRedirection({
            ...this.redirection,
            route: this.routeInput,
            targetUrl: this.targetPathInput,
            category: this.categoryInput,
        });
    }

    onRejectEdit() {
        this.editMode = false
    }
}
