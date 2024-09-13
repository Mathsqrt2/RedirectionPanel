import { Component, Input } from "@angular/core";
import { User, UsersService } from "../../../services/users.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
    selector: 'delete-account',
    templateUrl: './delete-account.component.html',
    styleUrls: ['./delete-account.component.scss', './../user-profile.component.scss']
})

export class DeleteAccountComponent {

    @Input(`currentUser`) currentUser: User;

    protected isPasswordVisible: boolean = false;
    protected deleteAccountForm: FormGroup;
    protected procesStarted: boolean = false;
    protected error: boolean = false;

    constructor(
        private readonly router: Router,
        private readonly usersService: UsersService,
    ) {

    }
    protected onStartDeleteProcess = async (): Promise<void> => {
        if (!this.deleteAccountForm) {
            this.deleteAccountForm = new FormGroup({
                confirmDeleteWithLogin: new FormControl(null, [Validators.required, Validators.minLength(3)]),
                confirmDeleteWithPassword: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            })
        }
        this.procesStarted = true;
    }

    protected onDeleteAccount = async (): Promise<void> => {

        const canDelete = window.confirm('This action is permanent, are you sure?')
        if (canDelete && this.deleteAccountForm.valid) {
            const body = {
                login: this.deleteAccountForm.value.confirmDeleteWithLogin,
                password: this.deleteAccountForm.value.confirmDeleteWithPassword,
            }
            this.error = !await this.usersService.deactivateCurrentUser(body);

            this.deleteAccountForm.reset();
            if (!this.error) {
                this.router.navigate(['/login']);
            }
        } else {
            this.deleteAccountForm.reset();
        }
    }
    protected togglePasswordVisibility = (): void => {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    protected onCancel(): void {
        this.procesStarted = false;

    }
}