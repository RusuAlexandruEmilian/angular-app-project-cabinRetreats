import { Component, inject, Inject } from '@angular/core';
import { Cabin } from '../../core/models/cabin';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CabinService } from '../../core/services/cabin.service';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-reserve-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './reserve-form.component.html',
  styleUrl: './reserve-form.component.scss'
})
export class ReserveFormComponent {
  private cabinService = inject(CabinService);
  private http = inject(HttpClient);
  private dialogRef = inject(DialogRef);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  cabin!: Cabin | null;
  searchInputs!: any | null;
  numberOfNights!: number;
  guests_and_number_of_nights!: string;
  totalPrice!: number;
  showSuccesMessage: boolean = false;
  showReserveForm: boolean = true;

  

  ngOnInit(){
    this.cabin = this.cabinService.currentCabin;
    this.searchInputs = this.cabinService.searchInputs();
    if(this.cabin && this.searchInputs){
      if(this.searchInputs.start_date && this.searchInputs.end_date){
        const checkIn = new Date(this.searchInputs.start_date);
        const checkOut = new Date(this.searchInputs.end_date);
        const diffInMs = checkOut.getTime() - checkIn.getTime();

        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        this.numberOfNights = diffInDays;

      }
      if(this.searchInputs.nr_adults && this.searchInputs.nr_children){
        if(parseInt(this.searchInputs.nr_adults) > 0 && parseInt(this.searchInputs.nr_children) > 0){
          this.guests_and_number_of_nights = `${this.numberOfNights} nights, ${this.searchInputs.nr_adults} adults, ${this.searchInputs.nr_children} children`;
        }else{
          this.guests_and_number_of_nights = `${this.numberOfNights} nights, ${this.searchInputs.nr_adults} adults`
        }
      };
      
      if(this.cabin.price_per_night){
        this.totalPrice = parseFloat((this.numberOfNights * this.cabin.price_per_night).toFixed(2));
      };
      
    }
  }

  bookCabin(){
    this.http.post<any>(`${this.apiUrl}/book`,
      {
        cabin_id: this.cabinService.currentCabin?.id,
        booking_details: {check_in: this.cabinService.searchInputs().start_date,
                          check_out: this.cabinService.searchInputs().end_date
        }
      },
      {
        withCredentials: true
      }
    ).subscribe({
      next: () => {
        this.cabin = null;
        this.showSuccesMessage = true;    
      },
      error: (err) => {
        console.log(err);
      }
    });  
  }
  

  continue_button_action(){
    this.router.navigate(['/']);
    this.cabinService.clearSearchInputs = true;
    this.cabinService.currentCabin = null;
    this.closeModal();
  }

  closeModal(){
    this.dialogRef.close();
  }
}
