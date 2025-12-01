// src/app/services/admin.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ================== INTERFACES EXISTENTES ==================

export interface PedidoItem {
  id: number;
  cantidad: number;
  precioUnitario: number;
  producto: {
    id: number;
    nombre: string;
  };
}

export interface Pedido {
  id: number;
  fecha: string;
  total: number;
  usuario: {
    id: number;
    username: string;
  };
  items: PedidoItem[];
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  precio: number;
  stock: number;
  activo: boolean;
  categoria: Categoria | null;
}

export interface LogReponedor {
  id: number;
  fecha: string;
  mensaje: string;
  cantidadAgregada: number;
  producto?: {
    id: number;
    nombre: string;
  };
  usuarioReponedor?: {
    id: number;
    username: string;
  };
}

export interface VentaUsuarioResumen {
  usuarioId: number;
  username: string;
  pedidos: number;
  total: number;
}

export interface DashboardResponse {
  pedidos: Pedido[];
  productos: Producto[];
  logsReponedor: LogReponedor[];
  ventasPorUsuario: VentaUsuarioResumen[];
}

// ================== NUEVAS INTERFACES ======================

export interface CrearProductoRequest {
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
}

// Para actualización (parcial)
export interface ActualizarCategoriaRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ActualizarProductoRequest {
  categoriaId?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  imagenUrl?: string;
}

// ================== SERVICIO ===============================

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // ------- DASHBOARD -------
  obtenerDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
  }

  // ------- STOCK / ESTADO / ELIMINAR -------
  actualizarStock(id: number, stock: number) {
    return this.http.put<Producto>(
      `${this.apiUrl}/productos/${id}/stock`,
      null,
      { params: { stock: stock.toString() } }
    );
  }

  cambiarEstadoActivo(id: number, activo: boolean) {
    return this.http.put<Producto>(
      `${this.apiUrl}/productos/${id}/activo`,
      null,
      { params: { activo: String(activo) } }
    );
  }

  eliminarProducto(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`);
  }

  // ================== CATEGORÍAS =====================

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  crearCategoria(data: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/categorias`, data);
  }

  actualizarCategoria(id: number, data: ActualizarCategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/categorias/${id}`, data);
  }

  // ================== PRODUCTOS =====================

  crearProducto(req: CrearProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, req);
  }

  actualizarProducto(id: number, data: ActualizarProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, data);
  }
}
