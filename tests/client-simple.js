#!/usr/bin/env node

// Simple test using direct HTTP calls to simulate what an MCP client would do
// This bypasses the stdio transport complexity for debugging

const testData = {
    create: {
        CollectionName: 'TestItems',
        SchemaName: 'TestItems',
        SchemaType: 1,
        Fields: [
            { Name: 'ItemName', Type: 'String' },
            { Name: 'Price', Type: 'Float' },
            { Name: 'Stock', Type: 'Float' }
        ],
        projectKey: 'cf18dc87904c4e1485639242cda4a026', // Replace with real key
        bearerToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJjZjE4ZGM4NzkwNGM0ZTE0ODU2MzkyNDJjZGE0YTAyNiIsInVzZXJfaWQiOiI3NmQ4MzA4NS01ZDRjLTQ3YjEtOWQ2My03M2YyMWFhNjA0NDEiLCJpYXQiOjE3NTM0NzQ0MDEsIm9yZ19pZCI6ImRlZmF1bHQiLCJlbWFpbCI6InNlbGlzZXRlc3R1c2VyMDFAeW9wbWFpbC5jb20iLCJ1c2VyX25hbWUiOiJzZWxpc2V0ZXN0dXNlcjAxQHlvcG1haWwuY29tIiwibmFtZSI6InRlc3QgdXNlciIsInBob25lIjoiIiwibmJmIjoxNzUzNDc0NDAwLCJleHAiOjE3NTM0NzQ4MjAsImlzcyI6IlNlbGlzZUJsb2NrcyIsImF1ZCI6Imh0dHBzOi8vZGV2LWNvbnN0cnVjdC5zZWxpc2VibG9ja3MuY29tIn0.Cwud6AWzSYRdwfXC1C1qxu3PLBHCnHCkJV8ai0jtxdS9Jg4yyLvuZ8JjUDCaT6Pij1NoFSd-ByHKVyPEeyqPIKy9HxrgGG7LWE1AHisJbjW-bSMsOLtmaOq6cBfgt3e4VwIgD_63xNQTmPCpUoIU9g0GIVI-y-nP2LN-VVL0NWDx9scHJdca90yFgzA62YR3jVR626IsmGarHZFT5IGqwGBmDmUYHIwdRvsQbsr0F4NyKGiJj8lmNsN87uTGu7jqCMKjiY90SzQvh1pCZlGEzqI65sJYZcz90HLIg8kQp5ug2fag4Wl9zd-V1IcVCnue_F6jiOVocsnkefq8cdDXGQ'
    },
    update: {
        ItemId: '123e4567-e89b-12d3-a456-426614174000',
        CollectionName: 'TestItems',
        SchemaName: 'TestItems',
        SchemaType: 1,
        Fields: [
            { Name: 'ItemName', Type: 'String' },
            { Name: 'Price', Type: 'Float' },
            { Name: 'Stock', Type: 'Float' },
            { Name: 'UpdatedField', Type: 'String' }
        ],
        projectKey: 'cf18dc87904c4e1485639242cda4a026', // Replace with real key
        bearerToken: 'your-bearer-token-here' // Replace with real token
    }
};

async function testMCPFunctionality() {
    console.log('🧪 Testing MCP Server Functionality...\n');

    // Test create schema functionality
    console.log('📝 Testing CREATE schema logic...');
    try {
        const result = await testCreateSchema(testData.create);
        console.log('✅ CREATE test passed');
        console.log('Response:', result);
    } catch (error) {
        console.error('❌ CREATE test failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test update schema functionality
    console.log('📝 Testing UPDATE schema logic...');
    try {
        const result = await testUpdateSchema(testData.update);
        console.log('✅ UPDATE test passed');
        console.log('Response:', result);
    } catch (error) {
        console.error('❌ UPDATE test failed:', error.message);
    }
}

// Simulate the createSchema function logic
async function testCreateSchema(args) {
    const { CollectionName, SchemaName, SchemaType = 1, Fields, projectKey, bearerToken } = args;

    console.log('Validating input parameters...');

    // Validate required fields (same logic as in your server)
    if (!CollectionName || !SchemaName || !Fields || !Array.isArray(Fields) || !projectKey || !bearerToken) {
        const missingFields = [];
        if (!CollectionName) missingFields.push('CollectionName');
        if (!SchemaName) missingFields.push('SchemaName');
        if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
        if (!projectKey) missingFields.push('projectKey');
        if (!bearerToken) missingFields.push('bearerToken');

        throw new Error(`Missing required parameters: ${missingFields.join(', ')}`);
    }

    // Validate Fields array
    for (const field of Fields) {
        if (!field.Name || !field.Type) {
            throw new Error('Each field must have Name and Type properties');
        }
    }

    console.log('✅ Input validation passed');

    const payload = {
        CollectionName,
        SchemaName,
        SchemaType,
        Fields,
    };

    const headers = {
        'Content-Type': 'application/json',
        'x-blocks-key': projectKey,
        'Authorization': `Bearer ${bearerToken}`,
    };

    console.log('🌐 Making API request...');
    console.log('URL: https://dev-api.seliseblocks.com/graphql/v1/schemas/define');
    console.log('Method: POST');
    console.log('Headers:', { ...headers, Authorization: 'Bearer [HIDDEN]' });
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        console.log('📡 Response received:');
        console.log('Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Body:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        return {
            content: [
                {
                    type: 'text',
                    text: `Schema "${SchemaName}" created successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
                },
            ],
        };
    } catch (error) {
        throw new Error(`Failed to create schema: ${error.message}`);
    }
}

// Simulate the updateSchema function logic
async function testUpdateSchema(args) {
    const { ItemId, CollectionName, SchemaName, SchemaType = 1, Fields, projectKey, bearerToken } = args;

    console.log('Validating input parameters...');

    // Validate required fields (same logic as in your server)
    if (!ItemId || !CollectionName || !SchemaName || !Fields || !Array.isArray(Fields) || !projectKey || !bearerToken) {
        const missingFields = [];
        if (!ItemId) missingFields.push('ItemId');
        if (!CollectionName) missingFields.push('CollectionName');
        if (!SchemaName) missingFields.push('SchemaName');
        if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
        if (!projectKey) missingFields.push('projectKey');
        if (!bearerToken) missingFields.push('bearerToken');

        throw new Error(`Missing required parameters: ${missingFields.join(', ')}`);
    }

    // Validate Fields array
    for (const field of Fields) {
        if (!field.Name || !field.Type) {
            throw new Error('Each field must have Name and Type properties');
        }
    }

    console.log('✅ Input validation passed');

    const payload = {
        ItemId,
        CollectionName,
        SchemaName,
        SchemaType,
        Fields,
    };

    const headers = {
        'Content-Type': 'application/json',
        'projectKey': projectKey,
        'Authorization': `Bearer ${bearerToken}`,
    };

    console.log('🌐 Making API request...');
    console.log('URL: https://dev-api.seliseblocks.com/graphql/v1/schemas/define');
    console.log('Method: PUT');
    console.log('Headers:', { ...headers, Authorization: 'Bearer [HIDDEN]' });
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
        });

        console.log('📡 Response received:');
        console.log('Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Body:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        return {
            content: [
                {
                    type: 'text',
                    text: `Schema "${SchemaName}" updated successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
                },
            ],
        };
    } catch (error) {
        throw new Error(`Failed to update schema: ${error.message}`);
    }
}

// Run the tests
if (require.main === module) {
    console.log('🚀 Starting MCP Logic Tests...\n');
    console.log('⚠️  Remember to update projectKey and bearerToken in the test data!\n');
    testMCPFunctionality().then(() => {
        console.log('\n✨ Tests completed!');
    }).catch((error) => {
        console.error('\n💥 Test suite failed:', error);
    });
}