/* usuario.spec.ts */
import { Usuario } from './usuario';

describe('Usuario model', () => {
  it('should allow creating a Usuario object', () => {
    const usuario: Usuario = {
      id: 1,
      username: 'test-user',
      email: 'test@example.com',
      // Si tu interface tiene más campos obligatorios, añádelos aquí
    } as Usuario;

    expect(usuario).toBeTruthy();
    expect(usuario.username).toBe('test-user');
  });
});
