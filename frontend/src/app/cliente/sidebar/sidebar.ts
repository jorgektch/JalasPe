import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core'; // <-- Añadimos OnDestroy
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs'; // <-- Importamos Subscription

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  standalone: false
})
export class SidebarComponent implements OnInit, OnDestroy {
  menuAbierto = false;
  inicialUsuario = 'U';
  misPlanes: any[] = [];
  
  private actualizacionSub!: Subscription; // <-- Variable para guardar nuestra conexión

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

      // <-- LA MAGIA: El Sidebar se queda "escuchando" el Walkie-Talkie
      this.actualizacionSub = this.apiService.planActualizado$.subscribe(() => {
        this.cargarPlanesMenu();
      });
    }
  }

  // Buenas prácticas: Apagamos el Walkie-Talkie si el componente se destruye
  ngOnDestroy() {
    if (this.actualizacionSub) {
      this.actualizacionSub.unsubscribe();
    }
  }

  async cargarPlanesMenu() {
    try {
      this.misPlanes = await this.apiService.getMisPlanes();
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error al cargar menú de planes", error);
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

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