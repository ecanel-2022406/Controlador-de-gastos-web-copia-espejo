import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/gastos';

  // Obtener todos los gastos del usuario autenticado
  obtenerGastos(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl, { headers });
  }

  // Crear un nuevo gasto
  crearGasto(gasto: { titulo: string; monto: number; categoria: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, gasto, { headers });
  }
}