import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-geografia',
  templateUrl: './geografia.html',
  standalone: false
})
export class Geografia implements OnInit {
  tabActiva: 'destinos' | 'ajustes' = 'destinos';
  cargando = true;
  guardando = false;

  // ESTADO DE PAÍSES
  paises: any[] = [];
  nuevoPais = { nombre: '', estado: 'Activo' };
  
  // ESTADO DE CIUDADES (Dependientes de País)
  paisActivo: any = null;
  ciudades: any[] = [];
  cargandoCiudades = false;
  nuevaCiudad = { nombre: '', descripcion: '', imagen_url: '', estado: 'Activo' };

  // ESTADO DE AJUSTES E IA
  nuevoModeloIA = '';
  ajustes: any = {
    contacto_email: '',
    contacto_whatsapp: '',
    modo_mantenimiento: false,
    mensaje_anuncio: '',
    modelos_disponibles: [],
    modelo_por_defecto: '',
    mensaje_bienvenida: '' // <-- NUEVA VARIABLE
  };

  constructor(private apiService: ApiService, private toastr: ToastrService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.cargarDatosBase();
  }

  async cargarDatosBase() {
    this.cargando = true;
    try {
      const [resPaises, resAjustes] = await Promise.all([
        this.apiService.getPaises(),
        this.apiService.getAjustes()
      ]);
      this.paises = resPaises;
      
      // FIX: Aseguramos que la lista de modelos siempre sea un array válido aunque sea viejo en la BD
      this.ajustes = resAjustes;
      if (!this.ajustes.modelos_disponibles) {
        this.ajustes.modelos_disponibles = [];
      }
    } catch (error) {
      this.toastr.error("Error al cargar la información", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  cambiarTab(tab: 'destinos' | 'ajustes') {
    this.tabActiva = tab;
  }

  // ==========================
  // LÓGICA DE PAÍSES
  // ==========================
  async guardarPais() {
    if (!this.nuevoPais.nombre || this.nuevoPais.nombre.trim() === '') return;
    try {
      this.guardando = true;
      this.cdr.detectChanges();

      const payload = { nombre: this.nuevoPais.nombre.trim(), estado: 'Activo' };
      const res = await this.apiService.crearPais(payload);
      
      this.paises.unshift({ id: res.id, ...payload });
      this.nuevoPais.nombre = ''; // Limpiamos el input
      this.toastr.success("País registrado", "Éxito");
    } catch (error) {
      this.toastr.error("Hubo un error al registrar el país", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  async eliminarPais(id: string) {
    if(!window.confirm("¿Seguro que deseas eliminar este País y TODAS sus ciudades?")) return;
    try {
      await this.apiService.eliminarPais(id);
      this.paises = this.paises.filter(p => p.id !== id);
      if (this.paisActivo?.id === id) this.paisActivo = null;
      this.toastr.success("País eliminado", "Éxito");
    } catch (error) {
      this.toastr.error("Error al eliminar", "Error");
    }
  }

  // ==========================
  // LÓGICA DE CIUDADES
  // ==========================
  async seleccionarPais(p: any) {
    this.paisActivo = p;
    this.cargandoCiudades = true;
    this.cdr.detectChanges();
    try {
      this.ciudades = await this.apiService.getCiudades(p.id);
    } catch (error) {
      this.toastr.error("No se pudieron cargar las ciudades", "Error");
    } finally {
      this.cargandoCiudades = false;
      this.cdr.detectChanges();
    }
  }

  async guardarCiudad() {
    if (!this.paisActivo || !this.nuevaCiudad.nombre) return;
    try {
      this.guardando = true;
      this.cdr.detectChanges();

      const res = await this.apiService.crearCiudad(this.paisActivo.id, this.nuevaCiudad);
      this.ciudades.unshift({ id: res.id, ...this.nuevaCiudad });
      this.toastr.success("Ciudad agregada", "Éxito");
      this.nuevaCiudad = { nombre: '', descripcion: '', imagen_url: '', estado: 'Activo' };
    } catch (error) {
      this.toastr.error("Hubo un error al guardar", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  async eliminarCiudad(id: string) {
    if(!window.confirm("¿Eliminar ciudad?")) return;
    try {
      await this.apiService.eliminarCiudad(this.paisActivo.id, id);
      this.ciudades = this.ciudades.filter(c => c.id !== id);
      this.toastr.success("Ciudad eliminada", "Éxito");
    } catch (error) {
      this.toastr.error("Error al eliminar", "Error");
    }
  }

  // ==========================
  // LÓGICA DE AJUSTES E IA
  // ==========================
  agregarModelo() {
    // FIX: Doble validación por seguridad
    if (!this.ajustes.modelos_disponibles) {
      this.ajustes.modelos_disponibles = [];
    }

    const nuevo = this.nuevoModeloIA.trim();
    if (nuevo && !this.ajustes.modelos_disponibles.includes(nuevo)) {
      this.ajustes.modelos_disponibles.push(nuevo);
      this.nuevoModeloIA = '';
    }
  }

  eliminarModelo(modelo: string) {
    if (!this.ajustes.modelos_disponibles) return;
    
    this.ajustes.modelos_disponibles = this.ajustes.modelos_disponibles.filter((m: string) => m !== modelo);
    // Si eliminamos el que estaba por defecto, seleccionamos el primero (si hay)
    if (this.ajustes.modelo_por_defecto === modelo) {
      this.ajustes.modelo_por_defecto = this.ajustes.modelos_disponibles.length > 0 ? this.ajustes.modelos_disponibles[0] : '';
    }
  }

  async guardarAjustes() {
    try {
      this.guardando = true;
      this.cdr.detectChanges();

      const payload = {
        ...this.ajustes,
        modo_mantenimiento: this.ajustes.modo_mantenimiento === 'true' || this.ajustes.modo_mantenimiento === true
      };
      
      await this.apiService.actualizarAjustes(payload);
      this.toastr.success("Configuración e IAs actualizadas", "Sistema Listo");
    } catch (error) {
      this.toastr.error("Error al guardar", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }
}