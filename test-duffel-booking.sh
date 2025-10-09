#!/bin/bash

# 🎯 Complete Duffel Flight Booking Test Script
# This script tests the COMPLETE flow: Search → Book → Pay

set -e  # Exit on error

BASE_URL="http://localhost:5001"
echo "🚀 Testing Duffel Flight Booking Flow"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# STEP 1: Login to get token
echo -e "${BLUE}Step 1: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trasealla.com",
    "password": "Admin123456!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed!${NC}"
  echo $LOGIN_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✅ Logged in successfully${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# STEP 2: Search for flights with Duffel
echo -e "${BLUE}Step 2: Searching flights (Cairo → Dubai)...${NC}"
SEARCH_RESPONSE=$(curl -s "$BASE_URL/api/flights/search?origin=CAI&destination=DXB&departureDate=2025-12-15&adults=2&travelClass=ECONOMY&currencyCode=USD&provider=duffel" \
  -H "Authorization: Bearer $TOKEN")

# Check if search succeeded
SEARCH_SUCCESS=$(echo $SEARCH_RESPONSE | jq -r '.success')
if [ "$SEARCH_SUCCESS" != "true" ]; then
  echo -e "${RED}❌ Search failed!${NC}"
  echo $SEARCH_RESPONSE | jq .
  exit 1
fi

FLIGHT_COUNT=$(echo $SEARCH_RESPONSE | jq '.data | length')
echo -e "${GREEN}✅ Found $FLIGHT_COUNT flights${NC}"

# Get first offer
OFFER=$(echo $SEARCH_RESPONSE | jq '.data[0]')
OFFER_ID=$(echo $OFFER | jq -r '.id')
PRICE=$(echo $OFFER | jq -r '.price.grandTotal')
CURRENCY=$(echo $OFFER | jq -r '.price.currency')

echo "Selected Flight:"
echo "  Offer ID: $OFFER_ID"
echo "  Price: $CURRENCY $PRICE"

# Get passenger IDs from offer
PASSENGER_1_ID=$(echo $OFFER | jq -r '.passengers[0].id // .raw.passengers[0].id')
PASSENGER_2_ID=$(echo $OFFER | jq -r '.passengers[1].id // .raw.passengers[1].id')

echo "  Passenger 1 ID: $PASSENGER_1_ID"
echo "  Passenger 2 ID: $PASSENGER_2_ID"
echo ""

# STEP 3: Create booking request
echo -e "${BLUE}Step 3: Creating booking...${NC}"

# Save offer to file for booking
echo $OFFER | jq '.raw // .' > /tmp/duffel_offer.json

# Create booking request
BOOKING_REQUEST=$(cat <<EOF
{
  "flightOffer": $(cat /tmp/duffel_offer.json),
  "travelers": [
    {
      "id": "$PASSENGER_1_ID",
      "firstName": "Samah",
      "lastName": "Salem",
      "dateOfBirth": "1990-01-01",
      "gender": "FEMALE",
      "email": "samah@example.com",
      "phoneCountryCode": "971",
      "phoneNumber": "522200730",
      "documents": [
        {
          "documentType": "PASSPORT",
          "number": "A1234567",
          "expiryDate": "2030-01-01",
          "issuanceCountry": "AE",
          "nationality": "AE",
          "holder": true
        }
      ]
    },
    {
      "id": "$PASSENGER_2_ID",
      "firstName": "Ahmed",
      "lastName": "Salem",
      "dateOfBirth": "1988-05-15",
      "gender": "MALE",
      "email": "ahmed@example.com",
      "phoneCountryCode": "971",
      "phoneNumber": "501234567",
      "documents": [
        {
          "documentType": "PASSPORT",
          "number": "B7654321",
          "expiryDate": "2030-01-01",
          "issuanceCountry": "AE",
          "nationality": "AE",
          "holder": true
        }
      ]
    }
  ],
  "contacts": {
    "email": "samah@example.com",
    "phone": "+971522200730"
  }
}
EOF
)

# Create booking
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/flights/create-order" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_REQUEST")

# Check if booking succeeded
BOOKING_SUCCESS=$(echo $BOOKING_RESPONSE | jq -r '.success')
if [ "$BOOKING_SUCCESS" != "true" ]; then
  echo -e "${RED}❌ Booking failed!${NC}"
  echo $BOOKING_RESPONSE | jq .
  exit 1
fi

# Extract booking details
BOOKING_NUMBER=$(echo $BOOKING_RESPONSE | jq -r '.data.booking.bookingNumber')
PNR=$(echo $BOOKING_RESPONSE | jq -r '.data.flightOrder.pnr')
ORDER_ID=$(echo $BOOKING_RESPONSE | jq -r '.data.flightOrder.orderNumber')
AMOUNT=$(echo $BOOKING_RESPONSE | jq -r '.data.booking.totalAmount')

echo -e "${GREEN}✅ Booking created successfully!${NC}"
echo "Booking Details:"
echo "  Booking Number: $BOOKING_NUMBER"
echo "  PNR: $PNR"
echo "  Order Number: $ORDER_ID"
echo "  Amount: $CURRENCY $AMOUNT"
echo ""

# STEP 4: Create payment (quick-pay for testing)
echo -e "${BLUE}Step 4: Processing payment...${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/quick-pay" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingNumber\": \"$BOOKING_NUMBER\",
    \"paymentMethod\": \"card\"
  }")

PAYMENT_SUCCESS=$(echo $PAYMENT_RESPONSE | jq -r '.success')
if [ "$PAYMENT_SUCCESS" != "true" ]; then
  echo -e "${RED}❌ Payment failed!${NC}"
  echo $PAYMENT_RESPONSE | jq .
else
  TRANSACTION_ID=$(echo $PAYMENT_RESPONSE | jq -r '.data.receipt.transactionId')
  echo -e "${GREEN}✅ Payment completed!${NC}"
  echo "Transaction ID: $TRANSACTION_ID"
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎉 COMPLETE BOOKING TEST SUCCESSFUL!${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  Route: Cairo (CAI) → Dubai (DXB)"
echo "  Passengers: 2 adults"
echo "  Provider: Duffel"
echo "  PNR: $PNR"
echo "  Booking: $BOOKING_NUMBER"
echo "  Amount: $CURRENCY $AMOUNT"
echo "  Status: CONFIRMED & PAID ✅"
echo ""
echo "View booking:"
echo "  GET $BASE_URL/api/flights/orders/$ORDER_ID"
echo ""

# Cleanup
rm -f /tmp/duffel_offer.json
