import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Necesario
import { ToastrModule } from 'ngx-toastr'; // Necesario

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Landing } from './landing/landing';

@NgModule({
  declarations: [App, Landing],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // <-- Debe ir ANTES del ToastrModule
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right', // <-- Esta es la clase mágica
      preventDuplicates: true,
    }),
    AppRoutingModule,
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
