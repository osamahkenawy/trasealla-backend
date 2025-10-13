    # ✈️ Frontend Flight Booking Integration Guide - Amadeus/Duffel

## 📋 Overview
Complete guide for implementing flight search and booking UI for Trasealla Travel Agency using Amadeus/Duffel flight APIs.

---

## 🎯 User Flow - Flight Booking Journey

```
1. Search Flights
   ↓
2. View Results & Filter
   ↓
3. Select Flight
   ↓
4. Confirm Pricing (Price may change)
   ↓
5. Add Traveler Information
   ↓
6. Select Seats (Optional)
   ↓
7. Review & Payment
   ↓
8. Booking Confirmation
   ↓
9. View Booking Details
```

---

## 🔌 API Endpoints Reference

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:5001/api
```

### 🟢 Public Endpoints (No Auth Required)

#### 1. Search Airports (Autocomplete)
```http
GET /api/airports/search?q=dubai&limit=10
```

**Response:**
```json
{
  "airports": [
    {
      "__typename": "SingleAirport",
      "code": "DXB",
      "title": "Dubai",
      "country": "United Arab Emirates"
    }
  ],
  "__typename": "AirportAutocompleterResults"
}
```

#### 2. Search Flights
```http
GET /api/flights/search?origin=DXB&destination=JFK&departureDate=2025-12-15&returnDate=2025-12-22&adults=2&travelClass=ECONOMY&currencyCode=AED
```

**Query Parameters:**
- `origin` (required): Airport IATA code (e.g., "DXB")
- `destination` (required): Airport IATA code (e.g., "JFK")
- `departureDate` (required): YYYY-MM-DD format
- `returnDate` (optional): For round trip
- `adults` (default: 1): Number of adults
- `children` (default: 0): Number of children
- `infants` (default: 0): Number of infants
- `travelClass` (default: "ECONOMY"): ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
- `nonStop` (default: false): true/false
- `currencyCode` (default: "AED"): Currency code
- `maxResults` (default: 50): Number of results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "unique-offer-id",
      "type": "flight-offer",
      "source": "GDS",
      "instantTicketingRequired": false,
      "nonHomogeneous": false,
      "oneWay": false,
      "lastTicketingDate": "2025-12-10",
      "numberOfBookableSeats": 9,
      "itineraries": [
        {
          "duration": "PT13H30M",
          "segments": [
            {
              "departure": {
                "iataCode": "DXB",
                "terminal": "3",
                "at": "2025-12-15T03:05:00"
              },
              "arrival": {
                "iataCode": "JFK",
                "terminal": "4",
                "at": "2025-12-15T08:35:00"
              },
              "carrierCode": "EK",
              "number": "202",
              "aircraft": {
                "code": "77W"
              },
              "operating": {
                "carrierCode": "EK"
              },
              "duration": "PT14H30M",
              "id": "1",
              "numberOfStops": 0,
              "blacklistedInEU": false
            }
          ]
        }
      ],
      "price": {
        "currency": "AED",
        "total": "3500.00",
        "base": "3200.00",
        "fees": [
          {
            "amount": "0.00",
            "type": "SUPPLIER"
          },
          {
            "amount": "0.00",
            "type": "TICKETING"
          }
        ],
        "grandTotal": "3500.00"
      },
      "pricingOptions": {
        "fareType": ["PUBLISHED"],
        "includedCheckedBagsOnly": true
      },
      "validatingAirlineCodes": ["EK"],
      "travelerPricings": [
        {
          "travelerId": "1",
          "fareOption": "STANDARD",
          "travelerType": "ADULT",
          "price": {
            "currency": "AED",
            "total": "1750.00",
            "base": "1600.00"
          },
          "fareDetailsBySegment": [
            {
              "segmentId": "1",
              "cabin": "ECONOMY",
              "fareBasis": "ZLOW1AUS",
              "class": "Z",
              "includedCheckedBags": {
                "weight": 30,
                "weightUnit": "KG"
              }
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "searchParams": {...},
    "resultsCount": 50,
    "provider": "Amadeus"
  }
}
```

#### 3. Get Flight Price Analysis
```http
GET /api/flights/price-analysis?origin=DXB&destination=JFK&departureDate=2025-12-15
```

### 🔒 Protected Endpoints (Auth Required)

#### 4. Confirm Flight Price
```http
POST /api/flights/confirm-price
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "flightOffer": { /* full flight offer object from search */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "flight-offers-pricing",
    "flightOffers": [
      { /* updated flight offer with confirmed prices */ }
    ]
  }
}
```

#### 5. Get Seat Maps
```http
POST /api/flights/seat-maps
Authorization: Bearer {{token}}

{
  "flightOffer": { /* flight offer */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "seat-map",
      "flightOfferId": "1",
      "segmentId": "1",
      "carrierCode": "EK",
      "number": "202",
      "aircraft": { "code": "77W" },
      "departure": { "iataCode": "DXB", "at": "2025-12-15T03:05:00" },
      "arrival": { "iataCode": "JFK", "at": "2025-12-15T08:35:00" },
      "class": { "code": "Y" },
      "decks": [
        {
          "deckType": "MAIN",
          "seats": [
            {
              "cabin": "ECONOMY",
              "number": "12A",
              "characteristicsCodes": ["W", "1"],
              "travelerPricing": [
                {
                  "travelerId": "1",
                  "seatAvailabilityStatus": "AVAILABLE",
                  "price": { "currency": "AED", "total": "150.00" }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### 6. Create Flight Order (Book Flight)
```http
POST /api/flights/create-order
Authorization: Bearer {{token}}

{
  "flightOffer": { /* confirmed flight offer */ },
  "travelers": [
    {
      "id": "1",
      "dateOfBirth": "1990-05-15",
      "name": {
        "firstName": "JOHN",
        "lastName": "DOE"
      },
      "gender": "MALE",
      "contact": {
        "emailAddress": "john.doe@example.com",
        "phones": [
          {
            "deviceType": "MOBILE",
            "countryCallingCode": "971",
            "number": "501234567"
          }
        ]
      },
      "documents": [
        {
          "documentType": "PASSPORT",
          "birthPlace": "New York",
          "issuanceLocation": "New York",
          "issuanceDate": "2020-01-01",
          "number": "AB1234567",
          "expiryDate": "2030-01-01",
          "issuanceCountry": "US",
          "validityCountry": "US",
          "nationality": "US",
          "holder": true
        }
      ]
    }
  ],
  "remarks": {
    "general": [
      {
        "subType": "GENERAL_MISCELLANEOUS",
        "text": "Special meal request: Vegetarian"
      }
    ]
  },
  "selectedSeats": {
    "1": {
      "1": "12A"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Flight booked successfully!",
  "data": {
    "id": 123,
    "pnr": "ABC123",
    "bookingReference": "EKABC123",
    "status": "confirmed",
    "totalPrice": "3500.00",
    "currency": "AED",
    "flightOffer": {...},
    "travelers": [...],
    "segments": [...]
  }
}
```

#### 7. Get My Flight Orders
```http
GET /api/flights/my-orders
Authorization: Bearer {{token}}
```

#### 8. Get Flight Order Details
```http
GET /api/flights/orders/:orderId
Authorization: Bearer {{token}}
```

#### 9. Cancel Flight Order
```http
DELETE /api/flights/orders/:orderId
Authorization: Bearer {{token}}
```

---

## 🎨 UI Components Needed

### 1. **Flight Search Form**
```jsx
<FlightSearchForm>
  - Trip Type: One-way, Round-trip, Multi-city
  - Origin Airport (Autocomplete)
  - Destination Airport (Autocomplete)
  - Departure Date (Date Picker)
  - Return Date (Date Picker - if round trip)
  - Passengers:
    - Adults (1-9)
    - Children (0-9)
    - Infants (0-9)
  - Travel Class: Economy, Premium Economy, Business, First
  - Additional Options:
    - Direct flights only checkbox
    - Flexible dates checkbox
  - Search Button
</FlightSearchForm>
```

### 2. **Airport Autocomplete**
```jsx
<AirportAutocomplete>
  - Input field with debounced search
  - Dropdown with results
  - Display: Airport Code - City, Country
  - Group by country for multiple airports
  - Show airport icon
</AirportAutocomplete>
```

### 3. **Flight Results List**
```jsx
<FlightResultsList>
  - Filters Sidebar:
    - Price range slider
    - Airlines (checkboxes)
    - Stops (nonstop, 1 stop, 2+ stops)
    - Departure time slots
    - Arrival time slots
    - Duration range
    - Baggage (included/not included)
  
  - Sort Options:
    - Cheapest
    - Fastest
    - Best (recommended)
    - Earliest departure
    - Latest departure
  
  - Results Count
  
  - Flight Cards:
    - Airline logo
    - Flight number
    - Departure/Arrival times
    - Duration
    - Stops indicator
    - Price (prominently displayed)
    - Baggage allowance
    - Seat availability indicator
    - "View Details" / "Select" button
</FlightResultsList>
```

### 4. **Flight Details Modal/Expandable**
```jsx
<FlightDetails>
  - Outbound Journey:
    - Each segment with:
      - Airline & flight number
      - Aircraft type
      - Departure: Airport, terminal, time
      - Arrival: Airport, terminal, time
      - Duration
      - Layover time (if applicable)
  
  - Return Journey (if applicable)
  
  - Fare Breakdown:
    - Base fare × passengers
    - Taxes & fees
    - Total price
  
  - Baggage Policy:
    - Carry-on
    - Checked baggage
  
  - Fare Conditions:
    - Refundable/Non-refundable
    - Changes allowed
    - Cancellation policy
  
  - Select Flight Button
</FlightDetails>
```

### 5. **Traveler Information Form**
```jsx
<TravelerForm>
  For each passenger:
  - Title (Mr/Mrs/Ms/Dr)
  - First Name (as on passport)
  - Last Name (as on passport)
  - Date of Birth (Date Picker)
  - Gender
  - Nationality
  - Passport Details:
    - Passport Number
    - Issue Date
    - Expiry Date
    - Issuing Country
  
  - Contact Information (for primary passenger):
    - Email
    - Phone (country code + number)
  
  - Special Requests (optional):
    - Meal preferences
    - Wheelchair assistance
    - Other requests
</TravelerForm>
```

### 6. **Seat Selection**
```jsx
<SeatMap>
  - Aircraft cabin layout
  - Color-coded seats:
    - Available (green)
    - Occupied (gray)
    - Selected (blue)
    - Extra legroom (yellow/premium)
  - Seat legend
  - Price indicator for paid seats
  - Per-passenger selection
  - Skip seat selection option
</SeatMap>
```

### 7. **Review & Payment**
```jsx
<BookingReview>
  - Flight Summary:
    - Outbound & Return flights
    - Passenger names
    - Selected seats
  
  - Price Breakdown:
    - Flight fare
    - Seat charges
    - Taxes & fees
    - Total Amount
  
  - Payment Method Selection:
    - Credit/Debit Card
    - PayTabs integration
    - Other payment methods
  
  - Terms & Conditions checkbox
  
  - Confirm & Pay Button
</BookingReview>
```

### 8. **Booking Confirmation**
```jsx
<BookingConfirmation>
  - Success message with animation
  - Booking Reference (PNR)
  - E-ticket numbers
  - Flight details
  - Passenger names
  - Download/Email ticket buttons
  - Add to calendar button
  - Check-in reminder
  - View booking details link
</BookingConfirmation>
```

### 9. **My Bookings List**
```jsx
<MyBookings>
  - Filter: Upcoming, Past, Cancelled
  - Booking Cards:
    - Booking reference
    - Route
    - Date
    - Passengers
    - Status badge
    - Total paid
    - Actions:
      - View details
      - Download ticket
      - Cancel (if allowed)
</MyBookings>
```

---

## 📊 State Management

### Recommended State Structure (Redux/Context):

```javascript
flightBooking: {
  // Search State
  searchParams: {
    origin: null,
    destination: null,
    departureDate: null,
    returnDate: null,
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    travelClass: 'ECONOMY',
    nonStop: false
  },
  
  // Results State
  searchResults: [],
  filteredResults: [],
  isSearching: false,
  searchError: null,
  
  // Selected Flight
  selectedFlight: null,
  confirmedFlight: null,
  isPriceConfirming: false,
  
  // Seat Maps
  seatMaps: [],
  selectedSeats: {},
  
  // Traveler Info
  travelers: [],
  
  // Booking State
  bookingInProgress: false,
  bookingSuccess: false,
  bookingError: null,
  currentBooking: null,
  
  // User Bookings
  myBookings: [],
  isLoadingBookings: false
}
```

---

## 🔄 API Integration Flow

### Step-by-Step Implementation:

#### **Step 1: Search Flights**
```javascript
// API Call
const searchFlights = async (searchParams) => {
  const queryString = new URLSearchParams({
    origin: searchParams.origin,
    destination: searchParams.destination,
    departureDate: searchParams.departureDate,
    returnDate: searchParams.returnDate,
    adults: searchParams.passengers.adults,
    children: searchParams.passengers.children,
    infants: searchParams.passengers.infants,
    travelClass: searchParams.travelClass,
    currencyCode: 'AED'
  }).toString();
  
  const response = await fetch(
    `${API_BASE_URL}/api/flights/search?${queryString}`
  );
  
  const data = await response.json();
  return data.data; // Array of flight offers
};
```

#### **Step 2: Confirm Price**
```javascript
const confirmFlightPrice = async (flightOffer) => {
  const response = await fetch(
    `${API_BASE_URL}/api/flights/confirm-price`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ flightOffer })
    }
  );
  
  const data = await response.json();
  return data.data.flightOffers[0]; // Updated flight offer
};
```

#### **Step 3: Get Seat Maps** (Optional)
```javascript
const getSeatMaps = async (flightOffer) => {
  const response = await fetch(
    `${API_BASE_URL}/api/flights/seat-maps`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ flightOffer })
    }
  );
  
  const data = await response.json();
  return data.data; // Array of seat maps
};
```

#### **Step 4: Create Booking**
```javascript
const createFlightOrder = async (bookingData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/flights/create-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(bookingData)
    }
  );
  
  const data = await response.json();
  return data.data; // Created flight order
};
```

---

## 🎯 Key Features to Implement

### 1. **Smart Autocomplete for Airports**
- Debounce search (300ms)
- Cache results
- Show loading state
- Handle no results
- Display airport groups for countries with multiple airports

### 2. **Real-time Price Updates**
- Confirm prices before proceeding to payment
- Show price change warnings if applicable
- Display "Price may change" disclaimer

### 3. **Multi-step Booking Process**
- Progress indicator
- Save progress (session storage)
- Allow back navigation
- Validate each step before proceeding

### 4. **Responsive Filters**
- Instant filtering (no API calls)
- Filter count indicators
- Clear all filters option
- Mobile-friendly filter drawer

### 5. **Loading States**
- Skeleton screens for search results
- Animated loading indicators
- Disabled buttons during API calls

### 6. **Error Handling**
- User-friendly error messages
- Retry mechanisms
- Validation before API calls
- Network error handling

### 7. **Mobile Optimization**
- Touch-friendly UI
- Bottom sheets for filters/details
- Swipe gestures
- Optimized forms

---

## 💡 UX Best Practices

1. **Search Form**
   - Auto-suggest popular routes
   - Remember recent searches
   - Flexible dates option with calendar heatmap
   - Show cheapest month to travel

2. **Results Display**
   - Show "Best Deal" badge
   - Highlight fastest option
   - Compare up to 3 flights side-by-side
   - Infinite scroll or pagination

3. **Booking Process**
   - Auto-fill from user profile
   - Save traveler profiles for future
   - Auto-format passport numbers
   - Validate expiry dates

4. **Payment**
   - Multiple payment options
   - Secure payment indicators
   - Save card details (tokenized)
   - Payment confirmation

5. **Post-Booking**
   - Instant confirmation
   - Email/SMS notifications
   - Download PDF ticket
   - Add to Apple/Google Wallet
   - Share itinerary

---

## 🎨 Design Recommendations

### Color Coding
- **Primary**: Flight routes, CTAs
- **Success**: Available, Confirmed
- **Warning**: Price changes, Limited seats
- **Error**: Unavailable, Errors
- **Info**: Tips, Additional info

### Typography
- **Headlines**: Bold, Large (Flight times, prices)
- **Body**: Regular (Details, descriptions)
- **Caption**: Small (Additional info, disclaimers)

### Icons
- ✈️ Flight
- 🌍 Destination
- 📅 Date
- 👤 Passengers
- 💺 Seats
- 🎫 Ticket
- 💳 Payment
- ✅ Confirmation

---

## 📱 Mobile-First Considerations

1. **Bottom Navigation**: Easy thumb access
2. **Collapsible Sections**: Save screen space
3. **Sticky Headers**: Keep context visible
4. **Touch Targets**: Minimum 44x44px
5. **Offline Mode**: Cache search results
6. **Progressive Web App**: Installable

---

## 🚀 Performance Optimization

1. **Lazy Loading**: Load images/components as needed
2. **Code Splitting**: Separate bundles per route
3. **Caching**: Cache API responses (with expiry)
4. **Compression**: Gzip/Brotli responses
5. **CDN**: Serve static assets
6. **Debouncing**: Search inputs
7. **Virtual Scrolling**: Large result lists

---

## 🧪 Testing Checklist

- [ ] Search with different passenger counts
- [ ] One-way and round-trip searches
- [ ] Filter and sort functionality
- [ ] Price confirmation flow
- [ ] Complete booking with payment
- [ ] View booking details
- [ ] Cancel booking
- [ ] Mobile responsiveness
- [ ] Accessibility (WCAG 2.1)
- [ ] Error scenarios
- [ ] Loading states
- [ ] Empty states

---

## 📚 Technologies Recommended

**Frontend Framework**: React/Next.js or Vue/Nuxt

**UI Libraries**:
- Tailwind CSS / Material-UI / Ant Design
- Framer Motion (animations)
- React Hook Form (forms)
- Date-fns / Day.js (dates)

**State Management**:
- Redux Toolkit / Zustand / Context API

**API**:
- Axios / Fetch API
- React Query / SWR (caching)

**Other**:
- React Router (navigation)
- Yup / Zod (validation)
- React-Select (dropdowns)
- React-Datepicker (dates)

---

## 📞 Support & Documentation

- API Documentation: `http://localhost:5001/api-docs`
- Postman Collection: Import from `/Trasealla_Production_APIs.postman_collection.json`
- Backend Guide: See `/POSTMAN_GUIDE.md`

---

## 🎬 Quick Start Command for Chat/AI

**Copy and paste this to your frontend AI assistant:**

```
Create a complete flight booking UI for a travel agency with the following requirements:

TECH STACK:
- React with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- React Hook Form for forms
- Zustand for state management

API BASE URL: http://localhost:5001/api

FEATURES TO IMPLEMENT:

1. FLIGHT SEARCH PAGE:
- Search form with:
  * Airport autocomplete (GET /api/airports/search?q=dubai)
  * Date pickers (departure and return)
  * Passenger selector (adults, children, infants)
  * Travel class dropdown (ECONOMY, BUSINESS, FIRST, PREMIUM_ECONOMY)
- Search flights (GET /api/flights/search with query params)
- Display results with filters and sorting
- Responsive design

2. FLIGHT RESULTS PAGE:
- Display flight cards with airline logo, times, duration, price
- Sidebar filters (price, airlines, stops, times)
- Sort options (cheapest, fastest, recommended)
- Flight details modal with segments, baggage, fare rules
- Select flight button

3. BOOKING FLOW:
- Confirm price (POST /api/flights/confirm-price)
- Traveler information form (passport details)
- Optional seat selection (POST /api/flights/seat-maps)
- Review & payment page
- Create booking (POST /api/flights/create-order)
- Confirmation page with PNR

4. MY BOOKINGS PAGE:
- List user's flight bookings (GET /api/flights/my-orders)
- View booking details
- Download ticket option

AUTH:
- All booking operations require Bearer token
- Login saves token to localStorage
- Include token in Authorization header

VALIDATION:
- All dates in YYYY-MM-DD format
- Airport codes are 3-letter IATA codes
- Passport numbers and dates required
- Email and phone validation

ERROR HANDLING:
- Display user-friendly error messages
- Handle network errors
- Show loading states
- Validate before API calls

Please create the complete implementation with all components, pages, API integration, and routing.
```

---

**Ready to implement! Share this guide with your frontend team or use the Quick Start command with an AI assistant.** ✈️🚀

