import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import 'moment/locale/fr';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from './date-adapter';
import { MatTableModule } from '@angular/material/table';
import { NgxSpinnerModule } from 'ngx-spinner';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DDMMYYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },

    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    BrowserAnimationsModule,
    provideAnimations(),
    provideHttpClient(),
    DatePipe,
    MatTableModule,
    NgxSpinnerModule,
    DecimalPipe,
  ],
};
