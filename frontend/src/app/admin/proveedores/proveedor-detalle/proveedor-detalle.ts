import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-proveedor-detalle',
  templateUrl: './proveedor-detalle.html',
  standalone: false
})
export class ProveedorDetalle implements OnInit {
  proveedorId: string = '';
  cargando = true;
  guardando = false;
  eliminando = false;
  
  proveedor: any = null;
  mostrarModalEliminar = false;
  
  // NUEVO: Agregada la pestaña 'api'
  tabActiva: 'general' | 'inventario' | 'api' = 'general';

  // GEOGRAFÍA DINÁMICA
  paises: any[] = [];
  ciudades: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.proveedorId = this.route.snapshot.paramMap.get('id') || '';
    if (this.proveedorId) {
      await this.cargarDatosIniciales();
    } else {
      this.volver();
    }
  }

  async cargarDatosIniciales() {
    try {
      this.cargando = true;
      this.paises = await this.apiService.getPaises();
      this.proveedor = await this.apiService.getProveedor(this.proveedorId);
      
      if (!this.proveedor.pais) this.proveedor.pais = 'Perú';
      
      // NUEVO: Inicializar configuración API si no existe
      if (!this.proveedor.api_config) {
        this.proveedor.api_config = {
          url_base: '',
          url_docs: '',
          ambiente: 'Sandbox',
          estado_api: 'Inactivo',
          tipo_auth: 'API Key',
          credencial_nombre: '',
          credencial_valor: '',
          cifrado: true,
          fecha_creacion: null,
          fecha_actualizacion: null
        };
      }
      
      const paisActual = this.paises.find(p => p.nombre === this.proveedor.pais);
      if (paisActual) {
        this.ciudades = await this.apiService.getCiudades(paisActual.id);
      }
    } catch (error) {
      this.toastr.error("El proveedor no existe o fue eliminado", "Error 404");
      this.volver();
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async onPaisCambio() {
    this.proveedor.ciudad = '';
    const pais = this.paises.find(p => p.nombre === this.proveedor.pais);
    if (pais) {
      this.ciudades = await this.apiService.getCiudades(pais.id);
    } else {
      this.ciudades = [];
    }
    this.cdr.detectChanges();
  }

  cambiarTab(tab: 'general' | 'inventario' | 'api') {
    this.tabActiva = tab;
  }

  volver() {
    this.router.navigate(['/admin/proveedores']);
  }

  async guardarCambios(event: Event) {
    event.preventDefault();
    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      // Manejo de Fechas para la API
      if (this.tabActiva === 'api') {
        const timestamp = new Date().toISOString();
        if (!this.proveedor.api_config.fecha_creacion) {
          this.proveedor.api_config.fecha_creacion = timestamp;
        }
        this.proveedor.api_config.fecha_actualizacion = timestamp;
      }
      
      await this.apiService.actualizarProveedor(this.proveedorId, {
        razon_social: this.proveedor.razon_social,
        nombre_comercial: this.proveedor.nombre_comercial,
        ruc: this.proveedor.ruc,
        categoria: this.proveedor.categoria,
        estado: this.proveedor.estado,
        pais: this.proveedor.pais,     
        ciudad: this.proveedor.ciudad, 
        api_config: this.proveedor.api_config // NUEVO
      });
      
      this.toastr.success("Información actualizada correctamente", "Éxito");
    } catch (error) {
      this.toastr.error("No se pudieron guardar los cambios", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalEliminar() { this.mostrarModalEliminar = true; }
  cerrarModalEliminar() { this.mostrarModalEliminar = false; }

  async confirmarEliminar() {
    try {
      this.eliminando = true;
      this.cdr.detectChanges();
      await this.apiService.eliminarProveedor(this.proveedorId);
      this.toastr.success("Proveedor eliminado del directorio", "Adiós");
      this.cerrarModalEliminar();
      this.volver(); 
    } catch (error) {
      this.toastr.error("Hubo un problema al eliminar", "Error");
      this.eliminando = false;
      this.cdr.detectChanges();
    }
  }

  get nombreInventario(): string {
    if (!this.proveedor) return 'Inventario / Catálogo';
    switch (this.proveedor.categoria) {
      case 'Hospedaje': return 'Gestión de Habitaciones';
      case 'Transporte': return 'Rutas y Salidas';
      case 'Restaurante': return 'Carta y Zonas';
      case 'Operador': return 'Paquetes Turísticos';
      default: return 'Inventario y Servicios';
    }
  }
}