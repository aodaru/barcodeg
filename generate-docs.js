import DocumentationAgent from './src/documentation-agent.js';

// Initialize the documentation agent
const docAgent = new DocumentationAgent();

// Generate README.md
await docAgent.generateReadme();