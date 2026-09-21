import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api';

  private listaIngresosSubject = new BehaviorSubject<any[]>([]);
  listaIngresos$ = this.listaIngresosSubject.asObservable();

  private listaGastosSubject = new BehaviorSubject<any[]>([]);
  listaGastos$ = this.listaGastosSubject.asObservable();

  private listaTransferenciasSubject = new BehaviorSubject<any[]>([]);
  listaTransferencias$ = this.listaTransferenciasSubject.asObservable();

  private ingresoFijoSubject = new BehaviorSubject<number>(0);
  ingresoFijo$ = this.ingresoFijoSubject.asObservable();

  historialUnificado$ = combineLatest([
    this.listaIngresos$,
    this.listaGastos$,
    this.listaTransferencias$
  ]);

  constructor() {
    // Ya no disparamos recargarDatosUsuario() a ciegas en el constructor.
    // Dejamos que el Dashboard o el componente lo invoquen cuando ya hay sesión segura.
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Sincroniza todos los datos desde PostgreSQL (Gastos, Ingresos, Transferencias)
  recargarDatosUsuario(): void {
    const token = localStorage.getItem('token');
    if (!token) return; // Evita peticiones 401 si no hay token

    const headers = this.getHeaders();

    // 1. Obtener Gastos
    this.http.get<any[]>(`${this.apiUrl}/gastos`, { headers }).subscribe({
      next: (gastos) => this.listaGastosSubject.next(gastos),
      error: (err) => console.error('Error al cargar gastos:', err)
    });

    // 2. Obtener Ingresos (Asegúrate de tener esta ruta /api/ingresos en tu backend)
    this.http.get<any[]>(`${this.apiUrl}/ingresos`, { headers }).subscribe({
      next: (ingresos) => this.listaIngresosSubject.next(ingresos),
      error: (err) => console.error('Error al cargar ingresos:', err)
    });

    // 3. Obtener Transferencias (Asegúrate de tener esta ruta /api/transferencias en tu backend)
    this.http.get<any[]>(`${this.apiUrl}/transferencias`, { headers }).subscribe({
      next: (transferencias) => this.listaTransferenciasSubject.next(transferencias),
      error: (err) => console.error('Error al cargar transferencias:', err)
    });
  }

  obtenerSaldoDisponibleReal(): number {
    const ingresos = this.listaIngresosSubject.getValue();
    const gastos = this.listaGastosSubject.getValue();
    const transferencias = this.listaTransferenciasSubject.getValue();

    let granTotalNeto = 0;

    ingresos.forEach(item => {
      const monto = Number(item.monto) || 0;
      const frecuencia = item.frecuencia || 'Único';

      if (frecuencia !== 'Único') {
        const igss = monto * 0.0483;
        const isr = monto * 0.05;
        let bonoDecreto = 0;

        if (frecuencia === 'Mensual') bonoDecreto = 250.00;
        else if (frecuencia === 'Quincenal') bonoDecreto = 125.00;
        else if (frecuencia === 'Semanal') bonoDecreto = 62.50;

        granTotalNeto += (monto - igss - isr + bonoDecreto);
      } else {
        granTotalNeto += monto;
      }
    });

    const totalGastos = gastos.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
    const totalTransferencias = transferencias.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);

    return granTotalNeto - totalGastos - totalTransferencias;
  }

  // --- MÉTODOS CONECTADOS AL BACKEND ---

  agregarGasto(nuevoGasto: { titulo: string; monto: number; categoria: string }): void {
    const headers = this.getHeaders();
    this.http.post(`${this.apiUrl}/gastos`, nuevoGasto, { headers }).subscribe({
      next: () => this.recargarDatosUsuario(),
      error: (err) => console.error('Error al guardar gasto:', err)
    });
  }

  agregarIngreso(nuevoIngreso: any): void {
    const headers = this.getHeaders();
    this.http.post(`${this.apiUrl}/ingresos`, nuevoIngreso, { headers }).subscribe({
      next: () => this.recargarDatosUsuario(),
      error: (err) => console.error('Error al guardar ingreso:', err)
    });
  }

  guardarTransferencia(nuevaTransaccion: any): void {
    const headers = this.getHeaders();
    this.http.post(`${this.apiUrl}/transferencias`, nuevaTransaccion, { headers }).subscribe({
      next: () => this.recargarDatosUsuario(),
      error: (err) => console.error('Error al guardar transferencia:', err)
    });
  }

  eliminarIngreso(id: number): void {
    const headers = this.getHeaders();
    this.http.delete(`${this.apiUrl}/ingresos/${id}`, { headers }).subscribe({
      next: () => this.recargarDatosUsuario(),
      error: (err) => console.error('Error al eliminar ingreso:', err)
    });
  }

  eliminarTransferencia(id: number): void {
    const headers = this.getHeaders();
    this.http.delete(`${this.apiUrl}/transferencias/${id}`, { headers }).subscribe({
      next: () => this.recargarDatosUsuario(),
      error: (err) => console.error('Error al eliminar transferencia:', err)
    });
  }
}