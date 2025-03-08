# Coding Tools MCP Server

## Overview

This project is a Model Context Protocol (MCP) server for coding-related tools, providing a robust backend for various coding utilities and filesystem operations.

## Features

- Filesystem-based server infrastructure
- Utilities for code manipulation and analysis
- TypeScript-based implementation
- Modular architecture with separate modules for configuration, server, tools, and utilities

## Prerequisites

- Node.js (version 18 or later recommended)
- npm (Node Package Manager)

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd coding-tools
npm install
```

## Development

### Building the Project

To build the project:

```bash
npm run build
```

This will compile TypeScript files to JavaScript in the `dist` directory.

### Watch Mode

For development with automatic recompilation:

```bash
npm run watch
```

## Project Structure

- `src/`
  - `config/`: Configuration management
  - `server/`: Server-related implementations
  - `tools/`: Specific coding tools and utilities
  - `utils/`: Utility functions and helpers
- `dist/`: Compiled JavaScript files
- `index.ts`: Main entry point

## Dependencies

Key dependencies include:
- `@modelcontextprotocol/sdk`: Core MCP functionality
- `diff`: Diff utility for code comparisons
- `glob`: File path matching
- `minimatch`: Filename matching
- `zod-to-json-schema`: Schema conversion utilities

## CLI Usage

After installation, you can use the CLI tool:

```bash
node dist/index.js <allow-folder>
```

## Licensing

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

For more information, please reach out to the project maintainer.