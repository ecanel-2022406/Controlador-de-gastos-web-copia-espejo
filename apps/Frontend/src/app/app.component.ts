import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InactivityService } from './services/inactivity.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Controlador-de-gastos-web';

  constructor(private inactivityService: InactivityService) {}

  ngOnInit() {
    // Si ya existe un token guardado, arrancamos el monitoreo de inactividad
    if (localStorage.getItem('token')) {
      this.inactivityService.iniciarMonitoreoInactivity();
    }
  }

  ngOnDestroy() {
    // Limpiamos los listeners al destruir el componente raíz
    this.inactivityService.detenerMonitoreo();
  }
}