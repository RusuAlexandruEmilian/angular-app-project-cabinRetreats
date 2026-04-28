import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { AuthenticationService } from './authentication.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environments';


interface jwtUserIdPayload extends JwtPayload {
    userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor() { }
  private http = inject(HttpClient);
  private autServices = inject(AuthenticationService);
  private apiUrl = environment.apiUrl;
  
  readonly userId = computed(() => {
    const token = this.autServices.getAuthenticationInfo();
    if(!this.autServices.authenticated() || !token) return null;

    const decodedToken = jwtDecode<jwtUserIdPayload>(token);
    return decodedToken.userId;
  });

  readonly userData = toSignal(
    toObservable(this.userId).pipe(
      switchMap(id => {
        if(!id) return of(null);
        return this.http.get<any>(`${this.apiUrl}/user/byId`, { params: {userId: id} });
      })
    ),

    {initialValue: null}
  );
}
