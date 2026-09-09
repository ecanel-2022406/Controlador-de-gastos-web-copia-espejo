import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IngresosService } from '../../services/ingresos.service';
import { IngresosComponent } from '../ingresos/ingresos.component';
import { GastosComponent } from '../gastos/gastos.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IngresosComponent, GastosComponent], // <-- Asegúrate de incluirlo aquí
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  fechaActual: Date = new Date();
  nombreUsuario: string = '';

  menuActivo: string = 'inicio';
  sidebarAbierto: boolean = true;

  ingresoFijo: number = 0;
  ingresoTotal: number = 0;
  gastosTotales: number = 0;

  listaPresupuesto: any[] = [];
  listaGastos: any[] = [];
  listaPagos: any[] = [];

  totalPresupuestado: number = 0;
  totalGastos: number = 0;

  private intervaloFecha: any;
  private suscripcionDashboard?: any;
  private suscripcionIngresoFijo?: any;
  private suscripcionGastos?: any;

  constructor(
    private router: Router,
    private ingresosService: IngresosService
  ) {}

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenUrl = urlParams.get('token');
    if (tokenUrl) {
      localStorage.setItem('token', tokenUrl);
      
      try {
        const partes = tokenUrl.split('.');
        const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        if (payload.email) {
          const nombreGoogle = payload.email.split('@')[0];
          localStorage.setItem('nombreUsuario', nombreGoogle);
        }
      } catch (e) {
        localStorage.setItem('nombreUsuario', 'Usuario Google');
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.verificarToken();

    this.ingresosService.recargarDatosUsuario();

    const usuarioKey = this.nombreUsuario.toLowerCase().trim();

    const fijoGuardado = localStorage.getItem('ingresoFijo_' + usuarioKey);
    if (fijoGuardado) {
      this.ingresoFijo = Number(fijoGuardado);
    } else {
      this.ingresoFijo = 0; 
    }

    this.intervaloFecha = setInterval(() => {
      this.fechaActual = new Date();
      this.verificarToken();
    }, 1000);

    this.suscripcionIngresoFijo = this.ingresosService.ingresoFijo$.subscribe(monto => {
      if (monto > 0) {
        this.ingresoFijo = monto;
        localStorage.setItem('ingresoFijo_' + usuarioKey, monto.toString());
      }
    });

    this.suscripcionDashboard = this.ingresosService.listaIngresos$.subscribe(lista => {
      this.listaPresupuesto = lista;
      this.calcularTotalPresupuesto();
    });

    this.suscripcionGastos = this.ingresosService.listaGastos$.subscribe(gastos => {
      this.listaGastos = gastos;
      this.calcularTotalGastos();
    });
  }

  ngOnDestroy(): void {
    if (this.intervaloFecha) {
      clearInterval(this.intervaloFecha);
    }
    if (this.suscripcionDashboard) {
      this.suscripcionDashboard.unsubscribe();
    }
    if (this.suscripcionIngresoFijo) {
      this.suscripcionIngresoFijo.unsubscribe();
    }
    if (this.suscripcionGastos) {
      this.suscripcionGastos.unsubscribe();
    }
  }

  verificarToken(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const partes = token.split('.');
      if (partes.length !== 3) throw new Error('Token inválido');

      const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload: any = JSON.parse(jsonPayload);
      const expiracion = payload.exp * 1000;

      if (Date.now() >= expiracion) {
        alert('La sesión ha expirado');
        this.limpiarSesionLocal();
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.limpiarSesionLocal();
      this.router.navigate(['/login']);
    }
  }
  
  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  seleccionarMenu(opcion: string): void {
    this.menuActivo = opcion;
  }

  cerrarSesion(): void {
    this.limpiarSesionLocal();
    this.router.navigate(['/login']);
  }

  private limpiarSesionLocal(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('emailUsuario');
    sessionStorage.clear();
  }

  calcularTotalPresupuesto(): void {
    if (this.listaPresupuesto?.length > 0) {
      this.totalPresupuestado = this.listaPresupuesto.reduce(
        (acc, item) => acc + (Number(item.monto) || 0),
        0
      );
    } else {
      this.totalPresupuestado = 0;
    }
    this.ingresoTotal = this.totalPresupuestado;
  } 

  calcularTotalGastos(): void {
    if (this.listaGastos?.length > 0) {
      this.totalGastos = this.listaGastos.reduce(
        (acc, item) => acc + (Number(item.monto) || 0),
        0
      );
    } else {
      this.totalGastos = 0;
    }
    this.gastosTotales = this.totalGastos;
  }

  cargarDatosReales(): void {}
}