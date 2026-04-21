import { inject, Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { AuthenticationService } from './authentication.service';
import { HttpClient } from '@angular/common/http';

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
  userId!: number | null;
  userData!: {name:string, surname:string, email:string} | null;

  decode_get_user_id(){
    const token = this.autServices.getAuthenticationInfo();
    if(token){
      const decodedToken = jwtDecode<jwtUserIdPayload>(token);
      this.userId = decodedToken.userId;
    }
    
  }

  getUserData(){
    if(this.userId){
      this.http.get<any>('http://localhost:3000/user/byId', { params: {userId: this.userId} }).subscribe(
        userInfo => {
          this.userData = userInfo;
        }
      )
    }
  }
}
