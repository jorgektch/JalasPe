import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth'; // Asegúrate de que la ruta sea correcta
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.html',
  standalone: false
})
export class ClienteComponent implements OnInit {
  usuarioEmail: string | null = 'Cargando...';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Obtenemos los datos del usuario logeado
    const user = this.authService.getUsuarioActual();
    if (user) {
      this.usuarioEmail = user.email;
    } else {
      // Si por alguna razón entra aquí sin estar logeado, lo devolvemos al login
      // (Más adelante crearemos un "Guardián" para proteger esta ruta mejor)
      this.router.navigate(['/auth/login']);
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