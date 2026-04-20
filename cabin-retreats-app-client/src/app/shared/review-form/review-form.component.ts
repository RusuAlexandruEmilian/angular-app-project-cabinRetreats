import { Component, ElementRef, EventEmitter, inject, Inject, Output, ViewChild } from '@angular/core';
import { ReviewFormStarRatingComponent } from '../review-form-star-rating/review-form-star-rating.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CabinService } from '../../core/services/cabin.service';
import { Cabin } from '../../core/models/cabin';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [ReviewFormStarRatingComponent, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss'
})
export class ReviewFormComponent {

  

  @ViewChild('reviewFormContainer') reviewFormContainer!: ElementRef;

  private dialogRef = inject(DialogRef);
  private http = inject(HttpClient);
  private cabinService = inject(CabinService);
  rating!: number;
  cabin!: Cabin | null;
  showReviewForm:boolean = true;
  showSubmitMessage: boolean = false;
  submitMessageImg!: string;
  submitMessage!: string;
  submitMessageRed: boolean = false;

  reviewForm = new FormGroup({
    review: new FormControl('')
  })

  ngOnInit(){
    this.cabin = this.cabinService.currentCabin;
  }

  closeModal(){
    this.dialogRef.close();
  }

  createReview(){
    if(!this.rating) this.rating = 1;
    if(this.cabin){
      this.http.post<{message: string}>('http://localhost:3000/create/review', {
        cabinId: this.cabin.id,
        review: this.reviewForm.value.review, 
        rating: this.rating }).subscribe(
            message => {
              console.log(message);
            if(message.message === "BOOKING AND REVIEW FOUND"){
              this.showSubmitMessage = true;
              this.showReviewForm = false;
              this.submitMessage = "You have already reviewed this location";
              this.submitMessageImg = "assets/icons/exclamation.png";
              this.submitMessageRed = true;
            }else if(message.message === "NO BOOKING FOUND"){
              this.showSubmitMessage = true;
              this.showReviewForm = false;
              this.submitMessage = "You haven't made a booking for this location yet";
              this.submitMessageImg = "assets/icons/exclamation.png";
              this.submitMessageRed = true;
            }
          }
        );
    
    
      }
    }
}
