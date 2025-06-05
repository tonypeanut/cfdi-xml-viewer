import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XmlReaderService } from '../../services/xml-reader.service';

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xml-viewer.component.html',
  styleUrls: ['./xml-viewer.component.css']
})
export class XmlViewerComponent {
  @Output() onProcessComplete = new EventEmitter<any[]>(); // Emitir array de datos
  selectedFiles: File[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private xmlReaderService: XmlReaderService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.errorMessage = '';

    if (input.files) {
      const files = Array.from(input.files);
      const validFiles = files.filter(file => file.name.toLowerCase().endsWith('.xml'));
      
      if (files.length !== validFiles.length) {
        const invalidFiles = files.filter(file => !file.name.toLowerCase().endsWith('.xml'));
        this.errorMessage = `Archivos no XML ignorados: ${invalidFiles.map(f => f.name).join(', ')}`;
      }

      this.selectedFiles = validFiles;
    }
  }

  processFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Selecciona al menos un archivo XML válido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.xmlReaderService.processXmlFiles(this.selectedFiles).subscribe({
      next: (response) => {
        this.onProcessComplete.emit(response); 
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMessage = 'Error al procesar los archivos. Verifica que sean XML válidos.';
        this.isLoading = false;
      }
    });
  }
}