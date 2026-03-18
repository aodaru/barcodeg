# barcodeg

API para generar códigos de barras (EAN/UPC/128 códigos) y plantillas de cupones/tarjetas

## Características

- 🎯 Generar códigos de barras EAN
- 🏷️ Generar códigos de barras UPC  
- 📊 Generar códigos de barras Code 128
- 🎫 Generar SVGs de cupones con códigos de barras incrustados
- 🎴 Generar plantillas de tarjetas (black/orange) con códigos de barras
- 🚀 Endpoints API RESTful
- ⚡ Construido con Express.js
- 📦 Usa la librería JsBarcode
- 🔗 Integrado con n8n para flujos de trabajo automatizados

## Instalación

```bash
# Clonar el repositorio
git clone git+ssh://git@github.com/aodaru/barcodeg.git
cd barcodeg

# Instalar dependencias
pnpm install

# Iniciar el servidor
pnpm start
```

## Uso

### Iniciar el servidor

```bash
pnpm start
```

El servidor iniciara en `http://localhost:1234`

### Endpoints del API

#### Verificación de salud
```
GET /
```

Retorna una simple respuesta "Hello World!".

---

#### Generar código de barras genérico
```
GET /gbcode/:value
```

Genera un código de barras CODE128 para el valor dado.

**Parametros:**
- `value` (requerido): Los datos a codificar en el código de barras

**Ejemplo:**
```
GET /gbcode/12345678
```

**Respuesta:** Imagen SVG con el código de barras

---

#### Generar Cupón (Recomendado para integración con n8n)
```
POST /coupon
```

Genera un SVG de cupón de descuento con código de barras incrustado.

**Cuerpo de la solicitud:**
```json
{
  "couponCode": "123456789012",
  "couponId": 1,
  "expirationDate": "2026-12-31"
}
```

**Parametros:**
- `couponCode` (requerido): El código a codificar en el código de barras
- `couponId` (opcional): El ID del cupón a mostrar en la plantilla
- `expirationDate` (opcional): Fecha de expiración en formato YYYY-MM-DD

**Ejemplo:**
```bash
curl -X POST http://localhost:1234/coupon \
  -H "Content-Type: application/json" \
  -d '{"couponCode":"123456789012","couponId":1,"expirationDate":"2026-12-31"}'
```

**Respuesta:** Imagen SVG del cupón con código de barras incrustado

---

#### Generar Tarjeta (POST)
```
POST /tcfj
```

Genera una tarjeta de membresía (plantilla black o orange) con código de barras incrustado.

**Cuerpo de la solicitud:**
```json
{
  "cardTemplate": "black",
  "value": "12345678",
  "sequenceNumber": 1
}
```

**Parametros:**
- `cardTemplate` (requerido): Ya sea "black" u "orange"
- `value` (requerido): Los datos a codificar en el código de barras
- `sequenceNumber` (opcional): Número de secuencia a mostrar en la tarjeta

**Ejemplo:**
```bash
curl -X POST http://localhost:1234/tcfj \
  -H "Content-Type: application/json" \
  -d '{"cardTemplate":"black","value":"12345678","sequenceNumber":1}'
```

---

#### Generar Tarjeta (GET)
```
GET /tcfj/:value/:cardTemplate/:sequenceNumber
```

Igual que POST pero usando parámetros URL.

**Ejemplo:**
```
GET /tcfj/12345678/black/1
```

---

## Despliegue

El API está desplegado en: **http://coolify.fj.local**

---

## Integración con n8n

Esta API está diseñada para trabajar con n8n para flujos de trabajo automatizados de impresión de cupones.

### Flujo Básico

1. **Form Trigger** - Recolectar selección de promoción/cupón del usuario
2. **Odoo Integration** - Obtener promociones y cupones activos de Odoo
3. **HTTP Request** - Llamar al API de barcodeg para generar SVGs de cupones
4. **Code Node** - Generar HTML con múltiples cupones por página
5. **Form Output** - Mostrar cupones para imprimir

### Ejemplo: Flujo de Impresión de Cupones

Ver [N8N_FLOW.es.md](./N8N_FLOW.es.md) para documentación completa del flujo de n8n.

### Generación de HTML para Impresión

El Code Node de n8n genera HTML con las siguientes características:
- **Orientación landscape** (11" x 8.5")
- **6 cupones por página** (3 columnas × 2 filas)
- **Saltos de página automáticos** después de cada 6 cupones
- **CSS optimizado para impresión** con márgenes adecuados

---

## Dependencias

- **express** - Framework web
- **jsbarcode** - Librería de generación de códigos de barras
- **xmldom** - Manipulación DOM XML para procesamiento SVG

## Scripts

- `pnpm dev` - Iniciar servidor con nodemon (desarrollo)
- `pnpm run` - Iniciar servidor con node
- `pnpm docs` - Generar documentación
- `pnpm watch` - Iniciar servidor con flag --watch

## Estructura del Proyecto

```
barcodeg/
├── index.js                    # Punto de entrada principal del servidor
├── commonjs.js                 # Ejemplo de compatibilidad CommonJS
├── package.json                # Configuración del proyecto
├── AGENTS.md                  # Guías de desarrollo
├── N8N_FLOW.md                # Documentación del flujo n8n (inglés)
├── N8N_FLOW.es.md             # Documentación del flujo n8n (español)
├── README.md                   # Este archivo (inglés)
├── README.es.md                # Este archivo (español)
├── src/
│   ├── barcode-generator.js   # Generación de códigos de barras (JsBarcode)
│   ├── svg-builder.js         # Manipulación y superposición de SVGs
│   ├── templates.js           # Cargador de plantillas
│   ├── documentation-agent.js # Auto-generar documentación
│   ├── cardBlackBack.svg      # Plantilla de tarjeta black
│   ├── cardOrangeBack.svg     # Plantilla de tarjeta orange
│   ├── cuponDescuento.svg     # Plantilla de cupón
│   └── README.md              # Documentación del código fuente
```

## Desarrollo

Este proyecto usa:
- **Node.js** con ES modules
- **pnpm** como administrador de paquetes
- **Express.js** para el servidor API
- **JsBarcode** para generación de códigos de barras
- **xmldom** para manipulación de XML SVG

## Contribuir

1. Hacer fork del repositorio
2. Crear una rama de funcionalidad
3. Hacer los cambios
4. Agregar pruebas si es aplicable
5. Enviar un pull request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Autor

**Adal Michael Garcia**

- Página principal: https://github.com/aodaru/barcodeg#readme
- Repositorio: git+ssh://git@github.com/aodaru/barcodeg.git

---

*Generado automáticamente por Documentation Agent*
