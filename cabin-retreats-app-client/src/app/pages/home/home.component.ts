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
  //cabins$!: Observable<Cabin[]>; 
  private subscription!: Subscription;
  guests: string | null = '';
  numberOfNights!: number | null; 
  check_in!: string | null;
  check_out!: string | null;
  
  
  

  constructor(private http: HttpClient, private headerService: HeaderService, private router: Router, private activatedRoute: ActivatedRoute) {}
  /*
  ngOnInit() {
    this.subscription = this.searchEvent.events.subscribe(
      (eventData) => {
        if (eventData) {
          this.getAvailableCabins(eventData);
          this.check_in = eventData[0];
          this.check_out = eventData[1];
          const adultsNumber = parseInt(eventData[4]);
          const childrenNumber = parseInt(eventData[5]);
          const checkIn = new Date(eventData[0]);
          const checkOut = new Date(eventData[1]);
          // Get the difference in milliseconds
          const diffInMs = checkOut.getTime() - checkIn.getTime();

          // Convert milliseconds to days
          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          
          this.numberOfNights = diffInDays;

          if(adultsNumber > 0 && childrenNumber > 0){
            this.guests = `${diffInDays} nights, ${adultsNumber} adults, ${childrenNumber} children`;
          }else{
            this.guests = `${diffInDays} nights, ${adultsNumber} adults`
          }
         
        }
        
      }
    );

    this.subscription = this.headerService.logoClickEvent.subscribe(
      (eventData) => {
        if (eventData) {
          this.getAllCabins();
          this.guests = null;
          this.numberOfNights = null;
        }
        
      }
    );
    

 

    

    this.subscription = this.activatedRoute.paramMap.subscribe(() => {
      if(history.state.data){
          this.getAvailableCabins(history.state.data);
          this.check_in = history.state.data[0];
          this.check_out = history.state.data[1];
          const adultsNumber = parseInt(history.state.data[4]);
          const childrenNumber = parseInt(history.state.data[5]);
          const checkIn = new Date(history.state.data[0]);
          const checkOut = new Date(history.state.data[1]);
          // Get the difference in milliseconds
          const diffInMs = checkOut.getTime() - checkIn.getTime();

          // Convert milliseconds to days
          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          
          this.numberOfNights = diffInDays;

          if(adultsNumber > 0 && childrenNumber > 0){
            this.guests = `${diffInDays} nights, ${adultsNumber} adults, ${childrenNumber} children`;
          }else{
            this.guests = `${diffInDays} nights, ${adultsNumber} adults`
          }
      }else if(history.state.getAllCabins){
        this.getAllCabins();
      }else{
        this.getAllCabins();
      }
    })
    
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  */
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
     //this.cabins$ = this.http.get<Cabin[]>('http://localhost:3000/');
    //return this.http.get<Cabin[]>('http://localhost:3000');
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

  openModal(){
    this.dialog.open(ReserveFormComponent, { autoFocus: false, disableClose: false, panelClass: 'reserve-dialog'});
  }

}


