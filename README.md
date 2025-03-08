# Coding Tools MCP Server

## Overview

Coding Tools is a Model Context Protocol (MCP) server designed to provide a robust backend for filesystem and code manipulation utilities. This TypeScript-based project offers a modular infrastructure for performing various coding-related operations.

## Features

- 🗂️ Filesystem-based server infrastructure
- 🛠️ Comprehensive code manipulation and analysis tools
- 🔄 Git version control integration
- 📦 Modular architecture with separate modules for:
  - Configuration management
  - Server implementations
  - Coding utilities
  - Helper functions

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js (v18+)
- **Key Dependencies**:
  - Model Context Protocol SDK
  - Zod JSON Schema conversion

## Prerequisites

- Node.js (version 18 or later)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd coding-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development Scripts

- Build the project:

  ```bash
  npm run build
  ```

- Watch mode (auto-recompile):

  ```bash
  npm run watch
  ```

- Code Formatting:

  ```bash
  npm run format           # Format all files
  npm run format:check     # Check formatting without changes
  ```

- Linting:
  ```bash
  npm run lint             # Lint the codebase
  npm run lint:fix         # Automatically fix linting issues
  ```

## Project Structure

```
coding-tools/
│
├── src/
│   ├── config/        # Configuration management
│   ├── server/        # Server-related implementations
│   ├── tools/         # Coding utilities
│   └── utils/         # Utility functions
│
├── dist/              # Compiled JavaScript files
└── index.ts           # Main entry point
```

## CLI Usage

After installation, run the server:

```bash
node dist/index.js <allow-folder>
```

## Dependencies

- `@modelcontextprotocol/sdk`: Core MCP functionality
- `zod-to-json-schema`: Schema conversion tools

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License.

## Contact

For more information, please reach out to the project maintainer.
