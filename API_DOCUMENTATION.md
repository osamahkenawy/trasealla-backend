# Trasealla Travel Agency - API Documentation

Complete API documentation for all travel agency services.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
Most endpoints require authentication using JWT Bearer tokens.

```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Users](#user-management)
3. [Destinations](#destinations)
4. [Tours](#tours)
5. [Flights](#flights)
6. [Hotels](#hotels)
7. [Activities](#activities)
8. [Bookings](#bookings)
9. [Payments](#payments)
10. [Visa Services](#visa-services)
11. [Reviews](#reviews)
12. [Contact](#contact-us)
13. [Newsletter](#newsletter)
14. [Content](#content-management)

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890"
}
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

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "nationality": "USA"
}
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## Destinations

### Get All Destinations
```http
GET /api/destinations?page=1&limit=10&country=USA&isPopular=true
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `country` - Filter by country
- `region` - Filter by region
- `isPopular` - Filter popular destinations
- `search` - Search by name or description

### Get Destination by ID
```http
GET /api/destinations/:id
```

### Create Destination (Admin/Agent)
```http
POST /api/destinations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Paris",
  "country": "France",
  "region": "Europe",
  "description": "The City of Light...",
  "mainImage": "paris.jpg",
  "bestTimeToVisit": "April to October",
  "currency": "EUR"
}
```

### Update Destination (Admin/Agent)
```http
PUT /api/destinations/:id
Authorization: Bearer <token>
```

### Delete Destination (Admin/Agent)
```http
DELETE /api/destinations/:id
Authorization: Bearer <token>
```

---

## Tours

### Get All Tours
```http
GET /api/tours?page=1&limit=10&category=Adventure&minPrice=100&maxPrice=1000
```

**Query Parameters:**
- `page`, `limit` - Pagination
- `category` - Tour category
- `minPrice`, `maxPrice` - Price range
- `duration` - Tour duration
- `difficulty` - Difficulty level
- `isFeatured` - Featured tours
- `isPopular` - Popular tours

### Get Tour by ID
```http
GET /api/tours/:id
```

### Get Featured Tours
```http
GET /api/tours/featured
```

### Get Popular Tours
```http
GET /api/tours/popular
```

### Create Tour (Admin/Agent)
```http
POST /api/tours
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Paris 5-Day Adventure",
  "description": "Explore the best of Paris...",
  "duration": 5,
  "basePrice": 999.99,
  "category": "Cultural",
  "maxGroupSize": 20,
  "includes": ["Hotel", "Breakfast", "Guide"],
  "itinerary": [...]
}
```

---

## Flights

### Search Flights
```http
GET /api/flights/search?from=JFK&to=CDG&date=2024-06-01&passengers=2&class=economy
```

**Query Parameters:**
- `from` - Departure airport code
- `to` - Arrival airport code
- `date` - Departure date
- `returnDate` - Return date (for round trips)
- `passengers` - Number of passengers
- `class` - Flight class (economy, business, first)
- `stops` - Number of stops (0, 1, 2+)

### Get Flight by ID
```http
GET /api/flights/:id
```

### Book Flight
```http
POST /api/flights/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "flightId": 123,
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "passportNumber": "AB123456"
    }
  ],
  "contactEmail": "john@example.com",
  "contactPhone": "+1234567890"
}
```

---

## Hotels

### Get All Hotels
```http
GET /api/hotels?destinationId=1&checkIn=2024-06-01&checkOut=2024-06-05&guests=2&starRating=4
```

**Query Parameters:**
- `destinationId` - Destination ID
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Number of guests
- `starRating` - Hotel star rating
- `minPrice`, `maxPrice` - Price range
- `amenities` - Required amenities

### Get Hotel by ID
```http
GET /api/hotels/:id
```

### Get Hotel Rooms
```http
GET /api/hotels/:id/rooms
```

### Check Hotel Availability
```http
GET /api/hotels/:id/availability?checkIn=2024-06-01&checkOut=2024-06-05
```

### Book Hotel
```http
POST /api/hotels/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "hotelId": 456,
  "roomType": "deluxe",
  "checkIn": "2024-06-01",
  "checkOut": "2024-06-05",
  "guests": 2,
  "specialRequests": "Late check-in"
}
```

---

## Activities

### Get All Activities
```http
GET /api/activities?destinationId=1&category=Adventure&date=2024-06-01
```

**Query Parameters:**
- `destinationId` - Filter by destination
- `category` - Activity category
- `date` - Available date
- `minPrice`, `maxPrice` - Price range
- `difficulty` - Difficulty level

### Get Activity by ID
```http
GET /api/activities/:id
```

### Book Activity
```http
POST /api/activities/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "activityId": 789,
  "date": "2024-06-01",
  "timeSlot": "09:00",
  "participants": 2
}
```

---

## Bookings

### Get User Bookings
```http
GET /api/bookings?status=confirmed&type=tour
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Booking status (pending, confirmed, cancelled, completed)
- `type` - Booking type (tour, activity, flight, hotel)
- `page`, `limit` - Pagination

### Get Booking by ID
```http
GET /api/bookings/:id
Authorization: Bearer <token>
```

### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingType": "tour",
  "referenceId": 123,
  "travelDate": "2024-06-01",
  "numberOfPeople": 2,
  "travelers": [...],
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "+1234567890"
}
```

### Cancel Booking
```http
PUT /api/bookings/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Change of plans"
}
```

---

## Payments

### Create Payment Intent
```http
POST /api/payments/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": 123,
  "amount": 999.99,
  "currency": "USD",
  "paymentMethod": "credit_card"
}
```

### Confirm Payment
```http
POST /api/payments/confirm-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "txn_123456",
  "paymentIntentId": "pi_123456"
}
```

### Get Payment History
```http
GET /api/payments/history?page=1&limit=10
Authorization: Bearer <token>
```

---

## Visa Services

### Get Visa Requirements
```http
GET /api/visas/requirements/france
```

### Apply for Visa
```http
POST /api/visas/apply
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "visaType": "Tourist",
  "destinationCountry": "France",
  "applicantName": "John Doe",
  "passportNumber": "AB123456",
  "travelDate": "2024-06-01",
  "documents": [file1, file2, ...]
}
```

### Get Visa Applications
```http
GET /api/visas/applications?status=submitted
Authorization: Bearer <token>
```

### Get Visa Application by ID
```http
GET /api/visas/applications/:id
Authorization: Bearer <token>
```

---

## Reviews

### Get Reviews
```http
GET /api/reviews?type=tour&page=1&limit=10
```

### Get Reviews for Specific Item
```http
GET /api/reviews/tour/123
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "reviewType": "tour",
  "referenceId": 123,
  "rating": 5,
  "title": "Amazing experience!",
  "comment": "This tour was incredible..."
}
```

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

### Mark Review as Helpful
```http
POST /api/reviews/:id/helpful
Authorization: Bearer <token>
```

---

## Contact Us

### Submit Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry about Paris tour",
  "message": "I would like to know more about...",
  "inquiryType": "booking"
}
```

### Get All Contacts (Admin)
```http
GET /api/contact?status=new&inquiryType=booking
Authorization: Bearer <admin-token>
```

### Get Contact by ID
```http
GET /api/contact/:id
Authorization: Bearer <token>
```

### Update Contact Status (Admin)
```http
PUT /api/contact/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "high",
  "assignedTo": 5
}
```

### Respond to Contact (Admin)
```http
POST /api/contact/:id/respond
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "response": "Thank you for your inquiry..."
}
```

### Get Contact Statistics (Admin)
```http
GET /api/contact/stats
Authorization: Bearer <admin-token>
```

---

## Newsletter

### Subscribe to Newsletter
```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Doe",
  "preferences": {
    "travelDeals": true,
    "newsletters": true
  }
}
```

### Unsubscribe from Newsletter
```http
POST /api/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "john@example.com",
  "reason": "Too many emails"
}
```

### Get All Subscribers (Admin)
```http
GET /api/newsletter/subscribers?isActive=true&page=1
Authorization: Bearer <admin-token>
```

### Get Newsletter Statistics (Admin)
```http
GET /api/newsletter/stats
Authorization: Bearer <admin-token>
```

---

## Content Management

### Get Blog Posts
```http
GET /api/content/blog?category=Travel Tips&page=1
```

### Get Blog Post by ID
```http
GET /api/content/blog/:id
```

### Get Team Members
```http
GET /api/content/team
```

### Get Testimonials
```http
GET /api/content/testimonials
```

### Create Blog Post (Admin)
```http
POST /api/content/blog
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "10 Tips for Solo Travel",
  "content": "...",
  "category": "Travel Tips",
  "featuredImage": "image.jpg",
  "status": "published"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [...]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting
- 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints

---

## Support
For API support, contact: support@trasealla.com
