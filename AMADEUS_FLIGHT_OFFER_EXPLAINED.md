# ✈️ Amadeus Flight Offer - Complete Field Explanation

## 📋 Flight Offer Structure Overview

When you search for flights, Amadeus returns an array of **flight offers**. Each offer is a complete package containing all information needed to display and book a flight.

---

## 🔍 Field-by-Field Explanation

### **Top-Level Fields**

#### `id: "1"`
- **What:** Unique identifier for this flight offer
- **Type:** String
- **Purpose:** Reference this ID when confirming price or booking
- **Important:** This ID is temporary (valid for ~10 minutes)
- **Usage:** Store temporarily, use for repricing before booking

#### `provider: "Amadeus"`
- **What:** Which provider returned this offer
- **Type:** String
- **Purpose:** Track data source
- **Usage:** For your internal tracking and SAL (Supplier Abstraction Layer)

#### `type: "flight-offer"`
- **What:** Type of object
- **Type:** String
- **Purpose:** Amadeus API standard (helps with data parsing)
- **Values:** Always "flight-offer" for search results

#### `source: "GDS"`
- **What:** Where the flight data comes from
- **Type:** String
- **Values:** 
  - `GDS` - Global Distribution System (most common, best availability)
  - `LCC` - Low-Cost Carrier (direct airline feed)
- **Important:** GDS offers are more reliable for booking

---

### **Booking Constraints**

#### `instantTicketingRequired: false`
- **What:** Must you issue ticket immediately after booking?
- **Type:** Boolean
- **Values:**
  - `true` - Ticket MUST be issued within minutes of booking
  - `false` - You have time (usually 24-72 hours)
- **Important:** If `true`, you need automated payment + ticketing
- **Display:** Show "Instant Ticketing Required" badge

#### `nonHomogeneous: false`
- **What:** Are all travelers on same fare class/rules?
- **Type:** Boolean
- **Values:**
  - `false` - All travelers same fare (normal)
  - `true` - Different fares for different travelers (rare)
- **Usage:** If `true`, check individual traveler pricing

#### `oneWay: false`
- **What:** Is this a one-way or round-trip flight?
- **Type:** Boolean
- **Values:**
  - `true` - One-way flight
  - `false` - Round-trip or multi-city
- **Display:** Show "One Way" or "Round Trip" label

#### `lastTicketingDate: "2025-12-15"`
- **What:** Deadline to issue ticket
- **Type:** Date string (YYYY-MM-DD)
- **Important:** ⚠️ **CRITICAL** - Must ticket by this date or booking auto-cancels
- **Display:** Show countdown: "Ticket by Dec 15, 2025"
- **Usage:** Set reminders, send emails to customer

#### `numberOfBookableSeats: 9`
- **What:** How many seats available at this price
- **Type:** Integer
- **Important:** 
  - If booking 5 people and seats = 4, booking will fail
  - Low numbers (1-3) mean limited availability
- **Display:** 
  - If `< 5`: Show "Only X seats left!" (urgency)
  - If `>= 5`: Show "Available"

---

### **Flight Itinerary Details**

#### `itineraries: []`
- **What:** Array of flight journeys (outbound, return)
- **Type:** Array
- **Structure:**
  - One-way: 1 itinerary
  - Round-trip: 2 itineraries (outbound + return)
  - Multi-city: 3+ itineraries

##### `duration: "PT12H25M"`
- **What:** Total flight duration
- **Format:** ISO 8601 duration (PT = Period Time)
- **Parse:** PT12H25M = 12 hours 25 minutes
- **Display:** "12h 25m" or "12:25"
- **Code Example:**
  ```javascript
  function parseDuration(duration) {
    const match = duration.match(/PT(\d+)H(\d+)M/);
    return `${match[1]}h ${match[2]}m`;
  }
  ```

---

### **Flight Segments** (Individual Flights)

Each itinerary contains **segments** (individual flight legs).

#### **Departure Information**

```json
"departure": {
  "iataCode": "JFK",
  "terminal": "4",
  "at": "2025-12-15T23:00:00"
}
```

- **`iataCode`**: Airport code (JFK = New York Kennedy)
- **`terminal`**: Terminal number at airport
  - **Display:** "Terminal 4"
  - **Important:** Show to customer for airport navigation
- **`at`**: Departure date/time (ISO 8601 format)
  - **Format:** YYYY-MM-DDTHH:MM:SS
  - **Display:** "Dec 15, 2025 at 11:00 PM"
  - **Important:** In **local airport time** (not UTC!)

#### **Arrival Information**

```json
"arrival": {
  "iataCode": "DXB",
  "terminal": "3",
  "at": "2025-12-16T20:25:00"
}
```

- Same structure as departure
- **Important:** Arrival time is in **destination local time**
- **Display:** Show arrival date prominently (may be next day!)

#### **Flight Details**

##### `carrierCode: "EK"`
- **What:** Airline code (EK = Emirates)
- **Type:** 2-letter IATA code
- **Usage:** 
  - Get airline logo: `https://images.kiwi.com/airlines/64/${code}.png`
  - Get airline name: Use airline dictionary
- **Display:** Show airline logo + name "Emirates"

##### `number: "202"`
- **What:** Flight number
- **Type:** String
- **Display:** "EK 202" (carrier code + number)
- **Usage:** Customers need this for check-in

##### `aircraft: "388"`
- **What:** Aircraft type code
- **Type:** String
- **Common Codes:**
  - `388` = Airbus A380-800 (double-decker!)
  - `77W` = Boeing 777-300ER
  - `32A` = Airbus A320
  - `738` = Boeing 737-800
- **Display:** "Airbus A380" (more passenger-friendly)
- **Usage:** Shows aircraft size/comfort level

##### `operating: { "carrierCode": "EK" }`
- **What:** Who actually operates the flight
- **Type:** Object
- **Important:** Sometimes different from `carrierCode`
- **Example:** You book Emirates (EK) but Qantas operates
- **Display:** "Operated by Emirates" (if different from carrier)

##### `duration: "PT12H25M"`
- **What:** Flight time for this segment
- **Display:** "12h 25m flight time"

##### `id: "1"`
- **What:** Segment identifier
- **Usage:** Reference specific segments for seat selection

##### `numberOfStops: 0`
- **What:** Number of stops in this segment
- **Type:** Integer
- **Values:**
  - `0` - Non-stop (direct flight)
  - `1` - 1 stop
  - `2+` - Multiple stops
- **Display:** 
  - `0`: "Direct flight" badge
  - `1`: "1 stop"
  - Use for filtering!

##### `blacklistedInEU: false`
- **What:** Is airline banned in EU for safety?
- **Type:** Boolean
- **Important:** EU maintains safety blacklist
- **Display:** If `true`, show warning ⚠️
- **Usage:** Compliance requirement in EU

---

### **Pricing Information** 💰

```json
"price": {
  "currency": "AED",
  "total": 3755,
  "base": 2970,
  "fees": [...],
  "grandTotal": 3755
}
```

#### `currency: "AED"`
- **What:** Currency code (ISO 4217)
- **Display:** Show currency symbol (AED → د.إ)
- **Usage:** Multi-currency display

#### `total: 3755`
- **What:** Base fare + taxes (before fees)
- **Type:** Number
- **Display:** Usually don't show separately

#### `base: 2970`
- **What:** Base fare only (what airline charges)
- **Type:** Number
- **Usage:** Calculate your markup/commission on this
- **Display:** Show in price breakdown

#### `fees: []`
- **What:** Additional fees (supplier, ticketing)
- **Type:** Array
- **Display:** Show in detailed breakdown
- **Important:** Usually $0 in self-service API

#### `grandTotal: 3755`
- **What:** **FINAL PRICE** - What customer pays
- **Type:** Number
- **Important:** ⭐ **THIS IS THE PRICE TO SHOW**
- **Display:** Large, prominent: "AED 3,755" or "$1,021"
- **Formula:** `base + taxes + fees`

---

### **Pricing Options**

```json
"pricingOptions": {
  "fareType": ["PUBLISHED"],
  "includedCheckedBagsOnly": true
}
```

#### `fareType: ["PUBLISHED"]`
- **What:** Type of fare
- **Values:**
  - `PUBLISHED` - Public fares (normal)
  - `NEGOTIATED` - Corporate/bulk rates
  - `PRIVATE` - Special rates
- **Display:** Usually hide (technical detail)

#### `includedCheckedBagsOnly: true`
- **What:** Does price include checked baggage?
- **Type:** Boolean
- **Important:** If `false`, customer may need to pay extra for bags
- **Display:** Show baggage info prominently!

---

### **Validating Airline**

#### `validatingAirlineCodes: ["EK"]`
- **What:** Which airline validates/issues the ticket
- **Type:** Array of airline codes
- **Important:** This airline's rules apply for changes/refunds
- **Display:** "Ticket issued by Emirates"

---

### **Traveler Pricing** (Per Passenger Breakdown)

```json
"travelerPricings": [
  {
    "travelerId": "1",
    "fareOption": "STANDARD",
    "travelerType": "ADULT",
    "price": {...},
    "fareDetailsBySegment": [...]
  }
]
```

#### `travelerId: "1"`
- **What:** ID for this traveler in the group
- **Usage:** Match with traveler details when booking

#### `fareOption: "STANDARD"`
- **What:** Fare product type
- **Values:**
  - `STANDARD` - Regular fare
  - `INCLUSIVE_TOUR` - Package fare
  - `BRANDED_FARE` - Branded product (Flex, Basic, etc.)

#### `travelerType: "ADULT"`
- **What:** Passenger type
- **Values:**
  - `ADULT` - 12+ years
  - `CHILD` - 2-11 years
  - `INFANT` - 0-2 years (lap infant)
  - `SEATED_INFANT` - 0-2 years with own seat
  - `SENIOR` - 60+ years (sometimes different pricing)

#### `price: { total, base }`
- **What:** This traveler's individual price
- **Usage:** Show per-person pricing in breakdown

---

### **Fare Details by Segment** (Most Important for Display!)

```json
"fareDetailsBySegment": [
  {
    "segmentId": "1",
    "cabin": "ECONOMY",
    "fareBasis": "KHSOSUS1",
    "brandedFare": "ECOFLEX",
    "brandedFareLabel": "ECO FLEX",
    "class": "K",
    "includedCheckedBags": {...},
    "includedCabinBags": {...},
    "amenities": [...]
  }
]
```

#### `segmentId: "1"`
- **What:** Links to segment in itinerary
- **Usage:** Match segment details with fare rules

#### `cabin: "ECONOMY"`
- **What:** Cabin class
- **Values:** ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
- **Display:** ⭐ Show prominently: "Economy Class"

#### `fareBasis: "KHSOSUS1"`
- **What:** Airline internal fare code
- **Type:** String (cryptic airline code)
- **Usage:** Technical, usually hide from customer
- **Purpose:** Airlines use this for changes/refunds

#### `brandedFare: "ECOFLEX"`
- **What:** Branded fare product code
- **Display:** Use `brandedFareLabel` instead

#### `brandedFareLabel: "ECO FLEX"` ⭐
- **What:** Human-readable fare name
- **Type:** String
- **Display:** ⭐ **Show this!** "Economy Flex"
- **Important:** This is what customer understands
- **Examples:**
  - "ECO BASIC" - Cheapest, restrictions
  - "ECO FLEX" - Flexible, refundable
  - "ECO PREMIUM" - Extra legroom, priority

#### `class: "K"`
- **What:** Booking class (airline inventory class)
- **Type:** Single letter A-Z
- **Purpose:** Airlines use for yield management
- **Usually:** Hide from customer (technical detail)

---

### **Baggage Allowance** 🧳

#### `includedCheckedBags`
```json
"includedCheckedBags": {
  "quantity": 2
}
```

- **What:** Free checked baggage included
- **Type:** Object with quantity or weight
- **Values:**
  - `quantity: 2` - 2 bags included
  - `weight: 23, weightUnit: "KG"` - 23 KG allowance
- **Display:** ⭐ **VERY IMPORTANT**
  - "2 checked bags included" (icon)
  - "23 KG baggage allowance"
- **Marketing:** Major selling point!

#### `includedCabinBags`
```json
"includedCabinBags": {
  "quantity": 1
}
```

- **What:** Free carry-on bags
- **Display:** "1 cabin bag"
- **Common:** 1 cabin bag + 1 personal item

---

### **Amenities** 🎁 (IMPORTANT FOR DISPLAY!)

```json
"amenities": [
  {
    "description": "PRE RESERVED SEAT ASSIGNMENT",
    "isChargeable": true,
    "amenityType": "PRE_RESERVED_SEAT",
    "amenityProvider": { "name": "BrandedFare" }
  },
  ...
]
```

Each amenity object tells you what's included or available:

#### **Common Amenity Types:**

##### 1. **PRE_RESERVED_SEAT** (Seat Selection)
```json
{
  "description": "PRE RESERVED SEAT ASSIGNMENT",
  "isChargeable": true,
  "amenityType": "PRE_RESERVED_SEAT"
}
```
- **isChargeable: true** - Costs extra
- **isChargeable: false** - Included free
- **Display:** "Seat selection available ($)" or "Free seat selection ✓"

##### 2. **MEAL** (Food & Drinks)
```json
{
  "description": "BEVERAGE",
  "isChargeable": false,
  "amenityType": "MEAL"
}
```
- **Display:** "Complimentary meals & drinks ✓"
- **Important:** Shows service level

##### 3. **REFUNDABLE TICKET**
```json
{
  "description": "REFUNDABLE TICKET",
  "isChargeable": true,
  "amenityType": "BRANDED_FARES"
}
```
- **isChargeable: true** - Costs extra to make it refundable
- **isChargeable: false** - Already refundable (premium fare)
- **Display:** "Refundable (+$50)" or "Fully refundable ✓"
- **Marketing:** Major selling point!

##### 4. **CHANGEABLE TICKET**
```json
{
  "description": "CHANGEABLE TICKET",
  "isChargeable": true,
  "amenityType": "BRANDED_FARES"
}
```
- **Display:** "Date changes allowed (+fee)" or "Free changes ✓"

##### 5. **UPGRADE ELIGIBILITY**
```json
{
  "description": "UPGRADE ELIGIBILITY",
  "isChargeable": true,
  "amenityType": "BRANDED_FARES"
}
```
- **Display:** "Eligible for upgrades"
- **Usage:** Upsell opportunity

##### 6. **MILES EARNED**
```json
{
  "description": "70 PERCENT MILES EARNED",
  "isChargeable": false,
  "amenityType": "BRANDED_FARES"
}
```
- **Display:** "Earn 70% frequent flyer miles"
- **Important:** Shows earning rate (100% = full miles)

---

## 🎨 How to Display This Data

### **Flight Card - Main Display**

```javascript
// Top Section
Emirates EK 202                                    AED 3,755
Economy Flex                                       per person

// Flight Route
JFK (Terminal 4)  ✈️  -----12h 25m-----  ✈️  DXB (Terminal 3)
11:00 PM                                           8:25 PM +1 day
New York                                           Dubai

// Key Features (Icons)
✓ Direct flight
✓ 2 checked bags
✓ Refundable
✓ Free changes
⚠️ Only 9 seats left!

// Aircraft
Airbus A380-800
```

---

### **Detailed View - Expandable**

```javascript
// Price Breakdown
Base Fare:           AED 2,970
Taxes & Fees:        AED   785
─────────────────────────────
Total Price:         AED 3,755

// Baggage
Checked: 2 bags (23 KG each)
Cabin:   1 carry-on + 1 personal item

// Amenities
✓ Complimentary meals
✓ Beverages included
✓ Seat selection available (+AED 150)
✓ Refundable (+AED 300)
✓ Changes allowed (+AED 200)
✓ Upgrade eligible
✓ Earn 70% miles

// Booking Details
Ticket by: Dec 15, 2025
Fare Type: Published
Cabin: Economy
Booking Class: K
```

---

## 💡 Frontend Code Examples

### React/Vue Component:

```javascript
const FlightCard = ({ flightOffer }) => {
  // Parse duration
  const parseDuration = (iso) => {
    const match = iso.match(/PT(\d+)H(\d+)M/);
    return `${match[1]}h ${match[2]}m`;
  };

  const segment = flightOffer.itineraries[0].segments[0];
  const price = flightOffer.price;
  
  return (
    <div className="flight-card">
      {/* Airline & Price */}
      <div className="header">
        <img src={`/airlines/${segment.carrierCode}.png`} alt="Emirates" />
        <span>{segment.carrierCode} {segment.number}</span>
        <div className="price">
          <span className="currency">{price.currency}</span>
          <span className="amount">{price.grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Route */}
      <div className="route">
        <div className="departure">
          <span className="time">
            {new Date(segment.departure.at).toLocaleTimeString()}
          </span>
          <span className="airport">{segment.departure.iataCode}</span>
          <span className="terminal">Terminal {segment.departure.terminal}</span>
        </div>

        <div className="flight-info">
          <span className="duration">
            {parseDuration(flightOffer.itineraries[0].duration)}
          </span>
          {segment.numberOfStops === 0 && <span>Direct</span>}
        </div>

        <div className="arrival">
          <span className="time">
            {new Date(segment.arrival.at).toLocaleTimeString()}
          </span>
          <span className="airport">{segment.arrival.iataCode}</span>
        </div>
      </div>

      {/* Amenities */}
      <div className="amenities">
        {flightOffer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags && (
          <span>✓ {flightOffer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} bags</span>
        )}
        {flightOffer.travelerPricings[0].fareDetailsBySegment[0].amenities
          .filter(a => !a.isChargeable && a.amenityType === 'MEAL')
          .length > 0 && <span>✓ Meals included</span>
        }
      </div>

      {/* Urgency */}
      {flightOffer.numberOfBookableSeats < 5 && (
        <div className="urgency">
          ⚠️ Only {flightOffer.numberOfBookableSeats} seats left!
        </div>
      )}

      <button onClick={() => selectFlight(flightOffer)}>
        Select Flight
      </button>
    </div>
  );
};
```

---

## 🎯 Key Fields for Different Uses

### **Search Results Display:**
- ✅ `price.grandTotal` - Main price
- ✅ `departure.at`, `arrival.at` - Times
- ✅ `departure.iataCode`, `arrival.iataCode` - Airports
- ✅ `carrierCode`, `number` - Airline & flight number
- ✅ `duration` - Flight time
- ✅ `numberOfStops` - Direct or stops
- ✅ `brandedFareLabel` - Fare type (if available)
- ✅ `numberOfBookableSeats` - Availability

### **Detailed View:**
- ✅ All above +
- ✅ `terminal` - Terminal info
- ✅ `aircraft` - Aircraft type
- ✅ `includedCheckedBags` - Baggage
- ✅ `amenities` - All services
- ✅ `lastTicketingDate` - Booking deadline

### **Booking Process:**
- ✅ **Entire `raw` object** - Send this to booking API
- ✅ `id` - For repricing
- ✅ `instantTicketingRequired` - Payment urgency
- ✅ `lastTicketingDate` - Ticketing deadline

### **Filtering & Sorting:**
- Price: `price.grandTotal`
- Duration: Parse `duration`
- Stops: `numberOfStops`
- Airline: `carrierCode`
- Departure time: `departure.at`
- Refundable: Check amenities for "REFUNDABLE"

---

## 🚨 Important Notes

### 1. **Price Validity** ⏰
- Prices change rapidly
- Always **reprice before booking**
- Offer ID expires (~10 minutes)

### 2. **Time Zones** 🌍
- All times are in **local airport time**
- Calculate flight time from departure to arrival
- Show "+1 day" if arrival is next day

### 3. **Baggage** 🧳
- **CRITICAL** to display clearly
- Customers hate hidden bag fees
- Show quantity AND weight if available

### 4. **Amenities** 🎁
- Major differentiator between fares
- Refundable = premium price but worth it
- Display "isChargeable" clearly

### 5. **Urgency** ⚡
- `numberOfBookableSeats < 5` = Show urgency
- `lastTicketingDate` = Create countdown
- `instantTicketingRequired` = Red flag to customer

---

## 📊 Price Display Examples

### Option 1: Simple
```
AED 3,755
Per person
```

### Option 2: Detailed
```
Total: AED 3,755
Base: AED 2,970 + Taxes: AED 785
Per adult, including 2 bags
```

### Option 3: Comparative
```
AED 3,755  ← 15% below average
Per person | Economy Flex
```

---

## 🎓 Pro Tips

### 1. **Parse Durations**
```javascript
const parseDuration = (iso) => {
  const hours = iso.match(/(\d+)H/)?.[1] || 0;
  const mins = iso.match(/(\d+)M/)?.[1] || 0;
  return { hours, mins, display: `${hours}h ${mins}m` };
};
```

### 2. **Format Prices**
```javascript
const formatPrice = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};
// formatPrice(3755, 'AED') → "AED 3,755.00"
```

### 3. **Check Refundability**
```javascript
const isRefundable = (flightOffer) => {
  const amenities = flightOffer.travelerPricings[0]
    .fareDetailsBySegment[0].amenities;
  
  return amenities.some(a => 
    a.amenityType === 'BRANDED_FARES' && 
    a.description.includes('REFUNDABLE') &&
    !a.isChargeable  // Free refund
  );
};
```

### 4. **Extract All Amenities**
```javascript
const getIncludedAmenities = (flightOffer) => {
  const amenities = flightOffer.travelerPricings[0]
    .fareDetailsBySegment[0].amenities;
  
  return amenities
    .filter(a => !a.isChargeable)  // Free only
    .map(a => a.description);
};
// Returns: ["BEVERAGE", "MEAL VOUCHER", "70 PERCENT MILES EARNED"]
```

---

## 🎯 Summary - Most Important Fields

### **Must Display:**
1. ✅ **Price:** `price.grandTotal` + `currency`
2. ✅ **Route:** `departure.iataCode` → `arrival.iataCode`
3. ✅ **Times:** `departure.at`, `arrival.at`
4. ✅ **Duration:** Parse `itineraries[0].duration`
5. ✅ **Airline:** `carrierCode` + `number`
6. ✅ **Stops:** `numberOfStops`
7. ✅ **Baggage:** `includedCheckedBags.quantity`
8. ✅ **Cabin:** `fareDetailsBySegment[0].cabin`

### **Should Display:**
9. ✅ **Fare Type:** `brandedFareLabel`
10. ✅ **Aircraft:** `aircraft` code
11. ✅ **Terminal:** `departure.terminal`
12. ✅ **Amenities:** Parse amenities array
13. ✅ **Refundable:** Check amenities
14. ✅ **Seats Left:** `numberOfBookableSeats`

### **For Booking (Send Entire Object):**
15. ✅ **Complete `raw` object** - Use for booking API

---

**Now you understand every field!** Use this guide to build your perfect flight search UI! 🚀✈️
