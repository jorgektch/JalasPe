import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.html',
  standalone: false
})
export class PlanesComponent implements OnInit {
  usuarioEmail: string | null = 'Cargando...';
  misPlanes: any[] = [];
  
  cargando: boolean = true;
  eliminando: boolean = false; 
  mostrarModalEliminar: boolean = false;
  planAEliminarId: string | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = await this.authService.esperarUsuarioAutenticado();
    if (user) {
      this.usuarioEmail = user.email;
      await this.cargarPlanes(); 
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  async cargarPlanes() {
    try {
      this.cargando = true;
      this.misPlanes = await this.apiService.getMisPlanes();
    } catch (error) {
      this.toastr.error("No se pudieron cargar tus planes", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges(); 
    }
  }

  async crearNuevoPlan() {
    try {
      this.cargando = true;
      this.cdr.detectChanges(); // Para que salga el loader si quisieras ponerlo
      const res = await this.apiService.crearPlan('Mi Nueva Aventura', 'Sin definir');
      this.toastr.success("¡Plan creado! Empecemos a organizar.", "Éxito");
      this.router.navigate(['/app/plan', res.id]); 
    } catch (error) {
      this.toastr.error("Hubo un error al crear el plan", "Error");
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalEliminar(planId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation(); 
    this.planAEliminarId = planId;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.planAEliminarId = null;
  }

  async confirmarEliminacion() {
    if (!this.planAEliminarId) return;

    try {
      this.eliminando = true; 
      this.cdr.detectChanges();
      
      await this.apiService.eliminarPlan(this.planAEliminarId);
      this.toastr.success("El plan ha sido eliminado", "Limpieza exitosa");
      
      await this.cargarPlanes(); 
    } catch (error) {
      this.toastr.error("No se pudo eliminar el plan", "Error");
    } finally {
      this.eliminando = false;
      this.cerrarModalEliminar();
      this.cdr.detectChanges();
    }
  }
}