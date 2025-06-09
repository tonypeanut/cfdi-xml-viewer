# Descripción del Proyecto
El CFDI XML Viewer es una aplicación web que permite visualizar y analizar archivos XML de Comprobantes Fiscales Digitales por Internet (CFDI) de México. La aplicación procesa los archivos, extrae la información relevante y la presenta en un formato legible con capacidades de filtrado y búsqueda.

# Arquitectura del Sistema

El proyecto sigue una arquitectura cliente-servidor con las siguientes componentes:

## Backend (Node.js/Express)
**Servidor**: Express.js
**Procesamiento XML**: fast-xml-parser
**Endpoints**:
  ```
    POST /api/process-xml: Procesa uno o más archivos XML de CFDI
  ```
## Frontend (Angular)
### Componentes principales:
- **XmlViewer**: Maneja la carga de archivos
- **CfdiVisualizer**: Muestra los datos procesados con capacidades de filtrado
### Servicios:
- **XmlReaderService**: Comunica con el backend para procesar los XML

## Funcionalidades Clave
### Carga múltiple de archivos:
- Soporta carga de uno o múltiples archivos XML
- Validación de formato (solo acepta .xml)
### Procesamiento avanzado de CFDI:
- Extracción de metadatos (folio, serie, fecha, etc.)
- Información de emisor y receptor
- Desglose de conceptos e impuestos
### Visualización de datos:
- Vista resumida y detallada de cada CFDI
- Sistema de paginación
- Capacidad de expandir/colapsar detalles
### Filtrado y búsqueda:
- Filtros por UUID, emisor, receptor
- Rango de fechas
- Rango de montos
- Búsqueda textual en múltiples campos
#### Estadísticas:
- Conteo total de CFDI
- Suma total de montos
- Promedio
- Cantidad de emisores distintos

# Tecnologías Utilizadas
## Backend
- Node.js	Entorno de ejecución
- Express	Framework web
- fast-xml-parser	Procesamiento de XML
- multer	Manejo de uploads de archivos
- cors	Manejo de CORS
## Frontend
- Angular 15+	Framework frontend
- TypeScript	Lenguaje base
- SweetAlert2	Notificaciones y diálogos
- ngx-pagination	Paginación de resultados
  
# Estructura del Código

```
/backend
  /services
    cfdiExtractor.js - Lógica de extracción de datos
    cfdiParser.js - Parser de XML a JSON
    cfdiValidator.js - Validaciones básicas
  /utils
    typeHelpers.js - Funciones de ayuda para tipos
  server.js - Servidor principal
```
```
/frontend
  /src
    /components
      cfdi-visualizer - Componente de visualización
      xml-viewer - Componente de carga de archivos
    /services
      xml-reader.service.ts - Comunicación con backend
    /utils
      truncate.pipe.ts - Pipe para truncar texto
```

# Flujo de Datos
## Carga de archivos:
- El usuario selecciona archivos XML en el frontend
- Los archivos se envían al backend como FormData

## Procesamiento:
- El backend convierte XML a JSON
- Extrae y estructura los datos del CFDI
- Valida la estructura básica

  ## Visualización:
- El frontend recibe los datos estructurados
- Muestra vista resumida con opción a detalles
- Aplica filtros según la interacción del usuario

# Consideraciones Técnicas

## Manejo de namespaces XML:
- El sistema soporta múltiples variaciones de nombres de nodos (con/sin namespace)
- Ej: cfdi:Emisor, Emisor, emisor

## Tipado de datos:
- Conversión segura de tipos (números, textos)
- Manejo de valores nulos/undefined

## Seguridad:
- Configuración cuidadosa de CORS
- Validación básica de estructura XML
- Manejo de errores en frontend y backend

# Requisitos para Producción

- Node.js 16+
- Angular CLI 15+ (solo para desarrollo)
- Navegadores modernos (Chrome, Firefox, Edge)

# Versiones
- Branch main: Configuración para producción/deploy
- Branch local-config: Configuración para desarrollo local (ver README específico)

# Mejoras planeadas:
- Exportación a Excel/PDF
- Gráficos más avanzados
- Soporte para más versiones de CFDI
- Validación más estricta de esquemas XML

# Pasos para Instalar y Ejecutar el Proyecto
## 1. Clonar el repositorio y cambiar a la rama local
```
git clone https://github.com/tonypeanut/cfdi-xml-viewer.git
cd cfdi-xml-viewer
git checkout local-config
```
## 2. Configurar el Backend (Node.js/Express)
```
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Iniciar el servidor backend
npm start

# O alternativamente:
npm run dev
```
## 3. Configurar el Frontend (Angular)
```
# Desde la raíz del proyecto, navegar a la carpeta del frontend
cd ../frontend

# Instalar dependencias
npm install

# Iniciar la aplicación Angular (se ejecutará en http://localhost:4200)
ng serve
```
