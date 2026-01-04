#!/bin/bash

echo "🧪 Testing AIM Academy 2FA Implementation"
echo "=========================================="

BASE_URL="http://localhost:3000"  # ✅ REMOVE /api

echo ""
echo "Test 1: Student Registration"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0771112233","password":"test123","name":"Test Student"}' | jq

echo ""
echo "Test 4: Admin Login"
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0999999999","password":"admin123"}' | jq -r '.accessToken')

echo "Admin Token: $ADMIN_TOKEN"

echo ""
echo "Test 7: Check 2FA Status"
curl -s -X GET $BASE_URL/auth/admin/2fa-status \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

echo ""
echo "✅ Basic tests complete!"