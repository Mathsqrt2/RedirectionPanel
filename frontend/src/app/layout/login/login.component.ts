import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {

    loginForm: FormGroup;

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            'login': new FormControl(null, [Validators.required, Validators.minLength(3)]),
            'password': new FormControl(null, [Validators.required, Validators.minLength(3)]),
        })
    };

    onSubmit(): void {
        console.log(this.loginForm.value);
        this.loginForm.reset();
    };

}