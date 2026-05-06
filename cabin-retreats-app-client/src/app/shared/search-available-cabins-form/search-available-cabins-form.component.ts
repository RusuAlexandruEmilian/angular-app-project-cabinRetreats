
import { Component, ViewEncapsulation, ViewChild, HostListener, Output, Injectable, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatDateRangePicker } from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms'; 
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, filter, Observable, startWith, switchMap, take, tap } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { Cabin } from '../../core/models/cabin';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { HeaderService } from '../../core/services/header.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CabinService } from '../../core/services/cabin.service';


@Component({
  selector: 'app-search-available-cabins-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, CommonModule, MatSlideToggleModule, RouterModule],
  templateUrl: './search-available-cabins-form.component.html',
  styleUrl: './search-available-cabins-form.component.scss',
  encapsulation: ViewEncapsulation.None
})



export class SearchAvailableCabinsFormComponent{
  private http = inject(HttpClient);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private cabinService = inject(CabinService);

  //Variables used to show or hide html elements
  isDestinationEmpty = false;
  isDestinationInputFocused: boolean = false;
  isSelectDateFocused: boolean = false;
  isInputFocused: boolean = false;
  isGuestsOptionsOpen: boolean = false;
  
  //variable is used to set the date range picker to preselect start date to the current date   
  minDate!: Date;

  
  adultsNumber: number = 1;
  childrenNumber: number = 0;
  petsNumber: number = 0;
  check_in: string | Date = 'Check-in'; 
  check_out: string | Date = 'Check-out';
  check_in_database: string | Date = this.check_in;
  check_out_database: string | Date = this.check_out;

  //Variables for Destination Search Input autocomplete logic
  destinationValueTrack: string = '';
  destinationValue = new FormControl('');
  destinationSearchResults$ = this.destinationValue.valueChanges.pipe(
    debounceTime(300),
    startWith(this.destinationValue.value),
    distinctUntilChanged(),
    filter(val => val!.length > 0), 
    switchMap(value => {
      return this.getDestination(value!)     
    })
  );
   
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  dateRageChanges$ = this.range.valueChanges.pipe(
    filter(value => !!value.start && !!value.end),

    tap(value => {
      const startTime = new Date(value.start!).getTime();
      const endTime = new Date(value.end!).getTime();
      if (startTime === endTime) {
        this.range.patchValue({ start: null, end: null }, { emitEvent: false });
        this.check_in = 'Check-in';
        this.check_out = 'Check-out';
        return; 
      }
      if (endTime < startTime) {
        this.range.patchValue({ start: null, end: null }, { emitEvent: false });
        return;
      }
      this.check_in = formatDate(value.start!, 'EEE, MMM d, y', 'en-us'); 
      this.check_out = formatDate(value.end!, 'EEE, MMM d, y', 'en-us');
      this.check_in_database = formatDate(value.start!, 'y-MM-dd', 'en-us'); 
      this.check_out_database = formatDate(value.end!, 'y-MM-dd', 'en-us');

    })
  )

  pets = new FormControl(false);

  private signalSearchinputsChange = effect(() => {
    if(Object.keys(this.cabinService.searchInputs()).length === 0){
      this.destinationValue.setValue('');
      this.pets.setValue(false);
      this.adultsNumber = 1;
      this.childrenNumber = 0;
      this.check_in = 'Check-in';
      this.check_out = 'Check-out';
    }
  });
  
  getDates(){

  }

  ngOnInit() {

    this.minDate = new Date();


    if(Object.keys(this.cabinService.searchInputs()).length > 0){
      this.destinationValue.setValue(this.cabinService.searchInputs().destination || null);
      this.pets.setValue(Boolean(this.cabinService.searchInputs().pets) || null);
      this.adultsNumber = +(this.cabinService.searchInputs().nr_adults || '1');
      this.childrenNumber = +(this.cabinService.searchInputs().nr_children || '1');;
      this.check_in = formatDate(this.cabinService.searchInputs().start_date?.toString() || 'Check-in', 'EEE, MMM d, y', 'en-us');
      this.check_out = formatDate(this.cabinService.searchInputs().end_date?.toString() || 'Check-out', 'EEE, MMM d, y', 'en-us');
    }

  } 





  
  
  getDestination(destination: string): Observable<any>{
    return this.http.get<any[]>(`http://localhost:3000/cabin/search/byDesinationInput?input_characters=${destination}`)
  }
  
  setDestinationInputValue(value: string){
    this.destinationValue.setValue(value);
  }
  

  searchAvailableCabins(){

    if(!this.destinationValue.value){
      this.isDestinationEmpty = true;
    }else{
        
      //If only the checkin-date is selected than add by default the next day to check-out date when button is pressed
      if(this.check_in_database != 'Check-in' && this.check_out_database === 'Check-out'){
        this.check_out_database = new Date(this.check_in_database);
        this.check_out_database.setDate(this.check_out_database.getDate() + 1)
        this.check_out_database = formatDate( this.check_out_database, 'y-MM-dd', 'en-us'); 
      
        this.check_in = formatDate(this.check_in_database, 'EEE, MMM d, y', 'en-us'); 
        this.check_out = formatDate(this.check_out_database, 'EEE, MMM d, y', 'en-us');
      
        const start = this.check_in_database.toString().split('T')[0];
        const end = this.check_out_database.toString().split('T')[0];
        
      }
    
      //If neither a check-in date or check-out date is selected than add by default the current date for ckeck-in and  the next day for check-out date when button is pressed
      if(this.check_in_database === 'Check-in' && this.check_out_database === 'Check-out'){
        this.check_in_database = new Date();
        this.check_out_database = new Date(this.check_in_database);
        this.check_out_database.setDate(this.check_out_database.getDate() + 1);
        this.check_out_database = formatDate( this.check_out_database, 'y-MM-dd', 'en-us'); 
        this.check_in_database = formatDate( this.check_in_database, 'y-MM-dd', 'en-us');
        
        this.check_in = formatDate(this.check_in_database, 'EEE, MMM d, y', 'en-us'); 
        this.check_out = formatDate(this.check_out_database, 'EEE, MMM d, y', 'en-us');
      
        const start = this.check_in_database.toString().split('T')[0];
        const end = this.check_out_database.toString().split('T')[0];
        
      }
    
    
      const start = this.check_in_database.toString().split('T')[0];
      const end = this.check_out_database.toString().split('T')[0];
    
      const withPets = this.pets.value ? 1 : 0;
    
      this.cabinService.clearSearchInputs = false;
    
      this.cabinService.getAvailableCabins({ 
        start_date: start,
        end_date: end,
        destination: this.destinationValue.value,
        pets: withPets,
        nr_adults: this.adultsNumber.toString(), 
        nr_children: this.childrenNumber.toString()
      });
      this.router.navigate(['']);

    

    }
   
      
    
    
    
     
    
    
  }

  toggle_guests_options_visibility(){
      this.isGuestsOptionsOpen = !this.isGuestsOptionsOpen;
  }




  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dateForm');
    
    if (!clickedInside) {
      this.isGuestsOptionsOpen = false;
    }
  }

  

  increaseGuests(guests: number): number{
      if(guests < 10){
        return guests + 1;
      }else{
        return guests;
      }
        
  }

  decreaseGuests(guests: number): number{
    if(guests > 0){
      return guests - 1;
    }else{
    return guests;
    }
  }
}
