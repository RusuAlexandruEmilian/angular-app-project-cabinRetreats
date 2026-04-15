import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CabinService } from './cabin.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private http = inject(HttpClient);
  private cabinService = inject(CabinService);
  private token: { accessToken: string } | null = null;
  private router = inject(Router);

  public getAuthenticationInfo(){
    return this.token?.accessToken;
  };

  public setAuthenticationInfo(accessToken: {accessToken: string}){
    this.token = accessToken;
  };

  public clearAuthenticationInfo(){
    this.token = null;
  }

  public logOut(){
    this.http.get('http://localhost:3000/logout', { withCredentials: true }).subscribe();
    this.token = null;
    this.cabinService.clearSearchInputs = true;
    this.cabinService.searchInputs.set({});
    this.router.navigate(['/']);
  }

  public refreshToken(){
    return this.http.get('http://localhost:3000/refreshToken', { withCredentials: true });
  }

  public isLogedIn():boolean {
    if(this.token){
      return true;
    };
    return false;
  }
}
