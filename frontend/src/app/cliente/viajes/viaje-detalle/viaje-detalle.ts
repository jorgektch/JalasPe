import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service'; 
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-viaje-detalle',
  templateUrl: './viaje-detalle.html',
  standalone: false
})
export class ViajeDetalleComponent implements OnInit, OnDestroy {
  viajeId: string = '';
  viaje: any = null;
  cargando = true;
  private routeSub!: Subscription;

  // Mantenemos tu data visual para la maqueta
  cronograma = [
    { dia: 'Día 1 - Llegada', items: [
      { hora: '08:00 AM', titulo: 'Salida en Bus', desc: 'Terminal de transporte', tipo: 'transporte' },
      { hora: '12:30 PM', titulo: 'Check-in Hospedaje', desc: 'Alojamiento seleccionado', tipo: 'hospedaje' }
    ]},
    { dia: 'Día 2 - Aventura', items: [
      { hora: '09:00 AM', titulo: 'Tour Principal', desc: 'Actividad turística', tipo: 'tour' },
      { hora: '02:00 PM', titulo: 'Almuerzo Local', desc: 'Restaurante sugerido', tipo: 'restaurante' }
    ]}
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Subscripción a los cambios de URL para evitar cruce de datos
    this.routeSub = this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id && id !== this.viajeId) {
        this.viajeId = id;
        this.cargando = true;
        this.viaje = null;
        this.cdr.detectChanges();
        
        await this.cargarViaje();
      }
    });
  }

  async cargarViaje() {
    try {
      this.viaje = await this.apiService.getPlan(this.viajeId);
    } catch (error) {
      this.toastr.error("El viaje no existe o no tienes acceso", "Error 404");
      this.router.navigate(['/app/viajes']);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}