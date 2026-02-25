# barcodeg

API for generating barcodes (EAN/UPC/128 codes) and coupon/card templates

## Features

- 🎯 Generate EAN barcodes
- 🏷️ Generate UPC barcodes  
- 📊 Generate Code 128 barcodes
- 🎫 Generate coupon SVGs with embedded barcodes
- 🎴 Generate card templates (black/orange) with barcodes
- 🚀 RESTful API endpoints
- ⚡ Built with Express.js
- 📦 Uses JsBarcode library
- 🔗 Integrated with n8n for automated workflows

## Installation

```bash
# Clone the repository
git clone git+ssh://git@github.com/aodaru/barcodeg.git
cd barcodeg

# Install dependencies
pnpm install

# Start the server
pnpm start
```

## Usage

### Start the server

```bash
pnpm start
```

The server will start on `http://localhost:1234`

### API Endpoints

#### Health Check
```
GET /
```

Returns a simple "Hello World!" response.

---

#### Generate Generic Barcode
```
GET /gbcode/:value
```

Generates a CODE128 barcode for the given value.

**Parameters:**
- `value` (required): The data to encode in the barcode

**Example:**
```
GET /gbcode/12345678
```

**Response:** SVG image with the barcode

---

#### Generate Coupon (Recommended for n8n Integration)
```
POST /coupon
```

Generates a discount coupon SVG with embedded barcode.

**Request Body:**
```json
{
  "couponCode": "123456789012",
  "couponId": 1,
  "expirationDate": "2026-12-31"
}
```

**Parameters:**
- `couponCode` (required): The code to encode in the barcode
- `couponId` (optional): The coupon ID to display on the template
- `expirationDate` (optional): Expiration date in YYYY-MM-DD format

**Example:**
```bash
curl -X POST http://localhost:1234/coupon \
  -H "Content-Type: application/json" \
  -d '{"couponCode":"123456789012","couponId":1,"expirationDate":"2026-12-31"}'
```

**Response:** SVG image of the coupon with barcode embedded

---

#### Generate Card (POST)
```
POST /tcfj
```

Generates a membership card (black or orange template) with embedded barcode.

**Request Body:**
```json
{
  "cardTemplate": "black",
  "value": "12345678",
  "sequenceNumber": 1
}
```

**Parameters:**
- `cardTemplate` (required): Either "black" or "orange"
- `value` (required): The data to encode in the barcode
- `sequenceNumber` (optional): Sequence number to display on the card

**Example:**
```bash
curl -X POST http://localhost:1234/tcfj \
  -H "Content-Type: application/json" \
  -d '{"cardTemplate":"black","value":"12345678","sequenceNumber":1}'
```

---

#### Generate Card (GET)
```
GET /tcfj/:value/:cardTemplate/:sequenceNumber
```

Same as POST but using URL parameters.

**Example:**
```
GET /tcfj/12345678/black/1
```

---

## n8n Integration

This API is designed to work with n8n for automated coupon printing workflows.

### Basic Workflow

1. **Form Trigger** - Collect promotion/coupon selection from user
2. **Odoo Integration** - Fetch active promotions and coupons from Odoo
3. **HTTP Request** - Call barcodeg API to generate coupon SVGs
4. **Code Node** - Generate HTML with multiple coupons per page
5. **Form Output** - Display coupons for printing

### Example: Coupon Printing Flow

See [N8N_FLOW.md](./N8N_FLOW.md) for complete documentation on the n8n workflow.

### HTML Generation for Printing

The n8n Code Node generates HTML with the following features:
- **Landscape orientation** (11" x 8.5")
- **6 coupons per page** (3 columns × 2 rows)
- **Automatic page breaks** after every 6 coupons
- **Print-optimized CSS** with proper margins

---

## Dependencies

- **express** - Web framework
- **jsbarcode** - Barcode generation library
- **xmldom** - XML DOM manipulation for SVG processing

## Scripts

- `pnpm dev` - Start server with nodemon (development)
- `pnpm run` - Start server with node
- `pnpm docs` - Generate documentation
- `pnpm watch` - Start server with --watch flag

## Project Structure

```
barcodeg/
├── index.js                    # Main server entry point
├── commonjs.js                 # CommonJS compatibility example
├── package.json                # Project configuration
├── AGENTS.md                  # Development guidelines
├── N8N_FLOW.md                # n8n workflow documentation
├── README.md                   # This file
├── src/
│   ├── barcode-generator.js   # Barcode generation (JsBarcode)
│   ├── svg-builder.js         # SVG manipulation and overlays
│   ├── templates.js           # Template loader
│   ├── documentation-agent.js # Auto-generate docs
│   ├── cardBlackBack.svg      # Black card template
│   ├── cardOrangeBack.svg     # Orange card template
│   ├── cuponDescuento.svg     # Coupon template
│   └── README.md              # Source documentation
```

## Development

This project uses:
- **Node.js** with ES modules
- **pnpm** as package manager
- **Express.js** for the API server
- **JsBarcode** for barcode generation
- **xmldom** for SVG XML manipulation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

**Adal Michael Garcia**

- Homepage: https://github.com/aodaru/barcodeg#readme
- Repository: git+ssh://git@github.com/aodaru/barcodeg.git

---

*Generated automatically by Documentation Agent*
