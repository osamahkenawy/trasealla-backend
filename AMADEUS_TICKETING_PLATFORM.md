# ✈️ Amadeus Ticketing Platform - Complete API Guide

## 🎯 Overview

A **production-ready ticketing platform** powered by Amadeus Self-Service APIs.

### 📊 What's Included:

1. **Flight Shopping** (Search, Pricing, Analysis)
2. **Pre-Booking** (Seat Selection, Branded Fares, Price Confirmation)
3. **Booking** (Create Order, Store PNR)
4. **Post-Booking** (Manage Orders, Cancellation)
5. **Reporting** (Statistics, Analytics)

---

## 🛤️ Complete Booking Flow

### The 7-Step Ticketing Process:

```
┌─────────────────────────────────────────────────────┐
│ STEP 1: Search Flights                              │
│ GET /api/flights/search                             │
│ → Returns available flight offers                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 2: Confirm Price                               │
│ POST /api/flights/confirm-price                     │
│ → Validates current price (prevents price changes)  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 3: Get Branded Fares (Optional Upsell)         │
│ POST /api/flights/branded-fares                     │
│ → Shows economy basic vs flex, etc.                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 4: Select Seats (Optional)                     │
│ POST /api/flights/seat-maps                         │
│ → Display airplane seat layout                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 5: Create Order (Book Flight)                  │
│ POST /api/flights/create-order                      │
│ → Creates PNR, reserves seats, stores booking       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 6: View Order Details                          │
│ GET /api/flights/orders/:orderId                    │
│ → Retrieve PNR, ticket info, traveler details       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 7: Cancel Order (If Needed)                    │
│ DELETE /api/flights/orders/:orderId                 │
│ → Cancel booking, process refund                    │
└─────────────────────────────────────────────────────┘
```

---

## 📡 Complete API Reference

### 🌍 PUBLIC APIs (No Authentication)

#### 1. Search Flights ⭐
```
GET /api/flights/search
```

**Required Parameters:**
- `origin` - Origin airport code (JFK, LHR, DXB)
- `destination` - Destination airport code
- `departureDate` - Date (YYYY-MM-DD)

**Optional Parameters:**
- `returnDate` - For round trips
- `adults` - Number of adults (default: 1)
- `children` - Number of children
- `infants` - Number of infants
- `travelClass` - ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
- `nonStop` - true/false
- `currencyCode` - USD, EUR, AED, etc.
- `maxResults` - Max number of results (default: 50)

**Example:**
```bash
curl 'http://localhost:5001/api/flights/search?origin=JFK&destination=DXB&departureDate=2025-12-15&adults=2&travelClass=ECONOMY&currencyCode=AED'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "provider": "Amadeus",
      "type": "flight-offer",
      "price": {
        "currency": "AED",
        "total": 4400.50,
        "base": 4000.00,
        "grandTotal": 4400.50
      },
      "itineraries": [
        {
          "duration": "PT13H30M",
          "segments": [
            {
              "departure": {
                "iataCode": "JFK",
                "terminal": "4",
                "at": "2025-12-15T22:00:00"
              },
              "arrival": {
                "iataCode": "DXB",
                "terminal": "3",
                "at": "2025-12-16T19:30:00"
              },
              "carrierCode": "EK",
              "number": "202",
              "aircraft": "77W",
              "duration": "PT13H30M",
              "numberOfStops": 0
            }
          ]
        }
      ],
      "numberOfBookableSeats": 9,
      "validatingAirlineCodes": ["EK"]
    }
  ],
  "meta": {
    "resultsCount": 15,
    "provider": "Amadeus"
  }
}
```

---

#### 2. Search Locations (Autocomplete)
```
GET /api/flights/locations?keyword=Dubai
```

**Example:**
```bash
curl 'http://localhost:5001/api/flights/locations?keyword=New'
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
    },
    {
      "code": "NYC",
      "name": "New York",
      "type": "CITY",
      "city": "New York",
      "country": "United States",
      "countryCode": "US"
    }
  ],
  "count": 2
}
```

---

#### 3. Price Analysis (AI-Powered Insights)
```
GET /api/flights/price-analysis?origin=JFK&destination=DXB&departureDate=2025-12-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "priceMetrics": [
      {
        "quartileRanking": "MEDIUM",
        "amount": "550.00",
        "currencyCode": "USD"
      }
    ]
  }
}
```

---

### 🔒 PROTECTED APIs (Authentication Required)

#### 4. Confirm Flight Price ⭐
```
POST /api/flights/confirm-price
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "flightOffer": {
    // Full flight offer object from search results
    "id": "1",
    "source": "GDS",
    "itineraries": [...],
    "price": {...},
    ...
  }
}
```

**Purpose:** Validates the offer is still available at same price before booking.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "price": {
      "currency": "AED",
      "total": 4400.50,
      "grandTotal": 4400.50
    },
    "priceChanged": false
  },
  "message": "Price confirmed. Ready to book."
}
```

---

#### 5. Get Branded Fares (Upsell Options)
```
POST /api/flights/branded-fares
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "flightOffer": { ... }
}
```

**Response:** Shows different fare options (Basic, Flex, Premium)

---

#### 6. Get Seat Maps
```
POST /api/flights/seat-maps
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "flightOffer": { ... }
}
```

**Response:** Airplane seat layout with availability and pricing

---

#### 7. Create Flight Order (Book Flight) ⭐⭐⭐
```
POST /api/flights/create-order
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "flightOffer": {
    "id": "1",
    "source": "GDS",
    "price": { "grandTotal": "4400.50", "currency": "AED" },
    "itineraries": [...],
    ...
  },
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
  "message": "Flight order created successfully",
  "data": {
    "order": {
      "id": 1,
      "orderNumber": "ORD-FLT-1702056796",
      "amadeusOrderId": "eJzTd9f3NjIJdzUGAAp/fD4=",
      "pnr": "ABC123",
      "status": "confirmed",
      "ticketingStatus": "not_issued",
      "totalAmount": 4400.50,
      "currency": "AED"
    },
    "booking": {
      "bookingNumber": "BKG-FLT-1702056796"
    },
    "nextSteps": {
      "step": "ticketing",
      "message": "Order confirmed. Proceed to ticketing.",
      "ticketingDeadline": "2025-12-14T23:59:59"
    }
  }
}
```

---

#### 8. Get My Flight Orders
```
GET /api/flights/my-orders?page=1&limit=10
Authorization: Bearer TOKEN
```

**Filters:**
- `status` - pending, confirmed, ticketed, cancelled
- `ticketingStatus` - not_issued, issued, voided
- `page`, `limit` - Pagination

---

#### 9. Get Order Details
```
GET /api/flights/orders/:orderId
Authorization: Bearer TOKEN
```

**Response:** Complete order details including PNR, travelers, tickets

---

#### 10. Cancel Flight Order
```
DELETE /api/flights/orders/:orderId
Authorization: Bearer TOKEN
```

---

### 👨‍💼 ADMIN/AGENT APIs

#### 11. Get All Flight Orders (Admin/Agent)
```
GET /api/flights/orders?status=confirmed&page=1
Authorization: Bearer ADMIN_TOKEN
```

**Filters:**
- `status`, `ticketingStatus`
- `userId` - Filter by user
- `startDate`, `endDate` - Date range
- `search` - Search by order number, PNR

---

#### 12. Get Flight Statistics (Admin)
```
GET /api/flights/stats?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalOrders": 150,
      "confirmedOrders": 120,
      "ticketedOrders": 100,
      "cancelledOrders": 10,
      "totalRevenue": 225000.00
    },
    "distribution": {
      "byStatus": [...],
      "byAirline": [...]
    }
  }
}
```

---

## 🎬 Complete Booking Example

### Frontend Flow:

```javascript
// STEP 1: Search Flights
const searchResults = await fetch(
  'http://localhost:5001/api/flights/search?' + 
  'origin=JFK&destination=DXB&departureDate=2025-12-15&adults=2&currencyCode=AED'
);
const flights = await searchResults.json();

// User sees list of flights and selects one
const selectedFlight = flights.data[0];

// STEP 2: Confirm Price (IMPORTANT!)
const priceCheck = await fetch('http://localhost:5001/api/flights/confirm-price', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ flightOffer: selectedFlight })
});
const confirmedFlight = await priceCheck.json();

// STEP 3: Get Seat Maps (Optional)
const seatMapResponse = await fetch('http://localhost:5001/api/flights/seat-maps', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ flightOffer: confirmedFlight.data })
});
const seatMaps = await seatMapResponse.json();

// User selects seats...

// STEP 4: Create Order (Book!)
const bookingResponse = await fetch('http://localhost:5001/api/flights/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    flightOffer: confirmedFlight.data,
    travelers: [
      {
        firstName: "JOHN",
        lastName: "DOE",
        dateOfBirth: "1990-01-01",
        gender: "MALE",
        email: "john@example.com",
        phoneCountryCode: "1",
        phoneNumber: "1234567890",
        documents: [
          {
            documentType: "PASSPORT",
            number: "AB123456",
            expiryDate: "2030-01-01",
            issuanceCountry: "US",
            nationality: "US",
            holder: true
          }
        ]
      }
    ],
    contacts: {
      email: "john@example.com",
      phone: "+11234567890"
    }
  })
});

const booking = await bookingResponse.json();

// SUCCESS! Booking confirmed
console.log('PNR:', booking.data.order.pnr);
console.log('Order ID:', booking.data.order.orderNumber);
console.log('Status:', booking.data.order.status);
```

---

## 📋 Database Schema

### FlightOrder Table Structure:

```javascript
{
  // Identifiers
  orderNumber: "ORD-FLT-1702056796",     // Internal order number
  amadeusOrderId: "eJzTd9f3NjIJdzUGAAp", // Amadeus order ID
  pnr: "ABC123",                          // PNR/Record locator
  gdsRecordLocator: "ABC123",             // GDS locator
  
  // Status
  status: "confirmed",                    // Order status
  ticketingStatus: "not_issued",          // Ticket status
  
  // Pricing
  totalAmount: 4400.50,
  baseAmount: 4000.00,
  taxAmount: 400.50,
  currency: "AED",
  
  // Flight Details
  flightOfferData: { ... },               // Complete offer
  itineraries: [ ... ],                   // Flight segments
  travelers: [ ... ],                     // Passenger details
  tickets: [ ... ],                       // E-ticket numbers
  
  // Airlines
  validatingAirline: "EK",
  operatingAirlines: ["EK", "AA"],
  
  // Ancillaries
  ancillaryServices: {
    seats: ["12A", "12B"],
    baggage: ["1PC", "2PC"],
    meals: ["VGML"],
    other: []
  },
  
  // Dates
  ticketedAt: "2025-12-10T10:00:00",
  cancelledAt: null,
  expiresAt: "2025-12-14T23:59:59"
}
```

---

## 🔐 Authentication & Authorization

### Public Endpoints:
- ✅ Search flights
- ✅ Search locations
- ✅ Price analysis

### Customer Endpoints:
- 🔒 Confirm price
- 🔒 Get seat maps
- 🔒 Create order
- 🔒 View my orders
- 🔒 Cancel my orders

### Admin/Agent Endpoints:
- 👨‍💼 View all orders
- 👨‍💼 Get statistics
- 👨‍💼 Manage any order

---

## ⚙️ Configuration

### Environment Variables:

Add to your `.env`:

```env
# Amadeus Configuration
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
AMADEUS_ENV=test  # test or production

# Optional: Markup/Commission
FLIGHT_MARKUP_PERCENTAGE=5
FLIGHT_MARKUP_FIXED=10
```

### Get Amadeus Credentials:

1. **Free Test API:**
   - Visit: https://developers.amadeus.com/register
   - Create "Self-Service" app
   - Get Client ID & Secret
   - Test for free!

2. **Production API:**
   - Contact Amadeus sales
   - Sign agreement
   - Get production credentials
   - Go live!

---

## 🎯 Amadeus Self-Service APIs Implemented

| API | Endpoint | Status |
|-----|----------|--------|
| **Flight Offers Search** | `/search` | ✅ Implemented |
| **Flight Offers Price** | `/confirm-price` | ✅ Implemented |
| **Flight Create Orders** | `/create-order` | ✅ Implemented |
| **Flight Order Management** | `/orders/:id` | ✅ Implemented |
| **Seatmap Display** | `/seat-maps` | ✅ Implemented |
| **Branded Fares Upsell** | `/branded-fares` | ✅ Implemented |
| **Flight Price Analysis** | `/price-analysis` | ✅ Implemented |
| **Airport & City Search** | `/locations` | ✅ Implemented |

---

## 📊 Data Stored in Database

For each booking, we store:

1. **FlightOrder** - Complete order details
2. **Booking** - General booking record
3. **Audit Log** - All actions tracked
4. **Payment** - Payment transactions (Phase 5)

**Benefits:**
- ✅ Complete order history
- ✅ PNR/ticket retrieval
- ✅ Customer service support
- ✅ Reporting & analytics
- ✅ Refund processing
- ✅ Commission tracking

---

## 🔄 Ticketing Status Flow

```
not_issued → issued → [voided/refunded]
    ↓
  Order confirmed but ticket not issued yet
    ↓
  Issue ticket (generates e-ticket number)
    ↓
  Customer receives e-ticket email
    ↓
  Can void (before departure) or refund (after)
```

---

## 🎫 E-Ticketing (Amadeus Self-Service)

### Important Notes:

1. **Auto-Ticketing:** Amadeus Self-Service APIs handle ticketing automatically
2. **Ticketing Agreement:** Set when creating order
3. **E-Ticket Numbers:** Retrieved from order response
4. **Time Limits:** Must ticket before deadline (24-72 hours typically)

### Ticketing Options:

```javascript
// When creating order, can specify:
ticketingAgreement: {
  option: "DELAY_TO_CANCEL",  // Delay ticketing
  delay: "6D"                 // 6 days delay
}

// OR
ticketingAgreement: {
  option: "CONFIRM"  // Immediate ticketing
}
```

---

## 🧪 Testing Guide

### Test in Postman:

**Collection:** Phase 7 - Flights via Amadeus

1. **Search Flights** (Public)
   - No auth needed
   - Try: JFK → DXB on 2025-12-15
   - ✅ Should return Emirates, other airlines

2. **Confirm Price**
   - Login first
   - Copy a flight offer from search
   - Paste into request
   - ✅ Confirms current price

3. **Create Order**
   - Use confirmed offer
   - Add traveler details
   - ✅ Creates booking with PNR

4. **View My Orders**
   - See all your bookings
   - ✅ Shows PNR, status, etc.

---

## 🚨 Important Validations

### Traveler Data Requirements:

**Required Fields:**
- `firstName` - As on passport (ALL CAPS)
- `lastName` - As on passport (ALL CAPS)
- `dateOfBirth` - YYYY-MM-DD format
- `gender` - MALE or FEMALE
- `documents` - At least one passport

**Passport Requirements:**
- `documentType` - "PASSPORT"
- `number` - Passport number
- `expiryDate` - Must be valid for 6+ months
- `issuanceCountry` - ISO 2-letter code
- `nationality` - ISO 2-letter code

---

## 💡 Pro Tips

1. **Always confirm price before booking** - Prevents booking failures
2. **Validate passport expiry** - Must be 6 months valid from return
3. **Use seat maps before booking** - Better UX
4. **Store PNR immediately** - Critical for customer service
5. **Handle errors gracefully** - Flight availability changes rapidly
6. **Set reasonable timeouts** - Amadeus can be slow (15-30 seconds)
7. **Cache search results** - Use Redis (5-10 minutes)
8. **Log everything** - Audit trail for disputes

---

## 🎨 Frontend Integration Tips

### React/Vue Component Example:

```javascript
// 1. Flight Search Component
const FlightSearch = () => {
  const [results, setResults] = useState([]);
  
  const searchFlights = async (params) => {
    const query = new URLSearchParams(params);
    const res = await fetch(`/api/flights/search?${query}`);
    const data = await res.json();
    setResults(data.data);
  };
  
  return <SearchForm onSearch={searchFlights} />;
};

// 2. Booking Component
const FlightBooking = ({ selectedFlight }) => {
  const bookFlight = async (travelers) => {
    // First confirm price
    const priceCheck = await fetch('/api/flights/confirm-price', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ flightOffer: selectedFlight })
    });
    
    const confirmed = await priceCheck.json();
    
    // Then book
    const booking = await fetch('/api/flights/create-order', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        flightOffer: confirmed.data,
        travelers,
        contacts: { ... }
      })
    });
    
    const result = await booking.json();
    // Show PNR to user
    alert(`Booking confirmed! PNR: ${result.data.order.pnr}`);
  };
};
```

---

## 📞 Next Steps

### For Production:

1. **Get Amadeus Production Credentials**
2. **Add Payment Integration** (Phase 5)
3. **Implement Email Notifications** (send PNR, e-tickets)
4. **Add PDF Generation** (e-ticket/booking confirmation)
5. **Set up Webhooks** (flight status updates)
6. **Implement Caching** (Redis for search results)
7. **Add Rate Limiting** (respect Amadeus limits)

---

**Your comprehensive Amadeus ticketing platform is ready!** 🚀

Just add your credentials and start booking real flights!
