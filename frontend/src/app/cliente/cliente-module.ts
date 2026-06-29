import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

import { ClienteRoutingModule } from './cliente-routing-module';
import { ClienteComponent } from './cliente';
import { PlanComponent } from './plan/plan';
import { PlanesComponent } from './planes/planes';
import { SidebarComponent } from './sidebar/sidebar';
import { PerfilComponent } from './perfil/perfil'; 

// NUEVOS COMPONENTES (Nombres exactos)
import { ViajesComponent } from './viajes/viajes';
import { ViajeDetalleComponent } from './viajes/viaje-detalle/viaje-detalle';

@NgModule({
  declarations: [
    ClienteComponent, 
    PlanComponent, 
    PlanesComponent, 
    SidebarComponent, 
    PerfilComponent,
    ViajesComponent,
    ViajeDetalleComponent
  ], 
  imports: [
    CommonModule, 
    ClienteRoutingModule,
    FormsModule
  ],
})
export class ClienteModule {}