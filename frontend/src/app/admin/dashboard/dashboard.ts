import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  standalone: false
})
export class Dashboard implements OnInit {
  cargando = true;
  
  // Contadores para las tarjetas
  stats = {
    usuarios: 0,
    proveedores: 0,
    itinerarios: 0,
    paisesHabilitados: 0
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarMetricas();
  }

  async cargarMetricas() {
    this.cargando = true;
    try {
      // Descargamos todo el sistema en paralelo para el "Command Center"
      const [resUsuarios, resProveedores, resPlanes, resPaises] = await Promise.all([
        this.apiService.getTodosUsuarios(),
        this.apiService.getProveedores(),
        this.apiService.getTodosPlanes(),
        this.apiService.getPaises()
      ]);

      this.stats.usuarios = resUsuarios.length;
      this.stats.proveedores = resProveedores.length;
      this.stats.itinerarios = resPlanes.length;
      this.stats.paisesHabilitados = resPaises.length;

    } catch (error) {
      this.toastr.error("Error al sincronizar datos del sistema", "Conexión Fallida");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
}