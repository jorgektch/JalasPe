import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Subject } from 'rxjs'; // <-- 1. Importamos Subject

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // <-- 2. Creamos el "Walkie-Talkie" (Canal de comunicación)
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
    
    // <-- Avisamos que hay un nuevo plan para que el menú se actualice
    this.planActualizado$.next(); 
    return res;
  }

  async actualizarPlan(planId: string, titulo: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}`;
    const res = await firstValueFrom(this.http.patch<any>(url, { titulo }));
    
    // <-- 3. LA MAGIA: Avisamos a toda la app que el nombre cambió
    this.planActualizado$.next(); 
    return res;
  }

  // Obtener un plan específico por su ID
  async getPlan(planId: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}`;
    return firstValueFrom(this.http.get<any>(url));
  }

  // Eliminar un plan
  async eliminarPlan(planId: string) {
    const url = `${environment.apiUrl}/api/v1/planes/${planId}`;
    const res = await firstValueFrom(this.http.delete<any>(url));
    
    // Avisamos a toda la app que un plan desapareció
    this.planActualizado$.next(); 
    return res;
  }

  // Obtener el perfil del usuario actual
  async getPerfil() {
    const url = `${environment.apiUrl}/api/v1/perfil`;
    return firstValueFrom(this.http.get<any>(url));
  }

  // Actualizar los datos del perfil
  async actualizarPerfil(datos: any) {
    const url = `${environment.apiUrl}/api/v1/perfil`;
    return firstValueFrom(this.http.patch<any>(url, datos));
  }
}