import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteComponent } from './cliente';
import { PlanComponent } from './plan/plan';
import { PlanesComponent } from './planes/planes';
// Importamos el nuevo componente
import { PerfilComponent } from './perfil/perfil'; 

const routes: Routes = [
  { path: '', component: ClienteComponent },
  { path: 'plan', component: PlanComponent },
  { path: 'planes', component: PlanesComponent },
  { path: 'perfil', component: PerfilComponent } // Nueva ruta
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }