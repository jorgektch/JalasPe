import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  public planActualizado$ = new Subject<void>(); 

  constructor(private http: HttpClient) {}

  async sincronizarUsuario() {
    const url = `${environment.apiUrl}/api/v1/auth/sync`;
    return firstValueFrom(this.http.post(url, {}));
  }

  async getMisPlanes() {
    const url = `${environment.apiUrl}/api/v1/planes`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearPlan(titulo: string, destino: string) {
    const url = `${environment.apiUrl}/api/v1/planes`;
    const res = await firstValueFrom(this.http.post<any>(url, { titulo, destino }));
    this.planActualizado$.next(); 
    return res;
  }

  async actualizarPlan(planId: string, titulo: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}`;
    const res = await firstValueFrom(this.http.patch<any>(url, { titulo }));
    this.planActualizado$.next(); 
    return res;
  }

  async getPlan(planId: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}`;
    return firstValueFrom(this.http.get<any>(url));
  }

  async eliminarPlan(planId: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}`;
    const res = await firstValueFrom(this.http.delete<any>(url));
    this.planActualizado$.next(); 
    return res;
  }

  async getPerfil() {
    const url = `${environment.apiUrl}/api/v1/perfil`;
    return firstValueFrom(this.http.get<any>(url));
  }

  async actualizarPerfil(datos: any) {
    const url = `${environment.apiUrl}/api/v1/perfil`;
    return firstValueFrom(this.http.patch<any>(url, datos));
  }

  // ==========================================
  // GESTIÓN DE PROVEEDORES (ADMIN STAFF)
  // ==========================================
  
  async getProveedores() {
    const url = `${environment.apiUrl}/api/v1/proveedores`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearProveedor(datos: any) {
    const url = `${environment.apiUrl}/api/v1/proveedores`;
    return firstValueFrom(this.http.post<any>(url, datos));
  }

  // NUEVO: Actualizar
  async actualizarProveedor(proveedorId: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}`;
    return firstValueFrom(this.http.patch<any>(url, datos));
  }

  async eliminarProveedor(proveedorId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  // NUEVO: Obtener un solo proveedor por ID
  async getProveedor(proveedorId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}`;
    return firstValueFrom(this.http.get<any>(url));
  }

  // ==========================================
  // INVENTARIO DINÁMICO: HOSPEDAJES
  // ==========================================

  async getHabitaciones(proveedorId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/habitaciones`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearHabitacion(proveedorId: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/habitaciones`;
    return firstValueFrom(this.http.post<any>(url, datos));
  }

  async eliminarHabitacion(proveedorId: string, habitacionId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/habitaciones/${habitacionId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  // ==========================================
  // INVENTARIO DINÁMICO: TRANSPORTE
  // ==========================================

  async getRutas(proveedorId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/rutas`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearRuta(proveedorId: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/rutas`;
    return firstValueFrom(this.http.post<any>(url, datos));
  }

  async eliminarRuta(proveedorId: string, rutaId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/rutas/${rutaId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  // ==========================================
  // INVENTARIO DINÁMICO: RESTAURANTES
  // ==========================================

  async getPlatos(proveedorId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/platos`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearPlato(proveedorId: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/platos`;
    return firstValueFrom(this.http.post<any>(url, datos));
  }

  async eliminarPlato(proveedorId: string, platoId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/platos/${platoId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  // ==========================================
  // INVENTARIO DINÁMICO: OPERADORES TURÍSTICOS
  // ==========================================

  async getTours(proveedorId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/tours`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearTour(proveedorId: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/tours`;
    return firstValueFrom(this.http.post<any>(url, datos));
  } 

  async eliminarTour(proveedorId: string, tourId: string) {
    const url = `${environment.apiUrl}/api/v1/proveedores/${proveedorId}/tours/${tourId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  // ==========================================
  // MONITOREO DE USUARIOS Y PLANES (ADMIN)
  // ==========================================

  async getTodosUsuarios() {
    const url = `${environment.apiUrl}/api/v1/admin/usuarios`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async actualizarUsuarioAdmin(email: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/admin/usuarios/${email}`;
    return firstValueFrom(this.http.patch<any>(url, datos));
  }

  async eliminarUsuarioAdmin(email: string) {
    const url = `${environment.apiUrl}/api/v1/admin/usuarios/${email}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  async getTodosPlanes() {
    const url = `${environment.apiUrl}/api/v1/admin/planes`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async actualizarPlanAdmin(planId: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/admin/planes/${planId}`;
    return firstValueFrom(this.http.patch<any>(url, datos));
  }

  async eliminarPlanAdmin(planId: string) {
    const url = `${environment.apiUrl}/api/v1/admin/planes/${planId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  // ==========================================
  // GEOGRAFÍA Y AJUSTES (ADMIN)
  // ==========================================

  async getPaises() {
    const url = `${environment.apiUrl}/api/v1/admin/paises`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearPais(datos: any) {
    const url = `${environment.apiUrl}/api/v1/admin/paises`;
    return firstValueFrom(this.http.post<any>(url, datos));
  }

  async eliminarPais(paisId: string) {
    const url = `${environment.apiUrl}/api/v1/admin/paises/${paisId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  async getCiudades(paisId: string) {
    const url = `${environment.apiUrl}/api/v1/admin/paises/${paisId}/ciudades`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async crearCiudad(paisId: string, datos: any) {
    const url = `${environment.apiUrl}/api/v1/admin/paises/${paisId}/ciudades`;
    return firstValueFrom(this.http.post<any>(url, datos));
  }

  async eliminarCiudad(paisId: string, ciudadId: string) {
    const url = `${environment.apiUrl}/api/v1/admin/paises/${paisId}/ciudades/${ciudadId}`;
    return firstValueFrom(this.http.delete<any>(url));
  }

  async getAjustes() {
    const url = `${environment.apiUrl}/api/v1/admin/ajustes`;
    return firstValueFrom(this.http.get<any>(url));
  }

  async actualizarAjustes(datos: any) {
    const url = `${environment.apiUrl}/api/v1/admin/ajustes`;
    return firstValueFrom(this.http.patch<any>(url, datos));
  }

  async getMisViajes() {
    const url = `${environment.apiUrl}/api/v1/viajes`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  // ==========================================
  // CEREBRO IA: CHAT
  // ==========================================
  
  async getMensajesPlan(planId: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}/mensajes`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  async enviarMensajeChat(planId: string, mensaje: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}/chat`;
    return firstValueFrom(this.http.post<any>(url, { mensaje }));
  }

  // Llamada para pagar y confirmar el viaje
  async pagarPlan(planId: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}`;
    return firstValueFrom(this.http.patch<any>(url, { estado: 'pagado' }));
  }
}