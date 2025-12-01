// src/app/services/filtro-productos.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltroProductosService {

  // null = todas las categorías
  private categoriaSeleccionadaSubject = new BehaviorSubject<string | null>(null);
  categoriaSeleccionada$ = this.categoriaSeleccionadaSubject.asObservable();

  private textoBusquedaSubject = new BehaviorSubject<string>('');
  textoBusqueda$ = this.textoBusquedaSubject.asObservable();

  // 🔹 NUEVO: lista de categorías dinámicas (para barra lateral y select superior)
  private categoriasSubject = new BehaviorSubject<string[]>([]);
  categorias$ = this.categoriasSubject.asObservable();

  setCategoria(nombre: string | null): void {
    this.categoriaSeleccionadaSubject.next(nombre);
  }

  setTextoBusqueda(texto: string): void {
    this.textoBusquedaSubject.next(texto);
  }

  // 🔹 NUEVO: actualizar lista de categorías
  setCategorias(nombres: string[]): void {
    this.categoriasSubject.next(nombres);
  }
}
