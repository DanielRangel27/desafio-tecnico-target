import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Apresentação | Desafio Target',
    loadComponent: () => import('./pages/apresentacao/apresentacao').then(m => m.Apresentacao)
  },
  {
    path: 'desafio-1',
    title: 'Desafio 1 · Comissões | Desafio Target',
    loadComponent: () => import('./pages/desafio1/desafio1').then(m => m.Desafio1)
  },
  {
    path: 'desafio-2',
    title: 'Desafio 2 · Estoque | Desafio Target',
    loadComponent: () => import('./pages/desafio2/desafio2').then(m => m.Desafio2)
  },
  {
    path: 'desafio-3',
    title: 'Desafio 3 · Juros | Desafio Target',
    loadComponent: () => import('./pages/desafio3/desafio3').then(m => m.Desafio3)
  },
  {
    path: 'codigo',
    title: 'Código-fonte | Desafio Target',
    loadComponent: () => import('./pages/codigo/codigo').then(m => m.Codigo)
  },
  { path: '**', redirectTo: '' }
];
