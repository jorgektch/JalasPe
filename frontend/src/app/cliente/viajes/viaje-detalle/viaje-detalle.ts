import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// <-- CORREGIDO: 3 niveles hacia arriba
import { ApiService } from '../../../services/api.service'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-viaje-detalle',
  templateUrl: './viaje-detalle.html',
  standalone: false
})
export class ViajeDetalleComponent implements OnInit {
  viajeId: string = '';
  viaje: any = null;
  cargando = true;

  // DATOS MOCKUP: Esto será reemplazado por la data real de la IA en el futuro
  cronograma = [
    { dia: 'Día 1 - Llegada', items: [
      { hora: '08:00 AM', titulo: 'Salida en Bus Cruz del Sur', desc: 'Terminal Javier Prado', tipo: 'transporte' },
      { hora: '12:30 PM', titulo: 'Check-in Hospedaje', desc: 'Hostal Kokopelli, Av. Principal 123', tipo: 'hospedaje' }
    ]},
    { dia: 'Día 2 - Aventura', items: [
      { hora: '09:00 AM', titulo: 'Tour Islas Ballestas', desc: 'Muelle de la Marina Turística', tipo: 'tour' },
      { hora: '02:00 PM', titulo: 'Almuerzo Criollo', desc: 'Restaurante El Piloto', tipo: 'restaurante' }
    ]}
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    this.viajeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.viajeId) {
      await this.cargarViaje();
    } else {
      this.router.navigate(['/app/viajes']);
    }
  }

  async cargarViaje() {
    try {
      this.cargando = true;
      this.viaje = await this.apiService.getPlan(this.viajeId);
    } catch (error) {
      this.toastr.error("El viaje no existe", "Error 404");
      this.router.navigate(['/app/viajes']);
    } finally {
      this.cargando = false;
    }
  }
}