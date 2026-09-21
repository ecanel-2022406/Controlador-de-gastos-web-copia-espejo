import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit, OnDestroy {
  listaGastos: any[] = [];
  ingresoTotal: number = 0;
  totalGastosAcumulado: number = 0;
  
  private subIngresos?: Subscription;
  private subGastos?: Subscription;

  primerDiaMes: string = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  })();

  fechaActual: string = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const ultimoDia = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');
    return `${year}-${monthStr}-${ultimoDia}`;
  })();

  nuevoGasto = {
    concepto: '',
    monto: null as number | null,
    fecha: ''
  };

  mostrarAlertaModal: boolean = false;
  mensajeAlerta: string = '';

  constructor(private ingresosService: IngresosService) {}

  ngOnInit(): void {
    this.subIngresos = this.ingresosService.listaIngresos$.subscribe(lista => {
      const totalPresupuestado = lista.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
      this.ingresoTotal = totalPresupuestado;
    });

    this.subGastos = this.ingresosService.listaGastos$.subscribe(gastos => {
      this.listaGastos = gastos || [];
      this.calcularTotal();
    });

    const usuarioKey = (localStorage.getItem('nombreUsuario') || 'usuario').toLowerCase().trim();
    const gastosLocales = JSON.parse(localStorage.getItem('listaGastos_' + usuarioKey) || '[]');
    if (gastosLocales.length > 0 && this.listaGastos.length === 0) {
      this.listaGastos = gastosLocales;
      this.calcularTotal();
    }

    this.ingresosService.recargarDatosUsuario();
  }

  ngOnDestroy(): void {
    if (this.subIngresos) this.subIngresos.unsubscribe();
    if (this.subGastos) this.subGastos.unsubscribe();
  }

  abrirModal(mensaje: string): void {
    this.mensajeAlerta = mensaje;
    this.mostrarAlertaModal = true;
  }

  cerrarModal(): void {
    this.mostrarAlertaModal = false;
    this.mensajeAlerta = '';
  }

  agregarGasto(): void {
    if (!this.nuevoGasto.concepto || !this.nuevoGasto.monto || this.nuevoGasto.monto <= 0) {
      this.abrirModal('Por favor completa el concepto y un monto válido.');
      return;
    }

    if (this.nuevoGasto.fecha && (this.nuevoGasto.fecha < this.primerDiaMes || this.nuevoGasto.fecha > this.fechaActual)) {
      this.abrirModal('La fecha debe pertenecer al mes actual.');
      return;
    }

    const montoNuevo = Number(this.nuevoGasto.monto);
    const saldoRealDisponible = this.ingresosService.obtenerSaldoDisponibleReal();

    if (montoNuevo > saldoRealDisponible) {
      this.abrirModal(`No se puede agregar el gasto. El monto (Q ${montoNuevo.toFixed(2)}) supera tu saldo disponible real (Q ${saldoRealDisponible.toFixed(2)}).`);
      return;
    }

    const gastoBackend = {
      titulo: this.nuevoGasto.concepto,
      categoria: this.nuevoGasto.concepto,
      monto: montoNuevo,
      fecha: this.nuevoGasto.fecha || new Date().toISOString().split('T')[0]
    };

    const usuarioKey = (localStorage.getItem('nombreUsuario') || 'usuario').toLowerCase().trim();
    const listaLocal = JSON.parse(localStorage.getItem('listaGastos_' + usuarioKey) || '[]');
    const gastoLocal = {
      id: Date.now(),
      titulo: this.nuevoGasto.concepto,
      categoria: this.nuevoGasto.concepto,
      monto: montoNuevo,
      fecha: this.nuevoGasto.fecha || new Date().toISOString().split('T')[0]
    };
    listaLocal.push(gastoLocal);
    localStorage.setItem('listaGastos_' + usuarioKey, JSON.stringify(listaLocal));

    this.listaGastos = [...this.listaGastos, gastoLocal];
    
    // Sincroniza al servicio de transacciones/gastos global si aplica
    this.ingresosService.agregarGasto(gastoBackend);
    
    this.nuevoGasto = { concepto: '', monto: null, fecha: '' };
    this.calcularTotal();
  }

  eliminarGasto(index: number): void {
    const usuarioKey = (localStorage.getItem('nombreUsuario') || 'usuario').toLowerCase().trim();
    let listaLocal = JSON.parse(localStorage.getItem('listaGastos_' + usuarioKey) || '[]');
    listaLocal.splice(index, 1);
    localStorage.setItem('listaGastos_' + usuarioKey, JSON.stringify(listaLocal));

    this.listaGastos.splice(index, 1);
    this.ingresosService.recargarDatosUsuario();
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalGastosAcumulado = this.listaGastos.reduce(
      (acc, item) => acc + (Number(item.monto) || 0),
      0
    );
  }
}