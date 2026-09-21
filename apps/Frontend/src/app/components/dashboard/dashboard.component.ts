import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IngresosService } from '../../services/ingresos.service';
import { IngresosComponent } from '../ingresos/ingresos.component';
import { GastosComponent } from '../gastos/gastos.component';
import { TransaccionesComponent } from '../transacciones/transacciones.component'; 
import { HistorialComponent } from '../historial/historial.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IngresosComponent, GastosComponent, TransaccionesComponent, HistorialComponent], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  fechaActual: Date = new Date();
  nombreUsuario: string = '';

  menuActivo: string = 'inicio';
  sidebarAbierto: boolean = true;
  notificacionesAbiertas: boolean = false;

  ingresoFijo: number = 0;
  ingresoTotal: number = 0;
  ingresoFijoNeto: number = 0;
  ingresoNetoReal: number = 0;   
  gastosTotales: number = 0;
  totalGastos: number = 0;
  totalTransferencias: number = 0;

  listaPresupuesto: any[] = [];
  listaGastos: any[] = [];
  listaPagos: any[] = [];

  private intervaloFecha: any;
  private subsIngresos?: any;
  private subsGastos?: any;
  private subsTransacciones?: any;
  private subsFijo?: any;

  constructor(
    private router: Router,
    private ingresosService: IngresosService
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Edy';
    this.verificarToken();
    this.ingresosService.recargarDatosUsuario();

    const usuarioKey = (localStorage.getItem('nombreUsuario') || 'usuario').toLowerCase().trim();
    const gastosLocales = JSON.parse(localStorage.getItem('listaGastos_' + usuarioKey) || '[]');
    if (gastosLocales.length > 0) {
      this.listaGastos = gastosLocales;
      const sumaLocales = gastosLocales.reduce((acc: number, item: any) => acc + (Number(item.monto) || 0), 0);
      this.totalGastos = sumaLocales;
      this.gastosTotales = sumaLocales + this.totalTransferencias;
    }

    this.intervaloFecha = setInterval(() => {
      this.fechaActual = new Date();
      this.verificarToken();
    }, 1000);

    this.subsIngresos = this.ingresosService.listaIngresos$.subscribe(lista => {
      this.listaPresupuesto = lista;
      this.ingresoTotal = lista.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
      
      let acumuladoFijoNeto = 0;
      let granTotalNeto = 0;

      lista.forEach(item => {
        const monto = Number(item.monto) || 0;
        const frecuencia = item.frecuencia || 'Único';

        if (frecuencia !== 'Único') {
          const igss = monto * 0.0483;
          const isr = monto * 0.05;
          let bonoDecreto = 0;

          if (frecuencia === 'Mensual') bonoDecreto = 250.00;
          else if (frecuencia === 'Quincenal') bonoDecreto = 125.00;
          else if (frecuencia === 'Semanal') bonoDecreto = 62.50;

          const montoFijoNetoItem = monto - igss - isr + bonoDecreto;

          acumuladoFijoNeto = montoFijoNetoItem; 
          granTotalNeto += montoFijoNetoItem;
        } else {
          granTotalNeto += monto;
        }
      });

      this.ingresoFijoNeto = acumuladoFijoNeto;
      this.ingresoNetoReal = granTotalNeto;
    });

    this.subsGastos = this.ingresosService.listaGastos$.subscribe(gastos => {
      if (gastos && gastos.length > 0) {
        this.listaGastos = gastos;
        const gastosPuros = gastos.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
        this.totalGastos = gastosPuros;
        this.gastosTotales = gastosPuros + this.totalTransferencias;
      }
    });

    this.subsTransacciones = this.ingresosService.listaTransferencias$.subscribe(transacciones => {
      const sumaTransacciones = transacciones.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
      this.totalTransferencias = sumaTransacciones;
      
      const gastosPuros = this.listaGastos.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
      this.gastosTotales = gastosPuros + sumaTransacciones;
      
      this.listaPagos = transacciones.map(t => ({
        titulo: t.destino ? `Transferencia a ${t.destino}` : (t.titulo || 'Pago programado'),
        motivo: t.motivo || t.descripcion || 'General',
        fecha: t.fecha || new Date(),
        monto: Number(t.monto) || 0
      }));
    });
  }

  ngOnDestroy(): void {
    if (this.intervaloFecha) clearInterval(this.intervaloFecha);
    if (this.subsIngresos) this.subsIngresos.unsubscribe();
    if (this.subsGastos) this.subsGastos.unsubscribe();
    if (this.subsTransacciones) this.subsTransacciones.unsubscribe();
    if (this.subsFijo) this.subsFijo.unsubscribe();
  }

  get saldoDisponible(): number {
    return (this.ingresoNetoReal || 0) - (this.gastosTotales || 0);
  }

  toggleNotificaciones(): void {
    this.notificacionesAbiertas = !this.notificacionesAbiertas;
  }

  get listaNotificaciones(): string[] {
    const alertas: string[] = [];
    
    if (this.saldoDisponible < 0) {
      alertas.push('¡Cuidado! Tus gastos superan tus ingresos totales. Estás en números rojos.');
    } else if (this.saldoDisponible === 0 && this.ingresoNetoReal === 0) {
      alertas.push('Bienvenido. Comienza registrando tus ingresos y gastos para ver recomendaciones.');
    } else {
      alertas.push('Tu balance general se encuentra saludable.');
    }

    if (this.gastosTotales > (this.ingresoNetoReal * 0.5) && this.ingresoNetoReal > 0) {
      alertas.push('Tus gastos actuales han superado el 50% de tus ingresos netos.');
    }

    if (this.listaPresupuesto.length === 0) {
      alertas.push('Recomendación: Agrega un ingreso fijo para calcular automáticamente las deducciones de ley en Guatemala (IGSS, ISR y Bono Decreto).');
    }

    return alertas;
  }

  verificarToken(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      const partes = token.split('.');
      if (partes.length !== 3) throw new Error();
      const payload = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (Date.now() >= payload.exp * 1000) {
        this.cerrarSesion();
      }
    } catch {
      this.cerrarSesion();
    }
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
    this.gastosTotales = this.totalGastos + this.totalTransferencias;
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  seleccionarMenu(opcion: string): void {
    this.menuActivo = opcion;
  }

  obtenerIconoMotivo(motivo: string): string {
    if (!motivo) return 'images/billetera.png';
    
    const m = motivo.toLowerCase().trim();
    
    if (m.includes('educación') || m.includes('educacion')) {
      return 'images/sombrero.png'; 
    } else if (m.includes('deuda') || m.includes('deudas')) {
      return 'images/tarjeta.png';
    } else if (m.includes('ahorro')) {
      return 'images/alcancia.png';
    } else if (m.includes('servicio')) {
      return 'images/factura.png';
    } else if (m.includes('otros')) {
      return 'images/otros.png';
    }
    
    return 'images/billetera.png';
  }

  cerrarSesion(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}