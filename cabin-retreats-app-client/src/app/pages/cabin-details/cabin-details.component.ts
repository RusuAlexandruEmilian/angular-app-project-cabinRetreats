import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Cabin } from '../../core/models/cabin';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { ReserveFormComponent } from '../../shared/reserve-form/reserve-form.component';
import { CabinStarRatingComponent } from '../../shared/cabin-star-rating/cabin-star-rating.component';
import { UserReviewCardComponent } from '../../shared/user-review-card/user-review-card.component';
import { Review } from '../../core/models/review';
import { CabinImageGalleryComponent } from '../../shared/cabin-image-gallery/cabin-image-gallery.component';
import { ReviewFormComponent } from '../../shared/review-form/review-form.component';
import { CabinService } from '../../core/services/cabin.service';





@Component({
  selector: 'app-cabin-details',
  standalone: true,
  imports: [RouterModule, CommonModule, CabinStarRatingComponent, UserReviewCardComponent],
  templateUrl: './cabin-details.component.html',
  styleUrl: './cabin-details.component.scss'
})
export class CabinDetailsComponent implements OnInit{
  private dialog = inject(Dialog);
  private cabinServices = inject(CabinService);
  
  cabin!: Cabin | null;
  dataForReserveForm: any;
  isNoDatesWarning!: boolean;
  reviews$!: Observable<Review[]>;
  numberOfReviews!: number | null;
 
  
  
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private http: HttpClient){
    //this.cabinId = this.router.getCurrentNavigation()?.extras?.state?.['data'][0];
    //this.dataForReserveForm = this.router.getCurrentNavigation()?.extras?.state?.['data'];
  }
 
  ngOnInit(){
    //this.getCabinById();
    //this.isNoDatesWarning = false;
    this.cabin = this.cabinServices.currentCabin;
    this.isNoDatesWarning = false;
    this.getReviews();
  }
  

  protected openReserveForm(){
    if(this.cabin && Object.keys(this.cabinServices.searchInputs()).length > 0){
        this.dialog.open(ReserveFormComponent, { autoFocus: false, disableClose: true, panelClass: 'reserve-dialog'});
    }else{
      this.isNoDatesWarning = true;
    }
  };

  getReviews(){
    if(this.cabin){
      this.reviews$ = this.http.get<Review[]>(`http://localhost:3000/cabin/reviews?cabin_id=${this.cabin.id}`);
      this.reviews$.subscribe(data => {
        this.numberOfReviews = data.length;
      })
    }
  }
  
  protected openImageGallery(){
    if(this.cabin){
      this.dialog.open(CabinImageGalleryComponent, { autoFocus: false, disableClose: true, data: this.cabin.picture});
    }
    
  };

  protected openReviewForm(){

    
    this.dialog.open(ReviewFormComponent, { autoFocus: false, disableClose: true });
    
    
    this.dialog.afterAllClosed.subscribe(() => {
      this.getReviews();
    });
  }
  
  console(){
    console.log(this.cabin?.id);
    console.log(this.cabinServices.searchInputs());
    console.log(this.cabinServices.currentCabin);
  }

}
