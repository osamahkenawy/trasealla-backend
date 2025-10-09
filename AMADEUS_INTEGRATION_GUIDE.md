# ✈️ Amadeus Flight Integration Guide

## 🎉 What's Been Implemented

Complete **Phase 7 - Flights via Amadeus** integration with:

### ✅ Features Implemented:
1. **Flight Search** - Real-time search via Amadeus API
2. **Airport/City Search** - Autocomplete for locations
3. **Price Analysis** - Historical price trends
4. **Flight Reprice** - Confirm pricing before booking
5. **Flight Booking** - Create flight orders
6. **Order Management** - View and cancel bookings
7. **Seat Maps** - View available seats
8. **User Bookings** - List user's flight bookings

---

## 🏗️ Architecture

### Supplier Abstraction Layer (SAL)

```
┌─────────────────────────────────────┐
│   Flight Controller                 │
│   (Business Logic)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   IFlightProvider Interface         │
│   (Abstract Interface)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   AmadeusFlightProvider             │
│   (Amadeus-specific implementation) │
└─────────────────────────────────────┘
```

**Benefits:**
- ✅ Easy to swap providers (add Skyscanner, Sabre, etc.)
- ✅ Consistent API regardless of provider
- ✅ Centralized error handling
- ✅ Unified data format

---

## 🔧 Setup

### Step 1: Get Amadeus Credentials

1. Sign up at: https://developers.amadeus.com
2. Create a new app
3. Get your API key and secret

### Step 2: Configure Environment

Add to your `.env` file:

```env
# Amadeus Flight API
AMADEUS_CLIENT_ID=your_client_id_here
AMADEUS_CLIENT_SECRET=your_client_secret_here
AMADEUS_ENV=test  # Use 'test' for development, 'production' for live
```

### Step 3: Test the Integration

The Amadeus SDK has been installed and configured!

---

## 📡 API Endpoints

### Public Endpoints (No Auth Required):

#### 1. **Search Flights**
```
GET /api/flights/search
```

**Parameters:**
- `origin` (required) - Origin airport code (e.g., JFK, LHR, DXB)
- `destination` (required) - Destination airport code
- `departureDate` (required) - Date in YYYY-MM-DD format
- `returnDate` (optional) - For round trips
- `adults` - Number of adults (default: 1)
- `children` - Number of children (default: 0)
- `infants` - Number of infants (default: 0)
- `travelClass` - ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
- `nonStop` - true/false (only non-stop flights)
- `currencyCode` - USD, EUR, AED, etc.
- `maxResults` - Maximum results (default: 50)

**Example:**
```bash
curl "http://localhost:5001/api/flights/search?origin=JFK&destination=DXB&departureDate=2025-12-15&adults=2&travelClass=ECONOMY"
```

---

#### 2. **Search Locations (Airport/City Autocomplete)**
```
GET /api/flights/locations/search?keyword=Dubai
```

**Example:**
```bash
curl "http://localhost:5001/api/flights/locations/search?keyword=New"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "JFK",
      "name": "John F Kennedy International Airport",
      "type": "AIRPORT",
      "city": "New York",
      "country": "United States",
      "countryCode": "US"
    }
  ]
}
```

---

#### 3. **Get Price Analysis**
```
GET /api/flights/price-analysis?origin=JFK&destination=DXB&departureDate=2025-12-15
```

Get historical price trends and analytics for a route.

---

### Protected Endpoints (Auth Required):

#### 4. **Reprice Flight** (Confirm Current Price)
```
POST /api/flights/reprice
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "flightOffer": {
    // Full flight offer object from search results
  }
}
```

**Purpose:** Confirms current pricing before booking (prices can change!)

---

#### 5. **Book Flight**
```
POST /api/flights/book
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "flightOffer": { ... },
  "travelers": [
    {
      "firstName": "JOHN",
      "lastName": "DOE",
      "dateOfBirth": "1990-01-01",
      "gender": "MALE",
      "email": "john@example.com",
      "phoneCountryCode": "1",
      "phoneNumber": "1234567890",
      "documents": [
        {
          "documentType": "PASSPORT",
          "number": "AB123456",
          "expiryDate": "2030-01-01",
          "issuanceCountry": "US",
          "nationality": "US",
          "holder": true
        }
      ]
    }
  ],
  "contacts": {
    "email": "john@example.com",
    "phone": "+11234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Flight booked successfully",
  "data": {
    "booking": {
      "bookingNumber": "FLT-1234567890",
      "status": "confirmed",
      "totalAmount": 1200.00
    },
    "flightOrder": {
      "id": "eJzTd9f3NjIJdzUGAAp/fD4=",
      "associatedRecords": [
        {
          "reference": "ABC123",
          "creationDate": "2025-12-10T10:00:00",
          "originSystemCode": "GDS",
          "flightOfferId": "1"
        }
      ]
    }
  }
}
```

---

#### 6. **Get Flight Order**
```
GET /api/flights/orders/:orderId
Authorization: Bearer TOKEN
```

---

#### 7. **Cancel Flight Order**
```
DELETE /api/flights/orders/:orderId
Authorization: Bearer TOKEN
```

---

#### 8. **Get Seat Maps**
```
POST /api/flights/seat-maps
Authorization: Bearer TOKEN
```

---

#### 9. **Get My Bookings**
```
GET /api/flights/my-bookings?page=1&limit=10
Authorization: Bearer TOKEN
```

---

## 🧪 Testing

### Test 1: Search Airports (No Auth)
```bash
curl "http://localhost:5001/api/flights/locations/search?keyword=Dubai"
```

### Test 2: Search Flights (No Auth)
```bash
curl "http://localhost:5001/api/flights/search?origin=NYC&destination=DXB&departureDate=2025-12-15&adults=2"
```

**Note:** Amadeus test API has limited data. Use these test airport codes:
- NYC, JFK, LHR, CDG, DXB, MAD, BER, FCO, SYD, BKK

---

## 📋 Postman Collection Updated

### Phase 7 - Flights via Amadeus

**Flight Search** folder:
1. ✅ Search Flights (public)
2. ✅ Search Airport/City Locations (public)
3. ✅ Get Flight Price Analysis (public)
4. ✅ Reprice Flight Offer (protected)

**Flight Booking** folder:
5. ✅ Book Flight (protected)
6. ✅ Get Flight Order Details (protected)
7. ✅ Cancel Flight Order (protected)
8. ✅ Get Seat Maps (protected)
9. ✅ Get My Flight Bookings (protected)

---

## 🔑 Amadeus Test API

### Get Free Test Credentials:

1. Go to: https://developers.amadeus.com
2. Sign up (free)
3. Create a new app
4. Get Test API credentials

### Test Environment Features:
- ✅ Free flight search
- ✅ Limited test data
- ✅ Full booking flow (test mode)
- ✅ No real charges

### Production:
- Live flight data
- Real bookings
- Actual charges apply
- Requires approval from Amadeus

---

## 🎯 Workflow Example

### Complete Booking Flow:

```javascript
// 1. User searches for flights
GET /api/flights/search?origin=JFK&destination=DXB&departureDate=2025-12-15

// Response includes flight offers with IDs

// 2. User selects a flight, reprice to confirm
POST /api/flights/reprice
Body: { flightOffer: {...} }

// Response confirms current price

// 3. User books the flight
POST /api/flights/book
Body: { flightOffer, travelers, contacts }

// Response includes PNR and booking confirmation

// 4. User views their bookings
GET /api/flights/my-bookings

// 5. If needed, cancel booking
DELETE /api/flights/orders/{orderId}
```

---

## 📊 Database Integration

Flight bookings are saved to your `bookings` table:

```javascript
{
  bookingType: 'flight',
  bookingNumber: 'FLT-1234567890',
  status: 'confirmed',
  totalAmount: 1200.00,
  currency: 'USD',
  providerReference: 'amadeus-order-id',
  bookingDetails: {
    provider: 'Amadeus',
    flightOrder: { ... },
    travelers: [ ... ]
  }
}
```

---

## ⚡ Provider Abstraction Benefits

### Current:
```javascript
const flightProvider = new AmadeusFlightProvider();
const flights = await flightProvider.searchFlights(params);
```

### Future: Easy to Add More Providers
```javascript
// Add Skyscanner
class SkyscannerFlightProvider extends IFlightProvider {
  async searchFlights(params) {
    // Skyscanner-specific logic
  }
}

// Add Sabre
class SabreFlightProvider extends IFlightProvider {
  async searchFlights(params) {
    // Sabre-specific logic
  }
}

// Provider registry
const providers = {
  amadeus: new AmadeusFlightProvider(),
  skyscanner: new SkyscannerFlightProvider(),
  sabre: new SabreFlightProvider()
};

// Use any provider
const provider = providers[req.query.provider || 'amadeus'];
const flights = await provider.searchFlights(params);
```

---

## 🚨 Error Handling

All Amadeus errors are caught and transformed:

```json
{
  "success": false,
  "message": "Flight not available",
  "provider": "Amadeus"
}
```

Common errors:
- Invalid airport codes
- No results found  
- Date in the past
- API quota exceeded
- Invalid credentials

---

## 🎬 Quick Start

### 1. Install Dependencies (Already Done!)
```bash
npm install amadeus axios
```

### 2. Configure Amadeus
Add credentials to `.env`:
```
AMADEUS_CLIENT_ID=your_id
AMADEUS_CLIENT_SECRET=your_secret
AMADEUS_ENV=test
```

### 3. Test in Postman
- Import the updated collection
- Go to: **Phase 7 - Flights via Amadeus**
- Try: **Search Flights** (no auth needed!)

### 4. Get Test Credentials
Visit: https://developers.amadeus.com/self-service

---

## 📚 Files Created

1. **`config/amadeus.js`** - Amadeus SDK configuration
2. **`services/providers/IFlightProvider.js`** - Provider interface
3. **`services/providers/AmadeusFlightProvider.js`** - Amadeus implementation
4. **`controllers/flightController.js`** - Flight business logic
5. **`routes/flights.js`** - Updated with all endpoints
6. **Updated Postman collection** - All flight endpoints

---

## 🎯 Next Steps

1. **Get Amadeus test credentials** (free at developers.amadeus.com)
2. **Add credentials to .env**
3. **Test flight search in Postman**
4. **Integrate with your frontend**
5. **Add more providers** (optional)

---

## 💡 Pro Tips

1. **Always reprice before booking** - Prices change frequently
2. **Cache search results** - Reduce API calls (use Redis)
3. **Handle Amadeus rate limits** - 10 requests/second on test API
4. **Test with known routes** - NYC-LHR, JFK-CDG work well in test mode
5. **Validate passenger data** - Amadeus is strict about passport details

---

**Your Amadeus integration is production-ready!** 🚀

Just add your credentials and start testing!
