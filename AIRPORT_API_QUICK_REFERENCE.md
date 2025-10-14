# ✈️ Airport API - Quick Reference Card

## 🎯 Three Ways to Search Airports

### 1️⃣ **Local Database (Default)**
```
GET /api/airports/search?q=dubai&limit=10
```
- ⚡ **Fast** (2-10ms)
- 📊 **Limited** (29 airports)
- 🔒 **Offline** support

---

### 2️⃣ **Duffel API (Recommended)**
```
GET /api/airports/duffel/search?q=dubai&limit=10
```
- 🌍 **Comprehensive** (10,000+ airports)
- 📅 **Always up-to-date**
- 🔄 **Real-time** data

---

### 3️⃣ **Auto-Switch with Source**
```
GET /api/airports/search?q=dubai&limit=10&source=duffel
```
- 🔀 **Flexible** switching
- 💡 **Same endpoint**, different source

---

## 📊 Quick Comparison

| Feature | Local | Duffel |
|---------|-------|--------|
| Speed | ⚡ 2-10ms | 🐌 100-400ms |
| Airports | 29 | 10,000+ |
| Coverage | Limited | Worldwide |
| Offline | ✅ | ❌ |
| Rate Limits | ❌ | ✅ |

**Recommendation:** Use **Duffel** for flight bookings! 🎯

---

## 🚀 **Examples**

### Search Dubai:
```bash
# Local: 1 result (DXB only)
GET /api/airports/search?q=dubai

# Duffel: 5 results (DXB, DWC, Jebel Ali, etc.)
GET /api/airports/duffel/search?q=dubai
```

### Search London:
```bash
# Local: 4 results (LHR, LGW, MAN, BHX)
GET /api/airports/search?q=london

# Duffel: 10+ results (All London airports + worldwide)
GET /api/airports/duffel/search?q=london
```

---

## 💻 **Frontend Usage**

### React/TypeScript:
```typescript
const searchAirports = async (query: string) => {
  const response = await fetch(
    `/api/airports/duffel/search?q=${query}&limit=10`
  );
  const data = await response.json();
  return data.airports;
};
```

### With Debouncing:
```typescript
const [query, setQuery] = useState('');
const [debouncedQuery] = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery.length >= 2) {
    searchAirports(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

## 🎨 **Response Example**

```json
{
  "airports": [
    {
      "__typename": "SingleAirport",
      "code": "DXB",
      "title": "Dubai International Airport",
      "country": "Dubai, AE"
    }
  ],
  "__typename": "AirportAutocompleterResults",
  "source": "duffel",
  "totalResults": 5
}
```

---

## ✅ **Best Practices**

1. **Use Duffel for Flight Booking:**
   ```
   Ensures airport codes work with Duffel flight search
   ```

2. **Debounce Search (300ms):**
   ```javascript
   Wait for user to stop typing
   ```

3. **Minimum 2 Characters:**
   ```javascript
   if (query.length >= 2) search();
   ```

4. **Show Loading State:**
   ```jsx
   {isSearching && <Spinner />}
   ```

5. **Cache Results:**
   ```javascript
   Cache for 5 minutes to avoid repeated calls
   ```

---

## 📱 **Postman Testing**

Import updated collection, then try:

1. **Search Airports (Local DB)**
2. **Search Airports (Duffel API)**  ← Try this!
3. **Search Airports (Auto-Duffel)**

All pre-configured and ready to test! 🎉

---

## 🔗 **Related Docs**

- Full Guide: `/AIRPORT_SEARCH_DUFFEL_INTEGRATION.md`
- Flight Params: `/FLIGHT_SEARCH_PARAMETERS.md`
- Postman Guide: `/POSTMAN_FLIGHT_BOOKING_GUIDE.md`

---

**Updated:** 2025-10-13
**Status:** ✅ Production Ready
**Coverage:** 🌍 Worldwide

🚀 **Ready to search 10,000+ airports!**

