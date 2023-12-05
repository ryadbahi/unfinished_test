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
  template: `<div class="sidenav-header">
      <img
        [width]="profilePicSize()"
        [height]="profilePicSize()"
        src="assets/prime.jpg"
      />
      <div class="header-text" [class.hide-header-text]="sideNavCollapsed()">
        <h2>Menu</h2>
        <p>Bienvenue</p>
      </div>
    </div>
    <mat-nav-list>
      <a
        mat-list-item
        *ngFor="let item of menuItems()"
        [routerLink]="item.route"
        routerLinkActive="selected-menu-item"
        #rla="routerLinkActive"
        [activated]="rla.isActive"
      >
        <mat-icon
          [fontSet]="
            rla.isActive ? 'material-icons' : 'material-icons-outlined'
          "
          matListItemIcon
          >{{ item.icon }}</mat-icon
        >
        <span matListItemTitle *ngIf="!sideNavCollapsed()">{{
          item.label
        }}</span>
      </a>
    </mat-nav-list> `,
  styles: [
    `
      :host * {
        transition: all 500ms ease-in-out;
      }
      .sidenav-header {
        padding-top: 24px;
        text-align: center;

        > img {
          border-radius: 100%;
          object-fit: cover;
          margin-bottom: 10px;
        }

        .header-text {
          height: 3rem;
          > h2 {
            margin: 0;
            font-size: 1rem;
            line-height: 1.5rem;
          }
          > p {
            margin: 0;
            font-size: 0.8rem;
          }
        }
        .hide-header-text {
          opacity: 0;
          height: 0px !important;
        }
      }

      .selected-menu-item {
        border-left: 5px solid;
        border-left-color: #9c27b0;
        transition: all 175ms ease-in-out;
        background: rgba(0, 0, 0, 0.05);
      }
    `,
  ],
})
export class DefaultSidenavComponent {
  sideNavCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }
  profilePicSize = computed(() => (this.sideNavCollapsed() ? '50' : '130'));

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
  ]);
}
