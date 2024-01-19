import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideToastr } from 'ngx-toastr';
import { MatTableModule } from '@angular/material/table';

import { NgxSpinnerModule } from 'ngx-spinner';
registerLocaleData(localeFr, 'fr');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
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
    NgxSpinnerModule,
  ],
};
