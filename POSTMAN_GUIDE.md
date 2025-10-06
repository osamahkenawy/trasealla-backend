# Postman Collection Guide - Trasealla Travel Agency API

This guide will help you set up and use the Postman collection to test all Trasealla API endpoints.

## 📦 Files Included

1. **Trasealla_API.postman_collection.json** - Complete API collection
2. **Trasealla_Environment.postman_environment.json** - Environment variables
3. **POSTMAN_GUIDE.md** - This guide

## 🚀 Quick Setup

### 1. Import Collection and Environment

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button
   - Select `Trasealla_API.postman_collection.json`
   - Click "Import"

3. **Import Environment:**
   - Click "Import" button
   - Select `Trasealla_Environment.postman_environment.json`
   - Click "Import"

4. **Select Environment:**
   - Click the environment dropdown (top right)
   - Select "Trasealla Development Environment"

### 2. Start Your Backend Server

```bash
cd backend
npm run dev
```

Make sure your server is running on `http://localhost:5000`

## 🧪 Testing Workflow

### Step 1: Test Health Check
1. Go to **Health Check** folder
2. Run **"API Health Check"**
3. Should return: `{"status":"success","message":"Trasealla API is running"}`

### Step 2: Register a New User
1. Go to **Authentication** folder
2. Run **"Register User"**
3. Check the response - should include `token` and `refreshToken`
4. The tokens are automatically saved to environment variables

### Step 3: Test Authenticated Endpoints
1. Go to **Authentication** folder
2. Run **"Get Current User"**
3. Should return your user profile

### Step 4: Test Other Services
Now you can test any other endpoint since authentication is set up!

## 📁 Collection Structure

### 🔐 Authentication (7 endpoints)
- **Register User** - Create new account
- **Login User** - Login with credentials
- **Get Current User** - Get profile (requires auth)
- **Update Profile** - Update user info (requires auth)
- **Change Password** - Change password (requires auth)
- **Refresh Token** - Get new access token
- **Logout** - Logout user (requires auth)

### 🌍 Destinations (5 endpoints)
- **Get All Destinations** - Browse destinations with filters
- **Get Destination by ID** - Get specific destination
- **Create Destination** - Create new destination (Admin/Agent)
- **Update Destination** - Update destination (Admin/Agent)
- **Delete Destination** - Delete destination (Admin/Agent)

### 🎯 Tours (5 endpoints)
- **Get All Tours** - Browse tours with filters
- **Get Tour by ID** - Get specific tour
- **Get Featured Tours** - Get featured tours
- **Get Popular Tours** - Get popular tours
- **Create Tour** - Create new tour (Admin/Agent)

### ✈️ Flights (3 endpoints)
- **Search Flights** - Search flights with filters
- **Get Flight by ID** - Get specific flight
- **Book Flight** - Book a flight (requires auth)

### 🏨 Hotels (5 endpoints)
- **Get All Hotels** - Browse hotels with filters
- **Get Hotel by ID** - Get specific hotel
- **Get Hotel Rooms** - Get hotel room types
- **Check Hotel Availability** - Check room availability
- **Book Hotel** - Book hotel room (requires auth)

### 🎪 Activities (3 endpoints)
- **Get All Activities** - Browse activities with filters
- **Get Activity by ID** - Get specific activity
- **Book Activity** - Book an activity (requires auth)

### 📋 Bookings (4 endpoints)
- **Get User Bookings** - Get user's bookings (requires auth)
- **Get Booking by ID** - Get specific booking (requires auth)
- **Create Booking** - Create new booking (requires auth)
- **Cancel Booking** - Cancel booking (requires auth)

### 💳 Payments (3 endpoints)
- **Create Payment Intent** - Start payment process (requires auth)
- **Confirm Payment** - Complete payment (requires auth)
- **Get Payment History** - Get payment history (requires auth)

### 🛂 Visa Services (4 endpoints)
- **Get Visa Requirements** - Get visa requirements by country
- **Apply for Visa** - Submit visa application (requires auth)
- **Get Visa Applications** - Get user's applications (requires auth)
- **Get Visa Application by ID** - Get specific application (requires auth)

### ⭐ Reviews (6 endpoints)
- **Get Reviews** - Browse reviews with filters
- **Get Reviews for Tour** - Get reviews for specific item
- **Create Review** - Create new review (requires auth)
- **Update Review** - Update own review (requires auth)
- **Delete Review** - Delete own review (requires auth)
- **Mark Review as Helpful** - Mark review as helpful (requires auth)

### 📞 Contact (6 endpoints)
- **Submit Contact Form** - Submit inquiry (public)
- **Get All Contacts** - Get all contacts (Admin)
- **Get Contact by ID** - Get specific contact (Admin)
- **Update Contact Status** - Update contact status (Admin)
- **Respond to Contact** - Respond to inquiry (Admin)
- **Get Contact Statistics** - Get contact stats (Admin)

### 📧 Newsletter (4 endpoints)
- **Subscribe to Newsletter** - Subscribe to newsletter (public)
- **Unsubscribe from Newsletter** - Unsubscribe (public)
- **Get All Subscribers** - Get subscribers (Admin)
- **Get Newsletter Statistics** - Get newsletter stats (Admin)

### 📝 Content (7 endpoints)
- **Get Blog Posts** - Browse blog posts
- **Get Blog Post by ID** - Get specific blog post
- **Get Team Members** - Get team members
- **Get Testimonials** - Get testimonials
- **Create Blog Post** - Create blog post (Admin)
- **Update Blog Post** - Update blog post (Admin)
- **Delete Blog Post** - Delete blog post (Admin)

## 🔧 Environment Variables

The collection uses these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:5000/api` |
| `authToken` | JWT access token | Auto-set after login |
| `refreshToken` | JWT refresh token | Auto-set after login |
| `userId` | Current user ID | Auto-set after login |
| `bookingId` | Booking ID for testing | `1` |
| `destinationId` | Destination ID for testing | `1` |
| `tourId` | Tour ID for testing | `1` |
| `hotelId` | Hotel ID for testing | `1` |
| `activityId` | Activity ID for testing | `1` |
| `flightId` | Flight ID for testing | `1` |
| `reviewId` | Review ID for testing | `1` |
| `contactId` | Contact ID for testing | `1` |
| `visaApplicationId` | Visa application ID | `1` |
| `blogId` | Blog post ID for testing | `1` |

## 🔄 Automatic Token Management

The collection automatically handles JWT tokens:

1. **After Registration/Login:** Tokens are automatically saved
2. **For Protected Routes:** Tokens are automatically included
3. **Token Refresh:** Use "Refresh Token" endpoint to get new tokens

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey
1. Register new user
2. Login user
3. Update profile
4. Browse destinations
5. Browse tours
6. Create booking
7. Submit review

### Scenario 2: Admin Workflow
1. Login as admin user
2. Create destination
3. Create tour
4. View all contacts
5. Respond to contact
6. View newsletter subscribers

### Scenario 3: Booking Flow
1. Search flights
2. Search hotels
3. Browse activities
4. Create booking
5. Process payment
6. View booking history

## 📊 Response Examples

### Successful Registration
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Please provide a valid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## 🔍 Debugging Tips

### 1. Check Server Status
- Always run "API Health Check" first
- Ensure server is running on correct port

### 2. Authentication Issues
- Check if tokens are set in environment
- Use "Refresh Token" if access token expired
- Verify user role for admin endpoints

### 3. Validation Errors
- Check request body format
- Ensure required fields are provided
- Verify data types (string, number, date)

### 4. Database Issues
- Check if database is connected
- Verify table exists
- Check foreign key relationships

## 🚀 Advanced Features

### 1. Collection Runner
- Use Collection Runner to run multiple requests
- Set up test data with pre-request scripts
- Validate responses with test scripts

### 2. Pre-request Scripts
```javascript
// Set random email for testing
pm.environment.set("testEmail", "test" + Date.now() + "@example.com");
```

### 3. Test Scripts
```javascript
// Validate response
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

### 4. Environment Switching
- Create multiple environments (Development, Staging, Production)
- Switch between environments easily
- Keep different base URLs and credentials

## 📝 Notes

### Current Implementation Status
- ✅ **Authentication** - Fully implemented
- ✅ **Contact** - Fully implemented  
- ✅ **Newsletter** - Fully implemented
- ⏳ **Other Controllers** - Structure ready, implementation pending

### Testing Recommendations
1. Start with authentication endpoints
2. Test public endpoints (destinations, tours)
3. Test protected endpoints (bookings, payments)
4. Test admin endpoints (create, update, delete)

### Common Issues
- **CORS errors:** Check server CORS configuration
- **Token expired:** Use refresh token endpoint
- **Validation errors:** Check request body format
- **Database errors:** Check server logs

## 🆘 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test with curl commands
4. Check API documentation

---

**Happy Testing! 🚀**
