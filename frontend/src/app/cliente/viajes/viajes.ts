import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.html',
  standalone: false
})
export class ViajesComponent implements OnInit {
  usuarioEmail: string | null = '';
  misViajes: any[] = [];
  cargando: boolean = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = await this.authService.esperarUsuarioAutenticado();
    if (user) {
      this.usuarioEmail = user.email;
      await this.cargarViajes(); 
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  async cargarViajes() {
    try {
      this.cargando = true;
      this.misViajes = await this.apiService.getMisViajes();
    } catch (error) {
      this.toastr.error("No se pudieron cargar tus viajes", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges(); 
    }
  }
}