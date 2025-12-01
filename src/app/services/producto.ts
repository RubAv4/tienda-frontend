// src/app/services/productos.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

const API_URL = `${API_BASE_URL}/productos`;

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  activo: boolean;
  categoria: Categoria | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http: HttpClient) {}

  // Productos visibles en la tienda (endpoint público)
  obtenerActivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_URL}/activos`);
  }

  // Admin / reponedor: todos los productos
  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(API_URL);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(API_URL, producto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${API_URL}/${id}`, producto);
  }

  // 🔹 NUEVO: actualización parcial (para el modal de edición en admin)
  actualizarParcial(id: number, cambios: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${API_URL}/${id}`, cambios);
  }

  actualizarStock(id: number, stock: number) {
    return this.http.patch<Producto>(`${API_URL}/${id}/stock`, { stock });
  }

}
