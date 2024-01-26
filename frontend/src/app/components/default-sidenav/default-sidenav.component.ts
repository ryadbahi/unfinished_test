import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule, RouterLinkActive } from '@angular/router';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
};

@Component({
  selector: 'app-default-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './default-sidenav.component.html',

  styleUrl: './default-sidenav.component.scss',
})
export class DefaultSidenavComponent {
  sideNavCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  menuItems = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Home',
      route: 'home',
    },
    {
      icon: 'work',
      label: 'Souscripteurs',
      route: 'souscripteurs',
    },
    {
      icon: 'person',
      label: 'Adhérents',
      route: 'adherents',
    },
    {
      icon: 'local_hospital',
      label: 'Sinistres',
      route: 'sinistres',
    },
    {
      icon: 'cloud_upload',
      label: 'Ajout Multiple',
      route: 'multiadd',
    },

    {
      icon: 'email',
      label: 'Suivi des requétes',
      route: 'mailreports',
    },

    {
      icon: 'table_chart',
      label: 'Vérif listing',
      route: 'validlist',
    },
    {
      icon: 'local_hospital',
      label: 'Vérif Dpt Sinistre',
      route: 'verifsin',
    },

    {
      icon: 'book',
      label: 'Parapheur',
      route: 'paraph',
    },
  ]);
}
