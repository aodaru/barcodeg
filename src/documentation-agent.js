import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Documentation Agent - Generates and manages project documentation
 * Automatically creates README.md and other documentation files
 */
class DocumentationAgent {
  constructor(projectRoot = path.dirname(__dirname)) {
    this.projectRoot = projectRoot;
    this.readmePath = path.join(projectRoot, 'README.md');
  }

  /**
   * Generates comprehensive README.md documentation
   * @param {Object} projectInfo - Project information
   * @returns {Promise<void>}
   */
  async generateReadme(projectInfo = {}) {
    const defaultInfo = await this.gatherProjectInfo();
    const info = { ...defaultInfo, ...projectInfo };

    const readme = this.buildReadmeContent(info);
    await fs.writeFile(this.readmePath, readme, 'utf-8');
    console.log('README.md generated successfully');
  }

  /**
   * Gathers project information from package.json and source files
   * @returns {Promise<Object>}
   */
  async gatherProjectInfo() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    try {
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // Analyze source files for additional info
      const hasExpress = packageJson.dependencies?.express;
      const hasJsBarcode = packageJson.dependencies?.jsbarcode;

      return {
        name: packageJson.name || 'barcodeg',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'API for generating barcodes',
        author: packageJson.author || 'Adal Michael Garcia',
        license: packageJson.license || 'MIT',
        repository: packageJson.repository?.url || '',
        homepage: packageJson.homepage || '',
        mainFile: packageJson.main || 'index.js',
        hasExpress,
        hasJsBarcode,
        scripts: packageJson.scripts || {}
      };
    } catch (error) {
      console.error('Error reading package.json:', error.message);
      return this.getDefaultProjectInfo();
    }
  }

  /**
   * Returns default project information
   * @returns {Object}
   */
  getDefaultProjectInfo() {
    return {
      name: 'barcodeg',
      version: '1.0.0',
      description: 'API for generating barcodes (EAN/UPC/128 codes)',
      author: 'Adal Michael Garcia',
      license: 'MIT',
      repository: '',
      homepage: '',
      mainFile: 'index.js',
      hasExpress: true,
      hasJsBarcode: true,
      scripts: {}
    };
  }

  /**
   * Builds README.md content
   * @param {Object} info - Project information
   * @returns {string}
   */
  buildReadmeContent(info) {
    return `# ${info.name}

${info.description}

## Features

- 🎯 Generate EAN barcodes
- 🏷️ Generate UPC barcodes  
- 📊 Generate Code 128 barcodes
- 🚀 RESTful API endpoints
- ⚡ Built with Express.js
- 📦 Uses JsBarcode library

## Installation

\`\`\`bash
# Clone the repository
git clone ${info.repository}
cd ${info.name}

# Install dependencies
pnpm install

# Start the server
pnpm start
\`\`\`

## Usage

### Start the server

\`\`\`bash
pnpm start
\`\`\`

The server will start on \`http://localhost:1234\`

### API Endpoints

#### Health Check
\`\`\`
GET /health
\`\`\`

Returns the server status and uptime.

#### Generate Barcode (Coming Soon)
\`\`\`
GET /barcode?type=EAN&data=123456789012
\`\`\`

Parameters:
- \`type\`: Barcode type (EAN, UPC, CODE128)
- \`data\`: Data to encode

## Dependencies

- **express** (${info.hasExpress ? '✓' : '✗'}) - Web framework
- **jsbarcode** (${info.hasJsBarcode ? '✓' : '✗'}) - Barcode generation library

## Scripts

${Object.entries(info.scripts).map(([script, command]) => 
  `- \`pnpm ${script}\`: ${command}`
).join('\n') || 'No scripts defined yet'}

## Development

This project uses:
- **Node.js** with ES modules
- **pnpm** as package manager
- **Express.js** for the API server
- **JsBarcode** for barcode generation

### Project Structure

\`\`\`
${info.name}/
├── index.js          # Main entry point
├── commonjs.js       # CommonJS compatibility example
├── package.json      # Project configuration
├── AGENTS.md         # Development guidelines
└── README.md         # This file
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ${info.license} License.

## Author

**${info.author}**

${info.homepage ? `- Homepage: ${info.homepage}` : ''}
${info.repository ? `- Repository: ${info.repository}` : ''}

---

*Generated automatically by Documentation Agent*
`;
  }

  /**
   * Updates existing README.md
   * @param {Object} updates - Information to update
   * @returns {Promise<void>}
   */
  async updateReadme(updates) {
    try {
      const existingContent = await fs.readFile(this.readmePath, 'utf-8');
      const info = await this.gatherProjectInfo();
      const updatedInfo = { ...info, ...updates };
      
      const newContent = this.buildReadmeContent(updatedInfo);
      await fs.writeFile(this.readmePath, newContent, 'utf-8');
      console.log('README.md updated successfully');
    } catch (error) {
      console.log('README.md not found, creating new one...');
      await this.generateReadme(updates);
    }
  }

  /**
   * Adds a new section to README.md
   * @param {string} sectionName - Name of the section
   * @param {string} content - Section content
   * @returns {Promise<void>}
   */
  async addSection(sectionName, content) {
    try {
      const existingContent = await fs.readFile(this.readmePath, 'utf-8');
      const sectionHeader = `\n## ${sectionName}\n\n${content}\n`;
      const newContent = existingContent + sectionHeader;
      
      await fs.writeFile(this.readmePath, newContent, 'utf-8');
      console.log(`Section "${sectionName}" added to README.md`);
    } catch (error) {
      console.error('Error adding section:', error.message);
    }
  }
}

export default DocumentationAgent;