import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {
  private listaGastosSource = new BehaviorSubject<any[]>([
    { categoria: 'Alquiler', monto: 1500, frecuencia: 'Mensual', fecha: '01 Sep' },
    { categoria: 'Supermercado', monto: 450, frecuencia: 'Variable', fecha: '05 Sep' }
  ]);
  
  listaGastos$ = this.listaGastosSource.asObservable();

  getGastosActuales() {
    return this.listaGastosSource.value;
  }

  agregarGasto(gasto: any) {
    const actuales = this.listaGastosSource.value;
    this.listaGastosSource.next([gasto, ...actuales]);
  }
}