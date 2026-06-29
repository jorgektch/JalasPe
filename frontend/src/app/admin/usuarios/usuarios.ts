import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  standalone: false
})
export class Usuarios implements OnInit {
  tabActiva: 'usuarios' | 'planes' = 'usuarios';
  
  usuarios: any[] = [];
  planes: any[] = [];
  cargando = true;
  guardando = false;
  eliminando = false;

  // Variables de Modal (Usuarios)
  mostrarModalEditarUsuario = false;
  mostrarModalEliminarUsuario = false;
  usuarioActivo: any = null;

  // Variables de Modal (Planes)
  mostrarModalEditarPlan = false;
  mostrarModalEliminarPlan = false;
  planActivo: any = null;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const [resUsuarios, resPlanes] = await Promise.all([
        this.apiService.getTodosUsuarios(),
        this.apiService.getTodosPlanes()
      ]);
      this.usuarios = resUsuarios;
      this.planes = resPlanes;
    } catch (error) {
      this.toastr.error("Error al cargar la base de datos", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  cambiarTab(tab: 'usuarios' | 'planes') {
    this.tabActiva = tab;
  }

  obtenerEmailUsuario(uid: string): string {
    const usuario = this.usuarios.find(u => u.uid === uid);
    return usuario ? usuario.email : 'Usuario Desconocido';
  }

  // ==========================
  // MÉTODOS DE USUARIO
  // ==========================
  abrirModalEditarUsuario(u: any) {
    this.usuarioActivo = { ...u }; 
    this.mostrarModalEditarUsuario = true;
  }

  cerrarModalEditarUsuario() {
    this.mostrarModalEditarUsuario = false;
    this.usuarioActivo = null;
  }

  async guardarUsuario(event: Event) {
    event.preventDefault();
    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      const payload = {
        nombres: this.usuarioActivo.nombres,
        apellido_paterno: this.usuarioActivo.apellido_paterno,
        apellido_materno: this.usuarioActivo.apellido_materno,
        username: this.usuarioActivo.username,
        fecha_nacimiento: this.usuarioActivo.fecha_nacimiento,
        celular: this.usuarioActivo.celular,
        pais: this.usuarioActivo.pais,
        ciudad: this.usuarioActivo.ciudad,
        direccion: this.usuarioActivo.direccion,
        perfil_completo: this.usuarioActivo.perfil_completo === 'true' || this.usuarioActivo.perfil_completo === true
      };

      await this.apiService.actualizarUsuarioAdmin(this.usuarioActivo.id, payload);
      
      const idx = this.usuarios.findIndex(u => u.id === this.usuarioActivo.id);
      if (idx !== -1) {
        this.usuarios[idx] = { ...this.usuarios[idx], ...payload };
      }
      
      this.toastr.success("Usuario actualizado correctamente", "Éxito");
      this.cerrarModalEditarUsuario();
    } catch (error) {
      this.toastr.error("Hubo un error al actualizar", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalEliminarUsuario(u: any) {
    this.usuarioActivo = u;
    this.mostrarModalEliminarUsuario = true;
  }

  cerrarModalEliminarUsuario() {
    this.mostrarModalEliminarUsuario = false;
    this.usuarioActivo = null;
  }

  async confirmarEliminarUsuario() {
    try {
      this.eliminando = true;
      this.cdr.detectChanges();
      await this.apiService.eliminarUsuarioAdmin(this.usuarioActivo.id);
      this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioActivo.id);
      this.toastr.success("Perfil de usuario eliminado", "Éxito");
      this.cerrarModalEliminarUsuario();
    } catch (error) {
      this.toastr.error("No se pudo eliminar el usuario", "Error");
    } finally {
      this.eliminando = false;
      this.cdr.detectChanges();
    }
  }

  // ==========================
  // MÉTODOS DE PLAN
  // ==========================
  abrirModalEditarPlan(p: any) {
    this.planActivo = { ...p };
    this.mostrarModalEditarPlan = true;
  }

  cerrarModalEditarPlan() {
    this.mostrarModalEditarPlan = false;
    this.planActivo = null;
  }

  async guardarPlan(event: Event) {
    event.preventDefault();
    try {
      this.guardando = true;
      this.cdr.detectChanges();
      
      const payload = {
        titulo: this.planActivo.titulo,
        destino: this.planActivo.destino,
        estado: this.planActivo.estado
      };

      await this.apiService.actualizarPlanAdmin(this.planActivo.id, payload);
      
      const idx = this.planes.findIndex(p => p.id === this.planActivo.id);
      if (idx !== -1) {
        this.planes[idx] = { ...this.planes[idx], ...payload };
      }
      
      this.toastr.success("Itinerario actualizado", "Éxito");
      this.cerrarModalEditarPlan();
    } catch (error) {
      this.toastr.error("Hubo un error al actualizar", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalEliminarPlan(p: any) {
    this.planActivo = p;
    this.mostrarModalEliminarPlan = true;
  }

  cerrarModalEliminarPlan() {
    this.mostrarModalEliminarPlan = false;
    this.planActivo = null;
  }

  async confirmarEliminarPlan() {
    try {
      this.eliminando = true;
      this.cdr.detectChanges();
      await this.apiService.eliminarPlanAdmin(this.planActivo.id);
      this.planes = this.planes.filter(p => p.id !== this.planActivo.id);
      this.toastr.success("Itinerario eliminado permanentemente", "Éxito");
      this.cerrarModalEliminarPlan();
    } catch (error) {
      this.toastr.error("No se pudo eliminar el itinerario", "Error");
    } finally {
      this.eliminando = false;
      this.cdr.detectChanges();
    }
  }
}