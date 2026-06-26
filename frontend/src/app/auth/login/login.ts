import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth'; 
import { ApiService } from '../../services/api.service'; 
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false
})
export class LoginComponent {
  
  constructor(
    private authService: AuthService,
    private apiService: ApiService, 
    private router: Router,
    private toastr: ToastrService) {}

  async iniciarSesion(event: Event) {
    event.preventDefault(); 
    
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await this.authService.login(email, password);
      await this.apiService.sincronizarUsuario();
      
      // === REDIRECCIÓN INTELIGENTE ===
      if (email === 'admin@jalas.pe') {
        this.toastr.success("Bienvenido al panel de control", "Staff Jalas.Pe");
        this.router.navigate(['/admin']); // Al panel interno
      } else {
        this.toastr.success("¡Bienvenido a JalasPe!", "Login Exitoso");
        this.router.navigate(['/app']); // Al panel de cliente
      }

    } catch (error) {
      this.toastr.error("Verifica tus credenciales", "Error de Login");
      console.error(error);
    }
  }
}