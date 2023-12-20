import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    BrowserAnimationsModule,
    provideAnimations(),
    provideHttpClient(),
    DatePipe,
    provideToastr({
      positionClass: 'toast-bottom-center',
      timeOut: 999999,
      tapToDismiss: true,
      maxOpened: 1,
      autoDismiss: true,
    }),
  ],
};
