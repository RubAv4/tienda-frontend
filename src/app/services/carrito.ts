/* src/app/services/carrito.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from './producto';
import { API_BASE_URL } from '../config/api.config';

export interface CarritoItem {
  id: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
}

export interface Carrito {
  id: number;
  estado: string;
  items: CarritoItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
   private apiUrl = `${API_BASE_URL}/carrito`;

  constructor(private http: HttpClient) {}

  obtenerMiCarrito(): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/mio`);
  }

  agregarProducto(productoId: number, cantidad: number): Observable<Carrito> {
    return this.http.post<Carrito>(
      `${this.apiUrl}/agregar`,
      null,
      {
        params: {
          productoId: productoId.toString(),
          cantidad: cantidad.toString(),
        },
      }
    );
  }

  actualizarCantidad(productoId: number, cantidad: number): Observable<Carrito> {
    return this.http.put<Carrito>(
      `${this.apiUrl}/cantidad`,
      null,
      {
        params: {
          productoId: productoId.toString(),
          cantidad: cantidad.toString(),
        },
      }
    );
  }

  vaciarCarrito(): Observable<Carrito> {
    return this.http.post<Carrito>(`${this.apiUrl}/vaciar`, null);
  }

  finalizarCompra(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/comprar`, {});
  }
}
