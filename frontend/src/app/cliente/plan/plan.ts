import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.html',
  standalone: false
})
export class PlanComponent implements OnInit {
  usuarioEmail: string | null = 'Cargando...';

  // ================= ESTADOS DEL PLAN (Simulación) =================
  // Cambia este valor a 'completado' o 'aprobado' para ver cómo cambia la UI
  estadoPlan: 'en_progreso' | 'completado' | 'aprobado' = 'en_progreso'; 
  
  nombrePlan = 'Escapada de fin de semana';
  presupuestoEstimado = 'S/ 0.00';

  // NUEVO: Estado para abrir/cerrar el resumen en móviles
  mostrarResumenMobile = false;

  // NUEVO: Función para alternar el menú
  toggleResumenMobile() {
    this.mostrarResumenMobile = !this.mostrarResumenMobile;
  }

  // Los pasos del "Protocolo"
  protocolo = [
    { id: 1, titulo: 'Destino y Fechas', estado: 'completado', resumen: 'Paracas, 12 al 14 de Noviembre' },
    { id: 2, titulo: 'Transporte', estado: 'completado', resumen: 'Cruz del Sur (Ida y Vuelta)' },
    { id: 3, titulo: 'Hospedaje', estado: 'en_progreso', resumen: 'La IA está buscando opciones...' },
    { id: 4, titulo: 'Actividades', estado: 'pendiente', resumen: 'Falta definir' },
  ];

  // El "Crew"
  participantes = [
    { nombre: 'Tú', inicial: 'T', color: 'bg-jalaspe-blue' },
    { nombre: 'Andrea', inicial: 'A', color: 'bg-purple-500' },
    { nombre: 'Carlos', inicial: 'C', color: 'bg-jalaspe-turquoise' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const user = this.authService.getUsuarioActual();
    if (user) {
      this.usuarioEmail = user.email;
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  // Métodos de acción para los botones
  agregarInvitado() {
    this.toastr.info("Se ha copiado el enlace de invitación al portapapeles", "¡Invita a tu Crew!");
  }

  verPlanDetallado() {
    this.toastr.success("Mostrando el itinerario completo con horarios y links", "Plan Detallado");
    // Aquí podrías abrir un modal o navegar a otra vista
  }

  pagarMiParte() {
    this.toastr.success("Redirigiendo a la pasarela de pagos...", "¡Todo listo!");
  }
}