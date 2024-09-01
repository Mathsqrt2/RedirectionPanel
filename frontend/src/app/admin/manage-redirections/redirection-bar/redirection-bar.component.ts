import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Redirection, RedirectionsService } from '../../../services/redirections.service';

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


    onDelete() {
        this.redirectionsService.deleteRedirection(this.redirection.id);
    }

    onEdit() {
        this.editMode = true;
    }

    confirmEdit() {
        this.editMode = false;
        this.redirection.route = this.redirectionInput;
        this.redirection.targetUrl = this.targetPathInput;
        this.redirectionsService.editRedirection(this.redirection);
    }

    rejectEdit() {
        this.editMode = false
    }
}
