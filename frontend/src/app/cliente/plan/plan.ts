import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.html',
  standalone: false
})
export class PlanComponent implements OnInit {
  usuarioEmail: string | null = 'Cargando...';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const user = this.authService.getUsuarioActual();
    if (user) {
      this.usuarioEmail = user.email;
    } else {
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