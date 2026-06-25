import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Nuestra ruta actualizada
import { ToastrService } from 'ngx-toastr'; // Importa esto

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false
})
export class LoginComponent {
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService) {}

  async iniciarSesion(event: Event) {
    event.preventDefault(); 
    
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await this.authService.login(email, password);
      this.toastr.success("¡Bienvenido a JalasPe!", "Login Exitoso");
      // Al ser exitoso, lo enviamos al panel del cliente
      this.router.navigate(['/app']);
    } catch (error) {
      this.toastr.error("Verifica tus credenciales", "Error de Login");
      console.error(error);
    }
  }
}