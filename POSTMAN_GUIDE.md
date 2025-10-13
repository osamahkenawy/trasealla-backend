# 📮 Postman Collection Guide - Trasealla API

## 🎯 Quick Start - Automatic Token Management

Your Postman collections are now configured to **automatically capture and use authentication tokens** across all API requests!

---

## 🔐 How to Use

### Step 1: Import the Collection
1. Open Postman
2. Click **Import** button
3. Select one of these files:
   - `Trasealla_API.postman_collection.json` (Development)
   - `Trasealla_Production_APIs.postman_collection.json` (Production)

### Step 2: Login Once
1. Go to **🔐 Authentication & Users** folder
2. Click on **Login** request
3. Update the email/password in the body if needed:
   ```json
   {
     "email": "osama.admin@yopmail.com",
     "password": "Osama123"
   }
   ```
4. Click **Send**

### Step 3: Token Automatically Saved! 🎉
After successful login, you'll see in the console:
```
✅ Login Successful!
👤 User: Osama Admin
🔑 Role: admin
🎫 Token saved and ready to use!
```

### Step 4: Use Any API
Now you can call **ANY** authenticated API in the collection, and the token will be **automatically included**!

---

## 🔧 How It Works

### Collection-Level Authentication
Both collections have **Bearer Token** authentication configured at the collection level:
```json
"auth": {
  "type": "bearer",
  "bearer": [{
    "key": "token",
    "value": "{{authToken}}"
  }]
}
```

This means **ALL requests inherit this authentication** automatically!

### Automatic Token Capture
When you login or register, a **test script** runs automatically:
```javascript
// Saves token to collection variables
pm.collectionVariables.set('authToken', response.data.token);
pm.collectionVariables.set('userId', response.data.user.id);

// Also saves to environment (if you're using one)
pm.environment.set('authToken', response.data.token);
```

### Variables Saved
After login, these variables are automatically saved:
- `{{authToken}}` - Your JWT token
- `{{refreshToken}}` - Refresh token (if available)
- `{{userId}}` - Your user ID

---

## 📝 API Categories

### 🔐 Authentication & Users
- Register, Login, Profile Management
- **Token auto-captured on login/register**

### ✈️ Flights
- Search flights (Amadeus + Duffel)
- Create offers
- Book flights
- Manage orders

### 🏨 Hotels
- Search hotels
- View details
- Book rooms

### 🎯 Tours & Activities
- Browse tours
- Activity bookings
- Destination management

### 🛂 Visas
- Visa applications
- Requirements
- Status tracking

### 💳 Payments
- Payment processing
- PayTabs integration
- Transaction history

### 📝 Bookings
- Create/manage bookings
- Traveler information
- Booking history

### 🏢 Agency Management
- Multi-branch support
- Agent management
- Role-based access control

### 🌍 Airports
- Search airports
- Autocomplete
- Airport details
- Country-based grouping

### 📧 Communications
- Contact forms
- Newsletter subscriptions
- Notifications

### 🔍 Reviews & Content
- Customer reviews
- Blog posts
- Pages management

---

## 🎨 Public vs Authenticated Endpoints

### 🌐 Public Endpoints (No Auth Required)
These endpoints have `"auth": { "type": "noauth" }` set:
- `GET /api/airports` - Search airports
- `GET /api/airports/search` - Autocomplete
- `GET /api/airports/:code` - Get airport details
- Most GET endpoints for browsing content

### 🔒 Authenticated Endpoints (Token Required)
These automatically use your saved token:
- All POST/PUT/DELETE requests
- User profile endpoints
- Booking operations
- Payment processing
- Admin operations

---

## 🔄 Token Refresh

If your token expires, simply:
1. Go back to **Login** request
2. Click **Send**
3. New token is automatically captured and used

---

## 💡 Pro Tips

### 1. **Use Collection Runner**
Run multiple requests in sequence:
1. Click collection name → **Run**
2. Select requests to run
3. Tokens will persist across all requests

### 2. **Environment Variables**
Create environments for different deployments:
- **Development**: `http://localhost:5001`
- **Staging**: `https://staging.trasealla.com`
- **Production**: `https://api.trasealla.com`

### 3. **Console Output**
Always check the Postman Console (bottom left) to see:
- Login success messages
- Token capture confirmations
- User details

### 4. **Variable Management**
View/edit variables anytime:
- Click collection → **Variables** tab
- See all saved tokens and IDs
- Manually update if needed

---

## 🐛 Troubleshooting

### Token Not Working?
1. Check if token was saved:
   - Collection → Variables → `authToken` should have a value
2. Try logging in again
3. Check console for error messages

### Authentication Failed?
1. Verify credentials in login request body
2. Ensure server is running: `http://localhost:5001`
3. Check if user exists in database

### Request Returns 401?
1. Token might be expired - login again
2. Check if endpoint requires admin role
3. Verify Authorization header is being sent

---

## 📚 API Documentation

For detailed API documentation, visit:
```
http://localhost:5001/api-docs
```

This provides:
- Interactive API explorer (Swagger UI)
- Request/response schemas
- Try-it-out functionality
- Complete endpoint documentation

---

## 🎯 Quick Test Workflow

1. **Login**: `POST /api/auth/login` ✅
2. **Get Profile**: `GET /api/auth/me` ✅
3. **Search Airports**: `GET /api/airports/search?q=dubai` ✅
4. **Create Booking**: `POST /api/bookings` ✅
5. **View Bookings**: `GET /api/bookings` ✅

All steps after #1 will automatically use your saved token!

---

## 📞 Support

For issues or questions:
- Check `/api-docs` for endpoint details
- Review server logs in terminal
- Verify database is running
- Ensure all environment variables are set

---

**Happy Testing! 🚀✈️**

