import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutId: any;
  private readonly INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutos de inactividad

  constructor(private router: Router, private ngZone: NgZone) {}

  public iniciarMonitoreoInactivity() {
    this.resetTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }

  private resetTimer() {
    clearTimeout(this.timeoutId);

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.cerrarSesionPorInactividad();
        });
      }, this.INACTIVITY_LIMIT);
    });
  }

  private cerrarSesionPorInactividad() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    alert('Tu sesión ha expirado por inactividad.');
    this.router.navigate(['/login']);
  }

  public detenerMonitoreo() {
    clearTimeout(this.timeoutId);
  }
}