import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SHA512 } from "crypto-js";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})


export class LoginComponent implements OnInit {

    constructor(private http: HttpClient) { }

    accountDoesntExist: boolean = false;
    loginForm: FormGroup;
    accounts: User[] = [
        { login: 'qwerty', isAuthenticated: false }
    ];



    ngOnInit(): void {
        this.loginForm = new FormGroup({
            'login': new FormControl(null, [Validators.required, Validators.minLength(3)]),
            'password': new FormControl(null, [Validators.required, Validators.minLength(3)]),
        })
    };

    onSubmit(): void {
        console.log(this.loginForm.value);
        console.log("hash", SHA512(this.loginForm.value.password).toString())
        this.loginForm.reset();
    };
}

export type User = {
    login: string,
    token?: string,
    refreshToken?: string,
    isAuthenticated: boolean,
}