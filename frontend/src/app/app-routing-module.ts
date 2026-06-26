import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { AdminGuard } from './auth/guards/admin.guard'; // <-- 1. Importamos el guardián

const routes: Routes = [
  { path: '', component: Landing }, 
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin-module').then((m) => m.AdminModule),
    canActivate: [AdminGuard] // <-- 2. Le asignamos el guardián a toda la zona admin
  },
  {
    path: 'app',
    loadChildren: () => import('./cliente/cliente-module').then((m) => m.ClienteModule),
  },
  { path: 'auth', loadChildren: () => import('./auth/auth-module').then((m) => m.AuthModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled' 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }