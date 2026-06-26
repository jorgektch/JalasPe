import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- 1. IMPORTANTE para los formularios (ngModel)
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing-module';
import { Admin } from './admin';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';
import { Dashboard } from './dashboard/dashboard';
import { Perfil } from './perfil/perfil'; // <-- 2. Importamos

@NgModule({
  declarations: [Admin, AdminSidebar, Dashboard, Perfil], // <-- 3. Declaramos
  imports: [
    CommonModule, 
    FormsModule, // <-- 4. Añadimos FormsModule
    AdminRoutingModule,
    RouterModule
  ],
})
export class AdminModule {}