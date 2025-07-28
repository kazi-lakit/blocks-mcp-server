# MCP Blocks Server (TypeScript)

A Model Context Protocol (MCP) server for managing schemas in SELISE Blocks platform, built with TypeScript.

## Overview

This project implements an MCP server that provides tools for creating and updating schemas in the SELISE Blocks platform. It uses the Model Context Protocol to expose these capabilities as tools that can be called by MCP clients.

## Project Structure

```
├── src/
│   ├── index.ts            # Main server entry point (TypeScript)
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Common types and interfaces
│   ├── services/           # Core implementation of schema operations
│   │   ├── createSchema.ts # Implementation of schema creation
│   │   ├── updateSchema.ts # Implementation of schema updates
│   │   ├── schemaService.ts# Unified schema operations
│   │   ├── authService.ts  # Authentication token service
│   │   └── index.ts        # Services exports
│   ├── tools/              # MCP tool definitions
│   │   ├── create_schema_tool.ts # Create schema tool definition
│   │   ├── update_schema_tool.ts # Update schema tool definition
│   │   └── index.ts              # Tools exports
│   └── utils/
│       └── logger.ts       # Logging utilities (TypeScript)
├── dist/                   # Compiled JavaScript output
├── tests/                  # Test files (JavaScript - legacy)
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json         # ESLint configuration for TypeScript
└── package.json           # Updated with TypeScript dependencies
```

## Available Tools

This MCP server provides the following tools:

### 1. Create Schema

Creates a new schema in the SELISE Blocks platform.

**Parameters:**

- `CollectionName`: Name of the collection
- `SchemaName`: Name of the schema
- `SchemaType`: Type of the schema (typically 1)
- `Fields`: Array of field definitions with `Name` and `Type` properties
- `ProjectKey`: Project key for API access
- `blocksKey`: Blocks key for authentication
- `username`: Username for authentication
- `userkey`: User key for authentication

### 2. Update Schema

Updates an existing schema in the SELISE Blocks platform.

**Parameters:**

- `ItemId`: GUID of the item to update
- `CollectionName`: Name of the collection
- `SchemaName`: Name of the schema
- `SchemaType`: Type of the schema (typically 1)
- `Fields`: Array of field definitions with `Name` and `Type` properties
- `ProjectKey`: Project key for API access
- `blocksKey`: Blocks key for authentication
- `username`: Username for authentication
- `userkey`: User key for authentication

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- TypeScript knowledge (for development)

### Installation

```bash
# Install dependencies
npm install

# Install TypeScript dependencies
npm install --save-dev typescript @types/node ts-node
```

### Development

```bash
# Build the TypeScript code
npm run build

# Run in development mode with ts-node
npm run dev

# Watch mode for development
npm run watch

# Type checking without compilation
npm run type-check

# Linting
npm run lint
```

### Running the Server

#### Production Mode (Compiled)
```bash
# Build and run
npm run build
npm start
```

#### Development Mode (Direct TypeScript)
```bash
# Run directly with ts-node
npm run dev
```

### Testing

You can test the server using the provided test scripts (these are still in JavaScript):

```bash
node tests/client.js
```

## TypeScript Features

### Type Safety
- Full TypeScript support with strict type checking
- Comprehensive type definitions for all MCP operations
- Interface definitions for API requests/responses
- Type-safe error handling

### Development Experience
- IntelliSense support in VS Code
- Compile-time error detection
- Automated code formatting and linting
- Source maps for debugging

### Key Types

```typescript
interface CreateSchemaArgs {
  CollectionName: string;
  SchemaName: string;
  SchemaType?: number;
  Fields: Field[];
  ProjectKey: string;
  blocksKey: string;
  username: string;
  userkey: string;
}

interface Field {
  Name: string;
  Type: string;
}
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Build and run the compiled server
- `npm run dev` - Run server directly with ts-node (development)
- `npm run debug` - Build and run with Node.js debugger
- `npm run clean` - Remove compiled output
- `npm run watch` - Watch for changes and recompile
- `npm run lint` - Run ESLint on TypeScript files
- `npm run type-check` - Type check without compilation

## Migration from JavaScript

This project has been converted from JavaScript to TypeScript:

- All `.js` files have been converted to `.ts`
- Type definitions added for all functions and interfaces
- Strict TypeScript configuration enabled
- ESLint configured for TypeScript
- Build process updated to compile TypeScript

### Legacy JavaScript Files

The original JavaScript files are still available in the repository for reference, but the TypeScript versions should be used for development.

## Environment Variables

Set these environment variables or pass them as tool parameters:

- `BLOCKS_KEY` - Your blocks API key
- `USERNAME` - Your username
- `USER_KEY` - Your user key for authentication

## Example: Creating a Schema

You can ask the MCP server to create a schema for you with a prompt like this:

```
Can you create a schema for me with these details:
- CollectionName: "Products"
- SchemaName: "Products"
- Fields: ItemName (String), Price (Float), Stock (Float)
- ProjectKey: "my-project-123"
```

## Logging

Enhanced logging with TypeScript support:

- Structured logging with type-safe log entries
- Separate error logging
- Log file rotation
- Console and file output

## License

This project is proprietary and confidential.

## Additional Resources

- See TypeScript documentation for type definitions
- Check the `src/types/` directory for all available types
- Original JavaScript implementation available for reference
