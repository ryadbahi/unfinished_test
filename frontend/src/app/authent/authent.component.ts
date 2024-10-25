import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { ApiService } from '../api.service';
import { SnackBarService } from '../snack-bar.service';

@Component({
  selector: 'app-authent',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './authent.component.html',
  styleUrl: './authent.component.scss',
})
export class AuthentComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private snackBar: SnackBarService
  ) {}

  showlogin = true;
  registerform!: FormGroup;
  loginform!: FormGroup;
  username!: string;

  ngOnInit(): void {
    this.registerform = this.formBuilder.group({
      user_name: ['', Validators.required],
      user_surname: ['', Validators.required],
      regpassword: ['', Validators.required],
    });

    this.loginform = this.formBuilder.group({
      username: ['', Validators.required],
      loginpassword: ['', Validators.required],
    });
  }

  resetForm() {
    this.registerform.reset();
  }

  showLogin() {
    this.showlogin = !this.showlogin;
  }

  ckeckRegData() {}

  generateUserName() {
    let data = this.registerform.value;

    let user_name = data.user_name;
    let user_surname = data.user_surname;

    let usernameGenerate = `${user_surname[0]}.${user_name}`;
    //let usernameGenerate = `${user_surname[0]}${user_surname[1]}.${user_name}`;
    let username = usernameGenerate.toLowerCase();
    console.log(username);
    this.username = username;
    return username;
  }

  async register(): Promise<void> {
    let data = this.registerform.value;

    // Generate the username using the generateUserName method
    let username = this.generateUserName(); // Capture the generated username

    let dataToSend = {
      user_name: data.user_name,
      user_surname: data.user_surname,
      username: username, // Use the generated username
      password: data.regpassword,
    };

    return new Promise((resolve, reject) => {
      this.apiService.register(dataToSend).subscribe({
        next: (ok) => {
          this.snackBar.openSnackBar(`${ok}`, 'Ok!');
          this.resetForm();
          resolve(); // Resolve promise on success
        },
        error: (error) => {
          console.error(error); // Log the error
          this.snackBar.openSnackBar(
            'Registration failed. Please try again.',
            'Close'
          );
          reject(error); // Reject promise on error
        },
      });
    });
  }
  login() {
    console.log(this.loginform.value);
  }
}
