#!/usr/bin/env node

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');
const path = require('path');

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
        // Get the absolute path to the server
        const serverPath = path.resolve(process.cwd(), 'src', 'index.js');
        console.log('🚀 Starting server at:', serverPath);

        // Check if server file exists
        const fs = require('fs');
        if (!fs.existsSync(serverPath)) {
            throw new Error(`Server file not found at: ${serverPath}`);
        }

        // Create transport directly with command and args
        const transport = new StdioClientTransport({
            command: 'node',
            args: [serverPath],
        });

        try {
            // Connect client to server
            await this.client.connect(transport);
            console.log('✅ Connected to MCP server');
            return transport;
        } catch (error) {
            console.error('❌ Failed to connect to server:', error);
            throw error;
        }
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
            projectKey: 'your-project-key-here', // Update this
            bearerToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJjZjE4ZGM4NzkwNGM0ZTE0ODU2MzkyNDJjZGE0YTAyNiIsInVzZXJfaWQiOiI3NmQ4MzA4NS01ZDRjLTQ3YjEtOWQ2My03M2YyMWFhNjA0NDEiLCJpYXQiOjE3NTM0NzQ0MDEsIm9yZ19pZCI6ImRlZmF1bHQiLCJlbWFpbCI6InNlbGlzZXRlc3R1c2VyMDFAeW9wbWFpbC5jb20iLCJ1c2VyX25hbWUiOiJzZWxpc2V0ZXN0dXNlcjAxQHlvcG1haWwuY29tIiwibmFtZSI6InRlc3QgdXNlciIsInBob25lIjoiIiwibmJmIjoxNzUzNDc0NDAwLCJleHAiOjE3NTM0NzQ4MjAsImlzcyI6IlNlbGlzZUJsb2NrcyIsImF1ZCI6Imh0dHBzOi8vZGV2LWNvbnN0cnVjdC5zZWxpc2VibG9ja3MuY29tIn0.Cwud6AWzSYRdwfXC1C1qxu3PLBHCnHCkJV8ai0jtxdS9Jg4yyLvuZ8JjUDCaT6Pij1NoFSd-ByHKVyPEeyqPIKy9HxrgGG7LWE1AHisJbjW-bSMsOLtmaOq6cBfgt3e4VwIgD_63xNQTmPCpUoIU9g0GIVI-y-nP2LN-VVL0NWDx9scHJdca90yFgzA62YR3jVR626IsmGarHZFT5IGqwGBmDmUYHIwdRvsQbsr0F4NyKGiJj8lmNsN87uTGu7jqCMKjiY90SzQvh1pCZlGEzqI65sJYZcz90HLIg8kQp5ug2fag4Wl9zd-V1IcVCnue_F6jiOVocsnkefq8cdDXGQ' // Update this
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
            ItemId: '9a4498e1-7d07-4d21-aaf4-78d5ed490fbd',
            CollectionName: 'TestItems',
            SchemaName: 'TestItems',
            SchemaType: 1,
            Fields: [
                { Name: 'ItemName', Type: 'String' },
                { Name: 'Price', Type: 'Float' },
                { Name: 'UpdatedField', Type: 'String' }
            ],
            projectKey: 'cf18dc87904c4e1485639242cda4a026', // Update this
            bearerToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJjZjE4ZGM4NzkwNGM0ZTE0ODU2MzkyNDJjZGE0YTAyNiIsInVzZXJfaWQiOiI3NmQ4MzA4NS01ZDRjLTQ3YjEtOWQ2My03M2YyMWFhNjA0NDEiLCJpYXQiOjE3NTM0NzQ0MDEsIm9yZ19pZCI6ImRlZmF1bHQiLCJlbWFpbCI6InNlbGlzZXRlc3R1c2VyMDFAeW9wbWFpbC5jb20iLCJ1c2VyX25hbWUiOiJzZWxpc2V0ZXN0dXNlcjAxQHlvcG1haWwuY29tIiwibmFtZSI6InRlc3QgdXNlciIsInBob25lIjoiIiwibmJmIjoxNzUzNDc0NDAwLCJleHAiOjE3NTM0NzQ4MjAsImlzcyI6IlNlbGlzZUJsb2NrcyIsImF1ZCI6Imh0dHBzOi8vZGV2LWNvbnN0cnVjdC5zZWxpc2VibG9ja3MuY29tIn0.Cwud6AWzSYRdwfXC1C1qxu3PLBHCnHCkJV8ai0jtxdS9Jg4yyLvuZ8JjUDCaT6Pij1NoFSd-ByHKVyPEeyqPIKy9HxrgGG7LWE1AHisJbjW-bSMsOLtmaOq6cBfgt3e4VwIgD_63xNQTmPCpUoIU9g0GIVI-y-nP2LN-VVL0NWDx9scHJdca90yFgzA62YR3jVR626IsmGarHZFT5IGqwGBmDmUYHIwdRvsQbsr0F4NyKGiJj8lmNsN87uTGu7jqCMKjiY90SzQvh1pCZlGEzqI65sJYZcz90HLIg8kQp5ug2fag4Wl9zd-V1IcVCnue_F6jiOVocsnkefq8cdDXGQ' // Update this
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
    let transport;

    try {
        // Connect to server
        transport = await testClient.connect();

        // List available tools
        await testClient.listTools();

        // Test create schema
        // await testClient.testCreateSchema();

        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test update schema
        await testClient.testUpdateSchema();

    } catch (error) {
        console.error('❌ Test failed:', error);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    } finally {
        // Clean up
        try {
            await testClient.disconnect();
        } catch (disconnectError) {
            console.error('Error during disconnect:', disconnectError.message);
        }
        process.exit(0);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    console.log('🚀 Starting MCP Server Tests...');
    console.log('⚠️  Make sure to update the projectKey and bearerToken in this file!');
    runTests();
}