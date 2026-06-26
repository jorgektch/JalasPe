import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ApiService } from '../../services/api.service'; // <-- Importamos nuestro ApiService
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {

  constructor(
    private authService: AuthService,
    private apiService: ApiService, // <-- Inyectamos el ApiService
    private router: Router,
    private toastr: ToastrService 
  ) { }

  async registrar(event: Event) {
    event.preventDefault(); 
    
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await this.authService.registro(email, password);
      
      // === NUEVO: Registramos al usuario en la BD de FastAPI ===
      await this.apiService.sincronizarUsuario();

      this.toastr.success("Cuenta creada correctamente", "¡Bienvenido a JalasPe!");
      this.router.navigate(['/app']);
    } catch (error: any) {
      // Normalizamos el código de error
      // A veces viene en error.code, a veces viene dentro del mensaje o la respuesta
      const errorCode = error.code || (error.error?.message) || "";

      console.error("Error detectado:", error);

      if (errorCode === 'auth/email-already-in-use' || errorCode === 'EMAIL_EXISTS') {
        this.toastr.warning("Este correo ya está registrado. Intenta iniciar sesión.", "Correo en uso");
      } 
      else if (errorCode === 'auth/weak-password' || errorCode === 'WEAK_PASSWORD') {
        this.toastr.error("La contraseña debe tener al menos 6 caracteres.", "Contraseña débil");
      } 
      else if (errorCode === 'auth/invalid-email' || errorCode === 'INVALID_EMAIL') {
        this.toastr.error("El formato del correo no es válido.", "Error de formato");
      } 
      else if (errorCode === 'auth/operation-not-allowed' || errorCode === 'OPERATION_NOT_ALLOWED') {
        this.toastr.error("El registro está deshabilitado en Firebase.", "Configuración");
      } 
      else {
        this.toastr.error("Hubo un problema al registrarte. Intenta de nuevo.", "Error inesperado");
      }
    }
  }
}