# n8n Workflow - Coupon Printing System

This document describes the n8n workflow for automated coupon printing using the barcodeg API.

## Overview

The workflow automates the process of:
1. Selecting active promotions from Odoo
2. Generating coupon SVGs with barcodes via barcodeg API
3. Creating print-ready HTML with multiple coupons per page
4. Displaying coupons for printing

---

## Workflow Diagram

```
┌─────────────────────┐
│   Form Trigger      │  (User submits promotion selection)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Get Promotions    │  (Odoo: fetch active promotions)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Active Promotions  │  (Filter: only active & not expired)
└──────────┬──────────┘
           │
           ▼
    ┌──────┴──────┐
    │     If      │  (Check if promotions exist)
    └──────┬──────┘
           │
     ┌─────┴─────┐
     │           │
   YES          NO
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Results │ │  Form   │  (Show: "No active promotions")
│to String│ └─────────┘
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ Promotion Selection │  (Form: dropdown to select promotion)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Split Selection    │  (Parse: program_id and name)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Get Coupons of      │  (Odoo: fetch coupons for promotion)
│ promotion selected  │
└──────────┬──────────┘
           │
           ▼
    ┌──────┴──────┐
    │   Switch    │  (Branch: Masiva vs Individual)
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
┌─────────┐ ┌──────────-──┐
│ Coupon  │ │Convert      │  (Convert to Int)
│Selection│ │Result to Int│
└────┬────┘ └─────┬────-──┘
     │            │
     ▼            ▼
┌─────────────────────┐
│  Filter coupon      │  (Merge: filter selected coupon)
│  selected data      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Get svg/s       │  (HTTP: call barcodeg /coupon API)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Code in JavaScript  │  (Generate HTML with coupons)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│        HTML         │  (Render HTML output)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       Form1         │  (Display coupons for printing)
└─────────────────────┘
```

---

## Node Details

### 1. Form Trigger

**Node:** `On form submission`
- **Type:** n8n-nodes-base.formTrigger
- **Path:** `/cupones`
- **Form Title:** "Impresión de cupones"
- **Button Label:** "Obtener Promos"

### 2. Get Promotions (Odoo)

**Node:** `Get Promotions`
- **Type:** Odoo Node
- **Custom Resource:** `loyalty.program`
- **Operation:** getAll
- **Fields:** id, name, date_to, active, program_type
- **Filter:** program_type = "coupons"

### 3. Active Promotions (Filter)

**Node:** `Active Promotions`
- **Type:** Filter
- **Conditions:**
  - date_to >= today
  - active = true

### 4. Promotion Selection (Form)

**Node:** `Promotion Selection`
- **Type:** Form
- **Fields:**
  - Promociones Activas (dropdown)
  - Tipo de impresion (radio: Masiva/Individual)

### 5. Split Selection (Code)

**Node:** `Split Selection`
- **Type:** Code
- **Purpose:** Parse "id - name" string into separate fields

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

**Node:** `Get coupons of promotion selected`
- **Type:** Odoo Node
- **Custom Resource:** `loyalty.card`
- **Operation:** getAll
- **Fields:** id, code, expiration_date
- **Filter:** program_id = selected program

### 7. Switch

**Node:** `Switch`
- **Type:** Switch
- **Conditions:**
  - Branch 0: Tipo de impresion = "Masiva"
  - Branch 1: Tipo de impresion = "individual"

### 8. Get svg/s (HTTP Request)

**Node:** `Get svg/s`
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `http://api-barcode.fj.local/coupon`
- **Body:**
```json
{
  "couponCode": "{{ $json.code }}",
  "couponId": {{ $json.id }},
  "expirationDate": "2026-02-20"
}
```

### 9. Code in JavaScript (HTML Generator)

**Node:** `Code in JavaScript`
- **Type:** Code
- **Purpose:** Generate HTML with coupons for printing
- **Key Features:**
  - Landscape orientation (11" x 8.5")
  - 6 coupons per page (3 columns × 2 rows)
  - Automatic page breaks
  - Print-optimized CSS

```javascript
// Key configuration
const pageWidth = 11;    // inches (landscape)
const pageHeight = 8.5;  // inches
const margin = 0.1;       // inches
const couponsPerPage = 6; // 3 columns × 2 rows

// CSS for page breaks
.page {
  page-break-after: always;
  break-after: page;
}
```

### 10. HTML (Output)

**Node:** `HTML`
- **Type:** HTML Node
- **Input:** `{{ $json.htmlContent }}`

### 11. Form1 (Display)

**Node:** `Form1`
- **Type:** Form
- **Operation:** completion
- **Response:** Shows HTML with coupons

---

## CSS for Printing

The HTML generator uses the following CSS for optimal printing:

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

### Print Settings

- **Page Size:** Letter (Landscape)
- **Margins:** 0.1 inches all sides
- **Coupons per Page:** 6
- **Layout:** 3 columns × 2 rows
- **Coupon Size:** 3.4" × 2.18"

---

## Configuration Required

### Environment Variables

- `PORT`: Server port (default: 1234)

### Odoo Credentials

- **Credential Name:** Odoo account QA
- **Required Permissions:**
  - Read loyalty.program
  - Read loyalty.card

### barcodeg API

- **URL:** `http://api-barcode.fj.local/coupon`
- **Method:** POST
- **Headers:** Content-Type: application/json
- **Body:**
  - `couponCode`: Barcode value
  - `couponId`: Coupon ID (optional)
  - `expirationDate`: YYYY-MM-DD (optional)

---

## Troubleshooting

### Page Break Not Working

If page breaks don't work in printing:
1. Ensure `@page` rule is set correctly
2. Check that `.page` container has explicit dimensions
3. Verify `page-break-after: always` and `break-after: page` are both set
4. Ensure no overflow issues with coupon-container

### Coupons Not Fitting

If coupons don't fit properly:
1. Adjust `.coupon-container` width/height
2. Check margins in `@page` rule
3. Verify landscape orientation is selected in print dialog

### SVG Not Loading

If SVGs don't render:
1. Verify barcodeg API is accessible
2. Check HTTP request is returning valid SVG
3. Ensure Content-Type is image/svg+xml

---

## Related Files

- [README.md](../README.md) - Main API documentation
- [index.js](../index.js) - Server implementation
- [src/svg-builder.js](../src/svg-builder.js) - SVG manipulation
- [src/cuponDescuento.svg](../src/cuponDescuento.svg) - Coupon template
