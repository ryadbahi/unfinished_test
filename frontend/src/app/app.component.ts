import { signal, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { DefaultSidenavComponent } from './components/default-sidenav/default-sidenav.component';
import { SouscripteursComponent } from './pages/souscripteurs/souscripteurs.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatdialogComponent } from './components/matdialog/matdialog.component';
import { MultiaddComponent } from './pages/multiadd/multiadd.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    RouterModule,
    MatListModule,
    DefaultSidenavComponent,
    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    SouscripteursComponent,
    MatTableModule,
    MatdialogComponent,
    MultiaddComponent,
  ],
  template: `
    <mat-toolbar class="mat-elevation-z3" color="primary"
      ><button mat-icon-button (click)="collapsed.set(!collapsed())">
        <mat-icon>menu</mat-icon>
      </button></mat-toolbar
    >
    <mat-sidenav-container>
      <mat-sidenav opened mode="side" [style.width]="sidenavWidth()">
        <app-default-sidenav [collapsed]="collapsed()" />
      </mat-sidenav>
      <mat-sidenav-content class="content" [style.margin-left]="sidenavWidth()">
        <router-outlet></router-outlet
      ></mat-sidenav-content>
    </mat-sidenav-container>
  `,

  styles: [
    `
      mat-toolbar {
        position: relative;
        margin: -10px, -10px, -10px, -10px;
        z-index: 5;
      }
      .content {
        padding: 20px;
      }
      mat-sidenav-container {
        height: calc(100vh - 80px);
        background-color: rgba(0, 0, 0, 0.09);
        transition: all 500ms ease-in-out;
      }

      mat-sidenav,
      mat-sidenav-content {
        transition: all 500ms ease-in-out;
      }
    `,
  ],
})
export class AppComponent {
  title = 'Prime';

  collapsed = signal(true);
  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
}
