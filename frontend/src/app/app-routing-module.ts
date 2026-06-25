import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing } from './landing/landing';

const routes: Routes = [
  { path: '', component: Landing }, // La raíz muestra el Landing
  { path: 'admin', loadChildren: () => import('./admin/admin-module').then((m) => m.AdminModule) },
  {
    path: 'app',
    loadChildren: () => import('./cliente/cliente-module').then((m) => m.ClienteModule),
  },
  { path: 'auth', loadChildren: () => import('./auth/auth-module').then((m) => m.AuthModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled' // Importante para que el smooth scroll funcione
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

