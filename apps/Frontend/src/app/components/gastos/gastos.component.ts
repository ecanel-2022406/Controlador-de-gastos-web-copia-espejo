import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit {
  listaGastos: any[] = [];
  
  // Formulario para gasto rápido o extra
  nuevoGasto = {
    concepto: '',
    monto: null as number | null,
    fecha: ''
  };

  totalGastosAcumulado: number = 0;

  constructor(private ingresosService: IngresosService) {}

  ngOnInit(): void {
    this.ingresosService.listaGastos$.subscribe(gastos => {
      this.listaGastos = gastos || [];
      this.calcularTotal();
    });
  }

  agregarGasto(): void {
    if (!this.nuevoGasto.concepto || !this.nuevoGasto.monto || this.nuevoGasto.monto <= 0) {
      alert('Por favor completa el concepto y un monto válido.');
      return;
    }

    const gastoAAgregar = {
      id: Date.now(),
      categoria: this.nuevoGasto.concepto,
      monto: Number(this.nuevoGasto.monto),
      fecha: this.nuevoGasto.fecha || new Date().toLocaleDateString()
    };

    const listaActual = [...this.listaGastos, gastoAAgregar];
    this.listaGastos = listaActual;

    const usuarioKey = (localStorage.getItem('nombreUsuario') || 'usuario').toLowerCase().trim();
    localStorage.setItem('listaGastos_' + usuarioKey, JSON.stringify(this.listaGastos));
    
    this.ingresosService.recargarDatosUsuario();

    // Limpiar formulario
    this.nuevoGasto = { concepto: '', monto: null, fecha: '' };
    this.calcularTotal();
  }

  eliminarGasto(index: number): void {
    this.listaGastos.splice(index, 1);
    const usuarioKey = (localStorage.getItem('nombreUsuario') || 'usuario').toLowerCase().trim();
    localStorage.setItem('listaGastos_' + usuarioKey, JSON.stringify(this.listaGastos));
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