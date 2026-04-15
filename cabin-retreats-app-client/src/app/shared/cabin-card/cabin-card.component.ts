import { Component, effect, inject, Input } from '@angular/core';
import { Cabin } from '../../core/models/cabin';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CabinService } from '../../core/services/cabin.service';

@Component({
  selector: 'app-cabin-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cabin-card.component.html',
  styleUrl: './cabin-card.component.scss'
})
export class CabinCardComponent {
  private cabinService = inject(CabinService);
  private router = inject(Router);
  @Input() cabin!: Cabin;
  guests_and_number_of_nights!: string | null;
  numberOfNights!: number | null;
  check_in!: string | null;
  check_out!: string | null;
  

  
  private signalSearchinputsChange = effect(() => {
    const bookingDetails = this.cabinService.searchInputs(); 
    this.check_in = bookingDetails.start_date ?? null;
    this.check_out = bookingDetails.end_date ?? null;
    
    const adultsNumber = bookingDetails.nr_adults;
    const childrenNumber = bookingDetails.nr_children;

    if(bookingDetails.start_date && bookingDetails.end_date){
      const checkIn = new Date(bookingDetails.start_date);
      const checkOut = new Date(bookingDetails.end_date!);
      const diffInMs = checkOut.getTime() - checkIn.getTime();

      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          
      this.numberOfNights = diffInDays;
    }
    
    
    if(bookingDetails.nr_adults && bookingDetails.nr_children){
      if(parseInt(bookingDetails.nr_adults) > 0 && parseInt(bookingDetails.nr_children) > 0){
        this.guests_and_number_of_nights = `${this.numberOfNights} nights, ${bookingDetails.nr_adults} adults, ${bookingDetails.nr_children} children`;
      }else{
        this.guests_and_number_of_nights = `${this.numberOfNights} nights, ${bookingDetails.nr_adults} adults`
      }
    };

    if(this.cabin.price_per_night){
      this.totalPrice = parseFloat((this.numberOfNights! * this.cabin.price_per_night).toFixed(2));
    };
      
  });
  cabinName!: String ;
  totalPrice!: number;
  
  
  ngOnInit(){
    this.cabinName = this.cabin.name;
    this.cabinName = this.cabinName.split(' ').join('-');
  }

  goToDetailsPage(){
    this.cabinService.currentCabin = this.cabin;
    this.router.navigate(['/cabin-details', this.cabinName]);
  }


  
}
