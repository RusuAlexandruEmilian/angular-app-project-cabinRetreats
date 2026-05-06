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
    this.authService.login(this.email.value, this.pwd.value, this.returnUrl).subscribe(logged_in => {
      if(!logged_in){
        this.wrongCredentials = true;
      }
    });
  }
  
}
