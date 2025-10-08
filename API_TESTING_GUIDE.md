# API Testing Guide - Trasealla Backend

## 🔐 Authentication Flow

### Step 1: Test Health Check (No Auth Required)
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Trasealla API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Step 2: Register a New User (No Auth Required)

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "phone": "+1234567890"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**IMPORTANT:** Save the `token` value! You'll need it for authenticated requests.

---

### Step 3: Login (No Auth Required)

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

---

### Step 4: Use Protected Endpoints (Auth Required)

Once you have the token, use it in the `Authorization` header:

**Endpoint:** `GET /api/auth/me`

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Example with Real Token:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzOTY4MDAwMH0.xyz"
```

---

## 📬 Public Endpoints (No Token Required)

These endpoints work WITHOUT authentication:

### 1. Contact Form
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Inquiry about tours",
    "message": "I would like to know more about your services",
    "inquiryType": "general"
  }'
```

### 2. Newsletter Subscription
```bash
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "name": "Jane Smith"
  }'
```

### 3. Get Public Pages
```bash
curl http://localhost:5000/api/cms/pages?status=published
```

### 4. Get Currencies
```bash
curl http://localhost:5000/api/agency/currencies
```

---

## 🔒 Protected Endpoints (Token Required)

### Agency Settings
```bash
curl http://localhost:5000/api/agency/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Branches
```bash
curl http://localhost:5000/api/agency/branches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe Updated",
    "phone": "+1234567890"
  }'
```

---

## 🎯 Using Postman

### Setup:
1. Import the collection: `Trasealla_Phases_Collection.postman_collection.json`
2. Create an environment with variable: `baseUrl` = `http://localhost:5000`
3. The collection auto-saves tokens after login!

### Testing Flow in Postman:

#### 1. **Register User**
   - Go to: `Authentication` > `Register User`
   - Click **Send**
   - Token is automatically saved to `{{authToken}}`

#### 2. **Login**
   - Go to: `Authentication` > `Login`  
   - Click **Send**
   - Token is automatically saved and refreshToken too

#### 3. **Test Protected Endpoint**
   - Go to: `Authentication` > `Get Current User`
   - Click **Send**
   - Should work automatically with saved token!

#### 4. **Test Public Endpoints**
   - Go to: `Contact` > `Submit Contact Form`
   - These have "No Auth" set, so they work without tokens

---

## 🐛 Troubleshooting

### Error: "Not authorized to access this route"

**Causes:**
1. ❌ No token provided
2. ❌ Token format wrong (must be: `Bearer YOUR_TOKEN`)
3. ❌ Token expired
4. ❌ JWT_SECRET not configured
5. ❌ User doesn't exist or is deactivated

**Solutions:**

1. **Check if you're using a protected endpoint:**
   - Register/Login endpoints DON'T need tokens
   - All other endpoints need tokens

2. **Verify token format:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Note the space after "Bearer"!

3. **Check JWT_SECRET in .env:**
   ```bash
   # Should be set in your .env file
   JWT_SECRET=your-super-secret-key-here-change-in-production
   ```

4. **Re-login to get fresh token:**
   - Tokens expire after some time
   - Login again to get a new token

5. **Check server logs:**
   - Look for authentication errors in console
   - "Invalid token" or "Token expired" messages

---

## 🔑 Environment Variables

Make sure these are set in your `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trasealla_db
DB_USER=root
DB_PASSWORD=your_password

# JWT (REQUIRED!)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "🧪 Testing Trasealla API..."
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check (No Auth)"
curl -s $BASE_URL/health | jq
echo ""

# Test 2: Register
echo "2️⃣ Register User (No Auth)"
RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@example.com",
    "password": "Test123456!",
    "phone": "+1234567890"
  }')
echo $RESPONSE | jq
TOKEN=$(echo $RESPONSE | jq -r '.data.token')
echo ""

# Test 3: Get Current User (With Auth)
echo "3️⃣ Get Current User (With Auth)"
curl -s $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "✅ Tests Complete!"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📞 Support

If you're still having issues:

1. Check server is running: `npm run dev`
2. Check database connection
3. Verify `.env` file has `JWT_SECRET`
4. Look at server console for error messages
5. Try the health endpoint first: `curl http://localhost:5000/health`

---

## 🎯 Quick Reference

| Endpoint | Auth Required | Method | Purpose |
|----------|---------------|--------|---------|
| `/health` | ❌ No | GET | Server health check |
| `/api/auth/register` | ❌ No | POST | Create new account |
| `/api/auth/login` | ❌ No | POST | Get auth token |
| `/api/auth/me` | ✅ Yes | GET | Get user info |
| `/api/contact` | ❌ No | POST | Submit contact form |
| `/api/newsletter/subscribe` | ❌ No | POST | Subscribe to newsletter |
| `/api/agency/settings` | ✅ Yes | GET | Get agency settings |
| `/api/roles` | ✅ Yes (Admin) | GET | Get all roles |

---

**Happy Testing! 🚀**
