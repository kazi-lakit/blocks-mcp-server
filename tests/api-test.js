#!/usr/bin/env node

// Direct API testing script to verify your endpoint works
// Run with: node api-test.js

async function testAPI() {
    console.log('🧪 Testing API directly...\n');

    // Test data
    const createPayload = {
        CollectionName: 'TestItems',
        SchemaName: 'TestItems',
        SchemaType: 1,
        Fields: [
            { Name: 'ItemName', Type: 'String' },
            { Name: 'Price', Type: 'Float' },
            { Name: 'Stock', Type: 'Float' }
        ]
    };

    const updatePayload = {
        ItemId: '123e4567-e89b-12d3-a456-426614174000',
        ...createPayload,
        Fields: [
            ...createPayload.Fields,
            { Name: 'UpdatedField', Type: 'String' }
        ]
    };

    // Replace these with your actual credentials
    const TEST_PROJECT_KEY = 'your-project-key-here';
    const TEST_BEARER_TOKEN = 'your-bearer-token-here';

    const headers = {
        'Content-Type': 'application/json',
        'projectKey': TEST_PROJECT_KEY,
        'Authorization': `Bearer ${TEST_BEARER_TOKEN}`,
    };

    // Test CREATE
    console.log('📤 Testing CREATE (POST)...');
    console.log('URL:', 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define');
    console.log('Method: POST');
    console.log('Headers:', { ...headers, Authorization: 'Bearer [HIDDEN]' });
    console.log('Payload:', JSON.stringify(createPayload, null, 2));
    console.log('\n⏳ Making request...\n');

    try {
        const createResponse = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
            method: 'POST',
            headers,
            body: JSON.stringify(createPayload),
        });

        console.log('📥 CREATE Response:');
        console.log('Status:', createResponse.status, createResponse.statusText);
        console.log('Headers:', Object.fromEntries(createResponse.headers.entries()));

        const createResponseText = await createResponse.text();
        console.log('Body:', createResponseText);

        if (createResponse.ok) {
            console.log('✅ CREATE request successful!\n');
        } else {
            console.log('❌ CREATE request failed!\n');
        }

        // Wait before next test
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test UPDATE
        console.log('📤 Testing UPDATE (PUT)...');
        console.log('URL:', 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define');
        console.log('Method: PUT');
        console.log('Headers:', { ...headers, Authorization: 'Bearer [HIDDEN]' });
        console.log('Payload:', JSON.stringify(updatePayload, null, 2));
        console.log('\n⏳ Making request...\n');

        const updateResponse = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
            method: 'PUT',
            headers,
            body: JSON.stringify(updatePayload),
        });

        console.log('📥 UPDATE Response:');
        console.log('Status:', updateResponse.status, updateResponse.statusText);
        console.log('Headers:', Object.fromEntries(updateResponse.headers.entries()));

        const updateResponseText = await updateResponse.text();
        console.log('Body:', updateResponseText);

        if (updateResponse.ok) {
            console.log('✅ UPDATE request successful!');
        } else {
            console.log('❌ UPDATE request failed!');
        }

    } catch (error) {
        console.error('💥 Network error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// CORS test function
async function testCORS() {
    console.log('\n🌐 Testing CORS and connectivity...');

    try {
        const response = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
            method: 'OPTIONS',
        });

        console.log('CORS preflight response:', response.status);
        console.log('CORS headers:', Object.fromEntries(response.headers.entries()));
    } catch (error) {
        console.error('CORS test failed:', error.message);
    }
}

// Basic connectivity test
async function testConnectivity() {
    console.log('\n🌍 Testing basic connectivity...');

    try {
        const response = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
            method: 'GET',
        });

        console.log('Connectivity test response:', response.status, response.statusText);
        const body = await response.text();
        console.log('Response body:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));
    } catch (error) {
        console.error('Connectivity test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting API Tests...\n');

    await testConnectivity();
    await testCORS();
    await testAPI();

    console.log('\n✨ Tests completed!');
}

if (require.main === module) {
    runAllTests();
}