import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transferencia {
  id?: number;
  titulo: string;
  monto: number;
  categoria?: string;
  fecha?: string;
  origen?: string;
  destino?: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/transferencias';

  obtenerTransferencias(): Observable<Transferencia[]> {
    return this.http.get<Transferencia[]>(this.apiUrl);
  }

  crearTransferencia(transferencia: Transferencia): Observable<Transferencia> {
    return this.http.post<Transferencia>(this.apiUrl, transferencia);
  }

  eliminarTransferencia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}