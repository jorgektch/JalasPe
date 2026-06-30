import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth'; 
import { ApiService } from '../services/api.service'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.html',
  standalone: false
})
export class ClienteComponent implements OnInit {
  usuarioEmail: string | null = 'Cargando...';
  cargando: boolean = false; 

  constructor(
    private authService: AuthService,
    private apiService: ApiService, 
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef 
  ) {}

  // <-- AÑADIMOS ASYNC AQUÍ Y CAMBIAMOS LA FUNCIÓN
  async ngOnInit() {
    const user = await this.authService.esperarUsuarioAutenticado();
    if (user) {
      this.usuarioEmail = user.email;
      this.cdr.detectChanges(); // <-- Línea añadida para calmar al compilador
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  async crearNuevoPlan() {
    try {
      this.cargando = true;
      this.cdr.detectChanges(); 

      const res = await this.apiService.crearPlan('Mi Nueva Aventura', 'Sin definir');
      this.toastr.success("¡Plan creado! Empecemos a organizar.", "Éxito");
      
      this.router.navigate(['/app/plan', res.id]); 
    } catch (error) {
      this.toastr.error("Hubo un error al crear el plan", "Error");
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      this.toastr.info("Has cerrado sesión correctamente", "Hasta pronto");
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.toastr.error("Hubo un problema al cerrar sesión", "Error");
      console.error(error);
    }
  }
}