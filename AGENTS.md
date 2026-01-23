# AGENTS.md

This file contains guidelines for agentic coding agents working in this repository.

## Project Overview

This is `barcodeg` - a Node.js API for generating barcodes (EAN/UPC/128 codes). The project uses ES modules and is currently in early development.

## Build/Test Commands

Currently, the project has minimal build setup:

```bash
# Install dependencies
pnpm install

# Test (currently not implemented)
pnpm test

# Run the main module
node index.js

# Run CommonJS example
node commonjs.js

# Generate documentation
pnpm docs

# Development (if dev scripts are added)
pnpm dev
```

**Note**: This project uses pnpm as the package manager. The project currently has no test framework configured. When adding tests, choose an appropriate framework (Jest, Mocha, etc.) and update this file.

## Code Style Guidelines

### Module System
- Use ES modules (`import`/`export`) as the primary module system
- The project is configured with `"type": "module"` in package.json
- CommonJS (`require`/`module.exports`) is only used for legacy compatibility examples

### File Structure
- `index.js` - Main entry point (currently empty)
- `commonjs.js` - CommonJS compatibility example
- Place new barcode generation logic in appropriate modules under `src/` or `lib/`

### Import/Export Conventions
```javascript
// Preferred - ES modules
import { generateBarcode } from './barcode-generator.js';
export { generateBarcode };

// Avoid - CommonJS (except in compatibility files)
const { generateBarcode } = require('./barcode-generator');
module.exports = { generateBarcode };
```

### Naming Conventions
- **Files**: kebab-case (`barcode-generator.js`)
- **Functions/Variables**: camelCase (`generateBarcode`, `barcodeType`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BARCODE_LENGTH`)
- **Classes**: PascalCase (`BarcodeGenerator`)

### Error Handling
- Use try/catch blocks for synchronous operations
- Use async/await with try/catch for async operations
- Create descriptive error messages that include context
- Throw appropriate error types (Error, TypeError, etc.)

```javascript
// Example error handling
try {
  const barcode = generateBarcode(type, data);
  return barcode;
} catch (error) {
  throw new Error(`Failed to generate ${type} barcode: ${error.message}`);
}
```

### Code Formatting
- Use 2 spaces for indentation
- Maximum line length: 80 characters
- Use semicolons
- Use single quotes for strings unless the string contains single quotes

### Comments
- Use JSDoc for function documentation
- Add inline comments for complex logic
- Keep comments concise and up-to-date

```javascript
/**
 * Generates a barcode of the specified type
 * @param {string} type - Barcode type ('EAN', 'UPC', 'CODE128')
 * @param {string} data - Data to encode in the barcode
 * @returns {string} Generated barcode representation
 * @throws {Error} When barcode type or data is invalid
 */
function generateBarcode(type, data) {
  // Implementation here
}
```

## Development Guidelines

### Adding New Features
1. Create appropriate modules in `src/` or `lib/` directory
2. Follow the naming conventions above
3. Add proper error handling and validation
4. Include JSDoc documentation
5. Update this AGENTS.md file if new patterns emerge

### Barcode Generation
- Focus on EAN, UPC, and Code 128 formats as specified in the project description
- Validate input data before processing
- Handle edge cases (invalid data, unsupported formats)
- Consider using established barcode generation libraries

### Testing
- When implementing tests, use a consistent framework
- Test both success and failure cases
- Include edge case testing
- Test barcode validation and generation separately

## Documentation Agent

The project includes a Documentation Agent (`src/documentation-agent.js`) that automatically generates and manages project documentation:

### Features
- Automatically generates comprehensive README.md
- Analyzes package.json and source files for project information
- Updates existing documentation
- Adds new sections to README.md
- Available as both CLI script and API endpoint

### Usage

#### CLI Usage
```bash
# Generate documentation
pnpm docs

# Or run directly
node generate-docs.js
```



#### Programmatic Usage
```javascript
import DocumentationAgent from './src/documentation-agent.js';

const docAgent = new DocumentationAgent();
await docAgent.generateReadme();
```

### Documentation Agent Guidelines
- Use the Documentation Agent for all README.md updates
- The agent automatically detects project structure and dependencies
- Call `docAgent.updateReadme()` when making significant changes
- Use `docAgent.addSection()` for adding new documentation sections
- The agent maintains consistent formatting and structure

## Dependencies

The project currently uses these external dependencies:
- **express** - Web framework for the API server
- **jsbarcode** - Barcode generation library

When adding new dependencies:
- Use pnpm for package management: `pnpm add <package>`
- Choose lightweight, well-maintained packages
- Prefer ESM-compatible packages
- Document why each dependency is needed
- Keep dependencies minimal

## Git Workflow

- Commit frequently with clear, descriptive messages
- Use conventional commit format if possible (`feat:`, `fix:`, `docs:`, etc.)
- Ensure all code is working before committing
- Update documentation when adding new features

## Notes for Agents

- This is a minimal project in early development
- Focus on implementing core barcode generation functionality
- Prioritize code quality and proper error handling
- Use the Documentation Agent for README updates
- Consider the project's goal: API for generating EAN/UPC/128 barcodes