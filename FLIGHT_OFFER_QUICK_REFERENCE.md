# ✈️ Amadeus Flight Offer - Quick Reference Cheat Sheet

## 🎯 Essential Fields (Display These!)

| Field | Path | Display As | Example |
|-------|------|------------|---------|
| **Price** | `price.grandTotal` | "AED 3,755" | ⭐ Main price |
| **Currency** | `price.currency` | Symbol (د.إ) | AED, USD, EUR |
| **Origin** | `segments[0].departure.iataCode` | "JFK" | 3-letter code |
| **Destination** | `segments[0].arrival.iataCode` | "DXB" | 3-letter code |
| **Departure Time** | `segments[0].departure.at` | "11:00 PM" | Local time |
| **Arrival Time** | `segments[0].arrival.at` | "8:25 PM +1" | Local time |
| **Duration** | `itineraries[0].duration` | "12h 25m" | Parse PT12H25M |
| **Airline** | `segments[0].carrierCode` | "Emirates" | Use lookup |
| **Flight Number** | `segments[0].number` | "EK 202" | Carrier + number |
| **Cabin Class** | `fareDetailsBySegment[0].cabin` | "Economy" | ECONOMY/BUSINESS |
| **Stops** | `segments[0].numberOfStops` | "Direct" or "1 stop" | 0, 1, 2+ |
| **Baggage** | `includedCheckedBags.quantity` | "2 bags" | Major feature! |

---

## ⚠️ Critical Fields (For Booking Logic)

| Field | What It Means | Action Required |
|-------|---------------|-----------------|
| `numberOfBookableSeats` | Seats available | If < 5, show "Only X left!" |
| `lastTicketingDate` | Ticket deadline | Countdown timer |
| `instantTicketingRequired` | Must ticket now? | Auto-payment needed |
| `id` | Offer ID | Use for repricing (expires in 10 min) |

---

## 💰 Price Breakdown

```
price: {
  base: 2970        ← Airline's base fare
  total: 3755       ← Base + taxes
  grandTotal: 3755  ← 🌟 SHOW THIS (final price)
  currency: "AED"   ← Currency code
  fees: [...]       ← Usually $0
}
```

**Display:**
```
AED 3,755  ← Big, bold
per person
```

---

## 🧳 Baggage Display

```javascript
const fareDetails = flightOffer.travelerPricings[0].fareDetailsBySegment[0];

// Checked bags
fareDetails.includedCheckedBags.quantity  // e.g., 2

// Display:
"✓ 2 checked bags included (23 KG each)"

// Cabin bags
fareDetails.includedCabinBags.quantity  // e.g., 1

// Display:
"✓ 1 carry-on bag"
```

---

## 🎁 Amenities Cheat Sheet

```javascript
const amenities = flightOffer.travelerPricings[0]
  .fareDetailsBySegment[0].amenities;

// Check if refundable (free)
const isRefundable = amenities.some(a => 
  a.description.includes('REFUNDABLE') && !a.isChargeable
);

// Check if changeable (free)
const isChangeable = amenities.some(a => 
  a.description.includes('CHANGEABLE') && !a.isChargeable
);

// Get meals
const hasMeals = amenities.some(a => 
  a.amenityType === 'MEAL' && !a.isChargeable
);
```

**Display:**
```
✓ Refundable
✓ Changes allowed
✓ Meals & drinks included
⚠️ Seat selection (+AED 150)
```

---

## ⏱️ Duration Parsing

```javascript
// Input: "PT12H25M"
// Output: "12h 25m"

function parseDuration(isoDuration) {
  const hours = isoDuration.match(/(\d+)H/)?.[1] || '0';
  const mins = isoDuration.match(/(\d+)M/)?.[1] || '0';
  return `${hours}h ${mins}m`;
}
```

---

## 🛫 Route Display

```javascript
const segment = flightOffer.itineraries[0].segments[0];

// Departure
const depTime = new Date(segment.departure.at);
const depAirport = segment.departure.iataCode;
const depTerminal = segment.departure.terminal;

// Arrival  
const arrTime = new Date(segment.arrival.at);
const arrAirport = segment.arrival.iataCode;
const arrTerminal = segment.arrival.terminal;

// Check if next day
const isNextDay = depTime.getDate() !== arrTime.getDate();
```

**Display:**
```
JFK (T4) → DXB (T3)
11:00 PM   8:25 PM +1 day
```

---

## 🏷️ Branded Fare Labels

```javascript
const fareLabel = flightOffer.travelerPricings[0]
  .fareDetailsBySegment[0].brandedFareLabel;

// Examples from real Amadeus data:
"ECO BASIC"    → Cheapest, most restrictions
"ECO FLEX"     → Your example - flexible economy
"ECO PREMIUM"  → Extra legroom
"BIZ SAVER"    → Business class discount
"BIZ FLEX"     → Full business flexibility
```

**Display:** Show as badge near price

---

## 📱 Mobile UI Layout

```
┌─────────────────────────────────────┐
│ Emirates EK 202        AED 3,755    │
│ Economy Flex           per person   │
├─────────────────────────────────────┤
│ JFK T4        12h 25m      DXB T3   │
│ 11:00 PM   ────────────   8:25 PM   │
│ Dec 15                    Dec 16    │
├─────────────────────────────────────┤
│ ✓ Direct flight                     │
│ ✓ 2 checked bags (46 KG)            │
│ ✓ Meals & drinks                    │
│ ✓ Refundable (+AED 300)             │
├─────────────────────────────────────┤
│ ⚠️ Only 9 seats left!                │
│                                     │
│         [SELECT FLIGHT]             │
└─────────────────────────────────────┘
```

---

## 🎨 CSS Class Mapping

```javascript
{
  numberOfStops: 0     → className="direct-flight" (green badge)
  numberOfStops: 1     → className="one-stop" (yellow badge)
  numberOfStops: 2+    → className="multi-stop" (red badge)
  
  cabin: "ECONOMY"     → className="economy" (blue)
  cabin: "BUSINESS"    → className="business" (gold)
  cabin: "FIRST"       → className="first" (platinum)
  
  numberOfBookableSeats < 5  → className="low-availability" (urgent)
  numberOfBookableSeats >= 5 → className="available"
}
```

---

## 🔄 Complete Data Flow

```javascript
// 1. Search returns offers
const offers = await searchFlights(params);

// 2. User selects an offer
const selected = offers[0];

// 3. Display details (use all fields above)
<FlightCard offer={selected} />

// 4. User clicks "Book"
// → Send ENTIRE selected.raw object to confirm-price API
await confirmPrice({ flightOffer: selected.raw });

// 5. Price confirmed, proceed to booking
// → Send confirmed offer + traveler data to create-order API
await createOrder({
  flightOffer: confirmed.raw,
  travelers: [...],
  contacts: {...}
});
```

---

## 📋 Fields by Use Case

### **Search Results Grid:**
```javascript
{
  price.grandTotal,
  carrierCode + number,
  departure.at → arrival.at,
  duration,
  numberOfStops,
  brandedFareLabel (if available)
}
```

### **Flight Details Modal:**
```javascript
{
  All search fields +
  terminal numbers,
  aircraft type,
  includedCheckedBags,
  amenities list,
  lastTicketingDate
}
```

### **Booking Confirmation:**
```javascript
{
  All flight details +
  pnr (after booking),
  ticketNumbers (after ticketing),
  fareRules,
  cancellation policy
}
```

---

## 💡 Quick Tips

1. **Always show grandTotal** - That's the final price
2. **Parse PT12H25M** - Don't show raw ISO duration
3. **Check numberOfStops** - Major filter criterion
4. **Display baggage clearly** - Avoids complaints
5. **Show terminal numbers** - Helps customer planning
6. **Indicate next-day arrival** - Use +1 or +2 badge
7. **Highlight refundable** - Premium feature
8. **Show urgency** - "Only 5 seats left!"
9. **Store raw object** - Need it for booking
10. **Reprice before booking** - Prices change!

---

## 🎊 You're Ready!

With this reference, you can:
- ✅ Display beautiful flight cards
- ✅ Show all important info
- ✅ Create detailed views
- ✅ Handle booking flow
- ✅ Build professional travel UI

**Happy coding!** 🚀✈️
