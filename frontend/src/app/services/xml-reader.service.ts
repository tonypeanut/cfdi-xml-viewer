import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class XmlReaderService {
  private apiUrl = 'http://localhost:3001/api/process-xml';
  private http = inject(HttpClient);

  processXmlFiles(files: File[]): Observable<any> {
    if (!files || files.length === 0) {
      return throwError(() => new Error('No files provided'));
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('xmlFiles', file, file.name);
    });

    return this.http.post(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}