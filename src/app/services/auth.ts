// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario_actual';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

// Versión normalizada que usaremos en toda la app
export interface UsuarioAuth {
  id: number;
  username: string;
  email: string;
  roles: string[];   // ["ROLE_ADMIN", "ROLE_REPONEDOR", "ROLE_USER", ...]
}

// Versión tal como viene del backend
interface RolApi {
  id: number;
  nombre: string;
  descripcion: string;
}

interface UsuarioApi {
  id: number;
  username: string;
  email: string;
  roles: RolApi[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  // --------------------------------
  // LOGIN
  // --------------------------------
  login(data: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      // 1) Guardar token
      tap(resp => this.guardarToken(resp.token)),

      // 2) Extraer username
      map(resp => resp.username),

      // 3) Pedir usuario completo y normalizar roles
      tap(username => {
        this.http
          .get<UsuarioApi>(`${this.apiUrl}/usuarios/buscar?username=${username}`)
          .subscribe({
            next: usuarioApi => {
              const usuarioNormalizado: UsuarioAuth = {
                id: usuarioApi.id,
                username: usuarioApi.username,
                email: usuarioApi.email,
                roles: (usuarioApi.roles || []).map(r => r.nombre) // ["ROLE_ADMIN", ...]
              };
              this.guardarUsuarioActual(usuarioNormalizado);
            },
            error: () => this.eliminarUsuarioActual()
          });
      }),

      // 4) Devolvemos void
      map(() => void 0)
    );
  }

  registrar(usuario: { username: string; email: string; password: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/registro`, usuario);
  }

  // --------------------------------
  // TOKEN & USUARIO
  // --------------------------------
  private guardarToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  eliminarToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  private guardarUsuarioActual(usuario: UsuarioAuth) {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  }

  obtenerUsuarioActual(): UsuarioAuth | null {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioAuth;
    } catch {
      return null;
    }
  }

  eliminarUsuarioActual() {
    localStorage.removeItem(USUARIO_KEY);
  }

  // --------------------------------
  // HELPERS DE ROLES
  // --------------------------------
  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  private tieneRol(rol: string): boolean {
    const usuario = this.obtenerUsuarioActual();
    return !!usuario && (usuario.roles || []).includes(rol);
  }

  esAdmin(): boolean {
    return this.tieneRol('ROLE_ADMIN');
  }

  esReponedor(): boolean {
    return this.tieneRol('ROLE_REPONEDOR');
  }

  /**
   * Cliente “normal”: no es admin ni reponedor.
   * Si además usas un rol explícito como ROLE_USER / ROLE_CLIENTE,
   * puedes añadirlo aquí.
   */
  esCliente(): boolean {
    const usuario = this.obtenerUsuarioActual();
    if (!usuario) return false;

    const roles = usuario.roles || [];
    const esAdmin = roles.includes('ROLE_ADMIN');
    const esRepo = roles.includes('ROLE_REPONEDOR');

    // Si tienes ROLE_USER, también puedes comprobarlo:
    // const esUser = roles.includes('ROLE_USER');

    return !esAdmin && !esRepo; // && esUser (si lo usas)
  }

  cerrarSesion() {
    this.eliminarToken();
    this.eliminarUsuarioActual();
  }
}
