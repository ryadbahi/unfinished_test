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
import { MatTableModule } from '@angular/material/table';
import { MAT_DATE_LOCALE } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
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
    MatTableModule,
  ],
};
