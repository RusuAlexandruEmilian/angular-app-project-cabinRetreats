import { Injectable, inject } from '@angular/core';
import { CabinService } from './cabin.service';
@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }
  private cabinService = inject(CabinService);

  refreshHomePage(){
    this.cabinService.clearSearchInputs = true;
    this.cabinService.getAllCabins();
  }
}
