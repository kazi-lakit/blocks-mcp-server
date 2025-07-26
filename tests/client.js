#!/usr/bin/env node

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');

class MCPTestClient {
    constructor() {
        this.client = new Client(
            {
                name: 'test-client',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );
    }

    async connect() {
        // Spawn the MCP server process with correct path
        const serverProcess = spawn('node', ['src/index.js'], {
            stdio: ['pipe', 'pipe', 'inherit'], // stdin, stdout, stderr
            cwd: process.cwd(), // Ensure we're in the right directory
        });

        // Handle server process errors
        serverProcess.on('error', (error) => {
            console.error('❌ Failed to start server process:', error);
            throw error;
        });

        // Handle server process exit
        serverProcess.on('exit', (code, signal) => {
            if (code !== 0) {
                console.error(`❌ Server process exited with code ${code}, signal ${signal}`);
            }
        });

        // Create transport using the server process
        const transport = new StdioClientTransport({
            reader: serverProcess.stdout,
            writer: serverProcess.stdin,
        });

        // Connect client to server
        await this.client.connect(transport);
        console.log('✅ Connected to MCP server');

        return serverProcess;
    }

    async listTools() {
        console.log('\n📋 Listing available tools...');
        try {
            const response = await this.client.listTools();
            console.log('Available tools:');
            response.tools.forEach((tool, index) => {
                console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
                console.log(`   Required params: ${tool.inputSchema.required.join(', ')}`);
            });
            return response.tools;
        } catch (error) {
            console.error('❌ Error listing tools:', error.message);
            throw error;
        }
    }

    async testCreateSchema() {
        console.log('\n🧪 Testing create_schema...');

        const testData = {
            CollectionName: 'TestItems',
            SchemaName: 'TestItems',
            SchemaType: 1,
            Fields: [
                { Name: 'ItemName', Type: 'String' },
                { Name: 'Price', Type: 'Float' },
                { Name: 'Stock', Type: 'Float' }
            ],
            projectKey: 'test-project-key',
            bearerToken: 'test-bearer-token'
        };

        try {
            console.log('Sending request with data:', JSON.stringify(testData, null, 2));

            const response = await this.client.callTool({
                name: 'create_schema',
                arguments: testData,
            });

            console.log('✅ Create schema response:');
            console.log(JSON.stringify(response, null, 2));
            return response;
        } catch (error) {
            console.error('❌ Error testing create_schema:', error.message);
            throw error;
        }
    }

    async testUpdateSchema() {
        console.log('\n🧪 Testing update_schema...');

        const testData = {
            ItemId: '123e4567-e89b-12d3-a456-426614174000',
            CollectionName: 'TestItems',
            SchemaName: 'TestItems',
            SchemaType: 1,
            Fields: [
                { Name: 'ItemName', Type: 'String' },
                { Name: 'Price', Type: 'Float' },
                { Name: 'UpdatedField', Type: 'String' }
            ],
            projectKey: 'test-project-key',
            bearerToken: 'test-bearer-token'
        };

        try {
            console.log('Sending request with data:', JSON.stringify(testData, null, 2));

            const response = await this.client.callTool({
                name: 'update_schema',
                arguments: testData,
            });

            console.log('✅ Update schema response:');
            console.log(JSON.stringify(response, null, 2));
            return response;
        } catch (error) {
            console.error('❌ Error testing update_schema:', error.message);
            throw error;
        }
    }

    async disconnect() {
        await this.client.close();
        console.log('👋 Disconnected from MCP server');
    }
}

// Main test function
async function runTests() {
    const testClient = new MCPTestClient();
    let serverProcess;

    try {
        // Connect to server
        serverProcess = await testClient.connect();

        // List available tools
        await testClient.listTools();

        // Test create schema
        await testClient.testCreateSchema();

        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test update schema
        await testClient.testUpdateSchema();

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Clean up
        await testClient.disconnect();
        if (serverProcess) {
            serverProcess.kill();
        }
        process.exit(0);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    console.log('🚀 Starting MCP Server Tests...');
    runTests();
}