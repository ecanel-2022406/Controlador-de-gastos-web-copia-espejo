import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';

@Component({
    selector: 'app-historial',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
    historialCompleto: any[] = [];
    historialFiltrado: any[] = [];

    filtroMes: string = 'todos';
    busquedaTexto: string = '';

    constructor(private ingresosService: IngresosService) {}

    ngOnInit(): void {
        this.ingresosService.listaIngresos$.subscribe(ingresos => {
        this.ingresosService.listaGastos$.subscribe(gastos => {
            this.combinarHistorial(ingresos || [], gastos || []);
        });
    });
    }

    combinarHistorial(ingresos: any[], gastos: any[]): void {
    const listIngresos = ingresos.map(item => ({
        ...item,
        tipoMovimiento: 'Ingreso',
        montoValor: Number(item.monto) || 0,
        descripcion: item.concepto || item.categoria || 'Ingreso registrado',
        claseMonto: 'historial-ingreso'
    }));

    const listGastos = gastos.map(item => ({
        ...item,
        tipoMovimiento: 'Gasto',
        montoValor: Number(item.monto) || 0,
        descripcion: item.categoria || item.concepto || 'Gasto registrado',
        claseMonto: 'historial-gasto'
    }));

        this.historialCompleto = [...listIngresos, ...listGastos].sort((a, b) => b.id - a.id);
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