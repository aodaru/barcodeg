# barcodeg

api for generate barcode ean/upc and 128 code

## Features

- 🎯 Generate EAN barcodes
- 🏷️ Generate UPC barcodes  
- 📊 Generate Code 128 barcodes
- 🚀 RESTful API endpoints
- ⚡ Built with Express.js
- 📦 Uses JsBarcode library

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
GET /health
```

Returns the server status and uptime.

#### Generate Barcode (Coming Soon)
```
GET /barcode?type=EAN&data=123456789012
```

Parameters:
- `type`: Barcode type (EAN, UPC, CODE128)
- `data`: Data to encode

## Dependencies

- **express** (✓) - Web framework
- **jsbarcode** (✓) - Barcode generation library

## Scripts

- `pnpm test`: echo "Error: no test specified" && exit 1
- `pnpm start`: node  --experimental-strip-types index.ts
- `pnpm docs`: node generate-docs.js

## Development

This project uses:
- **Node.js** with ES modules
- **pnpm** as package manager
- **Express.js** for the API server
- **JsBarcode** for barcode generation

### Project Structure

```
barcodeg/
├── index.js          # Main entry point
├── commonjs.js       # CommonJS compatibility example
├── package.json      # Project configuration
├── AGENTS.md         # Development guidelines
└── README.md         # This file
```

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
