import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdherentsComponent } from './pages/adherents/adherents.component';
import { SinistresComponent } from './pages/sinistres/sinistres.component';
import { SouscripteursComponent } from './pages/souscripteurs/souscripteurs.component';
import { CommonModule } from '@angular/common';
import { MultiaddComponent } from './pages/multiadd/multiadd.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  { path: 'home', component: HomeComponent, title: 'Acceuil' },
  { path: 'adherents', component: AdherentsComponent, title: 'Adhérents' },
  { path: 'sinistres', component: SinistresComponent, title: 'Sinistres' },
  { path: 'multiadd', component: MultiaddComponent, title: 'Ajout Multiple' },
  {
    path: 'souscripteurs',
    component: SouscripteursComponent,
    title: 'Souscripteurs',
  },
  {
    path: 'souscripteurs/:id',
    component: SouscripteursComponent,
    title: 'Souscripteurs',
  },
];
