import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdherentsComponent } from './pages/adherents/adherents.component';
import { SinistresComponent } from './pages/sinistres/sinistres.component';
import { SouscripteursComponent } from './pages/souscripteurs/souscripteurs.component';
import { CommonModule } from '@angular/common';
import { MultiaddComponent } from './pages/multiadd/multiadd.component';
import { MailreportsComponent } from './pages/mailreports/MailreportsComponent';
import { ValidlistComponent } from './pages/validlist/validlist.component';
import { VerifsinComponent } from './pages/verifsin/verifsin.component';
import { ParaphComponent } from './pages/paraph/paraph.component';
import { HistoParaphComponent } from './pages/paraph/histo-paraph/histo-paraph.component';
import { ContratComponent } from './pages/contrat/contrat.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  { path: 'home', component: HomeComponent, title: 'Acceuil' },
  { path: 'adherents', component: AdherentsComponent, title: 'Adhérents' },
  { path: 'adherents/:id', component: AdherentsComponent, title: 'Adhérents' },
  { path: 'sinistres', component: SinistresComponent, title: 'Sinistres' },
  { path: 'sinistres/:id', component: SinistresComponent, title: 'Sinistres' },
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
  {
    path: 'mailreports',
    component: MailreportsComponent,
    title: 'Suivi des requétes',
  },
  {
    path: 'mailreports/:id',
    component: MailreportsComponent,
    title: 'Suivi des requétes',
  },
  {
    path: 'validlist',
    component: ValidlistComponent,
    title: 'Vérif listing',
  },

  {
    path: 'verifsin',
    component: VerifsinComponent,
    title: 'Vérif Sinistres',
  },

  {
    path: 'paraph',
    component: ParaphComponent,
    title: 'Parapheur',
  },

  {
    path: 'histo_paraph',
    component: HistoParaphComponent,
    title: 'Historique parapheurs',
  },

  {
    path: 'contrat',
    component: ContratComponent,
    title: 'Contrats',
  },
];
