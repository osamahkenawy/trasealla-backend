# 🚀 Quick Start Guide - Trasealla API

## ⚠️ IMPORTANT: Port Configuration

**Port 5000 is used by AirPlay on macOS!**

This API runs on **PORT 5001** to avoid conflicts.

---

## 📝 The Problem You Had

You were getting: `"Not authorized to access this route"`

**Why?** Port 5000 was being used by macOS AirPlay service, not your API server!

**Solution:** The server now runs on port **5001**

---

## ✅ Step-by-Step Setup

### 1. Update Your Postman Collection

**Change the `baseUrl` variable from:**
```
http://localhost:5000
```

**To:**
```
http://localhost:5001
```

### 2. Test Public Endpoints (No Auth Required)

#### Health Check
```bash
curl http://localhost:5001/health
```

**Response:**
```json
{
  "status": "success",
  "message": "Trasealla API is running",
  "timestamp": "2025-10-08T10:42:00.000Z"
}
```

#### Register New User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**🔑 SAVE THE TOKEN!** You need it for authenticated requests.

#### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Test Protected Endpoints (Auth Required)

Use the token you received from registration/login:

```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Example:**
```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1OTkyMDEzNSwiZXhwIjoxNzYwNTI0OTM1fQ.01gQaQ2dcCI8YRHRxAwNMGsbeNKuJ9FQAt1747pf9Gs"
```

---

## 🎯 Postman Setup

### Method 1: Quick Setup
1. Open Postman
2. Import: `Trasealla_Phases_Collection.postman_collection.json`
3. Create environment variable:
   - Key: `baseUrl`
   - Value: `http://localhost:5001`
4. Select the environment
5. Done! ✅

### Method 2: Use Existing Environment
1. Open: `Trasealla_Environment.postman_environment.json`
2. Change `baseUrl` value to: `http://localhost:5001`
3. Re-import the environment
4. Select it in Postman

### Testing in Postman:

#### Step 1: Register (Auto-saves token)
- Go to: **Authentication** > **Register User**
- Click **Send**
- ✅ Token automatically saved to `{{authToken}}`

#### Step 2: Login (Auto-saves token)
- Go to: **Authentication** > **Login**
- Change email to match your registered user
- Click **Send**
- ✅ Token automatically saved

#### Step 3: Test Protected Endpoints
- Go to: **Authentication** > **Get Current User**
- Click **Send**
- ✅ Works automatically with saved token!

---

## 📊 Available Endpoints Summary

### Public (No Token Required)
- ✅ `GET /health` - Health check
- ✅ `POST /api/auth/register` - Create account
- ✅ `POST /api/auth/login` - Get token
- ✅ `POST /api/contact` - Submit contact form
- ✅ `POST /api/newsletter/subscribe` - Subscribe
- ✅ `GET /api/cms/pages` - Get public pages
- ✅ `GET /api/agency/currencies` - Get currencies

### Protected (Token Required)
- 🔒 `GET /api/auth/me` - Get current user
- 🔒 `PUT /api/auth/profile` - Update profile
- 🔒 `PUT /api/auth/change-password` - Change password
- 🔒 `GET /api/agency/settings` - Agency settings
- 🔒 `GET /api/agency/branches` - Get branches
- 🔒 `GET /api/roles` - Get roles (Admin only)
- 🔒 `GET /api/audit` - Audit logs (Admin only)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Not authorized to access this route"
**Cause:** Trying to access protected endpoint without token

**Solution:**
1. First register or login
2. Copy the token from response
3. Add header: `Authorization: Bearer YOUR_TOKEN`

### Issue 2: Port 5000 not responding
**Cause:** macOS AirPlay uses port 5000

**Solution:** Use port **5001** instead
- Update Postman: `baseUrl` = `http://localhost:5001`
- Update any curl commands to use 5001

### Issue 3: "Validation failed" errors
**Cause:** Invalid input data

**Solution:** Check the error message for specific field requirements
- Password: Minimum 6 characters
- Email: Valid email format
- Phone: Optional, but must be valid if provided

### Issue 4: Server not starting
**Cause:** Database connection issues

**Solution:**
```bash
# Fix database schema
npm run db:fix

# Initialize system
npm run init

# Start server
npm run dev
```

---

## 🎬 Complete Example Workflow

```bash
# 1. Test server is running
curl http://localhost:5001/health

# 2. Register a new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass123!"
  }'

# 3. Copy the token from response, then test protected endpoint
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_FROM_STEP_2"

# 4. Test public contact form
curl -X POST http://localhost:5001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contact Test",
    "email": "contact@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test message",
    "inquiryType": "general"
  }'
```

---

## 📚 Full API Documentation

See `API_DOCUMENTATION.md` and `API_TESTING_GUIDE.md` for complete documentation.

---

## 💡 Pro Tips

1. **In Postman**: Login/Register requests automatically save the token - no manual copying needed!

2. **Token Expiry**: Tokens last 7 days. If expired, just login again.

3. **Refresh Token**: Use the refresh token endpoint to get a new access token without logging in again.

4. **Environment Variables**: Create different Postman environments for dev, staging, and production.

5. **Admin Access**: To create an admin user, run:
   ```bash
   npm run create:admin
   ```

---

## 🎯 Next Steps

1. ✅ Server is running on port 5001
2. ✅ Test registration and login
3. ✅ Import Postman collection
4. ✅ Start building your frontend
5. ⏳ Continue implementing phases 2-14

**The API is ready for development!** 🚀
