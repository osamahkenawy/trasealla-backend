# ⏰ Flight Offer Expiry - Important Information

## 🚨 The Problem

When trying to book a flight, you may encounter this error:

```json
{
    "success": false,
    "message": "Field 'id' contains ID(s) of linked record(s) that were not found in your account"
}
```

Or this error (after our fix):

```json
{
    "success": false,
    "message": "Flight offer has expired",
    "expired": true,
    "expiresAt": "2025-10-12T19:19:37.859820Z",
    "hint": "Please search for flights again to get a fresh offer"
}
```

---

## 🎯 Why This Happens

### Flight Offer Lifecycle

```
Search → Offer Created → Offer Expires → Must Search Again
         ↓ (20-30 min)    ↓
         Valid            Invalid
```

### Expiry Times:

**Duffel:**
- Offers expire in **20-30 minutes** after search
- Check the `expires_at` field in the offer

**Amadeus:**
- Offers typically valid for **24 hours**
- Check the `lastTicketingDate` field

---

## ✅ Solutions

### Solution 1: Search Again (Quick Fix)

When the offer expires, simply search for flights again:

```javascript
// Frontend: If booking fails with expiry error
if (error.expired) {
  // Re-run the search
  await searchFlights(originalSearchParams);
  // Let user select flight again
}
```

### Solution 2: Check Expiry Before Booking (Prevention)

```javascript
// Frontend: Before proceeding to payment
const checkOfferValidity = (offer) => {
  if (offer.expiresAt) {
    const expiryDate = new Date(offer.expiresAt);
    const now = new Date();
    const minutesRemaining = (expiryDate - now) / 1000 / 60;
    
    if (minutesRemaining < 0) {
      return { valid: false, message: 'Offer has expired' };
    }
    
    if (minutesRemaining < 5) {
      return { 
        valid: true, 
        warning: `Offer expires in ${Math.floor(minutesRemaining)} minutes. Book quickly!` 
      };
    }
    
    return { valid: true };
  }
  return { valid: true };
};

// Usage
const validity = checkOfferValidity(selectedFlight);
if (!validity.valid) {
  alert('This offer has expired. Searching for fresh prices...');
  refreshSearch();
}
```

### Solution 3: Show Expiry Timer (Best UX)

```javascript
// React Component Example
const OfferExpiryTimer = ({ expiresAt }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry - now;
      
      if (diff <= 0) {
        setTimeRemaining('EXPIRED');
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  return (
    <div className={timeRemaining === 'EXPIRED' ? 'text-red-500' : 'text-orange-500'}>
      ⏰ {timeRemaining === 'EXPIRED' ? 'Offer Expired' : `Expires in ${timeRemaining}`}
    </div>
  );
};
```

---

## 🎨 Frontend Implementation

### Step 1: Add Expiry Display

```jsx
<FlightCard offer={flight}>
  <div className="flex justify-between">
    <div className="price">
      ${flight.price.total}
    </div>
    {flight.expiresAt && (
      <OfferExpiryTimer expiresAt={flight.expiresAt} />
    )}
  </div>
</FlightCard>
```

### Step 2: Validate Before Booking

```javascript
const proceedToBooking = async () => {
  // Check if offer is still valid
  const response = await fetch('/api/flights/confirm-price', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ flightOffer: selectedFlight })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Proceed with confirmed offer
    setConfirmedOffer(data.data.flightOffers[0]);
    navigateToTravelerDetails();
  } else if (data.expired) {
    // Offer expired, search again
    alert('This offer has expired. Searching for current prices...');
    await refreshFlightSearch();
  }
};
```

### Step 3: Handle Expired Offers During Booking

```javascript
const createBooking = async (bookingData) => {
  try {
    const response = await fetch('/api/flights/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.expired) {
        // Offer expired during booking process
        showError('Offer expired. Searching for current prices...');
        await refreshFlightSearch();
        return;
      }
      
      throw new Error(data.message);
    }
    
    // Success
    navigateToConfirmation(data.data);
    
  } catch (error) {
    showError(error.message);
  }
};
```

---

## 🔄 Recommended User Flow

```
1. Search Flights
   ↓
2. Show Results with Expiry Timer
   ↓
3. User Selects Flight
   ↓
4. Check Validity (Optional)
   ↓
5. Show Traveler Form
   ↓
6. Confirm Price (Recommended for Duffel)
   ↓
7. Show Payment
   ↓
8. Create Booking
   ↓
   If expired → Go back to step 1
   If success → Show Confirmation
```

---

## ⚡ Best Practices

### 1. **Always Confirm Price Before Payment**

```javascript
// For Duffel flights, always confirm price
if (flight.provider === 'Duffel') {
  const confirmed = await confirmFlightPrice(flight);
  // Use confirmed offer for booking
  await createBooking(confirmed);
}
```

### 2. **Show Warning When Expiry is Near**

```javascript
// Warn when < 5 minutes remaining
if (minutesRemaining < 5) {
  showWarning(`⚠️ This offer expires in ${minutesRemaining} minutes!`);
}
```

### 3. **Auto-Refresh on Expiry**

```javascript
// Automatically refresh when offer expires
useEffect(() => {
  if (offerExpired && isOnFlightResultsPage) {
    searchFlights(lastSearchParams);
  }
}, [offerExpired]);
```

### 4. **Save Search Parameters**

```javascript
// Save search params to easily re-search
const searchParams = {
  origin: 'DXB',
  destination: 'CAI',
  departureDate: '2025-10-14',
  returnDate: '2025-10-29',
  adults: 1
};

// Save to state or localStorage
localStorage.setItem('lastFlightSearch', JSON.stringify(searchParams));

// When offer expires, retrieve and search again
const lastSearch = JSON.parse(localStorage.getItem('lastFlightSearch'));
await searchFlights(lastSearch);
```

---

## 📊 API Response Examples

### Success (Valid Offer):

```json
{
  "success": true,
  "data": {
    "id": "off_0000Az8qk5QO5ReUpMZ2yC",
    "expiresAt": "2025-10-12T19:19:37.859820Z",
    "price": {
      "total": 273.3,
      "currency": "USD"
    }
  }
}
```

### Error (Expired Offer):

```json
{
  "success": false,
  "message": "Flight offer has expired",
  "expired": true,
  "expiresAt": "2025-10-12T19:19:37.859820Z",
  "hint": "Please search for flights again to get a fresh offer"
}
```

---

## 🎯 Quick Checklist

Before going to production:

- [ ] Display offer expiry time to users
- [ ] Validate offer before proceeding to payment
- [ ] Handle expiry errors gracefully
- [ ] Allow users to easily re-search
- [ ] Save search parameters for quick re-search
- [ ] Show warning when expiry is near (< 5 min)
- [ ] Auto-refresh expired offers
- [ ] Test booking flow with different expiry times
- [ ] Add loading states during re-search
- [ ] Show user-friendly error messages

---

## 🔧 Backend Validation (Already Implemented)

The backend now automatically checks offer expiry:

```javascript
// In createFlightOrder controller
if (isDuffelOffer && flightOffer.expires_at) {
  const expiryDate = new Date(flightOffer.expires_at);
  const now = new Date();
  
  if (expiryDate < now) {
    return res.status(400).json({
      success: false,
      message: 'Flight offer has expired',
      expired: true,
      expiresAt: flightOffer.expires_at,
      hint: 'Please search for flights again to get a fresh offer'
    });
  }
}
```

---

## 💡 Tips

1. **For Testing:** Duffel test offers expire in 20-30 minutes. Test your expiry handling!

2. **Production Tip:** In production, most users complete booking within 10 minutes, so 20-30 minute expiry is usually sufficient.

3. **User Communication:** Always inform users that prices and availability may change.

4. **Error Messages:** Use friendly language:
   - ❌ "Field 'id' contains ID(s) of linked record(s) that were not found"
   - ✅ "This offer has expired. Let's find you current prices!"

---

## 🆘 Troubleshooting

### Issue: Offers expiring too quickly

**Solution:** 
- Add countdown timer
- Speed up booking process
- Reduce form fields
- Auto-save form progress

### Issue: Users don't notice expiry

**Solution:**
- Prominent expiry display
- Warning notifications
- Auto-refresh on expiry

### Issue: Price changes after re-search

**Solution:**
- Inform users prices may change
- Show comparison if possible
- Allow users to decide whether to proceed

---

## 📚 Related Endpoints

- `GET /api/flights/search` - Search flights (creates offers)
- `POST /api/flights/confirm-price` - Confirm price (refreshes offer)
- `POST /api/flights/create-order` - Book flight (checks expiry)

---

**Remember:** Flight offers are temporary! Always check expiry and handle it gracefully in your UI. 🚀✈️

