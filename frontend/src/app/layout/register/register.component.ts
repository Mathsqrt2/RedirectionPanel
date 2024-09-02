import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  accountAlreadyExist: boolean = false;
  registerForm: FormGroup;

  areEquals(control: FormControl): { [s: string]: boolean } {
    if (control?.value !== this.registerForm?.value?.password) {
      return { 'passwordMustMatch': true };
    }
    return null;
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      'login': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'password-confirm': new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
    });
  };

  async onSubmit(): Promise<void> {
    const body = {
      login: this.registerForm.value.login,
      password: this.registerForm.value.login,
      confirmPassword: this.registerForm.value.login,
    }

    if (this.registerForm.status === "VALID") {
      const request = await this.authService.registerNewUser(body)
      this.registerForm.reset();
      if (request) {
        this.router.navigate(['/admin/redirections'])
      } else {
        this.accountAlreadyExist = true;
      }
    }

  };

}