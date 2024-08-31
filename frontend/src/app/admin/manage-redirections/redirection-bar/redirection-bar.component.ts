import { Component, Input } from '@angular/core';
import { Redirection, RedirectionsService } from '../../../services/redirections.service';

@Component({
    selector: '[redirectionBar]',
    templateUrl: './redirection-bar.component.html',
    styleUrl: './redirection-bar.component.scss'
})

export class RedirectionBarComponent {

    @Input('instance') redirection: Redirection;
    @Input('index') index: number;
    @Input('secret') secret: boolean = false; 

    constructor(
        private redirectionsService: RedirectionsService,
    ) { }

    editMode = false;



    onDelete(id: number) {
        this.redirectionsService.deleteRedirection(id);
    }

    onEdit() {
        this.editMode = true;
    }

    confirmEdit(id: number) {
        this.editMode = false;
        this.redirectionsService.editRedirection(id);
    }

    rejctEdit(id: number) {
        this.editMode = false
    }
}
