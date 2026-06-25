import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  standalone: false
})
export class PerfilComponent implements OnInit {
  usuarioEmail: string | null = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const user = this.authService.getUsuarioActual();
    if (user) {
      this.usuarioEmail = user.email;
    }
  }

  guardarDatosPersonales(event: Event) {
    event.preventDefault();
    // Aquí conectaremos con Firestore para actualizar los datos
    this.toastr.success("Tus datos personales han sido actualizados", "Perfil Guardado");
  }

  cambiarPassword(event: Event) {
    event.preventDefault();
    
    const nueva = (document.getElementById('nuevaPass') as HTMLInputElement).value;
    const confirmar = (document.getElementById('confirmarPass') as HTMLInputElement).value;

    if (nueva !== confirmar) {
      this.toastr.error("Las contraseñas no coinciden", "Error de validación");
      return;
    }

    // Aquí conectaremos con Firebase Auth para el cambio real
    this.toastr.success("Tu contraseña ha sido actualizada con éxito", "Seguridad");
    (event.target as HTMLFormElement).reset(); // Limpiamos el formulario por seguridad
  }
}