import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-geografia',
  templateUrl: './geografia.html',
  standalone: false
})
export class Geografia implements OnInit {
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

  constructor(private apiService: ApiService, private toastr: ToastrService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.cargarPaises();
  }

  async cargarPaises() {
    this.cargando = true;
    try {
      this.paises = await this.apiService.getPaises();
    } catch (error) {
      this.toastr.error("Error al cargar los países", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
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
}