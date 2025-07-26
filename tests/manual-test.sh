#!/bin/bash

# Manual MCP Server Testing Script
# This script demonstrates how to manually test the MCP server using stdio

echo "🚀 Starting MCP Server Manual Tests"
echo "===================================="

# Function to test list tools
test_list_tools() {
    echo "📋 Testing tools/list..."
    echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node ../src/index.js
    echo "......"
}

# Function to test create schema (you need to replace the credentials)
test_create_schema() {
    echo "🧪 Testing create_schema..."
    cat << 'EOF' | node ../src/index.js
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "create_schema",
    "arguments": {
      "CollectionName": "TestItems",
      "SchemaName": "TestSchema",
      "SchemaType": 1,
      "Fields": [
        {"Name": "ItemName", "Type": "String"},
        {"Name": "Price", "Type": "Float"}
      ],
      "projectKey": "cf18dc87904c4e1485639242cda4a026",
      "bearerToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJjZjE4ZGM4NzkwNGM0ZTE0ODU2MzkyNDJjZGE0YTAyNiIsInVzZXJfaWQiOiI3NmQ4MzA4NS01ZDRjLTQ3YjEtOWQ2My03M2YyMWFhNjA0NDEiLCJpYXQiOjE3NTM0Njc2MzAsIm9yZ19pZCI6ImRlZmF1bHQiLCJlbWFpbCI6InNlbGlzZXRlc3R1c2VyMDFAeW9wbWFpbC5jb20iLCJ1c2VyX25hbWUiOiJzZWxpc2V0ZXN0dXNlcjAxQHlvcG1haWwuY29tIiwibmFtZSI6InRlc3QgdXNlciIsInBob25lIjoiIiwibmJmIjoxNzUzNDY3NjMwLCJleHAiOjE3NTM0NjgwNTAsImlzcyI6IlNlbGlzZUJsb2NrcyIsImF1ZCI6Imh0dHBzOi8vZGV2LWNvbnN0cnVjdC5zZWxpc2VibG9ja3MuY29tIn0.RDvR_r7JE5iIVleROKttl29h_PZh8fW9TnAjYRqGnkO1vJ5a2EdMpaqaVgSFRs9nAiOYc4RbtEViy5EvnPomLsLbb4kj-4iUCqjfCnptHxP7ElV6JuskMDa4AVcZPE11SPKImF3HKfjyWaH0cshNcizV3ccRAmRfCkBggNYeBDEg55o5esALRWMJ2RucXsQvl-sJY0bWThvI0PlCjBRDfYexS8V5I1WEzqG7UMW4ComJo2dok4Qcc2wZcCSCJKkjke5OibW7TPGkdS2k28HnNf1Om8QK5KnzE5674ZgqotGilm8kGn2UsRLUd1HA7Pd9KupjUEA5EuJTQeW25ZKqhg"
    }
  }
}
EOF
    echo "......"
}

# # Function to test update schema
# test_update_schema() {
#     echo "🔄 Testing update_schema..."
#     cat << 'EOF' | node index.js
# {
#   "jsonrpc": "2.0",
#   "id": 3,
#   "method": "tools/call",
#   "params": {
#     "name": "update_schema",
#     "arguments": {
#       "ItemId": "123e4567-e89b-12d3-a456-426614174000",
#       "CollectionName": "TestItems",
#       "SchemaName": "TestSchema",
#       "SchemaType": 1,
#       "Fields": [
#         {"Name": "ItemName", "Type": "String"},
#         {"Name": "Price", "Type": "Float"},
#         {"Name": "NewField", "Type": "String"}
#       ],
#       "projectKey": "YOUR_PROJECT_KEY_HERE",
#       "bearerToken": "YOUR_BEARER_TOKEN_HERE"
#     }
#   }
# }
# EOF
#     echo ""
# }

# Function to test validation errors
test_validation_error() {
    echo "❌ Testing validation errors..."
    cat << 'EOF' | node ../src/index.js
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "create_schema",
    "arguments": {
      "CollectionName": "TestItems"
    }
  }
}
EOF
    echo "......"
}

# Run tests
echo "Note: Replace YOUR_PROJECT_KEY_HERE and YOUR_BEARER_TOKEN_HERE with actual values"
echo "... Running tests..."

test_list_tools
test_validation_error

echo "To test actual API calls, update the credentials in the script and uncomment:"
echo "# test_create_schema"
test_create_schema
# echo "# test_update_schema"

echo "......"
echo "✅ Manual testing complete!"