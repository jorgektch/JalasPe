import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.html',
  standalone: false
})
export class Proveedores implements OnInit {
  cargando = false;
  guardando = false;
  eliminando = false;
  proveedores: any[] = [];
  
  // GEOGRAFÍA DINÁMICA
  paises: any[] = [];
  ciudades: any[] = [];

  busqueda: string = '';
  categoriaFiltro: string = 'Todos';

  // CONTROL DE MODALES
  mostrarModal = false;
  mostrarModalEliminar = false;
  
  proveedorActivo: any = null;

  nuevoProveedor: any = {
    razon_social: '', nombre_comercial: '', ruc: '', categoria: 'Hospedaje',
    pais: 'Perú', ciudad: '', estado: 'Activo'
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.cargarProveedores(),
      this.cargarPaises()
    ]);
  }

  async cargarProveedores() {
    this.cargando = true;
    try {
      this.proveedores = await this.apiService.getProveedores();
    } catch (error) {
      this.toastr.error("No pudimos cargar la base de proveedores.", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cargarPaises() {
    try {
      this.paises = await this.apiService.getPaises();
      const peru = this.paises.find(p => p.nombre === 'Perú');
      if (peru) {
        this.nuevoProveedor.pais = peru.nombre;
        await this.cargarCiudades(peru.id);
      }
    } catch (error) {
      console.error("Error al cargar países", error);
    }
  }

  async cargarCiudades(paisId: string) {
    try {
      this.ciudades = await this.apiService.getCiudades(paisId);
    } catch (error) {
      this.ciudades = [];
    }
    this.cdr.detectChanges();
  }

  async onPaisCambio() {
    this.nuevoProveedor.ciudad = '';
    const pais = this.paises.find(p => p.nombre === this.nuevoProveedor.pais);
    if (pais) {
      await this.cargarCiudades(pais.id);
    } else {
      this.ciudades = [];
    }
  }

  abrirModalCrear() {
    this.nuevoProveedor = { 
      razon_social: '', nombre_comercial: '', ruc: '', categoria: 'Hospedaje', 
      pais: 'Perú', ciudad: '', estado: 'Activo' 
    };
    const peru = this.paises.find(p => p.nombre === 'Perú');
    if (peru) this.cargarCiudades(peru.id);
    
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  async guardarProveedor(event: Event) {
    event.preventDefault();
    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      const res = await this.apiService.crearProveedor(this.nuevoProveedor);
      this.proveedores.unshift({ id: res.id, ...this.nuevoProveedor });
      this.toastr.success("Proveedor registrado correctamente", "Éxito");
      
      this.cerrarModal();
    } catch (error) {
      this.toastr.error("No se pudo registrar el proveedor", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalEliminar(p: any) {
    this.proveedorActivo = p;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.proveedorActivo = null;
  }

  async confirmarEliminar() {
    try {
      this.eliminando = true;
      this.cdr.detectChanges();
      
      await this.apiService.eliminarProveedor(this.proveedorActivo.id);
      
      this.proveedores = this.proveedores.filter(p => p.id !== this.proveedorActivo.id);
      this.toastr.success("Proveedor eliminado permanentemente", "Éxito");
      this.cerrarModalEliminar();
    } catch(error) {
      this.toastr.error("Error al eliminar el proveedor", "Error");
    } finally {
      this.eliminando = false;
      this.cdr.detectChanges();
    }
  }

  verDetalles(proveedorId: string) {
    this.router.navigate(['/admin/proveedores', proveedorId]);
  }

  // Función segura para obtener la inicial del proveedor
  obtenerInicial(nombre: any): string {
    if (!nombre || typeof nombre !== 'string') return 'P'; // 'P' de Proveedor por defecto
    return nombre.charAt(0).toUpperCase();
  }

  get proveedoresFiltrados() {
    if (!this.proveedores) return [];
    const termino = (this.busqueda || '').toLowerCase();

    return this.proveedores.filter(p => {
      // Blindaje contra datos nulos o undefined
      const nombre = (p.nombre_comercial || '').toLowerCase();
      const razon = (p.razon_social || '').toLowerCase();
      const ruc = String(p.ruc || '').toLowerCase(); // String() por si el RUC se guardó como número

      const coincideTexto = nombre.includes(termino) || 
                            razon.includes(termino) ||
                            ruc.includes(termino);
                            
      const coincideCategoria = this.categoriaFiltro === 'Todos' || p.categoria === this.categoriaFiltro;
      
      return coincideTexto && coincideCategoria;
    });
  }
}