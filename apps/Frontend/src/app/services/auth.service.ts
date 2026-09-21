import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
                    
          if (response.usuario && response.usuario.email) {
            localStorage.setItem('emailUsuario', response.usuario.email);
          } else if (credentials.email) {
            localStorage.setItem('emailUsuario', credentials.email);
          }
        }
      })
    );
  }

  register(credentials: { email: string; password: string; nombre: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}