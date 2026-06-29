import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Admin } from './admin';
import { Dashboard } from './dashboard/dashboard';
import { Perfil } from './perfil/perfil'; 
import { Proveedores } from './proveedores/proveedores';
import { ProveedorDetalle } from './proveedores/proveedor-detalle/proveedor-detalle';
import { Usuarios } from './usuarios/usuarios'; 
import { Geografia } from './geografia/geografia';
import { Configuracion } from './configuracion/configuracion'; // <-- NUEVO

const routes: Routes = [
  { 
    path: '', 
    component: Admin,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'perfil', component: Perfil },
      { path: 'proveedores', component: Proveedores },
      { path: 'proveedores/:id', component: ProveedorDetalle },
      { path: 'usuarios', component: Usuarios },
      { path: 'cobertura', component: Geografia },       // <-- RUTA CAMBIADA
      { path: 'configuracion', component: Configuracion } // <-- NUEVA RUTA
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}