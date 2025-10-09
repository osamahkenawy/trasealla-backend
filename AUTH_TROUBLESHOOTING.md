# 🔐 Authentication Troubleshooting Guide

## ❌ Error: "Not authorized to access this route"

### **What This Means:**
You're trying to access a **protected endpoint** without proper authentication.

---

## 🎯 **Which APIs Need Authentication?**

### ✅ **PUBLIC (No Token Needed):**

These work WITHOUT authentication:

```bash
# Health check
curl http://localhost:5001/health

# Authentication
curl -X POST http://localhost:5001/api/auth/register
curl -X POST http://localhost:5001/api/auth/login

# Contact & Newsletter
curl -X POST http://localhost:5001/api/contact
curl -X POST http://localhost:5001/api/newsletter/subscribe

# Flight search (public)
curl 'http://localhost:5001/api/flights/search?origin=JFK&destination=DXB&departureDate=2025-12-15'
curl 'http://localhost:5001/api/flights/locations?keyword=Dubai'
curl 'http://localhost:5001/api/flights/price-analysis?origin=JFK&destination=DXB&departureDate=2025-12-15'

# Tours & Destinations (browse)
curl http://localhost:5001/api/destinations
curl http://localhost:5001/api/tours
curl http://localhost:5001/api/activities

# Reviews (read)
curl http://localhost:5001/api/reviews
```

---

### 🔒 **PROTECTED (Token Required):**

These **REQUIRE** authentication token:

```bash
# User profile
GET /api/auth/me
PUT /api/auth/profile
PUT /api/auth/change-password

# Flight booking
POST /api/flights/confirm-price      ← YOUR CASE!
POST /api/flights/create-order
GET /api/flights/my-orders
DELETE /api/flights/orders/:id

# Bookings
GET /api/bookings
POST /api/bookings

# Payments
POST /api/payments/create-intent
POST /api/payments/process

# User management
GET /api/users (all endpoints)

# And all other booking/payment operations
```

---

## 🔧 **How to Fix:**

### **Option 1: Using curl**

#### Step 1: Login First
```bash
curl -X POST 'http://localhost:5001/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@trasealla.com",
    "password": "Admin123456!"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc1OTk1Njc5NiwiZXhwIjoxNzYwNTYxNTk2fQ.bpcP9VDrI0HDFZT9bYdoqAUwNjFf0o-zSD8YORUkB3w"
  }
}
```

**Copy the token value!**

#### Step 2: Use Token in Your Request

```bash
curl --location 'http://localhost:5001/api/flights/confirm-price' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTc1OTk1Njc5NiwiZXhwIjoxNzYwNTYxNTk2fQ.bpcP9VDrI0HDFZT9bYdoqAUwNjFf0o-zSD8YORUkB3w' \
  --header 'Content-Type: application/json' \
  --data '{
    "flightOffer": {
      "type": "flight-offer",
      "id": "1",
      ...
    }
  }'
```

**Note the `Authorization: Bearer TOKEN` header!** ⭐

---

### **Option 2: Using Postman (RECOMMENDED)**

#### Step 1: Login
1. Go to: **🔐 Authentication** → **Login**
2. Body:
   ```json
   {
     "email": "admin@trasealla.com",
     "password": "Admin123456!"
   }
   ```
3. Click **Send**
4. ✅ Token automatically saved to `{{authToken}}`!

#### Step 2: All Other Requests Work!
The collection is configured to use `{{authToken}}` automatically:
- No need to copy/paste token
- No need to add Authorization header manually
- Just click Send on any protected endpoint!

---

## 🎯 **Complete Working Example:**

### **Full Booking Flow in curl:**

```bash
# STEP 0: Store token in variable
TOKEN=$(curl -s -X POST 'http://localhost:5001/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@trasealla.com","password":"Admin123456!"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"

# STEP 1: Search flights (NO AUTH NEEDED)
curl -s 'http://localhost:5001/api/flights/search?origin=JFK&destination=DXB&departureDate=2025-12-15&adults=1&currencyCode=AED' \
  | jq '.data[0].raw' > selected_flight.json

echo "✅ Flight selected and saved to selected_flight.json"

# STEP 2: Confirm price (AUTH NEEDED)
curl -s -X POST 'http://localhost:5001/api/flights/confirm-price' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"flightOffer\": $(cat selected_flight.json)}" \
  | jq '.data.raw' > confirmed_flight.json

echo "✅ Price confirmed and saved to confirmed_flight.json"

# STEP 3: Book flight (AUTH NEEDED)
curl -s -X POST 'http://localhost:5001/api/flights/create-order' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"flightOffer\": $(cat confirmed_flight.json),
    \"travelers\": [{
      \"firstName\": \"JOHN\",
      \"lastName\": \"DOE\",
      \"dateOfBirth\": \"1990-01-01\",
      \"gender\": \"MALE\",
      \"email\": \"john@example.com\",
      \"phoneCountryCode\": \"1\",
      \"phoneNumber\": \"1234567890\",
      \"documents\": [{
        \"documentType\": \"PASSPORT\",
        \"number\": \"AB123456\",
        \"expiryDate\": \"2030-01-01\",
        \"issuanceCountry\": \"US\",
        \"nationality\": \"US\",
        \"holder\": true
      }]
    }],
    \"contacts\": {
      \"email\": \"john@example.com\",
      \"phone\": \"+11234567890\"
    }
  }" | jq .

echo "✅ Flight booked!"
```

---

## 🚨 **Common Mistakes:**

### ❌ **Mistake 1: Missing "Bearer" Prefix**
```bash
# WRONG
--header 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# CORRECT
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

Note the word **"Bearer "** (with space after it)!

---

### ❌ **Mistake 2: No Authorization Header**
```bash
# WRONG - Missing header
curl -X POST 'http://localhost:5001/api/flights/confirm-price' \
  -H 'Content-Type: application/json' \
  -d '{...}'

# CORRECT - Has Authorization header
curl -X POST 'http://localhost:5001/api/flights/confirm-price' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{...}'
```

---

### ❌ **Mistake 3: Using Expired Token**
Tokens expire after 7 days. If you get "Not authorized", login again:

```bash
# Get fresh token
curl -X POST 'http://localhost:5001/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@trasealla.com",
    "password": "Admin123456!"
  }'
```

---

### ❌ **Mistake 4: Using Customer Token for Admin Endpoints**

Some endpoints need **admin** role:

```bash
# Admin-only endpoints
GET /api/users              ← Needs admin token
GET /api/flights/stats      ← Needs admin token
GET /api/audit              ← Needs admin token

# Login as admin
{
  "email": "admin@trasealla.com",
  "password": "Admin123456!"
}

# NOT customer email!
```

---

## ✅ **Correct Request Format:**

### **For confirm-price:**

```bash
# 1. Get token
TOKEN="paste_your_token_here"

# 2. Get flight offer from search
FLIGHT_OFFER='{
  "type": "flight-offer",
  "id": "1",
  ...complete object from search results...
}'

# 3. Confirm price
curl -X POST 'http://localhost:5001/api/flights/confirm-price' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"flightOffer\": $FLIGHT_OFFER}"
```

---

## 🎯 **In Postman (Easiest Way):**

### **Setup Once:**

1. **Import Collection:**
   - `Trasealla_Production_APIs.postman_collection.json`

2. **Set Environment:**
   - Variable: `baseUrl` = `http://localhost:5001`

3. **Login:**
   - Go to: **🔐 Authentication** → **Login**
   - Email: `admin@trasealla.com`
   - Password: `Admin123456!`
   - Click **Send**
   - ✅ Token auto-saved!

### **Now All Requests Work:**

The collection has this at the top level:
```json
"auth": {
  "type": "bearer",
  "bearer": [{
    "key": "token",
    "value": "{{authToken}}"
  }]
}
```

This means **ALL requests automatically use `{{authToken}}`** - no manual work needed!

---

## 🧪 **Test Right Now:**

### Quick Test in Terminal:

```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST 'http://localhost:5001/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@trasealla.com","password":"Admin123456!"}' \
  | jq -r '.data.token')

echo "Your token: $TOKEN"

# 2. Test a protected endpoint
curl "http://localhost:5001/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Should show your user profile ✅
```

---

## 📋 **Quick Reference:**

| API Type | Auth Required? | How to Call |
|----------|----------------|-------------|
| **Search flights** | ❌ No | `curl http://localhost:5001/api/flights/search?...` |
| **Confirm price** | ✅ Yes | `curl -H "Authorization: Bearer TOKEN" ...` |
| **Book flight** | ✅ Yes | `curl -H "Authorization: Bearer TOKEN" ...` |
| **My orders** | ✅ Yes | `curl -H "Authorization: Bearer TOKEN" ...` |
| **User profile** | ✅ Yes | `curl -H "Authorization: Bearer TOKEN" ...` |

---

## 🎊 **Solution Summary:**

### **The Problem:**
You forgot to add the `Authorization: Bearer TOKEN` header!

### **The Fix:**

**In curl:**
```bash
# Login first, copy token
# Then add this header to ALL protected endpoints:
-H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**In Postman:**
```
1. Login once (token auto-saves)
2. All requests work automatically!
```

---

**Try logging in and testing again - it will work!** 🚀

Need help getting your token? Run this:
```bash
curl -X POST 'http://localhost:5001/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@trasealla.com","password":"Admin123456!"}'
```

Copy the token from the response and use it! 🔑
