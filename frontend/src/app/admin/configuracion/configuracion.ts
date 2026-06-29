import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.html',
  standalone: false
})
export class Configuracion implements OnInit {
  cargando = true;
  guardando = false;

  nuevoModeloIA = '';
  ajustes: any = {
    contacto_email: '',
    contacto_whatsapp: '',
    modo_mantenimiento: false,
    mensaje_anuncio: '',
    modelos_disponibles: [],
    modelo_por_defecto: '',
    mensaje_bienvenida: '',
    openrouter_api_key: '',
    prompt_identidad: '',
    prompt_protocolo: '',
    prompt_guardrails: ''
  };

  constructor(private apiService: ApiService, private toastr: ToastrService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.cargarAjustes();
  }

  async cargarAjustes() {
    this.cargando = true;
    try {
      this.ajustes = await this.apiService.getAjustes();
      if (!this.ajustes.modelos_disponibles) this.ajustes.modelos_disponibles = [];
    } catch (error) {
      this.toastr.error("Error al cargar la configuración", "Error");
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  agregarModelo() {
    if (!this.ajustes.modelos_disponibles) this.ajustes.modelos_disponibles = [];
    const nuevo = this.nuevoModeloIA.trim();
    if (nuevo && !this.ajustes.modelos_disponibles.includes(nuevo)) {
      this.ajustes.modelos_disponibles.push(nuevo);
      this.nuevoModeloIA = '';
    }
  }

  eliminarModelo(modelo: string) {
    if (!this.ajustes.modelos_disponibles) return;
    this.ajustes.modelos_disponibles = this.ajustes.modelos_disponibles.filter((m: string) => m !== modelo);
    if (this.ajustes.modelo_por_defecto === modelo) {
      this.ajustes.modelo_por_defecto = this.ajustes.modelos_disponibles.length > 0 ? this.ajustes.modelos_disponibles[0] : '';
    }
  }

  async guardarAjustes(event?: Event) {
    if(event) event.preventDefault();
    try {
      this.guardando = true;
      this.cdr.detectChanges();

      const payload = {
        ...this.ajustes,
        modo_mantenimiento: this.ajustes.modo_mantenimiento === 'true' || this.ajustes.modo_mantenimiento === true
      };
      
      await this.apiService.actualizarAjustes(payload);
      this.toastr.success("Cerebro del Agente IA actualizado", "Sistema Listo");
    } catch (error) {
      this.toastr.error("Error al guardar", "Error");
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }
}