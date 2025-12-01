/* src/app/pages/inicio/inicio.ts */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../services/producto';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { FiltroProductosService } from '../../services/filtro-productos';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class InicioComponent implements OnInit {

  // Lista completa desde el backend
  productos: Producto[] = [];
  // Lista filtrada que se muestra en la vista
  productosFiltrados: Producto[] = [];

  cargando = false;
  error = '';

  // Filtros actuales
  categoriaSeleccionada: string | null = null;  // nombre exacto de la categoría
  textoBusqueda: string = '';

  // 🔹 NUEVO: lista de categorías obtenidas del backend
  categorias: string[] = [];

  // Modal de producto
  mostrandoModal = false;
  productoSeleccionado: Producto | null = null;
  cantidadSeleccionada = 1;
  mensajeCarrito = '';
  errorCarrito = '';

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
    private filtroProductos: FiltroProductosService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();

    // Escuchar cambios de filtros (vengan de la barra superior o de la barra lateral)
    this.filtroProductos.categoriaSeleccionada$.subscribe(cat => {
      this.categoriaSeleccionada = cat;
      this.aplicarFiltros();
    });

    this.filtroProductos.textoBusqueda$.subscribe(texto => {
      this.textoBusqueda = texto;
      this.aplicarFiltros();
    });
  }

  cargarProductos() {
    this.cargando = true;
    this.error = '';

    this.productoService.obtenerActivos().subscribe({
      next: (data) => {
        this.productos = data;

        // 🔹 Construir lista de categorías dinámicas desde los productos
        const nombres = Array.from(
          new Set(
            data
              .map(p => p.categoria?.nombre?.trim())
              .filter((n): n is string => !!n)
          )
        ).sort((a, b) => a.localeCompare(b));

        this.categorias = nombres;

        // Enviar categorías al servicio para que la barra superior también las vea
        this.filtroProductos.setCategorias(this.categorias);

        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos. Inicia sesión y verifica el backend.';
        this.cargando = false;
        this.productosFiltrados = [];
      }
    });
  }

  // ============================
  //      LÓGICA DE FILTROS
  // ============================

  aplicarFiltros(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();
    const catSeleccionada = this.categoriaSeleccionada
      ? this.categoriaSeleccionada.toLowerCase()
      : null;

    this.productosFiltrados = this.productos.filter((p) => {
      const nombreCat = (p.categoria?.nombre || '').toLowerCase();

      const coincideCategoria =
        !catSeleccionada || nombreCat === catSeleccionada;

      const cadenaBusqueda = (
        (p.nombre || '') + ' ' +
        (p.descripcion || '') + ' ' +
        (p.categoria?.nombre || '')
      ).toLowerCase();

      const coincideTexto =
        !texto || cadenaBusqueda.includes(texto);

      return coincideCategoria && coincideTexto;
    });
  }

  // 🔹 Click en las categorías de la barra lateral
  seleccionarCategoria(nombre: string | null): void {
    // avisamos al servicio; InicioComponent se actualiza solo por las suscripciones
    this.filtroProductos.setCategoria(nombre);
  }

  // ============================
  //   DETALLE Y CARRITO
  // ============================

  verDetalle(producto: Producto) {
    this.productoSeleccionado = producto;
    this.cantidadSeleccionada = 1;
    this.mensajeCarrito = '';
    this.errorCarrito = '';
    this.mostrandoModal = true;
  }

  cerrarModal() {
    this.mostrandoModal = false;
    this.productoSeleccionado = null;
  }

  // Pocas unidades: stock entre 1 y 5
  get stockBajo(): boolean {
    const p = this.productoSeleccionado;
    return !!p && p.stock != null && p.stock > 0 && p.stock <= 5;
  }

  // Sin stock o inactivo
  get sinStock(): boolean {
    const p = this.productoSeleccionado;
    return !!p && ((p.stock == null || p.stock <= 0) || (p as any).activo === false);
  }

  agregarAlCarrito() {
    this.mensajeCarrito = '';
    this.errorCarrito = '';

    if (!this.productoSeleccionado) return;

    const stock = this.productoSeleccionado.stock ?? 0;

    if (stock <= 0 || this.sinStock) {
      this.errorCarrito = 'Este producto no tiene stock disponible.';
      return;
    }

    if (this.cantidadSeleccionada < 1) {
      this.errorCarrito = 'La cantidad debe ser al menos 1.';
      return;
    }

    if (this.cantidadSeleccionada > stock) {
      this.errorCarrito = `Solo hay ${stock} unidades disponibles.`;
      return;
    }

    if (!this.authService.estaAutenticado()) {
      this.errorCarrito = 'Debes iniciar sesión para agregar productos al carrito.';
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/' } });
      return;
    }

    this.carritoService
      .agregarProducto(this.productoSeleccionado.id, this.cantidadSeleccionada)
      .subscribe({
        next: () => {
          this.mensajeCarrito = 'Producto agregado al carrito correctamente.';
        },
        error: () => {
          this.errorCarrito = 'No se pudo agregar el producto al carrito.';
        }
      });
  }
}

