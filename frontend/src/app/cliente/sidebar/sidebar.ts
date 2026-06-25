import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  standalone: false
})
export class SidebarComponent implements OnInit {
  menuAbierto = false;
  inicialUsuario = 'U';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Obtenemos el usuario para mostrar su inicial en la barra superior móvil
    const user = this.authService.getUsuarioActual();
    if (user && user.email) {
      this.inicialUsuario = user.email.charAt(0).toUpperCase();
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