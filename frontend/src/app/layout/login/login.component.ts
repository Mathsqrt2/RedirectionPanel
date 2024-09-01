import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})


export class LoginComponent implements OnInit {

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
    ) { }

    accessDenied: boolean = false;
    loginForm: FormGroup;

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            login: new FormControl(null, [Validators.required]),
            password: new FormControl(null, [Validators.required]),
        })
    };

    async onSubmit(): Promise<void> {
        if (this.loginForm.status === 'VALID') {
            const request = await this.authService.login(this.loginForm.value);
            this.loginForm.reset();
            if (request) {
                this.router.navigate(['/admin/redirections']);
            } else {
                this.accessDenied = true;
            }
        }
    };
}

export type User = {
    login: string,
    token?: string,
    refreshToken?: string,
    isAuthenticated: boolean,
}

