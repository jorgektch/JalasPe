import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Obtenemos el token de Firebase
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        // 2. Si hay token, clonamos la petición y se lo inyectamos
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        // 3. Dejamos que la petición continúe su viaje hacia FastAPI
        return next.handle(request);
      })
    );
  }
}