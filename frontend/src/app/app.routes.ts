import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'Auth',
  },

  {
    path: 'Auth',
    loadComponent: () =>
      import('./authent/authent.component').then((m) => m.AuthentComponent),
    data: { title: 'Login' },
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    data: { title: 'Acceuil' },
  },
  {
    path: 'adherents',
    loadComponent: () =>
      import('./pages/adherents/adherents.component').then(
        (m) => m.AdherentsComponent
      ),
    data: { title: 'Adhérents' },
  },
  {
    path: 'sinistres',
    loadComponent: () =>
      import('./pages/sinistres/sinistres.component').then(
        (m) => m.SinistresComponent
      ),
    data: { title: 'Sinistres' },
  },
  {
    path: 'souscripteurs',
    loadComponent: () =>
      import('./pages/souscripteurs/souscripteurs.component').then(
        (m) => m.SouscripteursComponent
      ),
    data: { title: 'Souscripteurs' },
  },
  {
    path: 'mailreports',
    loadComponent: () =>
      import('./pages/mailreports/MailreportsComponent').then(
        (m) => m.MailreportsComponent
      ),
    data: { title: 'Suivi des requétes' },
  },
  {
    path: 'validlist',
    loadComponent: () =>
      import('./pages/validlist/validlist.component').then(
        (m) => m.ValidlistComponent
      ),
    data: { title: 'Vérif listing' },
  },
  {
    path: 'verifsin',
    loadComponent: () =>
      import('./pages/verifsin/verifsin.component').then(
        (m) => m.VerifsinComponent
      ),
    data: { title: 'Vérif Sinistres' },
  },
  {
    path: 'paraph',
    loadComponent: () =>
      import('./pages/paraph/paraph.component').then((m) => m.ParaphComponent),
    data: { title: 'Parapheur' },
  },
  {
    path: 'contrat',
    loadComponent: () =>
      import('./pages/contrat/contrat.component').then(
        (m) => m.ContratComponent
      ),
    data: { title: 'Contrats' },
  },
  {
    path: 'tyc',
    loadComponent: () =>
      import('./pages/tyc/tyc.component').then((m) => m.TycComponent),
    data: { title: 'Conso sur 2 ans' },
  },
  { path: '**', redirectTo: 'home' }, // wildcard route
];
