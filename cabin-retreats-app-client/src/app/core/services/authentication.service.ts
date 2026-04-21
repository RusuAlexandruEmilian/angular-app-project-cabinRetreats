import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CabinService } from './cabin.service';
import { Router } from '@angular/router';
import { map, Observable, catchError, of } from 'rxjs';

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

  public login(email: string | null, pwd: string | null, returnUrl: string):Observable<boolean>{
    return this.http.post<any>('http://localhost:3000/authenticate', {
        email: email,
        password: pwd
      },
      {
        withCredentials: true
      }
    ).pipe(
        map(data => {
          this.setAuthenticationInfo(data);
          this.router.navigateByUrl(returnUrl);
          return true;
        }),

        catchError(err => {
          if((err.status === 401) || (err.status === 404)){
            //this.wrongCredentials = true;
            return of(false);
          }else{
            console.log(err);
            return of(false);
          }
        })
      //{
      // next: (data) => {
      //     this.setAuthenticationInfo(data);
      //     this.router.navigateByUrl(returnUrl);
      //     return false;
      //   },
      //   error: (err) => {
      //     if((err.status === 401) || (err.status === 404)){
      //       //this.wrongCredentials = true;
      //       console.log('Wrong Password!');
      //       return true;
      //     }else{
      //       console.log(err);
      //       return true;
      //     }
      //   }
  //  }
  )
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
