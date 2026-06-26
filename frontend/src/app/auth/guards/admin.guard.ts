import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastrService } from 'ngx-toastr'; // <-- Añadimos Toastr

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService // <-- Inyectamos Toastr
  ) {}

  async canActivate(): Promise<boolean> {
    const user = await this.authService.esperarUsuarioAutenticado();

    if (user) {
      if (user.email === 'admin@jalas.pe') {
        return true; // Es administrador, entra sin problemas
      } else {
        // Es un usuario normal intentando entrar al admin
        this.toastr.warning("No tienes permisos para acceder a esta área", "Acceso Restringido");
        this.router.navigate(['/app']); // Lo devolvemos gentilmente a su panel
        return false;
      }
    }

    // Si nadie ha iniciado sesión
    this.router.navigate(['/auth/login']);
    return false;
  }
}