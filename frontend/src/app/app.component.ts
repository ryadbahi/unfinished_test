import { signal, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';

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

import { CdkDrag } from '@angular/cdk/drag-drop';

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

    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    SouscripteursComponent,
    MatTableModule,

    CdkDrag,
  ],
  templateUrl: './app.component.html',

  styleUrl: './app.component.scss',
})
export class AppComponent {
  collapsed = signal(true);
  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
}
