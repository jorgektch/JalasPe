import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { Auth } from './auth'; 
import { LoginComponent } from './login/login';
import { RegistroComponent } from './registro/registro';

@NgModule({
  declarations: [Auth, LoginComponent, RegistroComponent],
  imports: [CommonModule, AuthRoutingModule],
})
export class AuthModule {}