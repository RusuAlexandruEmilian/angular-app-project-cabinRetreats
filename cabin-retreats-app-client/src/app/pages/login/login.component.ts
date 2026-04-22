import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  wrongCredentials: boolean = false;
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
    // this.http.post<any>('http://localhost:3000/authenticate', {
    //     email: this.email.value,
    //     password: this.pwd.value
    //   },
    //   {
    //     withCredentials: true
    //   }
    // ).subscribe({
    //     next: (data) => {
    //       this.authService.setAuthenticationInfo(data);
    //       console.log(`Return url: ${this.returnUrl}`);
    //       this.router.navigateByUrl(this.returnUrl);
    //     },
    //     error: (err) => {
    //       if((err.status === 401) || (err.status === 404)){
    //         this.wrongCredentials = true;
    //       }else{
    //         console.log(err);
    //       }
    //     }
    // });
    this.authService.login(this.email.value, this.pwd.value, this.returnUrl).subscribe(logged_in => {
      if(!logged_in){
        this.wrongCredentials = true;
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
