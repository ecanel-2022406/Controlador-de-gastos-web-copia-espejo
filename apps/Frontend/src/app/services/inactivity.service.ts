import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutId: any;
  private readonly INACTIVITY_LIMIT = 5* 60 * 1000;

  private sesionExpiradaSubject = new BehaviorSubject<boolean>(false);
  public sesionExpirada$ = this.sesionExpiradaSubject.asObservable();

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
    localStorage.removeItem('nombreUsuario');

    this.sesionExpiradaSubject.next(true);

    setTimeout(() => {
      this.sesionExpiradaSubject.next(false);
      this.router.navigate(['/login']);
    }, 3000);
  }

  public detenerMonitoreo() {
    clearTimeout(this.timeoutId);
  }
}