import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core'; 
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service'; 
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs'; 
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.html',
  standalone: false
})
export class PlanComponent implements OnInit, OnDestroy {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  usuarioEmail: string | null = 'Cargando...';
  estadoPlan: 'en_progreso' | 'completado' | 'aprobado' | 'pagado' = 'en_progreso';
  editandoTitulo = false;
  planId: string = '';
  nombrePlan = 'Cargando plan...'; 
  presupuestoEstimado = 'S/ 0.00';
  mostrarResumenMobile = false;
  private routeSub!: Subscription; 

  mensajes: any[] = [];
  nuevoMensaje: string = '';
  escribiendoIA: boolean = false;
  cargandoChat: boolean = true; 

  // VARIABLES DE LA PASARELA DE PAGO SIMULADA
  mostrarModalPago = false;
  procesandoPago = false;
  metodoPago: 'tarjeta' | 'yape' = 'tarjeta';
  errorPago = '';
  datosTarjeta = { numero: '', fecha: '', cvv: '', titular: '' };
  datosYape = { operacion: '' };

  protocolo = [
    { id: 1, titulo: 'Datos Básicos', estado: 'en_progreso', resumen: 'Destino, fechas y pasajeros' },
    { id: 2, titulo: 'Transporte', estado: 'pendiente', resumen: 'Buses y empresas' },
    { id: 3, titulo: 'Hospedaje', estado: 'pendiente', resumen: 'Selección de alojamiento' },
    { id: 4, titulo: 'Actividades y Comida', estado: 'pendiente', resumen: 'Tours y alimentación' },
    { id: 5, titulo: 'Plan Preliminar', estado: 'pendiente', resumen: 'Esperando tu confirmación' },
    { id: 6, titulo: '¡Viaje Armado!', estado: 'pendiente', resumen: 'Listo para pagar' }
  ];

  participantes = [{ nombre: 'Tú', inicial: 'T', color: 'bg-jalaspe-blue' }];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer 
  ) {}

  async ngOnInit() {
    const user = await this.authService.esperarUsuarioAutenticado();
    if (user) {
      this.usuarioEmail = user.email;
      this.routeSub = this.route.paramMap.subscribe(async params => {
        const id = params.get('id');
        if (id && id !== this.planId) {
          this.planId = id;
          this.mensajes = [];
          this.nombrePlan = 'Cargando plan...';
          this.escribiendoIA = false;
          this.nuevoMensaje = '';
          this.cargandoChat = true; 
          this.cerrarModalPago();
          this.cdr.detectChanges(); 
          
          await this.cargarDatosDelPlan(); 
          await this.cargarHistorialChat(); 
        }
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  // --- PARSEADOR MARKDOWN (Corregido para móviles y UX) ---
  formatMarkdown(text: string): SafeHtml {
    if (!text) return '';
    let parsed = text.replace(/\[FASE:\s*\d\]/g, ''); // Quitar fase oculta
    
    // 1. Limpiar exceso de saltos de línea de la IA (máximo 2)
    parsed = parsed.replace(/\n{3,}/g, '\n\n');

    // 2. Títulos (Renderizarlos más compactos)
    parsed = parsed.replace(/### (.*?)(?:\n|$)/g, '<h3 class="text-base font-black text-jalaspe-blue mt-3 mb-1">$1</h3>\n');
    parsed = parsed.replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-lg font-black text-jalaspe-blue mt-3 mb-1">$1</h2>\n');
    
    // 3. Listas (Guiones)
    parsed = parsed.replace(/^- (.*?)(?:\n|$)/gm, '<li class="ml-4 list-disc text-sm mb-0.5">$1</li>\n');
    
    // 4. Negritas
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-jalaspe-blue">$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 5. Convertir saltos restantes a <br>
    parsed = parsed.replace(/\n/g, '<br>');

    // 6. Limpiar <br> colados alrededor del HTML generado para evitar márgenes gigantes
    parsed = parsed.replace(/<\/h3><br>/g, '</h3>');
    parsed = parsed.replace(/<\/h2><br>/g, '</h2>');
    parsed = parsed.replace(/<\/li><br>/g, '</li>');
    parsed = parsed.replace(/<br><li/g, '<li');

    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  }

  actualizarProgreso() {
    if (this.estadoPlan === 'pagado') return;
    const mensajesIA = this.mensajes.filter(m => m.rol === 'assistant');
    if (mensajesIA.length === 0) return;

    const ultimoMsj = mensajesIA[mensajesIA.length - 1].contenido;
    const match = ultimoMsj.match(/\[FASE:\s*(\d)\]/);
    
    if (match) {
      const faseActual = parseInt(match[1], 10);
      
      if (faseActual === 5) this.estadoPlan = 'completado'; 
      else if (faseActual === 6) this.estadoPlan = 'aprobado'; 
      else this.estadoPlan = 'en_progreso';

      this.protocolo.forEach((p, index) => {
        if (index + 1 < faseActual) p.estado = 'completado';
        else if (index + 1 === faseActual) p.estado = 'en_progreso';
        else p.estado = 'pendiente';
      });
    }
  }

  // --- LÓGICA DE LA PASARELA DE PAGO SIMULADA ---
  abrirModalPago() {
    this.mostrarModalPago = true;
    this.errorPago = '';
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
    this.errorPago = '';
  }

  validarYProcesarPago() {
    this.errorPago = '';

    if (this.metodoPago === 'tarjeta') {
      const numClean = this.datosTarjeta.numero.replace(/\s/g, '');
      if (numClean.length !== 16 || !/^\d+$/.test(numClean)) {
        this.errorPago = 'Ingrese un número de tarjeta válido de 16 dígitos.'; return;
      }
      if (!this.datosTarjeta.fecha.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        this.errorPago = 'La fecha debe tener el formato MM/AA.'; return;
      }
      if (this.datosTarjeta.cvv.length < 3 || !/^\d+$/.test(this.datosTarjeta.cvv)) {
        this.errorPago = 'El CVV debe ser de 3 o 4 dígitos.'; return;
      }
      if (this.datosTarjeta.titular.trim().length < 3) {
        this.errorPago = 'Ingrese el nombre del titular.'; return;
      }
    } else {
      if (this.datosYape.operacion.trim().length < 6) {
        this.errorPago = 'Ingrese un número de operación válido o suba un comprobante.'; return;
      }
    }

    this.procesarPagoUnico();
  }

  async procesarPagoUnico() {
    this.procesandoPago = true;
    this.cdr.detectChanges();
    
    try {
      await this.apiService.pagarPlan(this.planId);
      this.cerrarModalPago();
      this.toastr.success("Se ha generado el comprobante exitosamente.", "¡Pago Aprobado!");
      this.toastr.info("Tu plan ahora incluye tus tickets y reservas.", "Viaje Confirmado");
      
      this.router.navigate(['/app/viajes']);
    } catch (error) {
      this.errorPago = "Hubo un error de conexión con la pasarela.";
    } finally {
      this.procesandoPago = false;
      this.cdr.detectChanges();
    }
  }

  async cargarDatosDelPlan() {
    try {
      const planData = await this.apiService.getPlan(this.planId);
      this.nombrePlan = planData.titulo || 'Plan sin título';
      if (planData.estado === 'pagado') {
        this.estadoPlan = 'pagado';
      }
      this.cdr.detectChanges(); 
    } catch (error) {}
  }

  async cargarHistorialChat() {
    const idAlIniciarPeticion = this.planId;
    try {
      const historial = await this.apiService.getMensajesPlan(this.planId);
      if (this.planId === idAlIniciarPeticion) {
        this.mensajes = historial;
        this.actualizarProgreso(); 
        this.scrollToBottom();
      }
    } catch (error) {} 
    finally {
      if (this.planId === idAlIniciarPeticion) {
        this.cargandoChat = false; 
        this.cdr.detectChanges();
      }
    }
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || this.escribiendoIA) return;
    const mensajeUsuario = this.nuevoMensaje;
    const idAlEnviar = this.planId; 
    
    this.mensajes.push({ rol: 'user', contenido: mensajeUsuario });
    this.nuevoMensaje = '';
    this.escribiendoIA = true;
    this.scrollToBottom();

    try {
      const res = await this.apiService.enviarMensajeChat(idAlEnviar, mensajeUsuario);
      if (this.planId === idAlEnviar) {
        this.mensajes.push({ rol: 'assistant', contenido: res.respuesta });
        this.actualizarProgreso(); 
      }
    } catch (error) {
      if (this.planId === idAlEnviar) {
        this.mensajes.push({ rol: 'assistant', contenido: "Lo siento, tuve un problema de red. ¿Podemos intentarlo de nuevo?" });
      }
    } finally {
      if (this.planId === idAlEnviar) {
        this.escribiendoIA = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      }
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }, 100);
  }

  ngOnDestroy() { if (this.routeSub) this.routeSub.unsubscribe(); }
  toggleResumenMobile() { this.mostrarResumenMobile = !this.mostrarResumenMobile; }
  activarEdicion() { this.editandoTitulo = true; }
  async guardarTitulo() {
    this.editandoTitulo = false;
    if (this.planId) await this.apiService.actualizarPlan(this.planId, this.nombrePlan);
  }
  agregarInvitado() { this.toastr.info("La función para agregar amigos estará disponible pronto", "Próximamente"); }
  verPlanDetallado() { this.toastr.success("Abriendo el itinerario completo", "Plan Detallado"); }
}