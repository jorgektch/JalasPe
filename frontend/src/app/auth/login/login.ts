import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth'; 
import { ApiService } from '../../services/api.service'; // <-- Importamos nuestro ApiService
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false
})
export class LoginComponent {
  
  constructor(
    private authService: AuthService,
    private apiService: ApiService, // <-- Inyectamos el ApiService
    private router: Router,
    private toastr: ToastrService) {}

  async iniciarSesion(event: Event) {
    event.preventDefault(); 
    
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await this.authService.login(email, password);
      
      // === NUEVO: Avisamos a FastAPI que el usuario entró ===
      await this.apiService.sincronizarUsuario();
      
      this.toastr.success("¡Bienvenido a JalasPe!", "Login Exitoso");
      // Al ser exitoso, lo enviamos al panel del cliente
      this.router.navigate(['/app']);
    } catch (error) {
      this.toastr.error("Verifica tus credenciales", "Error de Login");
      console.error(error);
    }
  }
}