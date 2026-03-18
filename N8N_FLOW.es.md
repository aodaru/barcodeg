# Flujo de n8n - Sistema de Impresión de Cupones

Este documento describe el flujo de n8n para la impresión automatizada de cupones usando el API de barcodeg.

## Descripción General

El flujo automatiza el proceso de:
1. Seleccionar promociones activas de Odoo
2. Generar SVGs de cupones con códigos de barras via API de barcodeg
3. Crear HTML listo para imprimir con múltiples cupones por página
4. Mostrar cupones para imprimir

---

## Diagrama del Flujo

```
┌─────────────────────┐
│   Form Trigger      │  (Usuario envía selección de promoción)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Get Promotions    │  (Odoo: obtener promociones activas)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Active Promotions  │  (Filtrar: solo activas y no expiradas)
└──────────┬──────────┘
           │
           ▼
    ┌──────┴──────┐
    │     If      │  (Verificar si hay promociones)
    └──────┬──────┘
           │
     ┌─────┴─────┐
     │           │
   YES          NO
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Results │ │  Form   │  (Mostrar: "No hay promociones activas")
│to String│ └─────────┘
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ Promotion Selection │  (Form: dropdown para seleccionar promoción)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Split Selection   │  (Parsear: program_id y name)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Get Coupons of     │  (Odoo: obtener cupones de la promoción)
│ promotion selected │
└──────────┬──────────┘
           │
           ▼
    ┌──────┴──────┐
    │   Switch    │  (Brancheo: Masiva vs Individual)
    └──────┬──────┘
           │
     ┌─────┴─────┐
     │           │
  MASIVA    INDIVIDUAL
     │           │
     ▼           ▼
┌─────────┐ ┌──────────┐
│ Results │ │Results to│
│to String│ │  String  │
└────┬────┘ └────┬─────┘
     │           │
     ▼           ▼
┌─────────┐ ┌────────────┐
│ Coupon  │ │Convert     │  (Convertir a Int)
│Selection│ │Result to Int│
└────┬────┘ └─────┬──────┘
     │            │
     ▼            ▼
┌─────────────────────┐
│  Filter coupon     │  (Merge: filtrar cupón seleccionado)
│  selected data     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Get svg/s      │  (HTTP: llamar API /coupon de barcodeg)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Code in JavaScript │  (Generar HTML con cupones)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│        HTML        │  (Renderizar salida HTML)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       Form1         │  (Mostrar cupones para imprimir)
└─────────────────────┘
```

---

## Detalle de Nodos

### 1. Form Trigger

**Nodo:** `On form submission`
- **Tipo:** n8n-nodes-base.formTrigger
- **Ruta:** `/cupones`
- **Título del Formulario:** "Impresión de cupones"
- **Etiqueta del Botón:** "Obtener Promos"

### 2. Get Promotions (Odoo)

**Nodo:** `Get Promotions`
- **Tipo:** Odoo Node
- **Recurso Personalizado:** `loyalty.program`
- **Operación:** getAll
- **Campos:** id, name, date_to, active, program_type
- **Filtro:** program_type = "coupons"

### 3. Active Promotions (Filter)

**Nodo:** `Active Promotions`
- **Tipo:** Filter
- **Condiciones:**
  - date_to >= hoy
  - active = true

### 4. Promotion Selection (Form)

**Nodo:** `Promotion Selection`
- **Tipo:** Form
- **Campos:**
  - Promociones Activas (dropdown)
  - Tipo de impresion (radio: Masiva/Individual)

### 5. Split Selection (Code)

**Nodo:** `Split Selection`
- **Tipo:** Code
- **Propósito:** Parsear cadena "id - name" en campos separados

```javascript
const option = $input.first().json["Promociones Activas"];
const codeArr = option.split(" - ");
const code = parseInt(codeArr[0]);
const descrip = codeArr[1];

return {
  json: {
    program_id: code,
    name: descrip
  }
}
```

### 6. Get Coupons of Promotion (Odoo)

**Nodo:** `Get coupons of promotion selected`
- **Tipo:** Odoo Node
- **Recurso Personalizado:** `loyalty.card`
- **Operación:** getAll
- **Campos:** id, code, expiration_date
- **Filtro:** program_id = programa seleccionado

### 7. Switch

**Nodo:** `Switch`
- **Tipo:** Switch
- **Condiciones:**
  - Rama 0: Tipo de impresion = "Masiva"
  - Rama 1: Tipo de impresion = "individual"

### 8. Get svg/s (HTTP Request)

**Nodo:** `Get svg/s`
- **Tipo:** HTTP Request
- **Método:** POST
- **URL:** `http://api-barcode.fj.local/coupon`
- **Cuerpo:**
```json
{
  "couponCode": "{{ $json.code }}",
  "couponId": {{ $json.id }},
  "expirationDate": "2026-02-20"
}
```

### 9. Code in JavaScript (Generador HTML)

**Nodo:** `Code in JavaScript`
- **Tipo:** Code
- **Propósito:** Generar HTML con cupones para imprimir
- **Características Clave:**
  - Orientación landscape (11" x 8.5")
  - 6 cupones por página (3 columnas × 2 filas)
  - Saltos de página automáticos
  - CSS optimizado para impresión

```javascript
// Configuración clave
const pageWidth = 11;    // pulgadas (landscape)
const pageHeight = 8.5;  // pulgadas
const margin = 0.1;       // pulgadas
const couponsPerPage = 6; // 3 columnas × 2 filas

// CSS para saltos de página
.page {
  page-break-after: always;
  break-after: page;
}
```

### 10. HTML (Salida)

**Nodo:** `HTML`
- **Tipo:** HTML Node
- **Entrada:** `{{ $json.htmlContent }}`

### 11. Form1 (Visualización)

**Nodo:** `Form1`
- **Tipo:** Form
- **Operación:** completion
- **Respuesta:** Muestra HTML con cupones

---

## CSS para Impresión

El generador HTML usa el siguiente CSS para impresión óptima:

```css
@page {
  size: 11in 8.5in;       /* Landscape */
  margin: 0.1in;
  marks: none;
}

body {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.page {
  height: calc(8.5in - 0.2in);
  width: calc(11in - 0.2in);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: flex-start;
  align-content: flex-start;
  page-break-after: always;
  break-after: page;
  padding: 0.1in;
}

.coupon-container {
  width: 3.4in;
  height: 2.18in;
  margin: 0.1in;
  box-sizing: border-box;
  overflow: hidden;
}

.coupon-container svg {
  width: 100%;
  height: 100%;
  display: block;
}
```

### Configuración de Impresión

- **Tamaño de Página:** Carta (Landscape)
- **Márgenes:** 0.1 pulgadas en todos los lados
- **Cupones por Página:** 6
- **Distribución:** 3 columnas × 2 filas
- **Tamaño del Cupón:** 3.4" × 2.18"

---

## Configuración Requerida

### Variables de Entorno

- `PORT`: Puerto del servidor (default: 1234)

### Credenciales de Odoo

- **Nombre de Credencial:** Odoo account QA
- **Permisos Requeridos:**
  - Leer loyalty.program
  - Leer loyalty.card

### API de barcodeg

- **URL:** `http://api-barcode.fj.local/coupon`
- **Método:** POST
- **Encabezados:** Content-Type: application/json
- **Cuerpo:**
  - `couponCode`: Valor del código de barras
  - `couponId`: ID del cupón (opcional)
  - `expirationDate`: YYYY-MM-DD (opcional)

---

## Solución de Problemas

### El Salto de Página No Funciona

Si los saltos de página no funcionan al imprimir:
1. Asegúrate de que la regla `@page` esté configurada correctamente
2. Verifica que el contenedor `.page` tenga dimensiones explícitas
3. Confirma que `page-break-after: always` y `break-after: page` estén ambos configurados
4. Asegúrate de que no haya problemas de overflow con coupon-container

### Los Cupones No Caben

Si los cupones no caben correctamente:
1. Ajusta el ancho/alto de `.coupon-container`
2. Revisa los márgenes en la regla `@page`
3. Verifica que la orientación landscape esté seleccionada en el diálogo de impresión

### El SVG No Carga

Si los SVGs no se renderizan:
1. Verifica que el API de barcodeg sea accesible
2. Revisa que la solicitud HTTP devuelva un SVG válido
3. Asegúrate de que Content-Type sea image/svg+xml

---

## Archivos Relacionados

- [README.md](../README.md) - Documentación principal del API (inglés)
- [README.es.md](../README.es.md) - Documentación principal del API (español)
- [index.js](../index.js) - Implementación del servidor
- [src/svg-builder.js](../src/svg-builder.js) - Manipulación de SVGs
- [src/cuponDescuento.svg](../src/cuponDescuento.svg) - Plantilla de cupón
