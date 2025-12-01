// src/app/pages/admin/admin.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminService,
  Pedido,
  Producto,
  LogReponedor,
  VentaUsuarioResumen,
  Categoria,
  CrearProductoRequest
} from '../../services/admin';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {

  // ====== DATOS DASHBOARD ======
  pedidos: Pedido[] = [];
  productos: Producto[] = [];
  logsReponedor: LogReponedor[] = [];
  ventasPorUsuario: VentaUsuarioResumen[] = [];

  cargando = false;
  error = '';
  mensaje = '';

  // ====== CATEGORÍAS ======
  categorias: Categoria[] = [];
  nuevaCategoria: Partial<Categoria> = {
    nombre: '',
    descripcion: '',
    activo: true
  };
  mensajeCategoria = '';
  errorCategoria = '';

  // modo: crear / editar categoría
  modoCategoria: 'crear' | 'editar' = 'crear';
  categoriaEnEdicion: Categoria | null = null;

  // ====== NUEVO PRODUCTO / EDICIÓN PRODUCTO ======
  nuevoProducto: CrearProductoRequest = {
    categoriaId: 0,
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagenUrl: ''
  };
  mensajeProducto = '';
  errorProducto = '';

  // modo: crear / editar producto
  modoProducto: 'crear' | 'editar' = 'crear';
  productoEnEdicion: Producto | null = null;

  // ====== MODALES ======
  mostrarModalCategoria = false;
  mostrarModalProducto = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  get esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  get esReponedor(): boolean {
    return this.authService.esReponedor();
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarCategorias();
  }

  // ==================== DASHBOARD ====================

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.adminService.obtenerDashboard().subscribe({
      next: (data: any) => {
        console.log('Dashboard recibido:', data);

        this.pedidos = data.pedidos ?? [];
        this.productos = data.productos ?? [];
        this.logsReponedor = data.logsReponedor ?? [];
        this.ventasPorUsuario = data.ventasPorUsuario ?? [];

        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar dashboard', err);
        this.error = 'No se pudo cargar el panel de administración.';
        this.cargando = false;
      }
    });
  }

  // ==================== STOCK / ESTADO / ELIMINAR ====================

  actualizarStock(p: Producto): void {
    const nuevo = prompt(
      `Nuevo stock para "${p.nombre}" (actual: ${p.stock}):`,
      String(p.stock)
    );
    if (nuevo === null) return;

    const valor = Number(nuevo);
    if (Number.isNaN(valor) || valor < 0) {
      alert('Valor de stock no válido');
      return;
    }

    this.adminService.actualizarStock(p.id, valor).subscribe({
      next: (prodActualizado: Producto) => {
        p.stock = prodActualizado.stock;
        this.mensaje = 'Stock actualizado correctamente.';
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'No se pudo actualizar el stock.';
      }
    });
  }

  cambiarActivo(p: Producto): void {
    const nuevoEstado = !p.activo;

    this.adminService.cambiarEstadoActivo(p.id, nuevoEstado).subscribe({
      next: (prodActualizado: Producto) => {
        p.activo = prodActualizado.activo;
        this.mensaje = nuevoEstado
          ? 'Producto marcado como disponible.'
          : 'Producto marcado como no disponible.';
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'No se pudo cambiar el estado del producto.';
      }
    });
  }

  eliminarProducto(p: Producto): void {
    if (!this.esAdmin) return;

    const ok = confirm(`¿Eliminar el producto "${p.nombre}"?`);
    if (!ok) return;

    this.adminService.eliminarProducto(p.id).subscribe({
      next: () => {
        this.productos = this.productos.filter(prod => prod.id !== p.id);
        this.mensaje = 'Producto eliminado correctamente.';
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'No se pudo eliminar el producto.';
      }
    });
  }

  // ==================== CATEGORÍAS ====================

  cargarCategorias(): void {
    this.adminService.listarCategorias().subscribe({
      next: (cats: Categoria[]) => {
        this.categorias = cats || [];
      },
      error: (err: any) => {
        console.error('Error al cargar categorías', err);
      }
    });
  }

  /**
   * Abrir modal de categoría.
   * - Sin parámetro  -> modo CREAR.
   * - Con categoría  -> modo EDITAR (solo admin).
   */
  abrirModalCategoria(cat?: Categoria): void {
    this.mensajeCategoria = '';
    this.errorCategoria = '';

    if (cat) {
      // EDITAR (solo admin)
      if (!this.esAdmin) {
        alert('Solo el administrador puede editar categorías.');
        return;
      }
      this.modoCategoria = 'editar';
      this.categoriaEnEdicion = cat;
      this.nuevaCategoria = {
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        activo: (cat as any).activo ?? true
      };
    } else {
      // CREAR
      this.modoCategoria = 'crear';
      this.categoriaEnEdicion = null;
      this.nuevaCategoria = {
        nombre: '',
        descripcion: '',
        activo: true
      };
    }

    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria(): void {
    this.mostrarModalCategoria = false;
    this.modoCategoria = 'crear';
    this.categoriaEnEdicion = null;
  }

  /**
   * Crear o actualizar categoría según el modo actual.
   */
  crearCategoria(): void {
    this.mensajeCategoria = '';
    this.errorCategoria = '';

    if (!this.nuevaCategoria.nombre || this.nuevaCategoria.nombre.trim() === '') {
      this.errorCategoria = 'El nombre de la categoría es obligatorio.';
      return;
    }

    // ===== EDITAR =====
    if (this.modoCategoria === 'editar' && this.categoriaEnEdicion && this.esAdmin) {
      this.adminService.actualizarCategoria(this.categoriaEnEdicion.id, this.nuevaCategoria).subscribe({
        next: (catActualizada: Categoria) => {
          this.mensajeCategoria = `Categoría "${catActualizada.nombre}" actualizada correctamente.`;
          this.cargarCategorias();
          this.cerrarModalCategoria();
        },
        error: (err: any) => {
          console.error('Error al actualizar categoría', err);
          this.errorCategoria = 'No se pudo actualizar la categoría.';
        }
      });
      return;
    }

    // ===== CREAR =====
    this.adminService.crearCategoria(this.nuevaCategoria).subscribe({
      next: (cat: Categoria) => {
        this.mensajeCategoria = `Categoría "${cat.nombre}" creada correctamente.`;
        this.cargarCategorias();
        this.cerrarModalCategoria();
      },
      error: (err: any) => {
        console.error('Error al crear categoría', err);
        this.errorCategoria = 'No se pudo crear la categoría.';
      }
    });
  }

  // ==================== NUEVO PRODUCTO / EDITAR PRODUCTO ====================

  /**
   * Abrir modal de producto.
   * - Sin parámetro  -> modo CREAR.
   * - Con producto   -> modo EDITAR (solo admin).
   */
  abrirModalProducto(p?: Producto): void {
    this.mensajeProducto = '';
    this.errorProducto = '';

    if (p) {
      // EDITAR
      if (!this.esAdmin) {
        alert('Solo el administrador puede editar productos.');
        return;
      }
      this.modoProducto = 'editar';
      this.productoEnEdicion = p;

      this.nuevoProducto = {
        categoriaId: p.categoria ? p.categoria.id : 0,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        imagenUrl: p.imagenUrl || ''
      };
    } else {
      // CREAR
      this.modoProducto = 'crear';
      this.productoEnEdicion = null;

      this.nuevoProducto = {
        categoriaId: 0,
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        imagenUrl: ''
      };
    }

    this.mostrarModalProducto = true;
  }

  cerrarModalProducto(): void {
    this.mostrarModalProducto = false;
    this.modoProducto = 'crear';
    this.productoEnEdicion = null;
  }

  /**
   * Crear o actualizar producto según el modo actual.
   */
  crearProducto(): void {
    this.mensajeProducto = '';
    this.errorProducto = '';

    if (!this.nuevoProducto.categoriaId || this.nuevoProducto.categoriaId <= 0) {
      this.errorProducto = 'Debes seleccionar una categoría.';
      return;
    }

    if (!this.nuevoProducto.nombre || this.nuevoProducto.nombre.trim() === '') {
      this.errorProducto = 'El nombre del producto es obligatorio.';
      return;
    }

    if (this.nuevoProducto.precio <= 0) {
      this.errorProducto = 'El precio debe ser mayor a 0.';
      return;
    }

    if (this.nuevoProducto.stock < 0) {
      this.errorProducto = 'El stock no puede ser negativo.';
      return;
    }

    // ===== EDITAR PRODUCTO =====
    if (this.modoProducto === 'editar' && this.productoEnEdicion && this.esAdmin) {
      const payload: CrearProductoRequest = {
        categoriaId: this.nuevoProducto.categoriaId,
        nombre: this.nuevoProducto.nombre,
        descripcion: this.nuevoProducto.descripcion,
        precio: this.nuevoProducto.precio,
        stock: this.nuevoProducto.stock,
        imagenUrl: this.nuevoProducto.imagenUrl
      };

      this.adminService.actualizarProducto(this.productoEnEdicion.id, payload).subscribe({
        next: (prodActualizado: Producto) => {
          this.mensajeProducto = `Producto "${prodActualizado.nombre}" actualizado correctamente.`;
          this.cargarDatos();  // refresca tabla de productos
          this.cerrarModalProducto();
        },
        error: (err: any) => {
          console.error('Error al actualizar producto', err);
          this.errorProducto = 'No se pudo actualizar el producto.';
        }
      });

      return;
    }

    // ===== CREAR PRODUCTO =====
    this.adminService.crearProducto(this.nuevoProducto).subscribe({
      next: (prod: Producto) => {
        this.mensajeProducto = `Producto "${prod.nombre}" creado correctamente.`;
        this.cargarDatos();     // refresca tabla
        this.cerrarModalProducto();
      },
      error: (err: any) => {
        console.error('Error al crear producto', err);
        this.errorProducto = 'No se pudo crear el producto.';
      }
    });
  }
}
