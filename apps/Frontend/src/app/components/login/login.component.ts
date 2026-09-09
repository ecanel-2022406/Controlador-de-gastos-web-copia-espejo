import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  esRegistro = false;
  
  usuario = {
    nombre: '',
    email: '',
    password: ''
  };

  private authService = inject(AuthService);
  private router = inject(Router);

  enviarFormulario() {
    if (this.esRegistro) {
      this.authService.register(this.usuario).subscribe({
        next: (res: any) => {
          alert('¡Usuario registrado con éxito! Ahora inicia sesión.');
          this.esRegistro = false;
          this.usuario.password = '';
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Error al registrarse');
        }
      });
    } else {
      this.authService.login({ email: this.usuario.email, password: this.usuario.password }).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          
          const nombreEncontrado = res.nombre || res.usuario?.nombre || this.usuario.email.split('@')[0];
          localStorage.setItem('nombreUsuario', nombreEncontrado);

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Credenciales incorrectas');
        }
      });
    }
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:4000/api/auth/google';
  }
}