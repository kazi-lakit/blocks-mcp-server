# MCP Blocks Server

A Model Context Protocol (MCP) server for managing schemas in SELISE Blocks platform.

## Overview

This project implements an MCP server that provides tools for creating and updating schemas in the SELISE Blocks platform. It uses the Model Context Protocol to expose these capabilities as tools that can be called by MCP clients.

## Project Structure

```
├── src/
│   ├── index.js            # Main server entry point
│   ├── services/           # Core implementation of schema operations
│   │   ├── createSchema.js # Implementation of schema creation
│   │   ├── index.js        # Services exports
│   │   └── updateSchema.js # Implementation of schema updates
│   ├── tools/              # MCP tool definitions
│   │   ├── create_schema_tool.js # Create schema tool definition
│   │   ├── index.js              # Tools exports
│   │   └── update_schema_tool.js # Update schema tool definition
│   └── utils/
│       └── logger.js       # Logging utilities
└── tests/
    ├── api-test.js         # API tests
    ├── client-fixed.js     # Fixed client implementation
    ├── client-simple.js    # Simple client implementation
    ├── client.js           # Test client
    └── manual-test.sh      # Manual testing script
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
- `projectKey`: Project key for API access
- `bearerToken`: Bearer token for authorization

### 2. Update Schema

Updates an existing schema in the SELISE Blocks platform.

**Parameters:**

- `ItemId`: GUID of the item to update
- `CollectionName`: Name of the collection
- `SchemaName`: Name of the schema
- `SchemaType`: Type of the schema (typically 1)
- `Fields`: Array of field definitions with `Name` and `Type` properties
- `projectKey`: Project key for API access
- `bearerToken`: Bearer token for authorization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Server

```bash
node src/index.js
```

### Testing

You can test the server using the provided test scripts:

```bash
node tests/client.js
```

## Example: Creating a Schema

See the `create-mcp-tool-schema.js` script for an example of how to create a schema using this MCP server.

### Example Prompt

You can ask the MCP server to create a schema for you with a prompt like this:

```
Can you create a schema for me with these details:
- CollectionName: "Products"
- SchemaName: "Products"
- Fields: ItemName (String), Price (Float), Stock (Float)
- ProjectKey: "my-project-123"
- BearerToken: "your-actual-token"
```

## Example: Querying Schema Items

See the `query-mcp-tools.js` script for an example of how to query items from a schema.

## License

This project is proprietary and confidential.

## Additional Resources

- See `CREATE_SCHEMA_README.md` for detailed information about the McpTool schema
- See `add-mcp-tool-item.js` for an example of how to add items to a schema