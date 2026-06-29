import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventario-hospedaje',
  templateUrl: './inventario-hospedaje.html',
  standalone: false
})
export class InventarioHospedaje implements OnInit {
  @Input() proveedorId!: string;
  
  habitaciones: any[] = [];
  cargando = true;
  guardando = false;

  mostrarModalEliminar = false;
  itemAEliminar: string | null = null;
  eliminandoItem = false;

  nuevaHabitacion = {
    tipo: 'Habitación Doble',
    capacidad: 2,
    precio_noche: 0,
    amenities: 'Wifi, TV, Baño privado',
    estado: 'Disponible'
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (this.proveedorId) {
      await this.cargarHabitaciones();
    }
  }

  async cargarHabitaciones() {
    this.cargando = true;
    try {
      this.habitaciones = await this.apiService.getHabitaciones(this.proveedorId);
    } catch (error) {
      this.toastr.error("No se pudo cargar el inventario", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardarHabitacion(event: Event) {
    event.preventDefault();
    if (this.nuevaHabitacion.precio_noche <= 0) {
      this.toastr.warning("El precio debe ser mayor a 0", "Atención");
      return;
    }

    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      const res = await this.apiService.crearHabitacion(this.proveedorId, this.nuevaHabitacion);
      
      this.habitaciones.push({
        id: res.id,
        ...this.nuevaHabitacion
      });
      
      this.toastr.success("Habitación agregada al catálogo", "Éxito");
      
      this.nuevaHabitacion.precio_noche = 0;
      this.nuevaHabitacion.amenities = '';
    } catch (error) {
      this.toastr.error("No se pudo agregar la habitación", "Error");
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
      
      await this.apiService.eliminarHabitacion(this.proveedorId, this.itemAEliminar);
      this.habitaciones = this.habitaciones.filter(h => h.id !== this.itemAEliminar);
      this.toastr.success("Habitación eliminada", "Éxito");
      this.cerrarModalEliminar();
    } catch (error) {
      this.toastr.error("Error al eliminar la habitación", "Error");
    } finally {
      this.eliminandoItem = false;
      this.cdr.detectChanges();
    }
  }
}