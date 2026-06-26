import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ApiService } from '../../services/api.service'; 
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs'; 

@Component({
  selector: 'app-plan',
  templateUrl: './plan.html',
  standalone: false
})
export class PlanComponent implements OnInit, OnDestroy {
  usuarioEmail: string | null = 'Cargando...';
  estadoPlan: 'en_progreso' | 'completado' | 'aprobado' = 'en_progreso'; 
  
  editandoTitulo = false;
  planId: string = '';
  nombrePlan = 'Cargando plan...'; 
  presupuestoEstimado = 'S/ 0.00';
  mostrarResumenMobile = false;

  private routeSub!: Subscription; 

  protocolo = [
    { id: 1, titulo: 'Destino y Fechas', estado: 'completado', resumen: 'Paracas, 12 al 14 de Noviembre' },
    { id: 2, titulo: 'Transporte', estado: 'completado', resumen: 'Cruz del Sur (Ida y Vuelta)' },
    { id: 3, titulo: 'Hospedaje', estado: 'en_progreso', resumen: 'Agente JalasPe está buscando opciones...' },
    { id: 4, titulo: 'Actividades', estado: 'pendiente', resumen: 'Falta definir' },
  ];

  participantes = [
    { nombre: 'Tú', inicial: 'T', color: 'bg-jalaspe-blue' },
    { nombre: 'Andrea', inicial: 'A', color: 'bg-purple-500' },
    { nombre: 'Carlos', inicial: 'C', color: 'bg-jalaspe-turquoise' }
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef 
  ) {}

  // <-- AÑADIMOS ASYNC AQUÍ Y CAMBIAMOS LA FUNCIÓN
  async ngOnInit() {
    const user = await this.authService.esperarUsuarioAutenticado();
    
    if (user) {
      this.usuarioEmail = user.email;
      
      this.routeSub = this.route.paramMap.subscribe(async params => {
        const id = params.get('id');
        if (id) {
          this.planId = id;
          await this.cargarDatosDelPlan(); 
        }
      });
      
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  async cargarDatosDelPlan() {
    try {
      this.nombrePlan = 'Cargando...'; 
      this.cdr.detectChanges();

      const planData = await this.apiService.getPlan(this.planId);
      this.nombrePlan = planData.titulo || 'Plan sin título';
      
      this.cdr.detectChanges(); 
    } catch (error) {
      console.error("Error al cargar el plan:", error);
      this.toastr.error("No se pudo cargar la información del plan");
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  toggleResumenMobile() {
    this.mostrarResumenMobile = !this.mostrarResumenMobile;
  }

  activarEdicion() {
    this.editandoTitulo = true;
  }

  async guardarTitulo() {
    this.editandoTitulo = false;
    try {
      if (this.planId) {
        await this.apiService.actualizarPlan(this.planId, this.nombrePlan);
        this.toastr.success("Nombre actualizado");
      }
    } catch (error) {
      this.toastr.error("No se pudo actualizar el nombre");
    }
  }

  agregarInvitado() {
    this.toastr.info("La función para agregar amigos estará disponible pronto", "Próximamente");
  }

  verPlanDetallado() {
    this.toastr.success("Abriendo el itinerario completo", "Plan Detallado");
  }

  pagarMiParte() {
    this.toastr.success("Redirigiendo a la pasarela de pagos", "Pago Seguro");
  }
}