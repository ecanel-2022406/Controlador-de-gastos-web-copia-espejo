import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-historial',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit, OnDestroy {
    historialCompleto: any[] = [];
    historialFiltrado: any[] = [];
    busquedaTexto: string = '';

    private subsHistorial?: Subscription;

    constructor(private ingresosService: IngresosService) {}

    ngOnInit(): void {
        this.subsHistorial = this.ingresosService.historialUnificado$.subscribe(([ingresos, gastos, transferencias]) => {
            this.combinarHistorial(ingresos || [], gastos || [], transferencias || []);
        });
    }

    ngOnDestroy(): void {
        if (this.subsHistorial) {
            this.subsHistorial.unsubscribe();
        }
    }

    combinarHistorial(ingresos: any[], gastos: any[], transferencias: any[]): void {
        const listIngresos = ingresos.map(item => ({
            ...item,
            tipoMovimiento: 'Ingreso',
            montoValor: Number(item.monto) || 0,
            descripcion: item.concepto || item.descripcion || 'Ingreso registrado',
            claseMonto: 'historial-ingreso'
        }));

        const listGastos = gastos.map(item => ({
            ...item,
            tipoMovimiento: 'Gasto',
            montoValor: Number(item.monto) || 0,
            descripcion: item.categoria || item.descripcion || 'Gasto registrado',
            claseMonto: 'historial-gasto'
        }));

        const listTransferencias = transferencias.map(item => ({
            ...item,
            tipoMovimiento: 'Transferencia',
            montoValor: Number(item.monto) || 0,
            descripcion: `Transferencia a ${item.destino || 'Cuenta externa'} - ${item.descripcion || ''}`,
            claseMonto: 'historial-gasto' // Resta saldo igual que un gasto
        }));

        // Unimos y ordenamos por ID de forma descendente (más reciente primero)
        this.historialCompleto = [...listIngresos, ...listGastos, ...listTransferencias].sort((a, b) => b.id - a.id);
        this.aplicarFiltrosHistorial();
    }

    aplicarFiltrosHistorial(): void {
        this.historialFiltrado = this.historialCompleto.filter(item => {
            const cumpleTexto = !this.busquedaTexto || 
                item.descripcion.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
                item.tipoMovimiento.toLowerCase().includes(this.busquedaTexto.toLowerCase());
            return cumpleTexto;
        });
    }
}