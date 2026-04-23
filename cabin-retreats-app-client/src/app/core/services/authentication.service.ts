import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CabinService } from './cabin.service';
import { Router } from '@angular/router';
import { map, Observable, catchError, of, take, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private http = inject(HttpClient);
  private cabinService = inject(CabinService);
  private token: { accessToken: string } | null = null;
  private router = inject(Router);
  authenticated = signal<boolean>(false);
  isLoading = signal<boolean>(true);

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
          this.authenticated.set(true);
          return true;
        }),

        catchError(err => {
          if((err.status === 401) || (err.status === 404)){
            return of(false);
          }else{
            console.log(err);
            return of(true);
          }
        })
    )
  }

  public logOut(){
    this.http.get('http://localhost:3000/logout', { withCredentials: true }).subscribe();
    this.token = null;
    this.cabinService.clearSearchInputs = true;
    this.cabinService.searchInputs.set({});
    this.authenticated.set(false);
    this.router.navigate(['/']);
  }

  public refreshToken(){
    return this.http.get('http://localhost:3000/refreshToken', { withCredentials: true });
  }

  public initializeLogin(){
    if(!document.cookie.startsWith('LoggedIn=')){
      this.isLoading.set(false);
      return of(null);
    }
    
    return this.refreshToken().pipe(
        take(1),
        tap((jwt: any) => {
          this.setAuthenticationInfo(jwt);
          this.authenticated.set(true);
          this.isLoading.set(false);
        }),
        catchError((err) => {
          console.error('Silent login on refresh failed', err);
          this.authenticated.set(false);
          this.isLoading.set(false);
          return of(null);
        }),
    )
  }

  public isLogedIn():boolean {
    if(this.token){
      return true;
    };
    return false;
  }
}
