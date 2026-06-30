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

  // Empezamos con un arreglo vacío. Se llenará con lo que diga el LLM.
  cronograma: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id && id !== this.viajeId) {
        this.viajeId = id;
        this.cargando = true;
        this.viaje = null;
        this.cronograma = [];
        this.cdr.detectChanges();
        
        await this.cargarViaje();
      }
    });
  }

  async cargarViaje() {
    try {
      // 1. Traemos la información básica del plan (Título, Destino)
      this.viaje = await this.apiService.getPlan(this.viajeId);
      
      // 2. Traemos el historial del chat para extraer el JSON de la IA
      const historial = await this.apiService.getMensajesPlan(this.viajeId);
      this.extraerCronogramaIA(historial);

    } catch (error) {
      this.toastr.error("El viaje no existe o no tienes acceso", "Error 404");
      this.router.navigate(['/app/viajes']);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  extraerCronogramaIA(mensajes: any[]) {
    // Filtramos solo los mensajes de la IA
    const msjsIA = mensajes.filter(m => m.rol === 'assistant');
    if (msjsIA.length === 0) return;

    // Buscamos desde el último mensaje hacia atrás un bloque de código JSON
    for (let i = msjsIA.length - 1; i >= 0; i--) {
      const contenido = msjsIA[i].contenido;
      // Expresión regular para atrapar lo que está dentro de ```json ... ```
      const jsonMatch = contenido.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cronograma = parsed;
            return; // Encontramos y cargamos el cronograma exitosamente
          }
        } catch(e) {
          console.error("El LLM generó un JSON inválido, buscando en un mensaje anterior...", e);
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}