import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Admin } from './admin';
import { Dashboard } from './dashboard/dashboard';
import { Perfil } from './perfil/perfil'; // <-- Importamos el Perfil

const routes: Routes = [
  { 
    path: '', 
    component: Admin,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'perfil', component: Perfil } // <-- Añadimos la ruta
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}