import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';

export const httpInterceptor: HttpInterceptorFn = (req: any, next: any) => {
  const authService = inject(AuthenticationService);
  const token = authService.getAuthenticationInfo();
  const router = inject(Router);
  const dialog = inject(Dialog);
  if(token && !req.url.includes('/authenticate')){
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      }
    })
    
  }

  
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if(error.status === 401 && !req.url.includes('/authenticate') && !req.url.includes('/refreshToken')){
        console.warn("Token expired!");
        return handle401Error(req, next, authService, router, dialog);
      }
      if(error.status === 400 && req.url.includes('/book')){
        const errorCode = error.error.code;
        if(errorCode === 'UNAUTHORIZED ACCESS'){
          console.warn("Not logged in!");
          const currentUrl = router.url
          router.navigate(['/login'], {
          state: { returnUrl: currentUrl }
          });
          dialog.closeAll();
          return throwError(() => error)
        }

        if(errorCode === 'MISSING BOOKING DATA'){
          console.log('Missing Booking Data!');
          authService.logOut();
          dialog.closeAll();
        }
        
      }
      return throwError(() => error);
    })

    
  )
  

  
};


function handle401Error(req:any, next:any, authService: AuthenticationService, router: Router, dialog: Dialog){
  return authService.refreshToken().pipe(
    tap(() => console.log("Token refresh successful!")),
    switchMap((token: any) => {
      authService.setAuthenticationInfo(token);
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token.accessToken}` }
      }))
    }),
    catchError((err) => {
      if(err.status != 400){
        console.error("Refresh failed:", err);
        authService.logOut();
        dialog.closeAll();
        router.navigate(['/login']);
      }else{
        console.log('Missing Booking Data!');
        authService.logOut();
        dialog.closeAll(); 
      }
      return throwError(() => err);
    })
  )
}

