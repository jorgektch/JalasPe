import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing-module';
import { Admin } from './admin';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';
import { Dashboard } from './dashboard/dashboard';
import { Perfil } from './perfil/perfil';
import { Proveedores } from './proveedores/proveedores';
import { ProveedorDetalle } from './proveedores/proveedor-detalle/proveedor-detalle';
import { InventarioHospedaje } from './proveedores/inventario-hospedaje/inventario-hospedaje';
import { InventarioTransporte } from './proveedores/inventario-transporte/inventario-transporte';
import { InventarioRestaurante } from './proveedores/inventario-restaurante/inventario-restaurante';
import { InventarioOperador } from './proveedores/inventario-operador/inventario-operador';
import { Usuarios } from './usuarios/usuarios';
import { Geografia } from './geografia/geografia';
import { Configuracion } from './configuracion/configuracion'; // <-- NUEVO

@NgModule({
  declarations: [
    Admin,
    AdminSidebar,
    Dashboard,
    Perfil,
    Proveedores,
    ProveedorDetalle,
    InventarioHospedaje,
    InventarioTransporte,
    InventarioRestaurante,
    InventarioOperador,
    Usuarios,
    Geografia,
    Configuracion // <-- NUEVO
  ],
  imports: [CommonModule, FormsModule, AdminRoutingModule, RouterModule],
})
export class AdminModule {}