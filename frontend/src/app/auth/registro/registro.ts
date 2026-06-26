import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ApiService } from '../../services/api.service'; 
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
    private apiService: ApiService, 
    private router: Router,
    private toastr: ToastrService 
  ) { }

  async registrar(event: Event) {
    event.preventDefault(); 
    
    // Capturamos los campos
    const nombres = (document.getElementById('nombres') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      // 1. Lo registramos en Firebase Auth
      await this.authService.registro(email, password);
      
      // 2. Creamos su documento base en Firestore
      await this.apiService.sincronizarUsuario();

      // 3. LA MAGIA: Guardamos automáticamente sus nombres en el perfil
      await this.apiService.actualizarPerfil({ nombres: nombres });

      this.toastr.success("Cuenta creada correctamente", "¡Bienvenido a JalasPe!");

      // 4. Redirección Inteligente
      if (email === 'admin@jalas.pe') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/app']);
      }

    } catch (error: any) {
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