import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventario-operador',
  templateUrl: './inventario-operador.html',
  standalone: false
})
export class InventarioOperador implements OnInit {
  @Input() proveedorId!: string;
  
  tours: any[] = [];
  cargando = true;
  guardando = false;

  mostrarModalEliminar = false;
  itemAEliminar: string | null = null;
  eliminandoItem = false;

  nuevoTour = {
    nombre: '',
    descripcion: '',
    duracion: 'Full Day',
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
      await this.cargarTours();
    }
  }

  async cargarTours() {
    this.cargando = true;
    try {
      this.tours = await this.apiService.getTours(this.proveedorId);
    } catch (error) {
      this.toastr.error("No se pudo cargar el catálogo de tours", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardarTour(event: Event) {
    event.preventDefault();
    if (this.nuevoTour.precio <= 0) {
      this.toastr.warning("El precio debe ser mayor a 0", "Atención");
      return;
    }

    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      const res = await this.apiService.crearTour(this.proveedorId, this.nuevoTour);
      
      this.tours.push({
        id: res.id,
        ...this.nuevoTour
      });
      
      this.toastr.success("Tour agregado al catálogo", "Éxito");
      
      this.nuevoTour.nombre = '';
      this.nuevoTour.descripcion = '';
      this.nuevoTour.precio = 0;
    } catch (error) {
      this.toastr.error("No se pudo agregar el tour", "Error");
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
      
      await this.apiService.eliminarTour(this.proveedorId, this.itemAEliminar);
      this.tours = this.tours.filter(t => t.id !== this.itemAEliminar);
      this.toastr.success("Tour eliminado", "Éxito");
      this.cerrarModalEliminar();
    } catch (error) {
      this.toastr.error("Error al eliminar el tour", "Error");
    } finally {
      this.eliminandoItem = false;
      this.cdr.detectChanges();
    }
  }
}