import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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

  private returnUrl: string = '/';

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.returnUrl = navigation.extras.state['returnUrl'];
    }
  }

  onSubmit(){
    this.http.post<any>('http://localhost:3000/register', {
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
          this.router.navigate(['/']);
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
  
  getInputs(){
    console.log(`email: ${this.email}` + '\n' + `passwod: ${this.pwd}`);
  }

  console(){
    console.log(`${this.email.value}, ${this.pwd.value}`);
  }
}
