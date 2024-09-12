import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../../services/users.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'delete-account',
    templateUrl: './delete-account.component.html',
    styleUrls: ['./delete-account.component.scss', './../user-profile.component.scss']
})

export class DeleteAccountComponent {

    @Input(`currentUser`) currentUser: User;
    @Input(`baseUrl`) baseUrl: string;

    protected deleteAccountForm: FormGroup;
    protected procesStarted: boolean = false;

    constructor() {

    }
    protected onStartDeleteProcess(): void {
        if (!this.deleteAccountForm) {
            this.deleteAccountForm = new FormGroup({
                login: new FormControl(null, [Validators.required, Validators.minLength(3)]),
                password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            })
        }
        this.procesStarted = true;
    }

    protected onDeleteAccount(): void {

        const canDelete = window.confirm('This action is permanent, are you sure?')
        if(canDelete) {

        }
    }

    protected onCancel(): void {
        this.procesStarted = false;
    }


}