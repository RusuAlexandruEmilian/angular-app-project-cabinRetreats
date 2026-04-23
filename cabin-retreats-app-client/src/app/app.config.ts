import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './core/services/http.interceptor';
import { AuthenticationService } from './core/services/authentication.service';

function intialize_login(authService: AuthenticationService){
  return () => authService.initializeLogin();
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideClientHydration(), provideHttpClient(withInterceptors([httpInterceptor])),
  {
      provide: APP_INITIALIZER,
      useFactory: intialize_login,
      deps: [AuthenticationService],
      multi: true,
    }
]
};
