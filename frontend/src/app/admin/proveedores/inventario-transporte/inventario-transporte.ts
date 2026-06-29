import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventario-transporte',
  templateUrl: './inventario-transporte.html',
  standalone: false
})
export class InventarioTransporte implements OnInit {
  @Input() proveedorId!: string;
  
  rutas: any[] = [];
  ciudadesGlobales: string[] = [];
  
  cargando = true;
  guardando = false;

  mostrarModalEliminar = false;
  itemAEliminar: string | null = null;
  eliminandoItem = false;

  // NUEVO: Se agregó fecha_salida
  nuevaRuta = {
    origen: '', destino: '', fecha_salida: '', hora_salida: '', tipo_vehiculo: 'Bus Cama',
    precio: 0, estado: 'Activo'
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (this.proveedorId) {
      await Promise.all([
        this.cargarRutas(),
        this.cargarCiudadesGlobales()
      ]);
    }
  }

  async cargarCiudadesGlobales() {
    try {
      const paises = await this.apiService.getPaises();
      const promesas = paises.map(p => this.apiService.getCiudades(p.id));
      const resultados = await Promise.all(promesas);
      this.ciudadesGlobales = resultados.flat().map(c => c.nombre).sort();
    } catch (error) {
      console.error("Error al cargar listado global de ciudades", error);
    }
  }

  async cargarRutas() {
    this.cargando = true;
    try {
      this.rutas = await this.apiService.getRutas(this.proveedorId);
    } catch (error) {
      this.toastr.error("No se pudo cargar el inventario de rutas", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardarRuta(event: Event) {
    event.preventDefault();
    if (this.nuevaRuta.precio <= 0) {
      this.toastr.warning("El precio debe ser mayor a 0", "Atención");
      return;
    }
    if (this.nuevaRuta.origen === this.nuevaRuta.destino) {
      this.toastr.warning("El origen y destino no pueden ser iguales", "Atención");
      return;
    }

    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      const res = await this.apiService.crearRuta(this.proveedorId, this.nuevaRuta);
      this.rutas.push({ id: res.id, ...this.nuevaRuta });
      this.toastr.success("Ruta agregada al catálogo", "Éxito");
      
      // Limpiar formulario incluyendo fecha
      this.nuevaRuta.origen = '';
      this.nuevaRuta.destino = '';
      this.nuevaRuta.fecha_salida = '';
      this.nuevaRuta.hora_salida = '';
      this.nuevaRuta.precio = 0;
    } catch (error) {
      this.toastr.error("No se pudo agregar la ruta", "Error");
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
      await this.apiService.eliminarRuta(this.proveedorId, this.itemAEliminar);
      this.rutas = this.rutas.filter(r => r.id !== this.itemAEliminar);
      this.toastr.success("Ruta eliminada", "Éxito");
      this.cerrarModalEliminar();
    } catch (error) {
      this.toastr.error("Error al eliminar la ruta", "Error");
    } finally {
      this.eliminandoItem = false;
      this.cdr.detectChanges();
    }
  }
}