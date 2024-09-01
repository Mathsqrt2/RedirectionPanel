import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Redirection, RedirectionsService } from '../../../services/redirections.service';
import { Router } from '@angular/router';

@Component({
    selector: '[redirectionBar]',
    templateUrl: './redirection-bar.component.html',
    styleUrl: './redirection-bar.component.scss'
})

export class RedirectionBarComponent implements OnChanges {

    @Input('instance') redirection: Redirection;
    @Input('index') index: number;
    @Input('secret') secret: boolean = false;
    redirectionInput: string;
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
        private router: Router,
    ) { }


    onCopyToClipboard = () => {
        navigator.clipboard.writeText(this.redirection.targetUrl);
    }

    onRedirectTo = () => {
        window.location.href = `${this.redirection.targetUrl}`;
    }

    onDelete() {
        this.redirectionsService.deleteRedirection(this.redirection.id);
    }

    onEdit() {
        this.redirectionInput = this.redirection.route;
        this.targetPathInput = this.redirection.targetUrl;
        this.categoryInput = this.redirection.category;
        this.editMode = true;
    }

    confirmEdit() {
        this.editMode = false;
        this.redirection.route = this.redirectionInput;
        this.redirection.targetUrl = this.targetPathInput;
        this.redirection.category = this.categoryInput;
        this.redirectionsService.editRedirection(this.redirection);
    }

    rejectEdit() {
        this.editMode = false
    }
}
