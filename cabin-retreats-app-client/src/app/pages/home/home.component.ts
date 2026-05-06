import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { Cabin } from '../../core/models/cabin';
import { Observable, Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CabinCardComponent } from '../../shared/cabin-card/cabin-card.component';
import { AsyncPipe } from '@angular/common';
import { HeaderService } from '../../core/services/header.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CabinService } from '../../core/services/cabin.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ReserveFormComponent } from '../../shared/reserve-form/reserve-form.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CabinCardComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {

  private url = 'http://localhost:3000'
  private subscription!: Subscription;
  guests: string | null = '';
  numberOfNights!: number | null; 
  check_in!: string | null;
  check_out!: string | null;
  
  
  

  constructor(private http: HttpClient, private headerService: HeaderService, private router: Router, private activatedRoute: ActivatedRoute) {}
  
  private authService = inject(AuthenticationService);
  private cabinService = inject(CabinService);
  private dialog = inject(Dialog);
  cabins!: Cabin[];
  
  ngOnInit(){
    if(this.cabinService.clearSearchInputs){
      this.cabinService.getAllCabins();
    }
    
  }

  private signalCabinValueChange = effect(() => this.cabins = this.cabinService.cabins())

  
  getAllCabins(){
    this.cabinService.getAllCabins();
  }

  getAccessToken(){
    console.log(this.authService.getAuthenticationInfo());
  }

  protectedRequest(){
    this.http.get<Cabin[]>('http://localhost:3000/protected').subscribe(data => {
      console.log(data);
    })
  }

  refreshToken(){
    this.authService.refreshToken();
  }

}


