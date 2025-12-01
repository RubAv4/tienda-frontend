// src/app/interceptors/auth-interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { API_BASE_URL } from '../config/api.config';

/**
 * Interceptor que agrega el header Authorization: Bearer <token>
 * a TODAS las peticiones que vayan a nuestro backend (API_BASE_URL).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obtenerToken();

  // Solo tocamos las peticiones que van a nuestro backend
  const esApiBackend = req.url.startsWith(API_BASE_URL);

  if (token && esApiBackend) {
    const reqClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(reqClonada);
  }

  // Si no hay token o no es URL de la API, la dejamos igual
  return next(req);
};
