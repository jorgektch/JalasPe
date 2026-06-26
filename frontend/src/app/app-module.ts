import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <-- NUEVO: Para editar el nombre del plan

import { ToastrModule } from 'ngx-toastr'; 

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Landing } from './landing/landing';
import { AuthInterceptor } from './auth/auth.interceptor'; 

@NgModule({
  declarations: [App, Landing],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, 
    HttpClientModule, 
    FormsModule, // <-- NUEVO: Agregado a los imports
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right', 
      preventDuplicates: true,
    }),
    AppRoutingModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } 
  ],
  bootstrap: [App],
})
export class AppModule {}