import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.css']
})
export class TransaccionesComponent implements OnInit {
  todasLasTransacciones: any[] = [];
  transaccionesFiltradas: any[] = [];
  
  filtroTipo: string = 'todos'; // 'todos', 'ingreso', 'gasto'
  busquedaConcepto: string = '';

  totalIngresosFlujo: number = 0;
  totalGastosFlujo: number = 0;
  balanceNeto: number = 0;

  constructor(private ingresosService: IngresosService) {}

  ngOnInit(): void {
    // Nos suscribimos tanto a ingresos como a gastos para unificarlos
    this.ingresosService.listaIngresos$.subscribe(ingresos => {
      this.ingresosService.listaGastos$.subscribe(gastos => {
        this.procesarTransacciones(ingresos || [], gastos || []);
      });
    });
  }

  procesarTransacciones(ingresos: any[], gastos: any[]): void {
    // Mapeamos los ingresos con un tipo explícito
    const listIngresos = ingresos.map(item => ({
      ...item,
      tipo: 'Ingreso',
      montoNum: Number(item.monto) || 0,
      conceptoFinal: item.concepto || item.categoria || 'Ingreso general',
      claseCss: 'monto-ingreso'
    }));

    // Mapeamos los gastos con un tipo explícito
    const listGastos = gastos.map(item => ({
      ...item,
      tipo: 'Gasto',
      montoNum: Number(item.monto) || 0,
      conceptoFinal: item.categoria || item.concepto || 'Gasto general',
      claseCss: 'monto-gasto'
    }));

    // Combinamos y ordenamos por ID o fecha (simulando orden cronológico)
    this.todasLasTransacciones = [...listIngresos, ...listGastos].sort((a, b) => b.id - a.id);
    
    this.aplicarFiltros();
    this.calcularTotalesGlobales(listIngresos, listGastos);
  }

  aplicarFiltros(): void {
    this.transaccionesFiltradas = this.todasLasTransacciones.filter(t => {
      const cumpleTipo = this.filtroTipo === 'todos' || t.tipo.toLowerCase() === this.filtroTipo.toLowerCase();
      const cumpleBusqueda = !this.busquedaConcepto || t.conceptoFinal.toLowerCase().includes(this.busquedaConcepto.toLowerCase());
      return cumpleTipo && cumpleBusqueda;
    });
  }

  calcularTotalesGlobales(ingresos: any[], gastos: any[]): void {
    this.totalIngresosFlujo = ingresos.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
    this.totalGastosFlujo = gastos.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
    this.balanceNeto = this.totalIngresosFlujo - this.totalGastosFlujo;
  }
}