import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css']
})
export class IngresosComponent implements OnInit {
  montoFijoInput: number | null = null;
  frecuenciaFijoInput: string = 'Quincenal';
  ingresoFijoGuardado: number = 0;

  conceptoExtraInput: string = '';
  montoExtraInput: number | null = null;  
  
  fechaExtraInput: string = new Date().toISOString().split('T')[0];
  minFechaMes: string = '2026-09-01';
  maxFechaMes: string = '2026-09-30';

  listaPresupuesto: any[] = [];
  listaIngresosReales: any[] = [];
  
  totalPresupuestado: number = 0;
  totalIngresoReal: number = 0;
  totalIgss: number = 0;
  totalIsr: number = 0;
  totalBonoDecreto: number = 0;
  totalGeneralAcumulado: number = 0;

  listaIngresosFijos: any[] = [];
  listaIngresosExtras: any[] = [];

  constructor(private ingresosService: IngresosService) {}

  ngOnInit(): void {
    this.ingresosService.listaIngresos$.subscribe(lista => {
      this.listaPresupuesto = lista;
      
      this.listaIngresosFijos = lista.filter(item => item.frecuencia !== 'Único');
      this.listaIngresosExtras = lista.filter(item => item.frecuencia === 'Único');

      this.listaIngresosReales = lista.map(item => {
        const montoOriginal = Number(item.monto) || 0;
        const calculo = this.calcularPrestacionesYImpuestosGT(montoOriginal, item.frecuencia);

        return {
          ...item,
          igss: calculo.igss,
          isr: calculo.isr,
          bonoDecreto: calculo.bonoDecreto,
          montoReal: calculo.montoReal
        };
      });

      this.calcularTotales();
    });

    this.ingresosService.ingresoFijo$.subscribe(monto => {
      this.ingresoFijoGuardado = monto;
    });
  }

  calcularPrestacionesYImpuestosGT(monto: number, frecuencia: string) {
    let igss = 0;
    let bonoDecreto = 0;
    let isr = 0;

    if (frecuencia !== 'Único') {
      igss = monto * 0.0483;

      if (frecuencia === 'Mensual') {
        bonoDecreto = 250.00;
      } else if (frecuencia === 'Quincenal') {
        bonoDecreto = 125.00;
      } else if (frecuencia === 'Semanal') {
        bonoDecreto = 62.50;
      }

      isr = monto * 0.05;
    }

    const montoReal = monto - igss - isr + bonoDecreto;

    return { igss, isr, bonoDecreto, montoReal };
  }

  guardarIngresoFijo(): void {
    if (this.montoFijoInput !== null && this.montoFijoInput > 0) {
      const nuevoIngresoFijo = {      
        id: Date.now(),
        categoria: 'Salario Fijo',
        monto: this.montoFijoInput,
        frecuencia: this.frecuenciaFijoInput, 
        fecha: new Date().toISOString().split('T')[0]
      };
      this.ingresosService.agregarIngreso(nuevoIngresoFijo);
      this.montoFijoInput = null; 
    }
  }

  guardarIngresoExtra(): void {
    if (!this.conceptoExtraInput || !this.montoExtraInput) return;
    const nuevoRegistro = {
      id: Date.now(),
      categoria: this.conceptoExtraInput,
      monto: this.montoExtraInput,
      frecuencia: 'Único',
      fecha: this.fechaExtraInput
    };
    this.ingresosService.agregarIngreso(nuevoRegistro);
    
    this.conceptoExtraInput = '';
    this.montoExtraInput = null;
  }

  eliminarIngreso(id: number): void {
    this.ingresosService.eliminarIngreso(id);
  }

  calcularTotales() {
    this.totalPresupuestado = this.listaPresupuesto.reduce((acc, curr) => acc + Number(curr.monto), 0);
    this.totalIngresoReal = this.listaIngresosReales.reduce((acc, curr) => acc + curr.montoReal, 0);
    this.totalGeneralAcumulado = this.totalIngresoReal;
  }
}