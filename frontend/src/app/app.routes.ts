import { Routes } from '@angular/router';
import { PostComponent } from './post/post.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  { path: 'post', component: PostComponent },
  { path: 'home', component: HomeComponent },
];
