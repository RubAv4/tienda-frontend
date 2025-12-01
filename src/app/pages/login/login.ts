import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  formLogin!: FormGroup;
  formRegistro!: FormGroup;

  cargandoLogin = false;
  cargandoRegistro = false;

  errorLogin = '';
  mensajeRegistro = '';
  errorRegistro = '';

  // para mostrar/ocultar el modal de registro
  mostrandoRegistro = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // formularios
    this.formLogin = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.formRegistro = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  abrirRegistro() {
    this.mensajeRegistro = '';
    this.errorRegistro = '';
    this.mostrandoRegistro = true;
  }

  cerrarRegistro() {
    this.mostrandoRegistro = false;
  }

  onSubmitLogin() {
    this.errorLogin = '';

    if (this.formLogin.invalid) {
      this.errorLogin = 'Completa usuario y contraseña.';
      return;
    }

    this.cargandoLogin = true;

    this.authService.login(this.formLogin.value).subscribe({
      next: () => {
        this.cargandoLogin = false;
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.cargandoLogin = false;
        this.errorLogin = err.error?.detalle || 'Credenciales incorrectas.';
      }
    });
  }

  onSubmitRegistro() {
    this.mensajeRegistro = '';
    this.errorRegistro = '';

    if (this.formRegistro.invalid) {
      this.errorRegistro = 'Revisa los datos del formulario.';
      return;
    }

    this.cargandoRegistro = true;

    this.authService.registrar(this.formRegistro.value).subscribe({
      next: () => {
        this.cargandoRegistro = false;
        this.mensajeRegistro = 'Usuario registrado correctamente. Ahora puedes iniciar sesión.';
        this.formRegistro.reset();
      },
      error: (err) => {
        this.cargandoRegistro = false;
        this.errorRegistro = err.error?.detalle || 'No se pudo registrar el usuario.';
      }
    });
  }
}
