import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  standalone: false
})
export class Perfil implements OnInit {
  usuarioEmail: string | null = '';
  
  cargando = true;
  guardando = false;
  cambiandoPassword = false;

  perfilData: any = {
    nombres: '', apellido_paterno: '', apellido_materno: '',
    tipo_documento: '', numero_documento: '', // <-- Campos agregados
    username: '', fecha_nacimiento: '', celular: '',
    pais: '', ciudad: '', direccion: ''
  };

  // Listas Dinámicas
  paises: any[] = [];
  ciudades: any[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.authService.esperarUsuarioAutenticado();
    
    if (user) {
      this.usuarioEmail = user.email;
      await this.cargarDatos();
    } else {
      this.cargando = false;
      this.cdr.detectChanges();
      this.router.navigate(['/auth/login']);
    }
  }

  async cargarDatos() {
    try {
      this.cargando = true;
      // Cargamos el perfil y la lista de países en paralelo
      const [data, listaPaises] = await Promise.all([
        this.apiService.getPerfil(),
        this.apiService.getPaises()
      ]);
      
      this.perfilData = { ...this.perfilData, ...data };
      this.paises = listaPaises;

      // Si el perfil ya tiene un país, cargamos sus ciudades
      if (this.perfilData.pais) {
        await this.cargarCiudades(this.perfilData.pais);
      }
    } catch (error) {
      this.toastr.error("No pudimos cargar tus datos o países", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cargarCiudades(nombrePais: string) {
    const paisSeleccionado = this.paises.find(p => p.nombre === nombrePais);
    if (paisSeleccionado) {
      this.ciudades = await this.apiService.getCiudades(paisSeleccionado.id);
    } else {
      this.ciudades = [];
    }
    this.cdr.detectChanges();
  }

  async onPaisCambio() {
    this.perfilData.ciudad = ''; // Reseteamos la ciudad al cambiar el país
    await this.cargarCiudades(this.perfilData.pais);
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
      this.cdr.detectChanges();
      await this.authService.actualizarPassword(actual, nueva);
      this.toastr.success("Tu contraseña ha sido actualizada con éxito", "Seguridad");
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      const errorCode = error.code;
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
        this.toastr.error("La contraseña actual es incorrecta", "Acceso denegado");
      } else {
        this.toastr.error("No se pudo actualizar la contraseña. Intenta nuevamente.", "Error");
      }
    } finally {
      this.cambiandoPassword = false;
      this.cdr.detectChanges();
    }
  }
}