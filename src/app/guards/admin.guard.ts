// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    router.navigate(['/login']);
    return false;
  }

  const usuario = auth.obtenerUsuarioActual();
  const roles = usuario?.roles || [];

  // permitir ADMIN y REPONEDOR para el panel
  if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_REPONEDOR')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
