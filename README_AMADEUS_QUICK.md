# ✈️ Amadeus Flight Integration - Quick Reference

## 🚀 Get Started in 3 Steps

### Step 1: Get Free Amadeus Credentials
1. Visit: **https://developers.amadeus.com/register**
2. Create a free account
3. Create a new "Self-Service" app
4. Copy your **Client ID** and **Client Secret**

### Step 2: Add to .env
```bash
AMADEUS_CLIENT_ID=paste_your_id_here
AMADEUS_CLIENT_SECRET=paste_your_secret_here
AMADEUS_ENV=test
```

### Step 3: Test in Postman
1. Go to: **Phase 7 - Flights via Amadeus** → **Search Flights**
2. Click **Send** (no auth needed!)
3. ✅ See real flight results!

---

## 📡 API Endpoints

### 🌍 Public (No Auth)
```
GET /api/flights/search?origin=JFK&destination=DXB&departureDate=2025-12-15&adults=2
GET /api/flights/locations/search?keyword=Dubai
GET /api/flights/price-analysis?origin=JFK&destination=DXB&departureDate=2025-12-15
```

### 🔒 Protected (Need Token)
```
POST /api/flights/reprice
POST /api/flights/book
POST /api/flights/seat-maps
GET /api/flights/my-bookings
GET /api/flights/orders/:orderId
DELETE /api/flights/orders/:orderId
```

---

## 🎯 Quick Test

```bash
# Search flights (works without Amadeus credentials for demo)
curl "http://localhost:5001/api/flights/search?origin=NYC&destination=LON&departureDate=2025-12-15&adults=1"
```

**With real Amadeus credentials, you'll get:**
- Real flight availability
- Current prices
- Multiple airlines
- Booking options

---

## 📚 Full Documentation

See `AMADEUS_INTEGRATION_GUIDE.md` for complete details.

---

**Amadeus is ready to use!** 🎉
