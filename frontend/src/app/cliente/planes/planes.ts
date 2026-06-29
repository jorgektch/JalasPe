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
    this.cargando = true;
    this.cdr.detectChanges(); // Forzamos a Angular a asimilar el estado de carga
    
    try {
      this.misPlanes = await this.apiService.getMisPlanes();
    } catch (error) {
      this.toastr.error("No se pudieron cargar tus planes", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges(); 
    }
  }

  async crearNuevoPlan() {
    this.cargando = true;
    this.cdr.detectChanges();

    try {
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
    this.cdr.detectChanges(); // Notificamos a la vista que el modal se abrió
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.planAEliminarId = null;
    this.eliminando = false;
    this.cdr.detectChanges(); // Notificamos a la vista que el modal se cerró
  }

  async confirmarEliminacion() {
    if (!this.planAEliminarId) return;

    this.eliminando = true; 
    this.cdr.detectChanges();
    
    try {
      await this.apiService.eliminarPlan(this.planAEliminarId);
      
      // ESTRATEGIA LOCAL: Quitamos el plan del arreglo en memoria sin recargar de la base de datos
      this.misPlanes = this.misPlanes.filter(p => p.id !== this.planAEliminarId);
      this.toastr.success("El plan ha sido eliminado", "Limpieza exitosa");
      
    } catch (error) {
      this.toastr.error("No se pudo eliminar el plan", "Error");
    } finally {
      // Cerramos el modal independientemente del resultado
      this.cerrarModalEliminar();
    }
  }
}