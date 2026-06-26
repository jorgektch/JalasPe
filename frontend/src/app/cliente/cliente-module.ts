import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- 1. Importamos FormsModule aquí

import { ClienteRoutingModule } from './cliente-routing-module';
import { ClienteComponent } from './cliente';
import { PlanComponent } from './plan/plan';
import { PlanesComponent } from './planes/planes';
import { SidebarComponent } from './sidebar/sidebar';
// Importamos el perfil
import { PerfilComponent } from './perfil/perfil'; 

@NgModule({
  // Lo añadimos a las declaraciones
  declarations: [ClienteComponent, PlanComponent, PlanesComponent, SidebarComponent, PerfilComponent], 
  imports: [
    CommonModule, 
    ClienteRoutingModule,
    FormsModule // <-- 2. Lo añadimos a los imports del módulo
  ],
})
export class ClienteModule {}