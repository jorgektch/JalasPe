import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core'; 
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs'; 

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  standalone: false
})
export class SidebarComponent implements OnInit, OnDestroy {
  menuAbierto = false;
  inicialUsuario = 'U';
  
  misPlanes: any[] = [];
  misViajes: any[] = []; // <-- NUEVO
  
  private actualizacionSub!: Subscription; 

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = this.authService.getUsuarioActual();
    if (user && user.email) {
      this.inicialUsuario = user.email.charAt(0).toUpperCase();
      await this.cargarPlanesMenu();

      this.actualizacionSub = this.apiService.planActualizado$.subscribe(() => {
        this.cargarPlanesMenu();
      });
    }
  }

  ngOnDestroy() {
    if (this.actualizacionSub) {
      this.actualizacionSub.unsubscribe();
    }
  }

  async cargarPlanesMenu() {
    try {
      // Cargamos ambas listas en paralelo
      const [planes, viajes] = await Promise.all([
        this.apiService.getMisPlanes(),
        this.apiService.getMisViajes()
      ]);
      this.misPlanes = planes;
      this.misViajes = viajes;
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error al cargar menú", error);
    }
  }

  toggleMenu() { this.menuAbierto = !this.menuAbierto; }
  cerrarMenu() { this.menuAbierto = false; }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      this.toastr.info("Has cerrado sesión", "Hasta pronto");
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.toastr.error("Error al cerrar sesión", "Error");
    }
  }
}