# 📮 Postman Flight Booking - Step by Step Guide

## ⚠️ **IMPORTANT: Offer Expiry**

Flight offers expire in **20-30 minutes**. You MUST complete the entire flow quickly, or search again!

---

## ✅ **Correct Booking Flow**

### **Step 1: Login First**
Before booking, you MUST be authenticated:

```
POST /api/auth/login
Body:
{
  "email": "osama.admin@yopmail.com",
  "password": "Osama123"
}
```

✅ Token will be automatically saved and used for all requests!

---

### **Step 2: Search Flights** 
Run: **"1️⃣ Search Flights"** in Postman

```
GET /api/flights/search?origin=DXB&destination=CAI&departureDate=2025-10-14&returnDate=2025-10-29&adults=1&provider=duffel
```

**What Happens:**
- ✅ Returns list of available flights
- ✅ First offer is **AUTO-SAVED** to `{{confirmedFlightOffer}}` variable
- ✅ Console shows: Offer saved, expiry time, price

**Console Output:**
```
✅ Found 50 flights
💾 First offer saved. Expires: 2025-10-12T19:24:44.094084Z
💰 Price: USD 270.71

⚠️  IMPORTANT: Offer expires in ~20-30 minutes!
📋 Next step: Run "2️⃣ Confirm Price" then "4️⃣ Book Flight"
```

---

### **Step 3: Confirm Price (Optional but Recommended)**
Run: **"2️⃣ Confirm Price"**

```
POST /api/flights/confirm-price
Body: {
  "flightOffer": {{confirmedFlightOffer}}
}
```

**What Happens:**
- ✅ Validates offer is still available
- ✅ Gets final confirmed price
- ✅ Updates `{{confirmedFlightOffer}}` with confirmed data

**Console Output:**
```
✅ Price confirmed!
💰 Final Price: USD 270.71
📋 Next: Run "4️⃣ Book Flight" immediately
```

---

### **Step 4: Book Flight**
Run: **"4️⃣ Book Flight"**

```
POST /api/flights/create-order
Body: {
  "flightOffer": {{confirmedFlightOffer}},
  "travelers": [...],
  "contacts": {...}
}
```

**IMPORTANT:** Update the traveler information before sending:

```json
{
  "flightOffer": {{confirmedFlightOffer}},
  "travelers": [
    {
      "id": "1",
      "firstName": "ALAA",
      "lastName": "SALEM",
      "dateOfBirth": "1990-01-01",
      "gender": "MALE",
      "email": "alaa@example.com",
      "phoneCountryCode": "971",
      "phoneNumber": "522200730",
      "documents": [
        {
          "documentType": "PASSPORT",
          "number": "A21856",
          "expiryDate": "2028-10-24",
          "issuanceCountry": "SY",
          "nationality": "SY",
          "holder": true
        }
      ]
    }
  ],
  "contacts": {
    "email": "alaa@example.com",
    "phone": "522200730"
  }
}
```

**What Happens:**
- ✅ Creates flight booking
- ✅ Saves booking to database
- ✅ Returns PNR and booking details
- ✅ Auto-saves PNR to `{{pnr}}` variable

**Success Response:**
```json
{
  "success": true,
  "message": "Flight booked successfully!",
  "data": {
    "booking": {...},
    "order": {
      "orderNumber": "ORD-FLT-1728757484123",
      "pnr": "ABC123",
      "status": "confirmed"
    }
  }
}
```

---

## 🚨 **Common Errors & Solutions**

### Error 1: "Field 'id' contains ID(s) of linked record(s) that were not found"

**Cause:** Offer has expired (past 20-30 min)

**Solution:** 
1. Go back to **Step 2** (Search Flights)
2. Run search again to get fresh offer
3. Immediately proceed to Step 4

---

### Error 2: "Flight offer has expired"

**Cause:** Our backend detected expired offer

**Solution:**
Same as Error 1 - search again!

---

### Error 3: "{{confirmedFlightOffer}} is not defined"

**Cause:** You skipped Step 2 (Search Flights)

**Solution:**
1. Run **"1️⃣ Search Flights"** first
2. Check console - should show "First offer saved"
3. Then run booking

---

### Error 4: "Unauthorized" or "401"

**Cause:** Not logged in or token expired

**Solution:**
1. Run **"Login"** request first
2. Check console shows "✅ Login Successful!"
3. Token is auto-saved and used for all requests

---

## ⏱️ **Time-Sensitive Workflow**

```
Search → Confirm → Book
  ↓        ↓         ↓
< 1 min  < 1 min  < 5 min
├─────────────────────┤
   Total: < 10 minutes
```

**Recommendation:** Complete entire flow within 10 minutes of searching.

---

## 📋 **Complete Example (Copy-Paste Ready)**

### 1. Login
```json
POST {{baseUrl}}/api/auth/login
{
  "email": "osama.admin@yopmail.com",
  "password": "Osama123"
}
```

### 2. Search Flights
```
GET {{baseUrl}}/api/flights/search?origin=DXB&destination=CAI&departureDate=2025-10-14&returnDate=2025-10-29&adults=1&provider=duffel
```
✅ Offer auto-saved!

### 3. Confirm Price (Optional)
```json
POST {{baseUrl}}/api/flights/confirm-price
{
  "flightOffer": {{confirmedFlightOffer}}
}
```

### 4. Book Flight
```json
POST {{baseUrl}}/api/flights/create-order
{
  "flightOffer": {{confirmedFlightOffer}},
  "travelers": [
    {
      "id": "1",
      "firstName": "ALAA",
      "lastName": "SALEM",
      "dateOfBirth": "1997-01-09",
      "gender": "MALE",
      "email": "alaa@example.com",
      "phoneCountryCode": "971",
      "phoneNumber": "522200730",
      "documents": [
        {
          "documentType": "PASSPORT",
          "number": "A21856",
          "expiryDate": "2028-10-24",
          "issuanceCountry": "SY",
          "nationality": "SY",
          "holder": true
        }
      ]
    }
  ],
  "contacts": {
    "email": "alaa@example.com",
    "phone": "522200730"
  }
}
```

---

## 🔍 **Debugging Tips**

### Check if Offer is Saved:
1. Go to Postman → Variables tab
2. Look for `confirmedFlightOffer`
3. Should contain full flight offer JSON

### Check Expiry Time:
```javascript
// In Postman Console
let offer = JSON.parse(pm.collectionVariables.get('confirmedFlightOffer'));
console.log('Expires:', offer.expiresAt);
console.log('Now:', new Date().toISOString());
```

### View Saved Token:
1. Postman → Variables tab
2. Look for `authToken`
3. Should start with "eyJ..."

---

## 🎯 **Quick Checklist**

Before booking, verify:
- [ ] Logged in (token saved)
- [ ] Searched flights (offer saved)
- [ ] Offer not expired (< 30 min old)
- [ ] Updated traveler details
- [ ] Phone number format correct (+971...)
- [ ] Passport expiry > 6 months from travel date

---

## 💡 **Pro Tips**

1. **Use Collection Runner:**
   - Click collection → Run
   - Select all 4 requests in order
   - Run automatically!

2. **Save Different Scenarios:**
   - Duplicate the booking request
   - Name them: "Book 1 Adult", "Book 2 Adults + Child"
   - Pre-fill different traveler data

3. **Test Error Handling:**
   - Wait 30 minutes after search
   - Try booking with expired offer
   - Verify backend returns proper error

4. **Watch Console:**
   - Always open Postman Console (bottom left)
   - See all automatic saves
   - Debug issues easier

---

## 🆘 **Still Having Issues?**

If you're still getting errors:

1. **Clear Variables:**
   ```
   Postman → Variables → Delete all
   ```

2. **Fresh Start:**
   - Close Postman
   - Reopen
   - Run Login → Search → Book

3. **Check Server:**
   ```bash
   # Is server running?
   curl http://localhost:5001/health
   ```

4. **Check Database:**
   ```bash
   # Are tables created?
   mysql -u root -p -e "USE trasealla_db; SHOW TABLES;"
   ```

5. **Check Logs:**
   - Look at server terminal
   - See actual error details

---

## 📞 **Support**

- API Docs: `http://localhost:5001/api-docs`
- Offer Expiry Guide: `/FLIGHT_OFFER_EXPIRY_GUIDE.md`
- Frontend Guide: `/FRONTEND_FLIGHT_INTEGRATION_GUIDE.md`

---

**Happy Testing! ✈️🚀**

