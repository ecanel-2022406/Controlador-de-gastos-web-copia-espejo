import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InactivityService } from './services/inactivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private inactivityService = inject(InactivityService);

  mostrarAlertaInactividad: boolean = false;

  ngOnInit() {

    this.inactivityService.iniciarMonitoreoInactivity();

    this.inactivityService.sesionExpirada$.subscribe(expirada => {
      this.mostrarAlertaInactividad = expirada;
    });

    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const nombre = params['nombre'];

      if (token) {
        localStorage.setItem('token', token);
        if (nombre) {
          localStorage.setItem('nombreUsuario', decodeURIComponent(nombre));
        }
        
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    });
  }
}