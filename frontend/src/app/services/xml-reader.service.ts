import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class XmlReaderService {
  private apiUrl = `${environment.backendUrl}/api/process-xml`;
  private http = inject(HttpClient);

  // Headers personalizados para CORS y FormData
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      // 'Authorization': 'Bearer tu-token' // Si usas autenticación
    });
  }

  processXmlFiles(files: File[]): Observable<any> {
    if (!files || files.length === 0) {
      return throwError(() => new Error('No files provided'));
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('xmlFiles', file, file.name);
    });

    return this.http.post(this.apiUrl, formData, {
      headers: this.getHeaders(),
      withCredentials: false // Cambia a true si usas cookies
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error procesando XML';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
    }
    console.error('[XmlReaderService]', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}