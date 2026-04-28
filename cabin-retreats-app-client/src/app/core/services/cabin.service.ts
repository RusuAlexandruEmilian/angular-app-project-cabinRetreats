import { Injectable } from '@angular/core';
import { inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Cabin } from '../models/cabin';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class CabinService {

  constructor() { }
  private http = inject(HttpClient);

  private _cabins = signal<Cabin[]>([]);
  public cabins = this._cabins.asReadonly();
  public searchInputs = signal<{start_date?: string, end_date?: string, destination?: string, pets?: number, nr_adults?: string,  nr_children?: string}>({});
  public clearSearchInputs: boolean = true;
  public currentCabin!: Cabin | null;
  private apiUrl = environment.apiUrl;


  getAvailableCabins(searchParameters: {start_date: string, end_date: string, destination: string, pets: number, nr_adults: string,  nr_children: string})
  {
    this.searchInputs.set(searchParameters);
    this.http.get<Cabin[]>(`${this.apiUrl}/api/cabins/availability`, { params: searchParameters }).subscribe(data => {
      this._cabins.set(data);
    })  
  }

  getAllCabins(){
    this.searchInputs.set({});
    this.http.get<Cabin[]>(`${this.apiUrl}/`).subscribe(data => {
      this._cabins.set(data);
    })  
  }


}
