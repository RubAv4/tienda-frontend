// src/app/core/barra-superior/barra-superior.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, UsuarioAuth } from '../../services/auth';
import { FiltroProductosService } from '../../services/filtro-productos';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './barra-superior.html',
  styleUrls: ['./barra-superior.scss']
})
export class BarraSuperiorComponent implements OnInit {

  categorias: string[] = [];
  categoriaSeleccionada: string | null = null;
  textoBusqueda: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private filtroProductos: FiltroProductosService
  ) {}

  ngOnInit(): void {
    // Recibir lista de categorías dinámica
    this.filtroProductos.categorias$.subscribe(cats => {
      this.categorias = cats;
    });

    // Mantener sincronizados los filtros
    this.filtroProductos.categoriaSeleccionada$.subscribe(cat => {
      this.categoriaSeleccionada = cat;
    });

    this.filtroProductos.textoBusqueda$.subscribe(text => {
      this.textoBusqueda = text;
    });
  }

  // ==== AUTH / USUARIO ====

  get usuarioActual(): UsuarioAuth | null {
    return this.authService.obtenerUsuarioActual();
  }

  estaAutenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  get esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  get esReponedor(): boolean {
    return this.authService.esReponedor();
  }

  get esCliente(): boolean {
    return this.authService.esCliente();
  }

  get nombreUsuario(): string {
    return this.usuarioActual?.username ?? '';
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  irAlAdmin() {
    this.router.navigate(['/admin']);
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }

  // ==== FILTROS ====

  onCategoriaChange(valor: string | null) {
    const cat = valor || null;
    this.filtroProductos.setCategoria(cat);
  }

  onTextoChange(valor: string) {
    this.filtroProductos.setTextoBusqueda(valor);
  }

  buscar() {
    this.filtroProductos.setTextoBusqueda(this.textoBusqueda);
  }
}
