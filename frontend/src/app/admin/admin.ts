import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  usuarioEmail: string | null = 'Cargando...';

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    const user = await this.authService.esperarUsuarioAutenticado();
    if (user) {
      this.usuarioEmail = user.email;
    }
  }
}