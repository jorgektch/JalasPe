import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteComponent } from './cliente';
import { PlanComponent } from './plan/plan';
import { PlanesComponent } from './planes/planes';
import { PerfilComponent } from './perfil/perfil'; 
// NUEVOS COMPONENTES
import { ViajesComponent } from './viajes/viajes';
import { ViajeDetalleComponent } from './viajes/viaje-detalle/viaje-detalle';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ClienteComponent },
  { path: 'plan/:id', component: PlanComponent },
  { path: 'planes', component: PlanesComponent },
  { path: 'perfil', component: PerfilComponent },
  
  // NUEVAS RUTAS DE VIAJES
  { path: 'viajes', component: ViajesComponent },
  { path: 'viaje/:id', component: ViajeDetalleComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }