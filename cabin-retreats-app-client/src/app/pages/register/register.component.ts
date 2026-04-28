import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
private http = inject(HttpClient);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private apiUrl = environment.apiUrl;
  showSuccessMessage: boolean = false;
  showRegisterForm: boolean = true;

  duplicateEmail: boolean = false;
  firstName = new FormControl('', {
    validators: [Validators.required]
  });
  lastName = new FormControl('', {
    validators: [Validators.required]
  });
  email = new FormControl('', {
    validators: [Validators.required, Validators.email],
    updateOn: 'blur'
  });
  pwd = new FormControl('', {
    validators: [Validators.required],
  });

  onSubmit(){
    this.http.post<any>(`${this.apiUrl}/register`, {
        email: this.email.value,
        password: this.pwd.value,
        name: this.firstName.value,
        surname: this.lastName.value
      },
      {
        withCredentials: true
      }
    ).subscribe({
        next: (data) => {
          this.showSuccessMessage = true;
          this.showRegisterForm = false;
        },
        error: (err) => {
          if(err.status === 409){
            this.duplicateEmail = true;
            console.log(err);
          }else{
            console.log(err);
          }
        }
    });
  }
  
}
