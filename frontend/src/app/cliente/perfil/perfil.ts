import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'; // <-- Inyectamos el Router
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  standalone: false
})
export class PerfilComponent implements OnInit {
  usuarioEmail: string | null = '';
  
  // ... (Tus variables iniciales de estado)
  cargando = true;
  guardando = false;
  cambiandoPassword = false; // <-- Nueva variable para el loader

  perfilData: any = {
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    username: '',
    fecha_nacimiento: '',
    celular: '',
    pais: 'PE', 
    ciudad: '',
    direccion: ''
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router // <-- Lo agregamos al constructor
  ) {}

  async ngOnInit() {
    // LA MAGIA: Ahora Angular espera a que Firebase termine de cargar la sesión de IndexedDB
    const user = await this.authService.esperarUsuarioAutenticado();
    
    if (user) {
      this.usuarioEmail = user.email;
      await this.cargarPerfil();
    } else {
      // Si realmente es null (el usuario cerró sesión), lo mandamos al login
      this.cargando = false;
      this.cdr.detectChanges();
      this.router.navigate(['/auth/login']);
    }
  }

  async cargarPerfil() {
    try {
      this.cargando = true;
      const data = await this.apiService.getPerfil();
      this.perfilData = { ...this.perfilData, ...data };
    } catch (error) {
      this.toastr.error("No pudimos cargar tus datos", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardarDatosPersonales(event: Event) {
    event.preventDefault();
    try {
      this.guardando = true;
      this.cdr.detectChanges();

      await this.apiService.actualizarPerfil(this.perfilData);
      
      this.toastr.success("Tus datos personales han sido actualizados", "Perfil Guardado");
    } catch (error) {
      this.toastr.error("No pudimos guardar los cambios", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  async cambiarPassword(event: Event) {
    event.preventDefault();
    
    const actual = (document.getElementById('actualPass') as HTMLInputElement).value;
    const nueva = (document.getElementById('nuevaPass') as HTMLInputElement).value;
    const confirmar = (document.getElementById('confirmarPass') as HTMLInputElement).value;

    if (!actual || !nueva || !confirmar) {
      this.toastr.warning("Por favor completa todos los campos", "Campos vacíos");
      return;
    }

    if (nueva !== confirmar) {
      this.toastr.error("Las nuevas contraseñas no coinciden", "Error de validación");
      return;
    }

    if (nueva.length < 6) {
      this.toastr.error("La nueva contraseña debe tener al menos 6 caracteres", "Contraseña muy corta");
      return;
    }

    try {
      this.cambiandoPassword = true;
      this.cdr.detectChanges(); // Mostramos el loader

      // Llamamos a nuestro servicio de Firebase
      await this.authService.actualizarPassword(actual, nueva);
      
      this.toastr.success("Tu contraseña ha sido actualizada con éxito", "Seguridad");
      (event.target as HTMLFormElement).reset(); // Limpiamos el formulario

    } catch (error: any) {
      console.error("Error en seguridad:", error);
      const errorCode = error.code;

      // Manejamos los errores típicos de Firebase
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
        this.toastr.error("La contraseña actual es incorrecta", "Acceso denegado");
      } else {
        this.toastr.error("No se pudo actualizar la contraseña. Intenta nuevamente.", "Error");
      }
    } finally {
      this.cambiandoPassword = false;
      this.cdr.detectChanges(); // Ocultamos el loader
    }
  }
}