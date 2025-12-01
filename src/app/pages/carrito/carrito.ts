// src/app/pages/carrito/carrito.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService, Carrito, CarritoItem } from '../../services/carrito';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss'],
})
export class CarritoComponent implements OnInit {
  carrito: Carrito | null = null;

  cargando = false;
  error = '';
  mensaje = '';

  // mensajes específicos de la compra
  mensajeCompra = '';
  errorCompra = '';

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.cargarCarrito();
  }

  private cargarCarrito(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';
    this.mensajeCompra = '';
    this.errorCompra = '';

    this.carritoService.obtenerMiCarrito().subscribe({
      next: (carrito: Carrito) => {
        carrito.items = carrito.items || [];
        this.carrito = carrito;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar carrito', err);
        this.error = err?.error?.detalle || 'No se pudo cargar el carrito.';
        this.cargando = false;
      },
    });
  }

  totalCarrito(): number {
    if (!this.carrito) return 0;
    return this.carrito.items.reduce(
      (acc, item) => acc + item.cantidad * item.precioUnitario,
      0
    );
  }

  cambiarCantidad(item: CarritoItem, delta: number): void {
    if (!this.carrito) return;

    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;

    this.error = '';
    this.mensaje = '';
    this.mensajeCompra = '';
    this.errorCompra = '';

    this.carritoService.actualizarCantidad(item.producto.id, nuevaCantidad).subscribe({
      next: (carritoActualizado: Carrito) => {
        carritoActualizado.items = carritoActualizado.items || [];
        this.carrito = carritoActualizado;
      },
      error: (err: any) => {
        console.error('Error al actualizar cantidad', err);
        this.error = err?.error?.detalle || 'No se pudo actualizar la cantidad.';
      },
    });
  }

  vaciar(): void {
    this.error = '';
    this.mensaje = '';
    this.mensajeCompra = '';
    this.errorCompra = '';

    this.carritoService.vaciarCarrito().subscribe({
      next: (carritoActualizado: Carrito) => {
        carritoActualizado.items = carritoActualizado.items || [];
        this.carrito = carritoActualizado;
        this.mensaje = 'Carrito vaciado correctamente.';
      },
      error: (err: any) => {
        console.error('Error al vaciar carrito', err);
        this.error = err?.error?.detalle || 'No se pudo vaciar el carrito.';
      },
    });
  }

  finalizarCompra(): void {
    this.mensajeCompra = '';
    this.errorCompra = '';

    this.carritoService.finalizarCompra().subscribe({
      next: (pedido: any) => {
        this.mensajeCompra =
          'Compra realizada correctamente. Nº pedido: ' + pedido.id;
        // recarga el carrito (debería venir vacío tras la compra)
        this.cargarCarrito();
      },
      error: (err: any) => {
        console.error('Error al finalizar compra', err);
        this.errorCompra =
          err?.error?.detalle || 'No se pudo completar la compra.';
      },
    });
  }
}
