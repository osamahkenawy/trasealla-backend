# 📬 Postman Collections Guide

## 📦 Available Collections

You now have **2 Postman collections**:

### 1. **Trasealla_Production_APIs.postman_collection.json** ⭐ RECOMMENDED
**Best for:** Frontend development, customer-facing APIs, production use

**What's included:**
- ✅ Clean, focused, production-ready endpoints
- ✅ No internal admin/system APIs
- ✅ Auto-saves tokens and IDs
- ✅ Emoji icons for easy navigation
- ✅ Test scripts for workflow automation

**Sections:**
1. 🔐 **Authentication & Users** (4 requests)
2. ✈️ **Flights (Amadeus)** (9 requests) - Complete booking flow
3. 🏨 **Hotels** (3 requests)
4. 🏖️ **Tours & Destinations** (5 requests)
5. 🛂 **Visa Services** (5 requests)
6. 💳 **Payments** (4 requests)
7. 📋 **Bookings** (3 requests)
8. ⭐ **Reviews & Ratings** (2 requests)
9. 🎫 **Activities** (3 requests)
10. 📊 **Reports & Analytics** (3 requests - Admin)

**Total:** ~40 customer-facing API endpoints

---

### 2. **Trasealla_Phases_Collection.postman_collection.json**
**Best for:** Full system testing, admin operations, all 14 phases

**What's included:**
- All customer-facing APIs
- Internal system APIs (Phases 1-14)
- Admin & agent operations
- System configuration APIs

**Sections:**
- Authentication
- Contact & Newsletter
- User Management
- Phase 1: Core Foundation (Agency, RBAC, CMS, Audit)
- Phase 2: Integration Foundation
- Phase 3-14: All business phases

**Total:** 100+ API endpoints

---

## 🎯 Which Collection to Use?

### Use **Production APIs** if:
- ✅ Building frontend application
- ✅ Integrating with mobile app
- ✅ Customer-facing features
- ✅ Third-party integrations
- ✅ Clean, focused testing

### Use **Phases Collection** if:
- Testing admin features
- System configuration
- Internal operations
- Complete platform testing
- All 14 phases exploration

---

## 🚀 Quick Start - Production Collection

### Step 1: Import Collection
1. Open Postman
2. Click **Import**
3. Select: `Trasealla_Production_APIs.postman_collection.json`
4. ✅ Imported!

### Step 2: Set Environment
Create environment with variables:
```
baseUrl: http://localhost:5001
authToken: (auto-filled after login)
```

### Step 3: Test Flow

**Quick Test (3 steps):**

1. **Register/Login**
   - Go to: 🔐 Authentication & Users → Login
   - Use: `admin@trasealla.com` / `Admin123456!`
   - Click **Send**
   - ✅ Token auto-saved!

2. **Search Flights**
   - Go to: ✈️ Flights → 1️⃣ Search Flights
   - Click **Send**
   - ✅ See available flights!

3. **Book Flight**
   - Copy a flight offer from search results
   - Go to: ✈️ Flights → 2️⃣ Confirm Price
   - Paste offer
   - Go to: ✈️ Flights → 4️⃣ Book Flight
   - Click **Send**
   - ✅ Flight booked with PNR!

---

## 🎨 Collection Features

### Auto-Save Variables
The production collection automatically saves:
- `{{authToken}}` - After login
- `{{userId}}` - Current user ID
- `{{flightOrderId}}` - After booking
- `{{pnr}}` - Flight PNR
- `{{confirmedFlightOffer}}` - Validated offer

### Test Scripts
Automatic actions after successful requests:
```javascript
// After Login
✅ Saves auth token
✅ Saves user ID
✅ Logs user role

// After Flight Search
✅ Can save selected offer

// After Booking
✅ Saves order ID
✅ Saves PNR
✅ Logs booking number
```

### Smart Organization
- Emoji icons for visual navigation
- Numbered steps for workflows (1️⃣, 2️⃣, 3️⃣)
- Grouped by business domain
- Public endpoints marked (no auth)

---

## 📋 Complete API List - Production Collection

### 🔐 Authentication & Users
1. Register
2. Login  
3. Get My Profile
4. Update Profile

### ✈️ Flights (Amadeus)
1. 1️⃣ Search Flights (public)
2. 2️⃣ Confirm Price
3. 3️⃣ Get Seat Maps
4. 4️⃣ Book Flight
5. Get My Flight Orders
6. Get Order by PNR
7. Cancel Flight Order
8. Search Locations (autocomplete)
9. Price Analysis

### 🏨 Hotels
1. Search Hotels
2. Get Hotel Details
3. Book Hotel

### 🏖️ Tours & Destinations
1. Get All Destinations
2. Get Destination by ID
3. Search Tours
4. Get Tour Details
5. Book Tour

### 🛂 Visa Services
1. Get Visa Requirements (public)
2. Submit Application
3. Get My Applications
4. Get Application Status
5. Update Status (Admin)

### 💳 Payments
1. Create Payment Intent
2. Process Payment
3. Get Payment History
4. Request Refund

### 📋 Bookings
1. Get My Bookings
2. Get Booking Details
3. Cancel Booking

### ⭐ Reviews
1. Get Reviews (public)
2. Submit Review

### 🎫 Activities
1. Search Activities
2. Get Details
3. Book Activity

### 📊 Reports (Admin)
1. Sales Report
2. Revenue Dashboard
3. Booking Metrics

---

## 🔑 Environment Variables

Set these in Postman Environment:

```
baseUrl: http://localhost:5001
authToken: (auto-filled)
refreshToken: (auto-filled)
userId: (auto-filled)
flightOrderId: (auto-filled)
pnr: (auto-filled)
confirmedFlightOffer: {} (auto-filled)
```

---

## 💡 Pro Tips

### 1. Use Environments
Create different environments:
- **Local** - `http://localhost:5001`
- **Staging** - `https://staging-api.trasealla.com`
- **Production** - `https://api.trasealla.com`

### 2. Collection Runner
Run entire booking flow automatically:
1. Select: ✈️ Flights folder
2. Click: Run Collection
3. Watch automated booking flow!

### 3. Pre-request Scripts
Add global setup:
```javascript
// Auto-refresh token if expired
if (pm.environment.get('tokenExpiry') < Date.now()) {
    // Refresh token logic
}
```

### 4. Documentation
Each request has description field:
- What it does
- Required fields
- Example use case

---

## 🎬 Example Workflows

### Complete Flight Booking:
```
Login → Search Flights → Confirm Price → Get Seats → Book → View Order
```

### Customer Journey:
```
Register → Browse Destinations → Search Tours → Book Tour → Submit Review
```

### Admin Operations:
```
Login (Admin) → View All Bookings → Check Statistics → Generate Report
```

---

## 📞 Support

### Collection Issues:
- Check `baseUrl` is set to `http://localhost:5001`
- Verify server is running: `npm run dev`
- Check token is saved after login
- Look at Postman Console for errors

### API Issues:
- Check authentication (most endpoints need token)
- Verify request format (JSON body)
- Check server logs for errors
- See API documentation files

---

## 🎊 Benefits of Production Collection

✅ **Clean & Focused** - Only customer-facing APIs
✅ **Auto-Saves Data** - Tokens, IDs automatically stored
✅ **Easy Navigation** - Emoji icons and clear names
✅ **Production-Ready** - Real-world request examples
✅ **Well-Documented** - Each request has description
✅ **Workflow Support** - Numbered steps guide you

---

## 📚 Related Documentation

- `AMADEUS_TICKETING_PLATFORM.md` - Complete flight booking guide
- `API_TESTING_GUIDE.md` - How to test all APIs
- `QUICK_START.md` - Quick setup guide

---

**Use the Production APIs collection for daily development!** 🚀

It's cleaner, faster, and focused on what matters - booking travel! ✈️🏨🏖️
