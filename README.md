# Coding Tools MCP Server

## Overview

Coding Tools is a Model Context Protocol (MCP) server designed to provide a robust backend for filesystem and code manipulation utilities. This TypeScript-based project offers a modular infrastructure for performing various coding-related operations with strong security measures and validation.

## Features

- Secure filesystem operations with path validation and sanitization
- Comprehensive shell command execution with security restrictions
- Git version control integration
- Modular architecture with separate components for:
  - Configuration management
  - Server implementations
  - Coding utilities and tools
  - Security and validation utilities

## Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "coding-tools": {
      "command": "npx",
      "args": ["-y", "@setkyar/coding-tools", "<directory-that-you-want-to-allow>"]
    }
  }
}
```

## Available Tools

### Filesystem Operations

- List directories
- Read and write files
- Navigate file system

### Shell Commands

- Text processing (cat, grep, sed, etc.)
- File management (ls, find, mkdir, etc.)
- Development tools (git, npm, node)

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js (v18+)
- **Key Dependencies**:
  - Model Context Protocol SDK (v0.5.0)
  - Zod for schema validation

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
│   │   └── AppConfig.ts  # Handles directory validation and security
│   │
│   ├── server/        # Server-related implementations
│   │   └── MCPServer.ts  # MCP protocol server implementation
│   │
│   ├── tools/         # Coding utilities
│   │   ├── filesystem/  # Filesystem operations
│   │   ├── shell/       # Shell command execution
│   │   └── types.ts     # Shared type definitions
│   │
│   └── utils/         # Utility functions
│       └── PathUtils.ts  # Path handling and sanitization
│
├── dist/              # Compiled JavaScript files
└── index.ts           # Main entry point
```

## Security Features

- Path traversal prevention through canonical path resolution
- Strict validation of allowed directories
- Shell command sanitization and whitelisting
- Execution environment restriction

## CLI Usage

After installation, run the server with allowed directories:

```bash
node dist/index.js <allowed-directory-1> [allowed-directory-2...]
```

The server will only allow operations within the specified directories.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License.

## Contact

For more information, please reach out to the project maintainer.
