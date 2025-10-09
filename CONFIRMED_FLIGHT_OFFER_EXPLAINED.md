# 🎯 What is `confirmedFlightOffer`?

## 📖 Simple Explanation

**`confirmedFlightOffer`** is a **price-validated** flight offer that you're ready to book.

Think of it like this:

```
Step 1: Search Results     →  You get 50 flight offers
Step 2: User Selects One   →  selectedFlightOffer
Step 3: Confirm Price      →  confirmedFlightOffer ✅
Step 4: Book Flight        →  Use confirmedFlightOffer
```

---

## ⚠️ Why Do You Need It?

### **The Problem: Prices Change!**

```javascript
// 10:00 AM - User searches
Search Results: "AED 3,755"

// 10:05 AM - User fills form
Still showing: "AED 3,755"

// 10:10 AM - User clicks "Book"
Actual Price: "AED 4,100" ❌ Price increased!

// Booking fails or customer charged more! 😡
```

### **The Solution: Confirm Price First!**

```javascript
// 1. Search (10:00 AM)
GET /api/flights/search
Response: Array of flight offers

// 2. User selects (10:05 AM)
selectedOffer = offers[0]  // AED 3,755

// 3. Confirm price (10:09 AM) ← THIS STEP!
POST /api/flights/confirm-price
Body: { flightOffer: selectedOffer }
Response: confirmedFlightOffer

// If price changed:
{
  "price": { "grandTotal": 4100 },  // New price
  "priceChanged": true,
  "oldPrice": 3755,
  "newPrice": 4100
}

// 4. Book with confirmed price (10:10 AM)
POST /api/flights/create-order
Body: { flightOffer: confirmedFlightOffer }  // ✅ Guaranteed price!
```

---

## 🔄 Complete Flow Diagram

```
┌──────────────────────────────────────────────────┐
│ STEP 1: Search Flights                           │
│ GET /api/flights/search?origin=JFK&dest=DXB      │
└──────────────┬───────────────────────────────────┘
               │
               ▼
        Returns 50 offers
        Each has: id, price, itinerary
               │
               ▼
┌──────────────────────────────────────────────────┐
│ STEP 2: User Selects Flight                      │
│ selectedOffer = offers[0]                        │
│ Price shown: AED 3,755                           │
└──────────────┬───────────────────────────────────┘
               │
               ▼
        User fills passenger details
        (Name, passport, etc.)
               │
               ▼
┌──────────────────────────────────────────────────┐
│ STEP 3: Confirm Price (CRITICAL!)                │
│ POST /api/flights/confirm-price                  │
│ Body: { flightOffer: selectedOffer.raw }         │
└──────────────┬───────────────────────────────────┘
               │
               ▼
        Amadeus validates:
        - Is offer still available?
        - Is price still the same?
        - Can we book this?
               │
               ▼
        Returns: confirmedFlightOffer
        {
          id: "new-validated-id",
          price: { grandTotal: 3755 },  // Confirmed!
          priceChanged: false,           // ✅ Same price
          ...all flight details
        }
               │
               ▼
┌──────────────────────────────────────────────────┐
│ STEP 4: Create Order (Book!)                     │
│ POST /api/flights/create-order                   │
│ Body: {                                          │
│   flightOffer: confirmedFlightOffer.raw,         │
│   travelers: [...],                              │
│   contacts: {...}                                │
│ }                                                │
└──────────────┬───────────────────────────────────┘
               │
               ▼
        ✅ Booking Success!
        PNR: ABC123
        Order: ORD-FLT-1234
```

---

## 🎯 In Postman Collection

### **How It Works:**

#### 1. **Search Flights** (Manual Step)
```
GET /api/flights/search?origin=JFK&destination=DXB...

Response:
{
  "data": [
    { "id": "1", "price": {"grandTotal": 3755}, ... },
    { "id": "2", "price": {"grandTotal": 4200}, ... },
    ...
  ]
}
```

**You manually:** Copy one offer from the results

---

#### 2. **Confirm Price** (Auto-Save!)
```
POST /api/flights/confirm-price

Body:
{
  "flightOffer": {
    // Paste the offer you copied
  }
}

Response:
{
  "data": {
    "id": "validated-123",
    "price": { "grandTotal": 3755 },
    // Complete validated offer
  }
}
```

**✨ Test Script Runs:**
```javascript
// Auto-saves to environment variable
pm.environment.set('confirmedFlightOffer', JSON.stringify(jsonData.data));
```

**Now `{{confirmedFlightOffer}}` contains the validated offer!**

---

#### 3. **Book Flight** (Auto-Uses Confirmed Offer!)
```
POST /api/flights/create-order

Body:
{
  "flightOffer": {{confirmedFlightOffer}},  // ← Auto-filled!
  "travelers": [...],
  "contacts": {...}
}
```

**The Postman variable `{{confirmedFlightOffer}}` gets replaced automatically!**

---

## 🤔 Why Not Book Directly from Search?

### ❌ **Bad Practice:**
```javascript
// Search at 10:00 AM
const offers = await searchFlights();
const selected = offers[0];  // AED 3,755

// User takes 10 minutes filling form...

// Book at 10:10 AM
await bookFlight(selected);  // ❌ DANGER!
// Price might have changed to AED 4,100!
```

### ✅ **Good Practice:**
```javascript
// Search at 10:00 AM
const offers = await searchFlights();
const selected = offers[0];  // AED 3,755

// User fills form...

// Confirm price at 10:09 AM (just before booking)
const confirmed = await confirmPrice(selected);

// Check if price changed
if (confirmed.priceChanged) {
  alert(`Price changed from ${selected.price.grandTotal} to ${confirmed.price.grandTotal}`);
  // Ask user to confirm new price
}

// Book at 10:10 AM with confirmed price
await bookFlight(confirmed);  // ✅ SAFE!
```

---

## 🎨 Frontend Implementation

### React Example:

```javascript
const FlightBooking = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [confirmedOffer, setConfirmedOffer] = useState(null);
  const [priceChanged, setPriceChanged] = useState(false);

  // Step 1: User selects from search results
  const handleSelectFlight = (offer) => {
    setSelectedOffer(offer);
    // Show passenger form
  };

  // Step 2: Confirm price before booking
  const handleConfirmAndBook = async (travelers) => {
    try {
      // Confirm current price
      const response = await fetch('/api/flights/confirm-price', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ flightOffer: selectedOffer.raw })
      });
      
      const { data } = await response.json();
      setConfirmedOffer(data);

      // Check if price changed
      if (data.price.grandTotal !== selectedOffer.price.grandTotal) {
        setPriceChanged(true);
        
        // Show modal to user
        const userConfirms = window.confirm(
          `Price changed from ${selectedOffer.price.grandTotal} to ${data.price.grandTotal}. Continue?`
        );
        
        if (!userConfirms) return;
      }

      // Book with confirmed price
      const bookingResponse = await fetch('/api/flights/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flightOffer: data.raw,  // ← Use confirmed offer!
          travelers,
          contacts: { ... }
        })
      });

      const booking = await bookingResponse.json();
      
      // Success!
      console.log('Booked! PNR:', booking.data.order.pnr);
      
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <>
      {selectedOffer && (
        <PassengerForm 
          flight={selectedOffer}
          onSubmit={handleConfirmAndBook}
        />
      )}
    </>
  );
};
```

---

## 💡 Key Differences

| Variable | When | Purpose |
|----------|------|---------|
| **flightOffer** (from search) | After search | Raw search result |
| **selectedFlightOffer** | User clicks "Select" | User's choice |
| **confirmedFlightOffer** | Before booking | ✅ Price validated |
| **bookedFlightOrder** | After booking | Has PNR, ticket info |

---

## 🎯 In Your Postman Collection

The `{{confirmedFlightOffer}}` variable:

**Populated by:** "2️⃣ Confirm Price" request
**Used by:** "4️⃣ Book Flight" request

**Test Script in "Confirm Price" request:**
```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set('confirmedFlightOffer', JSON.stringify(jsonData.data));
  console.log('✅ Price confirmed. Ready to book.');
}
```

**Used in "Book Flight" request body:**
```json
{
  "flightOffer": {{confirmedFlightOffer}},  // ← Auto-inserted!
  "travelers": [...],
  "contacts": {...}
}
```

---

## 🔍 Example Values

### After Search (selectedOffer):
```json
{
  "id": "1",
  "price": { "grandTotal": 3755 },
  "lastChecked": "10:00 AM"
}
```

### After Confirm Price (confirmedFlightOffer):
```json
{
  "id": "validated-abc123",  // New ID
  "price": { "grandTotal": 3755 },  // Confirmed price
  "lastChecked": "10:09 AM",
  "validUntil": "10:19 AM",  // Valid for ~10 minutes
  "priceChanged": false
}
```

---

## ⚡ Quick Answer

**Q: What is `confirmedFlightOffer`?**

**A:** It's the **price-validated version** of a flight offer that you get from the "Confirm Price" API call. It guarantees the price is still correct before booking.

**Why needed?**
- Flight prices change every minute
- Prevents booking failures
- Protects customers from surprise charges
- Required by Amadeus best practices

**How to use?**
1. User selects flight from search → `selectedOffer`
2. Call `/confirm-price` with `selectedOffer` → Get `confirmedFlightOffer`
3. Book immediately with `confirmedFlightOffer` → Success!

---

## 🎊 Summary

```
Search Result        →  selectedFlightOffer
      ↓
Confirm Price API    →  confirmedFlightOffer ✅
      ↓
Book Flight API      →  Booking with PNR
```

**The `confirmedFlightOffer` is your "insurance policy" that the price is still valid!** 🛡️

In Postman, it's auto-saved as an environment variable so you can use it in the next request without copying/pasting! 🚀
