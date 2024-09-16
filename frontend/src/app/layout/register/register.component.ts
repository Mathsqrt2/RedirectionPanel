import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Component, OnInit } from "@angular/core";
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

  protected isPasswordVisible = false;
  protected isConfirmationVisible = false;
  protected accountAlreadyExist: boolean = false;
  protected registerForm: FormGroup;

  private areEquals(control: FormControl): { [s: string]: boolean } {
    if (control?.value !== this.registerForm?.value?.password) {
      return { 'passwordMustMatch': true };
    }
    return null;
  }

  public ngOnInit(): void {
    this.registerForm = new FormGroup({
      'login': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'confirmPassword': new FormControl(null, [Validators.required, this.areEquals.bind(this)]),
    });
  };

  protected async onSubmit(): Promise<void> {
    const body = {
      login: this.registerForm.value.login,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
    }

    if (this.registerForm.status === "VALID") {
      const request = await this.authService.registerNewUser(body)
      this.registerForm.reset();
      if (request) {
        this.router.navigate(['/admin'])
      } else {
        this.accountAlreadyExist = true;
      }
    }
  };

  protected togglePasswordVisibility = (choose: boolean): void => {
    if (choose) {
      this.isPasswordVisible = !this.isPasswordVisible;
    } else {
      this.isConfirmationVisible = !this.isConfirmationVisible;
    }
  }

}