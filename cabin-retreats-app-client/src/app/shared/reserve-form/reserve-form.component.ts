import { Component, inject, Inject } from '@angular/core';
import { Cabin } from '../../core/models/cabin';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CabinService } from '../../core/services/cabin.service';

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
  cabin!: Cabin | null;
  searchInputs!: any | null;
  numberOfNights!: number;
  guests_and_number_of_nights!: string;
  totalPrice!: number;
  //isNewUser: boolean = false;
  //showSelectUser: boolean = true;
  //isExistingUser: boolean = false;
  //inputWarning!: string;
  //showInputWarning!: string;
  showSuccesMessage: boolean = false;
  //showUserExistsWarning: boolean = false;
  //showWrongEmailPasswordWarning: boolean = false;
  //showInputWarning_forExistingUserForm!: string;
  

  bookFormNewUser = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('')
  });


  bookFormExistingUser = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  })

  

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
    console.log(this.cabinService.searchInputs().start_date);
    this.http.post<any>('http://localhost:3000/book',
      {
        cabin_id: this.cabinService.currentCabin?.id,
        booking_details: {check_in: this.cabinService.searchInputs().start_date,
                          check_out: this.cabinService.searchInputs().end_date
        }
      },
      {
        withCredentials: true
      }
    ).subscribe();  
  }
  // bookWithNewUser(){
    
  //   if(!this.bookFormNewUser.value.name){
  //     this.inputWarning = "Please insert a name";
  //     this.showInputWarning = 'name';
  //   }else if(!this.bookFormNewUser.value.surname){
  //     this.inputWarning = "Please insert a surname";
  //     this.showInputWarning = 'surname';
  //   }else if(!this.bookFormNewUser.value.email){
  //     this.inputWarning = "Please insert a email";
  //     this.showInputWarning = 'email';
  //   }else if(!this.bookFormNewUser.value.password){
  //     this.inputWarning = "Please insert a password";
  //     this.showInputWarning = 'password';
  //   }else{
  //     this.http.post<{message: string}>('http://localhost:3000/create/booking/newUser', 
  //       {user: {
  //               name: this.bookFormNewUser.value.name,
  //               surname: this.bookFormNewUser.value.surname,
  //               email: this.bookFormNewUser.value.email,
  //               password: this.bookFormNewUser.value.password
  //             },
  //         booking: {
  //                   cabin_id: this.data[0].id,
  //                   start_date: this.data[1][1],
  //                   end_date: this.data[1][2]
  //                  }
  //       }
  //     ).subscribe(data =>{
  //       if(data.message === "User already exists"){
  //         this.showUserExistsWarning = true;
  //       }else{
  //         this.showSelectUser = false;
  //         this.isExistingUser = false;
  //         this.isNewUser = false;
  //         this.showSuccesMessage = true;
  //         this.showInputWarning = '';
  //         this.showUserExistsWarning = false;
  //       }
  
  //     })
      
    
  //   }
  // }

  // bookWithExistingUser(){
  //     if(!this.bookFormExistingUser.value.email){
  //       this.showInputWarning_forExistingUserForm = 'email';
  //     }else if(!this.bookFormExistingUser.value.password){
  //       this.showInputWarning_forExistingUserForm = 'password';
  //     }else{
  //       this.http.post<{message: string}>('http://localhost:3000/create/booking/existingUser', 
  //         {
  //           email: this.bookFormExistingUser.value.email,
  //           password: this.bookFormExistingUser.value.password,
  //           booking: {
  //             cabin_id: this.data[0].id,
  //             start_date: this.data[1][1],
  //             end_date: this.data[1][2]
  //            }
  //         }
  //       ).subscribe(data => {
  //         if(data.message === "Wrong email or password"){
  //           this.showWrongEmailPasswordWarning = true;
  //           this.showInputWarning_forExistingUserForm = '';
  //           this.bookFormExistingUser.get('email')?.setValue('');
  //           this.bookFormExistingUser.get('password')?.setValue('');
  //         }else{
  //           this.showSelectUser = false;
  //           this.isExistingUser = false;
  //           this.isNewUser = false;
  //           this.showSuccesMessage = true;
  //           this.showInputWarning_forExistingUserForm = '';
  //         }
  //       })
       
  //     }
  // }

  closeModal(){
    this.dialogRef.close();
  }
}
