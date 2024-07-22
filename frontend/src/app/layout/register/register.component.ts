import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SHA512 } from "crypto-js";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  constructor(private http: HttpClient) { }

  accountDoesntExist: boolean = false;
  loginForm: FormGroup;
  accounts: User[] = [
    { login: 'qwerty', isAuthenticated: false }
  ];

  areEquals(control: FormControl): { [s: string]: boolean } {
    console.log("checked");
    if (control?.value !== this.loginForm?.value?.password) {
      return { 'passwordMustMatch': true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      'login': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'password-confirm': new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
    });
  };


  onSubmit(): void {
    console.log(this.loginForm.value);
    console.log("hash", SHA512(this.loginForm.value.password).toString());
    this.loginForm.reset();
  };
}

export type User = {
  login: string,
  token?: string,
  refreshToken?: string,
  isAuthenticated: boolean,
}