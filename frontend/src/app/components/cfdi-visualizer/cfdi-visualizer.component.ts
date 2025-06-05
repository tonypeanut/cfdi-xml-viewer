
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cfdi-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './cfdi-visualizer.component.html',
  styleUrls: ['./cfdi-visualizer.component.css']
})
export class CfdiVisualizerComponent {
  @Input() cfdiData: any[] = [];
  Math = Math;
  
  // Configuración de paginación
  p: number = 1;
  itemsPerPage: number = 5;
  pageSizes: number[] = [1, 5, 10, 20, 50];
  
  // Filtros
  filterText: string = '';
  selectedField: string = 'fileName';

  filterFields = [
    { value: 'data.complemento.timbreFiscalDigital.uuid', label: 'UUID' },
    { value: 'data.emisor.nombre', label: 'Emisor' },
    { value: 'data.receptor.nombre', label: 'Receptor' },
    { value: 'data.metadata.fecha', label: 'Fecha' },
    { value: 'data.metadata.total', label: 'Total' }
  ];

  filters = {
    uuid: '',
    emisor: '',
    receptor: '',
    fecha: {
      min: '',
      max: ''
    },
    total: {
      min: '',
      max: ''
    }
  }

  showFilters = false; // Controla si los filtros están visibles
  tempFilters: any; // Copia temporal de los filtros
  
  // Estadísticas
  stats = {
    totalCFDIs: 0,
    totalAmount: 0,
    avgAmount: 0,
    emisores: new Map<string, number>(),
    tiposComprobante: new Map<string, number>()
  };

  // Track expanded items
  expandedItems: Set<number> = new Set();
  
  showDeleteSuccess = false;

  ngOnInit() {
    this.resetTempFilters();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cfdiData']) {
      this.cfdiData = Array.isArray(this.cfdiData) ? this.cfdiData : [];
      this.calculateStats();
      this.p = 1;
    }
  }
  
  calculateStats() {
    const safeData = Array.isArray(this.cfdiData) ? this.cfdiData : [];

    this.stats = {
      totalCFDIs: safeData.length,
      totalAmount: 0,
      avgAmount: 0,
      emisores: new Map(),
      tiposComprobante: new Map()
    };
    
    safeData.forEach(item => {
      const m = item.data.metadata;
      const e = item.data.emisor;
      
      if (m?.total) this.stats.totalAmount += Number(m.total);
      if (e?.nombre) {
        const count = this.stats.emisores.get(e.nombre) || 0;
        this.stats.emisores.set(e.nombre, count + 1);
      }
      if (m?.tipo) {
        const count = this.stats.tiposComprobante.get(m.tipo) || 0;
        this.stats.tiposComprobante.set(m.tipo, count + 1);
      }
    });
    
    this.stats.avgAmount = this.stats.totalCFDIs > 0 ? 
      this.stats.totalAmount / this.stats.totalCFDIs : 0;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    if (this.showFilters) {
      this.resetTempFilters();
    }
  }

  toggleDetails(index: number) {
    if (this.expandedItems.has(index)) {
      this.expandedItems.delete(index);
    } else {
      this.expandedItems.clear();
      this.expandedItems.add(index);
    }
  }

  get filteredData() {
    if (!this.cfdiData || !Array.isArray(this.cfdiData)) return [];
    
    // Si hay texto de filtro, usa el sistema antiguo (opcional, puedes eliminarlo si no lo necesitas)
    if (this.filterText) {
      return this.cfdiData.filter(item => {
        const value = this.getNestedValue(item, this.selectedField);
        return value?.toString().toLowerCase().includes(this.filterText.toLowerCase());
      });
    }
    
    // Aplicar el nuevo sistema de filtrado
    return this.cfdiData.filter(item => {
      // Filtro por UUID
      if (this.filters.uuid && 
          !item.data.complemento?.timbreFiscalDigital?.uuid?.toLowerCase()
          .includes(this.filters.uuid.toLowerCase())) {
        return false;
      }
      
      // Filtro por Emisor
      if (this.filters.emisor && 
          !item.data.emisor?.nombre?.toLowerCase()
          .includes(this.filters.emisor.toLowerCase())) {
        return false;
      }
      
      // Filtro por Receptor
      if (this.filters.receptor && 
          !item.data.receptor?.nombre?.toLowerCase()
          .includes(this.filters.receptor.toLowerCase())) {
        return false;
      }
      
      // Filtro por Fecha
      const fechaCFDI = item.data.metadata?.fecha.split('T')[0];
  
      // Convertir a formato UTC para comparaciones consistentes
      const fechaUTC = new Date(fechaCFDI + 'T00:00:00Z');

      if (this.filters.fecha.min) {
        const minDate = new Date(this.filters.fecha.min + 'T00:00:00Z');

        if (fechaUTC < minDate) {
          return false;
        }
      }

      if (this.filters.fecha.max) {
        const maxDate = new Date(this.filters.fecha.max + 'T23:59:59.999Z');

        if (fechaUTC > maxDate) {
          return false;
        }
      }

      // Filtro por Total
      const totalCFDI = Number(item.data.metadata?.total);
      if (this.filters.total.min !== null && this.filters.total.min !== '' && 
          totalCFDI < Number(this.filters.total.min)) {
        return false;
      }
      if (this.filters.total.max !== null && this.filters.total.max !== '' && 
          totalCFDI > Number(this.filters.total.max)) {
        return false;
      }
      
      return true;
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX');
  }

  getEmisorLabel(tipo: string): string {
    const labels: {[key: string]: string} = {
      'I': 'Ingreso',
      'E': 'Egreso',
      'T': 'Traslado',
      'P': 'Pago',
      'N': 'Nómina'
    };
    return labels[tipo] || tipo;
  }

  onPageChange(newPage: number) {
    this.p = newPage;
    this.expandedItems.clear(); // Cerrar todos los detalles al cambiar de página
  }

  onItemsPerPageChange(newSize: number) {
    this.itemsPerPage = newSize;
    this.p = 1; // Resetear a la primera página
    this.expandedItems.clear(); // Cerrar todos los detalles al cambiar el tamaño
  }

  async confirmDelete(item: any, filteredIndex: number): Promise<void> {
      const result = await Swal.fire({
        title: '¿Eliminar CFDI?',
        html: this.buildDeleteMessage(item),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        this.deleteCfdi(item, filteredIndex);
      }
    }

  private buildDeleteMessage(item: any): string {
    // Formatear el total manualmente
    const total = item.data.metadata?.total ? 
      this.formatCurrency(item.data.metadata.total) : 
      'N/A';

    return `
      <div class="text-left">
        <p>Vas a eliminar el siguiente CFDI:</p>
        <div class="mt-2 p-3 bg-red-50 rounded-md">
          <p><b>UUID:</b> ${item.data.complemento?.timbreFiscalDigital?.uuid || 'No disponible'}</p>
          <p><b>Emisor:</b> ${item.data.emisor?.nombre || 'No disponible'} (${item.data.emisor?.rfc || 'N/A'})</p>
          <p><b>Total:</b> ${total}</p>
        </div>
        <p class="mt-3 text-red-600 font-medium">Esta acción no se puede deshacer.</p>
      </div>
    `;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  private deleteCfdi(itemToDelete: any, filteredIndex: number): void {
    const realIndex = this.cfdiData.findIndex(item => 
      item.data.complemento?.timbreFiscalDigital?.uuid === 
      item.data.complemento?.timbreFiscalDigital?.uuid
    );

    if (realIndex !== -1) {
      this.cfdiData.splice(realIndex, 1);
      this.expandedItems.delete(filteredIndex);
      this.calculateStats();
      
      // Usar SweetAlert2 para mostrar confirmación
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'CFDI eliminado',
        showConfirmButton: false,
        timer: 2000,
        toast: true
      });
    }
  }
  
  clearFilters(): void {
    this.filters = {
      uuid: '',
      emisor: '',
      receptor: '',
      fecha: {
        min: '',
        max: ''
      },
      total: {
        min: '',
        max: ''
      }
    };
    this.resetTempFilters();
    this.p = 1; // Volver a la primera página
  }

  resetTempFilters() {
    this.tempFilters = {
      uuid: this.filters.uuid,
      emisor: this.filters.emisor,
      receptor: this.filters.receptor,
      fecha: {
        min: this.filters.fecha.min,
        max: this.filters.fecha.max
      },
      total: {
        min: this.filters.total.min,
        max: this.filters.total.max
      }
    };
  }

  applyFilters() {
    // Crear un nuevo objeto para trigger change detection
    this.filters = {
      uuid: this.tempFilters.uuid || '',
      emisor: this.tempFilters.emisor || '',
      receptor: this.tempFilters.receptor || '',
      fecha: {
        min: this.tempFilters.fecha.min || '',
        max: this.tempFilters.fecha.max || ''
      },
      total: {
        min: this.tempFilters.total.min || '',
        max: this.tempFilters.total.max || ''
      }
    };
    
    // Resetear paginación
    this.p = 1;
    
    // Cerrar panel de filtros
    this.showFilters = false;
    
    // Forzar actualización (opcional)
    this.cfdiData = [...this.cfdiData];
  }

  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    // Convertir path en array (ej: 'data.emisor.nombre' => ['data', 'emisor', 'nombre'])
    const properties = path.split('.');
    
    // Recorrer el path para obtener el valor anidado
    return properties.reduce((current, prop) => {
      return current ? current[prop] : undefined;
    }, obj);
  }

  private normalizeDate(dateString: string): Date {
    if (!dateString) return new Date(NaN); // Fecha inválida
    
    // Crear fecha en UTC para evitar problemas de zona horaria
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return new Date(NaN); // Fecha inválida
    
    // Retornar nueva fecha solo con día, mes y año (hora 00:00:00 local)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

}