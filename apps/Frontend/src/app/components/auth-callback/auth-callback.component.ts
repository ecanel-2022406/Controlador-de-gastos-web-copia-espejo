import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #0b0f19; color: white; font-family: sans-serif;">
      <p>Iniciando sesión con Google, por favor espera...</p>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const nombre = params['nombre'];

      if (token) {
        localStorage.setItem('token', token);
        if (nombre) {
          localStorage.setItem('nombreUsuario', decodeURIComponent(nombre));
        }
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}