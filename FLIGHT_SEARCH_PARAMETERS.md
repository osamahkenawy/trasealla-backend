# ✈️ Flight Search API Parameters - Complete Guide

## 📡 Endpoint

```
GET /api/flights/search
```

No authentication required for searching flights.

---

## 🎯 Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `origin` | String | Origin airport IATA code (3 letters) | `DXB` |
| `destination` | String | Destination airport IATA code (3 letters) | `CAI` |
| `departureDate` | String | Departure date in YYYY-MM-DD format | `2025-12-15` |

---

## 🔧 Optional Parameters

### Passengers

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `adults` | Integer | `1` | Number of adult passengers (18+ years) | `2` |
| `children` | Integer | `0` | Number of child passengers (2-17 years) | `1` |
| `infants` | Integer | `0` | Number of infant passengers (< 2 years) | `1` |

**Notes:**
- Total passengers should not exceed 9
- At least 1 adult is required
- Infants must be accompanied by an adult (max 1 infant per adult)

---

### Travel Class

| Parameter | Type | Default | Description | Values |
|-----------|------|---------|-------------|--------|
| `travelClass` | String | `ECONOMY` | Cabin class preference | `ECONOMY`, `PREMIUM_ECONOMY`, `BUSINESS`, `FIRST` |

**Duffel Mapping:**
- `ECONOMY` → `economy`
- `PREMIUM_ECONOMY` → `premium_economy`
- `BUSINESS` → `business`
- `FIRST` → `first`

---

### Trip Type

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `returnDate` | String | `null` | Return date for round trip (YYYY-MM-DD) | `2025-12-22` |

**Notes:**
- If `returnDate` is provided → Round trip search
- If `returnDate` is omitted → One-way search
- Return date must be after departure date

---

### Flight Preferences

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `nonStop` | Boolean | `false` | Search for non-stop flights only | `true` |
| `maxResults` | Integer | `50` | Maximum number of offers to return | `20` |

**Notes:**
- `nonStop=true` → Only direct flights (0 connections)
- `nonStop=false` → Flights with up to 2 connections
- `maxResults` caps the number of offers returned

---

### Currency

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `currencyCode` | String | `USD` | Currency code for prices (ISO 3-letter) | `AED`, `USD`, `EUR` |

**Supported Currencies:**
- `AED` - UAE Dirham
- `USD` - US Dollar
- `EUR` - Euro
- `GBP` - British Pound
- `SAR` - Saudi Riyal
- And many more...

---

### Provider Selection

| Parameter | Type | Default | Description | Values |
|-----------|------|---------|-------------|--------|
| `provider` | String | `duffel` | Flight provider to use | `duffel`, `amadeus` |

**Notes:**
- Can also be set via environment variable: `DEFAULT_FLIGHT_PROVIDER`
- Duffel is faster and has better test data
- Amadeus has wider coverage

---

## 📊 Complete Example Requests

### 1. **One-Way Economy Flight**
```
GET /api/flights/search?origin=DXB&destination=CAI&departureDate=2025-12-15&adults=1&travelClass=ECONOMY&currencyCode=AED
```

### 2. **Round-Trip Business Class**
```
GET /api/flights/search?origin=DXB&destination=AUH&departureDate=2025-12-15&returnDate=2025-12-22&adults=2&travelClass=BUSINESS&currencyCode=AED
```

### 3. **Family Trip (2 Adults + 2 Children)**
```
GET /api/flights/search?origin=DXB&destination=LHR&departureDate=2025-12-20&returnDate=2026-01-05&adults=2&children=2&travelClass=ECONOMY&currencyCode=GBP
```

### 4. **Direct Flights Only**
```
GET /api/flights/search?origin=DXB&destination=JFK&departureDate=2025-11-01&adults=1&nonStop=true&currencyCode=USD
```

### 5. **Limit Results**
```
GET /api/flights/search?origin=CAI&destination=IST&departureDate=2025-10-20&adults=1&maxResults=10&currencyCode=USD
```

### 6. **With Infant**
```
GET /api/flights/search?origin=DXB&destination=BOM&departureDate=2025-12-10&returnDate=2025-12-20&adults=2&infants=1&travelClass=ECONOMY&currencyCode=INR
```

---

## 🎨 Postman / Frontend Usage

### JavaScript (Fetch)
```javascript
const searchParams = new URLSearchParams({
  origin: 'DXB',
  destination: 'CAI',
  departureDate: '2025-12-15',
  returnDate: '2025-12-22',
  adults: 2,
  children: 0,
  infants: 0,
  travelClass: 'ECONOMY',
  currencyCode: 'AED',
  nonStop: false,
  maxResults: 50
});

const response = await fetch(
  `http://localhost:5001/api/flights/search?${searchParams}`
);
const data = await response.json();
```

### Axios
```javascript
const { data } = await axios.get('/api/flights/search', {
  params: {
    origin: 'DXB',
    destination: 'CAI',
    departureDate: '2025-12-15',
    returnDate: '2025-12-22',
    adults: 2,
    travelClass: 'ECONOMY',
    currencyCode: 'AED'
  }
});
```

### cURL
```bash
curl -X GET "http://localhost:5001/api/flights/search?origin=DXB&destination=CAI&departureDate=2025-12-15&adults=2&travelClass=ECONOMY&currencyCode=AED"
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "off_0000...",
      "provider": "Duffel",
      "type": "flight-offer",
      "source": "Duffel",
      "expiresAt": "2025-10-12T19:24:44.094084Z",
      "price": {
        "currency": "USD",
        "total": 270.71,
        "base": 229.41,
        "tax": 41.3,
        "grandTotal": 270.71
      },
      "itineraries": [
        {
          "duration": "PT3H48M",
          "segments": [
            {
              "id": "seg_0000...",
              "departure": {
                "iataCode": "DXB",
                "cityName": "Dubai",
                "at": "2025-10-14T10:03:00",
                "terminal": "2"
              },
              "arrival": {
                "iataCode": "CAI",
                "cityName": "Cairo",
                "at": "2025-10-14T12:51:00",
                "terminal": "1"
              },
              "carrierCode": "ZZ",
              "carrierName": "Duffel Airways",
              "number": "6077",
              "duration": "PT3H48M"
            }
          ]
        }
      ],
      "passengers": [
        {
          "type": "adult",
          "age": null
        }
      ],
      "conditions": {
        "changeBeforeDeparture": {
          "penalty_currency": "GBP",
          "penalty_amount": "30.00",
          "allowed": true
        },
        "refundBeforeDeparture": {
          "allowed": false
        }
      }
    }
  ],
  "meta": {
    "searchParams": {...},
    "resultsCount": 50,
    "provider": "Duffel"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "origin, destination, and departureDate are required",
  "example": "?origin=JFK&destination=DXB&departureDate=2025-12-15&adults=2"
}
```

---

## ⚠️ Validation Rules

### Date Validation
- ✅ `departureDate >= today`
- ✅ `returnDate > departureDate` (if provided)
- ✅ Format: `YYYY-MM-DD`

### Passenger Validation
- ✅ `adults >= 1`
- ✅ `adults + children + infants <= 9`
- ✅ `infants <= adults` (1 infant per adult max)

### Airport Code Validation
- ✅ Must be 3-letter IATA codes
- ✅ Case insensitive (converted to uppercase)
- ✅ Must exist in airports database

---

## 🎯 Advanced Filtering (Duffel-Specific)

### Duffel Additional Features

While not directly exposed in our API, Duffel supports these internally:

**Max Connections:**
- Controlled via `nonStop` parameter
- `nonStop=true` → `max_connections: 0`
- `nonStop=false` → `max_connections: 2`

**Sorting:**
- Results sorted by `total_amount` (cheapest first)

**Cabin Class:**
- Exact match on requested cabin class
- No mixed-cabin results

---

## 💡 Best Practices

### 1. **Cache Results**
```javascript
// Frontend: Cache search results for 5 minutes
const cacheKey = `flights_${origin}_${destination}_${departureDate}`;
const cached = localStorage.getItem(cacheKey);
if (cached && Date.now() - cached.timestamp < 300000) {
  return cached.data;
}
```

### 2. **Debounce Search**
```javascript
// Wait for user to stop typing
const debouncedSearch = debounce(searchFlights, 500);
```

### 3. **Loading States**
```javascript
setLoading(true);
try {
  const results = await searchFlights(params);
  setFlights(results);
} finally {
  setLoading(false);
}
```

### 4. **Error Handling**
```javascript
try {
  const results = await searchFlights(params);
} catch (error) {
  if (error.message.includes('required')) {
    showError('Please fill all required fields');
  } else {
    showError('No flights found. Try different dates.');
  }
}
```

---

## 🔍 Testing Examples

### Test 1: Basic Search
```bash
curl "http://localhost:5001/api/flights/search?origin=DXB&destination=CAI&departureDate=2025-12-15&adults=1"
```

### Test 2: With All Parameters
```bash
curl "http://localhost:5001/api/flights/search?origin=DXB&destination=LHR&departureDate=2025-12-15&returnDate=2025-12-22&adults=2&children=1&infants=0&travelClass=BUSINESS&currencyCode=GBP&nonStop=true&maxResults=10&provider=duffel"
```

### Test 3: Invalid Parameters
```bash
# Missing required parameter
curl "http://localhost:5001/api/flights/search?origin=DXB&destination=CAI"
# Expected: 400 error

# Invalid date format
curl "http://localhost:5001/api/flights/search?origin=DXB&destination=CAI&departureDate=15-12-2025"
# Expected: 400 error
```

---

## 📚 Related Endpoints

After searching flights, use these endpoints:

1. **Confirm Price**: `POST /api/flights/confirm-price`
2. **Get Seat Maps**: `POST /api/flights/seat-maps`
3. **Book Flight**: `POST /api/flights/create-order`

---

## 🆘 Troubleshooting

### Issue: "No flights found"
**Solutions:**
- Try different dates (weekdays often have more flights)
- Remove `nonStop=true` filter
- Increase `maxResults`
- Try different airports (e.g., LGW instead of LHR)

### Issue: "Invalid airport code"
**Solutions:**
- Use 3-letter IATA codes (not city names)
- Check airport code exists: `GET /api/airports/search?q=dubai`
- Verify spelling

### Issue: "Prices seem high"
**Solutions:**
- Try different currency (`currencyCode=AED` vs `USD`)
- Book further in advance
- Try economy class
- Remove direct flight filter

---

## 📊 Parameter Summary Table

| Parameter | Required | Type | Default | Example | Notes |
|-----------|----------|------|---------|---------|-------|
| `origin` | ✅ Yes | String | - | `DXB` | 3-letter IATA code |
| `destination` | ✅ Yes | String | - | `CAI` | 3-letter IATA code |
| `departureDate` | ✅ Yes | String | - | `2025-12-15` | YYYY-MM-DD |
| `returnDate` | No | String | `null` | `2025-12-22` | For round trips |
| `adults` | No | Integer | `1` | `2` | 1-9 passengers |
| `children` | No | Integer | `0` | `1` | 0-8 passengers |
| `infants` | No | Integer | `0` | `1` | Max 1 per adult |
| `travelClass` | No | String | `ECONOMY` | `BUSINESS` | Cabin class |
| `nonStop` | No | Boolean | `false` | `true` | Direct only |
| `currencyCode` | No | String | `USD` | `AED` | 3-letter ISO |
| `maxResults` | No | Integer | `50` | `20` | 1-100 |
| `provider` | No | String | `duffel` | `amadeus` | Flight provider |

---

**Last Updated:** 2025-10-13
**API Version:** 2.0
**Duffel API Version:** v2

🚀 **Ready to search flights!**

