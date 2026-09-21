import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferenciaService, Transferencia } from '../../services/transferencia.service';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.css']
})
export class TransaccionesComponent implements OnInit {
  private transferenciaService = inject(TransferenciaService);

  listaTransferencias: Transferencia[] = [];
  transaccionesFiltradas: Transferencia[] = [];
  
  busquedaConcepto: string = '';
  ingresoTotal: number = 0;
  totalGastosAcumulado: number = 0;
  totalTransferenciasAcumulado: number = 0;

  // Adaptado para que el HTML reconozca los campos del formulario
  nuevaTransferencia = {
    cuentaOrigen: 'Cuenta Principal',
    cuentaDestino: '',
    monto: null as number | null,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  };

  mostrarModalAlerta: boolean = false;
  mensajeAlerta: string = '';

  ngOnInit(): void {
    this.cargarTransferencias();
  }

  cargarTransferencias(): void {
    this.transferenciaService.obtenerTransferencias().subscribe({
      next: (data) => {
        this.listaTransferencias = data;
        this.transaccionesFiltradas = data;
        this.totalTransferenciasAcumulado = data.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
      },
      error: (err) => {
        console.error('Error al cargar transferencias:', err);
      }
    });
  }

  abrirModal(mensaje: string): void {
    this.mensajeAlerta = mensaje;
    this.mostrarModalAlerta = true;
  }

  cerrarModal(): void {
    this.mostrarModalAlerta = false;
    this.mensajeAlerta = '';
  }

  realizarTransferencia(): void {
    if (!this.nuevaTransferencia.cuentaDestino || !this.nuevaTransferencia.monto || this.nuevaTransferencia.monto <= 0 || !this.nuevaTransferencia.descripcion) {
      this.abrirModal('Por favor completa todos los campos (destino, monto y motivo).');
      return;
    }

    const montoNuevo = Number(this.nuevaTransferencia.monto);

    // Mapeamos los campos del formulario antiguo a la estructura que guarda PostgreSQL
    const transferenciaObj: Transferencia = {
      titulo: `${this.nuevaTransferencia.cuentaDestino} - ${this.nuevaTransferencia.descripcion}`,
      monto: montoNuevo,
      categoria: this.nuevaTransferencia.descripcion,
      fecha: this.nuevaTransferencia.fecha,
      origen: this.nuevaTransferencia.cuentaOrigen,
      destino: this.nuevaTransferencia.cuentaDestino,
      descripcion: this.nuevaTransferencia.descripcion
    };

    this.transferenciaService.crearTransferencia(transferenciaObj).subscribe({
      next: () => {
        this.cargarTransferencias();
        this.nuevaTransferencia = {
          cuentaOrigen: 'Cuenta Principal',
          cuentaDestino: '',
          monto: null,
          descripcion: '',
          fecha: new Date().toISOString().split('T')[0]
        };
      },
      error: (err) => {
        console.error('Error al guardar transferencia:', err);
        this.abrirModal('No se pudo guardar la transferencia.');
      }
    });
  }

  eliminarTransferencia(id?: number): void {
    if (!id) return;
    
    this.transferenciaService.eliminarTransferencia(id).subscribe({
      next: () => {
        this.cargarTransferencias();
      },
      error: (err) => {
        console.error('Error al eliminar transferencia:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.transaccionesFiltradas = this.listaTransferencias.filter(t => {
      const destinoTxt = t.destino || t.titulo || '';
      const descTxt = t.descripcion || t.categoria || '';
      return !this.busquedaConcepto || 
        destinoTxt.toLowerCase().includes(this.busquedaConcepto.toLowerCase()) || 
        descTxt.toLowerCase().includes(this.busquedaConcepto.toLowerCase());
    });
  }
}