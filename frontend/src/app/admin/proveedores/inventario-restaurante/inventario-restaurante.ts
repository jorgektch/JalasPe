import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventario-restaurante',
  templateUrl: './inventario-restaurante.html',
  standalone: false
})
export class InventarioRestaurante implements OnInit {
  @Input() proveedorId!: string;
  
  platos: any[] = [];
  cargando = true;
  guardando = false;

  mostrarModalEliminar = false;
  itemAEliminar: string | null = null;
  eliminandoItem = false;

  nuevoPlato = {
    nombre: '',
    descripcion: '',
    categoria: 'Plato de Fondo',
    precio: 0,
    estado: 'Disponible'
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (this.proveedorId) {
      await this.cargarPlatos();
    }
  }

  async cargarPlatos() {
    this.cargando = true;
    try {
      this.platos = await this.apiService.getPlatos(this.proveedorId);
    } catch (error) {
      this.toastr.error("No se pudo cargar la carta", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardarPlato(event: Event) {
    event.preventDefault();
    if (this.nuevoPlato.precio <= 0) {
      this.toastr.warning("El precio debe ser mayor a 0", "Atención");
      return;
    }

    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      const res = await this.apiService.crearPlato(this.proveedorId, this.nuevoPlato);
      
      this.platos.push({
        id: res.id,
        ...this.nuevoPlato
      });
      
      this.toastr.success("Plato agregado a la carta", "Éxito");
      
      this.nuevoPlato.nombre = '';
      this.nuevoPlato.descripcion = '';
      this.nuevoPlato.precio = 0;
    } catch (error) {
      this.toastr.error("No se pudo agregar el plato", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalEliminar(id: string) {
    this.itemAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.itemAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  async confirmarEliminacion() {
    if (!this.itemAEliminar) return;
    try {
      this.eliminandoItem = true;
      this.cdr.detectChanges();
      
      await this.apiService.eliminarPlato(this.proveedorId, this.itemAEliminar);
      this.platos = this.platos.filter(p => p.id !== this.itemAEliminar);
      this.toastr.success("Plato eliminado", "Éxito");
      this.cerrarModalEliminar();
    } catch (error) {
      this.toastr.error("Error al eliminar el plato", "Error");
    } finally {
      this.eliminandoItem = false;
      this.cdr.detectChanges();
    }
  }
}