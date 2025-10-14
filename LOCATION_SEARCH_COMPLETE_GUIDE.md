# 🌍 Complete Location Search Guide - Airports & Cities

## ✅ **All Issues Fixed!**

You now have **FOUR DIFFERENT WAYS** to search for airports and cities!

---

## 🎯 **All Available Endpoints**

### 1. **Airport Search (Local Database)**
```http
GET /api/airports/search?q=dubai&limit=10
```
- 📊 **29 seeded airports**
- ⚡ **Super fast** (2-10ms)
- 🔒 **Works offline**

---

### 2. **Airport Search (Duffel Dedicated)**
```http
GET /api/airports/duffel/search?q=dubai&limit=10
```
- 🌍 **10,000+ airports**
- 📅 **Always current**
- ✈️ **Airport-only** results

---

### 3. **Airport Search (Auto-Switch)**
```http
GET /api/airports/search?q=dubai&limit=10&source=duffel
```
- 🔀 **Flexible switching**
- 💡 **Same endpoint**, choose source

---

### 4. **Location Search (Airports + Cities)** ⭐ NEW!
```http
GET /api/flights/locations?keyword=dubai&provider=duffel
```
- ✈️ **Airports** (e.g., DXB, DWC)
- 🏙️ **Cities** (e.g., Dubai city code)
- 🎯 **Both in one call**

---

## 📊 **Comparison Table**

| Endpoint | Data Source | Returns | Speed | Coverage |
|----------|-------------|---------|-------|----------|
| `/airports/search` | Local DB | Airports only | ⚡ Fast | 29 |
| `/airports/search?source=duffel` | Duffel | Airports only | 🐌 Medium | 10,000+ |
| `/airports/duffel/search` | Duffel | Airports only | 🐌 Medium | 10,000+ |
| `/flights/locations?provider=duffel` | Duffel | Airports + Cities | 🐌 Medium | 10,000+ |

---

## 🎯 **When to Use Which?**

### **Use `/airports/search` (Local)** when:
- ✅ You need fast autocomplete
- ✅ Working with seeded airports only
- ✅ Offline support needed
- ✅ High-traffic pages (e.g., homepage)

### **Use `/airports/duffel/search`** when:
- ✅ Need comprehensive airport list
- ✅ Working with flight bookings
- ✅ User might search any airport worldwide

### **Use `/flights/locations?provider=duffel`** when:
- ✅ Want both airports AND cities
- ✅ More flexible search (city-level)
- ✅ Multi-airport city bookings

---

## 📝 **Response Examples**

### 1. Local Airport Search:
```bash
GET /api/airports/search?q=dubai

{
  "airports": [
    {
      "__typename": "SingleAirport",
      "code": "DXB",
      "title": "Dubai",
      "country": "United Arab Emirates"
    }
  ],
  "source": "local"
}
```

### 2. Duffel Airport Search:
```bash
GET /api/airports/duffel/search?q=dubai

{
  "airports": [
    {
      "__typename": "SingleAirport",
      "code": "DXB",
      "title": "Dubai International Airport",
      "country": "Dubai, AE"
    },
    {
      "__typename": "SingleAirport",
      "code": "DWC",
      "title": "Al Maktoum International Airport",
      "country": "Dubai, AE"
    }
  ],
  "source": "duffel",
  "totalResults": 5
}
```

### 3. Duffel Locations (Airports + Cities):
```bash
GET /api/flights/locations?keyword=dubai&provider=duffel

{
  "success": true,
  "data": [
    {
      "code": "DXB",
      "name": "Dubai",
      "type": "CITY",
      "country": "AE"
    },
    {
      "code": "DXB",
      "name": "Dubai International Airport",
      "type": "AIRPORT",
      "city": "Dubai",
      "country": "AE",
      "latitude": 25.252987,
      "longitude": 55.365035
    },
    {
      "code": "DWC",
      "name": "Al Maktoum International Airport",
      "type": "AIRPORT",
      "city": "Dubai",
      "country": "AE"
    }
  ],
  "count": 5
}
```

---

## 🎨 **Frontend Recommendations**

### **For Flight Search Form:**

Use **Locations endpoint** (includes both airports and cities):

```typescript
const AirportCityAutocomplete = () => {
  const searchLocations = async (keyword: string) => {
    const response = await fetch(
      `/api/flights/locations?keyword=${keyword}&provider=duffel`
    );
    const data = await response.json();
    return data.data;
  };
  
  return (
    <Autocomplete
      onInputChange={(value) => searchLocations(value)}
      renderOption={(location) => (
        <div>
          <strong>{location.code}</strong> - {location.name}
          <span className="text-gray-500">
            {location.type === 'AIRPORT' ? '✈️ Airport' : '🏙️ City'}
          </span>
        </div>
      )}
    />
  );
};
```

### **For Airport-Only Selection:**

Use **Airport Duffel endpoint**:

```typescript
const AirportOnlyAutocomplete = () => {
  const searchAirports = async (query: string) => {
    const response = await fetch(
      `/api/airports/duffel/search?q=${query}&limit=10`
    );
    const data = await response.json();
    return data.airports;
  };
};
```

---

## 🔄 **Recommended Flow**

### Flight Booking User Journey:

```
User types "dub" in search
   ↓
Call: GET /api/flights/locations?keyword=dub&provider=duffel
   ↓
Show results:
   - 🏙️ Dubai (DXB) - City with 5 airports
   - ✈️ Dubai International Airport (DXB)
   - ✈️ Al Maktoum International (DWC)
   - ✈️ Dublin Airport (DUB)
   ↓
User selects: Dubai International Airport (DXB)
   ↓
Use code "DXB" for flight search
```

---

## 🧪 **Test All Methods in Postman**

The collection now includes:

**Airports Section:**
1. Get All Airports
2. Search Airports (Local DB)
3. Search Airports (Duffel API)
4. Search Airports (Auto-Duffel)
5. Get Airport by Code
6. Get Airports by Country

**Flights Section:**
1. 🌍 Search Locations (Airports & Cities) ⭐ NEW!
2. 1️⃣ Search Flights
3. 2️⃣ Confirm Price
4. 4️⃣ Book Flight

---

## 💡 **Pro Tips**

### 1. **Use Cities for Multi-Airport Selection**
```javascript
// If user searches "London" and selects city
if (location.type === 'CITY') {
  // Search for all airports in London
  // Let user choose specific airport
  showAirportSelector(location.code);
}
```

### 2. **Prioritize Airports Over Cities**
```javascript
const sortResults = (locations) => {
  return locations.sort((a, b) => {
    // Airports first, then cities
    if (a.type === 'AIRPORT' && b.type === 'CITY') return -1;
    if (a.type === 'CITY' && b.type === 'AIRPORT') return 1;
    return 0;
  });
};
```

### 3. **Show Type Icons**
```jsx
<LocationOption location={loc}>
  {loc.type === 'AIRPORT' ? '✈️' : '🏙️'} {loc.name}
</LocationOption>
```

---

## 🚀 **Quick Test Commands**

```bash
# Test all 4 methods:

# 1. Local
curl "http://localhost:5001/api/airports/search?q=london"

# 2. Duffel airports only
curl "http://localhost:5001/api/airports/duffel/search?q=london"

# 3. Auto-switch
curl "http://localhost:5001/api/airports/search?q=london&source=duffel"

# 4. Locations (airports + cities)
curl "http://localhost:5001/api/flights/locations?keyword=london&provider=duffel"
```

---

## 📋 **Summary of Changes**

### ✅ **What Was Added:**

1. **DuffelFlightProvider.js:**
   - Added `searchPlaces()` method
   - Added `searchLocations()` method (Amadeus-compatible)

2. **airportController.js:**
   - Added `searchAirportsFromDuffel()` function
   - Updated `searchAirports()` with source parameter

3. **routes/airports.js:**
   - Added `/duffel/search` route
   - Updated `/search` route with source parameter

4. **Postman Collection:**
   - Added 3 new airport search requests
   - Added 1 locations search request

---

## 🎁 **Bonus: What Each Returns**

### `/airports/search` (Local):
```json
{"airports": [...], "source": "local"}
```

### `/airports/duffel/search`:
```json
{"airports": [...], "source": "duffel", "totalResults": 10}
```

### `/flights/locations`:
```json
{"success": true, "data": [...], "count": 12}
```

**Note:** Different formats for different use cases!

---

## ✅ **Error Fixed!**

**Before:**
```
"flightProvider.searchLocations is not a function"
```

**After:**
```json
{
  "success": true,
  "data": [
    {"code": "DXB", "name": "Dubai", "type": "CITY"},
    {"code": "DXB", "name": "Dubai International Airport", "type": "AIRPORT"}
  ]
}
```

---

## 🎯 **Recommended Frontend Implementation**

```typescript
// Smart autocomplete with both options
interface LocationSearchProps {
  includeCities?: boolean;
  onSelect: (location: Location) => void;
}

const LocationSearch = ({ includeCities = true, onSelect }: LocationSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    if (query.length < 2) return;
    
    const search = async () => {
      const endpoint = includeCities 
        ? `/api/flights/locations?keyword=${query}&provider=duffel`
        : `/api/airports/duffel/search?q=${query}&limit=10`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      // Handle different response formats
      const items = includeCities ? data.data : data.airports;
      setResults(items);
    };
    
    const debounced = setTimeout(search, 300);
    return () => clearTimeout(debounced);
  }, [query]);
  
  return (
    <input 
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search airports or cities..."
    />
  );
};
```

---

**All location search methods are now working! 🌍✈️**

Test them in Postman and choose the best one for your frontend! 🚀

