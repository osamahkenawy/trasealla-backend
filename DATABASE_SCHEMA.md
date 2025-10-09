# 🗄️ Database Schema - Where Your Data is Stored

## 📊 **Complete Database Tables (23 Tables)**

When a customer books a flight, data is stored across **4 main tables**:

---

## ✈️ **Flight Booking Data Flow:**

### **Table 1: `bookings`** (Universal booking record)

**Stores:**
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY,
  booking_number VARCHAR(50) UNIQUE,        -- BKG-FLT-1760036845750
  user_id INT,                              -- Customer ID
  booking_type ENUM('flight','hotel',...),  -- 'flight'
  reference_id INT,                         -- Links to flight_orders.id
  booking_status ENUM('pending','confirmed','cancelled'),
  payment_status ENUM('pending','paid','refunded'),
  travel_date DATETIME,                     -- 2025-12-15
  number_of_people INT,                     -- 2
  total_amount DECIMAL(10,2),               -- 311.85
  currency VARCHAR(3),                      -- USD, AED, EGP
  contact_name VARCHAR(100),                -- "Samah Salem"
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  travelers JSON,                           -- Full traveler details
  confirmed_at DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

**Example Data:**
```json
{
  "id": 1,
  "booking_number": "BKG-FLT-1760036845750",
  "user_id": 5,
  "booking_type": "flight",
  "reference_id": 1,  // Points to flight_orders.id
  "booking_status": "confirmed",
  "payment_status": "paid",
  "travel_date": "2025-12-15T10:50:00",
  "number_of_people": 2,
  "total_amount": 311.85,
  "currency": "USD",
  "contact_name": "Samah Salem",
  "contact_email": "samah@example.com",
  "contact_phone": "+971522200730",
  "travelers": [
    {
      "firstName": "Samah",
      "lastName": "Salem",
      "passportNumber": "A1234567"
    }
  ]
}
```

---

### **Table 2: `flight_orders`** (Detailed flight information)

**Stores:**
```sql
CREATE TABLE flight_orders (
  id INT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,          -- ORD-FLT-1760036845750
  user_id INT,
  booking_id INT,                           -- Links to bookings.id
  amadeus_order_id VARCHAR(255),            -- Duffel/Amadeus order ID
  pnr VARCHAR(50),                          -- 9RHWMZ, ABCD123
  gds_record_locator VARCHAR(50),           -- Same as PNR usually
  status ENUM('pending','confirmed','cancelled'),
  ticketing_status ENUM('not_issued','issued','voided'),
  payment_status ENUM('pending','paid','refunded'),
  
  -- Flight Details (JSON)
  flight_offer_data JSON,                   -- Complete flight offer
  itineraries JSON,                         -- Flight segments
  travelers JSON,                           -- Passenger details
  
  -- Pricing
  total_amount DECIMAL(10,2),               -- 311.85
  base_amount DECIMAL(10,2),                -- 265.22
  tax_amount DECIMAL(10,2),                 -- 46.63
  currency VARCHAR(3),                      -- USD
  amount_paid DECIMAL(10,2),                -- 311.85
  
  -- Airlines
  validating_airline VARCHAR(10),           -- ZZ, EK, etc.
  operating_airlines JSON,                  -- ["ZZ", "EK"]
  
  -- Tickets
  tickets JSON,                             -- E-ticket info
  e_ticket_numbers JSON,                    -- ["1234567890123"]
  ticketed_at DATETIME,
  
  -- Metadata
  number_of_travelers INT,                  -- 2
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  booking_channel ENUM('web','mobile','agent'),
  agent_id INT,
  
  created_at DATETIME,
  updated_at DATETIME
);
```

**Example Data:**
```json
{
  "id": 1,
  "order_number": "ORD-FLT-1760036845750",
  "booking_id": 1,
  "amadeus_order_id": "off_0000Az2eeLT2pQdqsUneLq",
  "pnr": "ABCD123",
  "status": "confirmed",
  "ticketing_status": "issued",
  "payment_status": "paid",
  "total_amount": 311.85,
  "currency": "USD",
  "validating_airline": "ZZ",
  "flight_offer_data": {
    "id": "off_...",
    "slices": [...],
    "passengers": [...]
  },
  "travelers": [
    {
      "firstName": "SAMAH",
      "lastName": "SALEM",
      "passportNumber": "A1234567"
    }
  ],
  "ticketed_at": "2025-10-09T07:53:20.000Z"
}
```

---

### **Table 3: `payments`** (Payment transactions)

**Stores:**
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY,
  transaction_id VARCHAR(100) UNIQUE,       -- TXN-1760036845826
  user_id INT,
  booking_id INT,                           -- Links to bookings.id
  amount DECIMAL(10,2),                     -- 311.85
  currency VARCHAR(3),                      -- USD
  payment_method VARCHAR(50),               -- card, wallet, cash
  payment_gateway VARCHAR(50),              -- paytabs, paymob, stripe
  status ENUM('pending','completed','failed','refunded'),
  payment_intent_id VARCHAR(255),           -- PayTabs/Stripe intent ID
  gateway_response JSON,                    -- Full gateway response
  paid_at DATETIME,
  refunded_amount DECIMAL(10,2),
  refunded_at DATETIME,
  metadata JSON,                            -- Additional info
  created_at DATETIME,
  updated_at DATETIME
);
```

**Example Data:**
```json
{
  "id": 1,
  "transaction_id": "TXN-1760036845826",
  "user_id": 5,
  "booking_id": 1,
  "amount": 311.85,
  "currency": "USD",
  "payment_method": "card",
  "payment_gateway": "manual",
  "status": "completed",
  "paid_at": "2025-10-09T07:55:00.000Z",
  "metadata": {
    "bookingNumber": "BKG-FLT-1760036845750",
    "quickPay": true
  }
}
```

---

### **Table 4: `audit_logs`** (Activity tracking)

**Stores:**
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY,
  user_id INT,
  action VARCHAR(50),                       -- CREATE, UPDATE, VIEW
  entity VARCHAR(50),                       -- flight_order, payment
  entity_id INT,
  changes JSON,                             -- Old vs new values
  metadata JSON,                            -- IP, user agent, details
  status ENUM('success','failed'),
  created_at DATETIME
);
```

**Example Data:**
```json
{
  "id": 1,
  "user_id": 5,
  "action": "CREATE",
  "entity": "flight_order",
  "entity_id": 1,
  "metadata": {
    "bookingNumber": "BKG-FLT-1760036845750",
    "pnr": "ABCD123",
    "amount": 311.85,
    "provider": "Duffel",
    "ip": "::1"
  },
  "status": "success",
  "created_at": "2025-10-09T07:53:20.000Z"
}
```

---

## 📊 **Complete Database Schema:**

### **User Management (5 tables):**
1. **users** - Customer/admin/agent accounts
2. **roles** - Permission system
3. **branches** - Office locations
4. **agencies** - Company settings
5. **currencies** - Exchange rates

### **Booking System (4 tables):**
6. **bookings** - Universal booking record
7. **flight_orders** - Detailed flight bookings
8. **payments** - Payment transactions
9. **audit_logs** - Activity tracking

### **Content & Services (8 tables):**
10. **destinations** - Travel destinations
11. **tours** - Tour packages
12. **activities** - Activities & experiences
13. **hotels** - Hotel inventory
14. **flights** - Flight inventory (legacy)
15. **visa_applications** - Visa services
16. **reviews** - Customer reviews
17. **blogs** - Content management

### **CRM (3 tables):**
18. **contacts** - Contact form submissions
19. **newsletters** - Email subscriptions
20. **leads** - Sales leads
21. **lead_activities** - Lead tracking

### **CMS (3 tables):**
22. **pages** - Website pages
23. **media_library** - File uploads
24. **translations** - i18n translations

---

## 🔍 **Query Examples:**

### **View Your Bookings:**

```sql
-- All flight bookings
SELECT 
  b.booking_number,
  b.booking_status,
  b.payment_status,
  f.pnr,
  f.total_amount,
  f.currency,
  u.email as customer_email
FROM bookings b
JOIN flight_orders f ON b.id = f.booking_id
JOIN users u ON b.user_id = u.id
WHERE b.booking_type = 'flight'
ORDER BY b.created_at DESC;
```

### **Today's Revenue:**

```sql
SELECT 
  COUNT(*) as bookings_today,
  SUM(total_amount) as revenue,
  currency
FROM bookings
WHERE DATE(created_at) = CURDATE()
  AND payment_status = 'paid'
GROUP BY currency;
```

### **Bookings by Provider:**

```sql
SELECT 
  JSON_EXTRACT(f.flight_offer_data, '$.provider') as provider,
  COUNT(*) as bookings,
  SUM(f.total_amount) as revenue
FROM flight_orders f
GROUP BY provider;
```

---

## 📈 **Data Relationships:**

```
users (customer)
  └── bookings (booking record)
      ├── flight_orders (flight details)
      │   ├── amadeus_order_id (provider reference)
      │   ├── pnr (booking reference)
      │   └── tickets (e-ticket numbers)
      └── payments (payment transaction)
          ├── transaction_id
          └── gateway_response (PayTabs/Paymob data)

Every action logged in:
  └── audit_logs (complete activity trail)
```

---

## 🎯 **What Gets Stored When You Book:**

### **When customer books Cairo → Dubai flight:**

**1. `bookings` table:**
```
- Booking number: BKG-FLT-1760036845750
- Customer: user_id 5
- Amount: 311.85 USD
- Status: confirmed
- Travelers: JSON array with passenger details
```

**2. `flight_orders` table:**
```
- Order number: ORD-FLT-1760036845750
- PNR: ABCD123
- Duffel order ID: off_0000Az2eeLT2pQdqsUneLq
- Complete flight offer (JSON)
- Itineraries/segments (JSON)
- Pricing breakdown
- Airline codes
```

**3. `payments` table:**
```
- Transaction: TXN-1760036845826
- Amount: 311.85 USD
- Gateway: PayTabs/manual
- Status: completed
- Paid at: timestamp
```

**4. `audit_logs` table:**
```
- User: admin (id 5)
- Action: CREATE flight_order
- Details: booking number, PNR, amount
- Timestamp: when it happened
```

---

## 🔍 **View Your Data:**

### **Using MySQL:**

```bash
# Connect to database
mysql -u root -p -D trasealla_db

# View all bookings
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;

# View flight orders with PNRs
SELECT order_number, pnr, total_amount, currency, status 
FROM flight_orders 
ORDER BY created_at DESC;

# View payments
SELECT transaction_id, amount, currency, status, paid_at 
FROM payments 
ORDER BY created_at DESC;

# View audit trail
SELECT user_id, action, entity, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📊 **Useful Queries:**

### **1. Today's Bookings:**
```sql
SELECT 
  COUNT(*) as total_bookings,
  SUM(total_amount) as total_revenue,
  currency
FROM bookings
WHERE DATE(created_at) = CURDATE()
GROUP BY currency;
```

### **2. Unpaid Bookings:**
```sql
SELECT 
  booking_number,
  total_amount,
  currency,
  contact_email
FROM bookings
WHERE payment_status = 'pending'
ORDER BY created_at DESC;
```

### **3. Flight Orders with PNR:**
```sql
SELECT 
  f.order_number,
  f.pnr,
  f.total_amount,
  f.currency,
  f.status,
  f.ticketing_status,
  b.booking_number,
  u.email as customer_email
FROM flight_orders f
JOIN bookings b ON f.booking_id = b.id
JOIN users u ON f.user_id = u.id
ORDER BY f.created_at DESC
LIMIT 10;
```

### **4. Payment History:**
```sql
SELECT 
  p.transaction_id,
  p.amount,
  p.currency,
  p.payment_gateway,
  p.status,
  b.booking_number,
  p.paid_at
FROM payments p
JOIN bookings b ON p.booking_id = b.id
WHERE p.status = 'completed'
ORDER BY p.created_at DESC;
```

---

## 📋 **All 23 Database Tables:**

### **Core System (5):**
1. `users` - User accounts
2. `roles` - Permission system
3. `branches` - Office locations
4. `agencies` - Company settings
5. `currencies` - Exchange rates

### **Booking System (4):**
6. **`bookings`** ⭐ - Universal booking record
7. **`flight_orders`** ⭐ - Flight-specific data
8. **`payments`** ⭐ - Payment transactions
9. **`audit_logs`** ⭐ - Activity tracking

### **Services (6):**
10. `destinations` - Travel destinations
11. `tours` - Tour packages
12. `activities` - Activities/experiences
13. `hotels` - Hotel inventory
14. `flights` - Flight inventory (legacy, not used)
15. `visa_applications` - Visa processing

### **CRM (4):**
16. `contacts` - Contact submissions
17. `newsletters` - Email subscriptions
18. `leads` - Sales leads
19. `lead_activities` - Lead interactions

### **CMS (3):**
20. `pages` - Website pages
21. `media_library` - Uploaded files
22. `translations` - Multi-language content

### **Other (1):**
23. `reviews` - Customer reviews

---

## 🎯 **Data Flow Diagram:**

```
CUSTOMER BOOKS FLIGHT:
    │
    ├─→ bookings table
    │   ├─ booking_number: BKG-FLT-xxx
    │   ├─ booking_status: confirmed
    │   ├─ payment_status: pending
    │   └─ travelers: [JSON array]
    │
    ├─→ flight_orders table
    │   ├─ order_number: ORD-FLT-xxx
    │   ├─ pnr: ABCD123
    │   ├─ amadeus_order_id: off_xxx (Duffel) or eJz... (Amadeus)
    │   ├─ flight_offer_data: [Complete offer JSON]
    │   ├─ itineraries: [Flight segments JSON]
    │   └─ ticketing_status: not_issued
    │
    ├─→ audit_logs table
    │   ├─ action: CREATE
    │   ├─ entity: flight_order
    │   ├─ metadata: {booking details}
    │   └─ created_at: timestamp
    │
    └─→ (Payment happens)
        │
        └─→ payments table
            ├─ transaction_id: TXN-xxx
            ├─ amount: 311.85
            ├─ status: completed
            └─ paid_at: timestamp
            │
            └─→ Updates:
                ├─ bookings.payment_status = 'paid'
                └─ flight_orders.ticketing_status = 'issued'
```

---

## 🔎 **View Your Test Booking:**

```sql
-- Find your latest booking
SELECT 
  b.booking_number,
  b.booking_status,
  b.payment_status,
  b.total_amount,
  b.currency,
  f.pnr,
  f.order_number,
  p.transaction_id,
  p.status as payment_status
FROM bookings b
LEFT JOIN flight_orders f ON b.id = f.booking_id
LEFT JOIN payments p ON b.id = p.booking_id
ORDER BY b.created_at DESC
LIMIT 1;
```

**Should show:**
```
BKG-FLT-1760036845750 | confirmed | paid | 311.85 | USD | null | null | TXN-xxx | completed
```

---

## 📊 **Table Sizes (After Your Test):**

```sql
SELECT 
  TABLE_NAME,
  TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'trasealla_db'
  AND TABLE_NAME IN (
    'bookings', 
    'flight_orders', 
    'payments', 
    'users', 
    'audit_logs'
  );
```

**Example Output:**
```
bookings:        5 rows  (your test bookings)
flight_orders:   5 rows
payments:        5 rows
users:           5 rows  (admin + test users)
audit_logs:      25 rows (all actions tracked)
```

---

## 🎯 **Quick Summary:**

### **For Flight Bookings, Data Goes Into:**

1. ✅ **`bookings`** - Main booking record (booking number, amount, status)
2. ✅ **`flight_orders`** - Flight details (PNR, itinerary, tickets)
3. ✅ **`payments`** - Payment transactions (transaction ID, gateway info)
4. ✅ **`audit_logs`** - Everything tracked (who, what, when)

### **Plus Supporting Tables:**
- `users` - Customer who booked
- `roles` - User permissions
- `currencies` - For multi-currency

---

## 💡 **Pro Tips:**

### **1. View Latest Bookings:**
```sql
SELECT booking_number, total_amount, currency, booking_status, payment_status
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;
```

### **2. Revenue Report:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as bookings,
  SUM(total_amount) as revenue,
  currency
FROM bookings
WHERE payment_status = 'paid'
GROUP BY DATE(created_at), currency
ORDER BY date DESC;
```

### **3. Find Booking by PNR:**
```sql
SELECT 
  b.*,
  f.pnr,
  f.order_number
FROM bookings b
JOIN flight_orders f ON b.id = f.booking_id
WHERE f.pnr = 'ABCD123';
```

---

**Your data is safely stored across 4 main tables with complete tracking!** 🗄️✅

Want to see your actual data? Run:
```bash
mysql -u root -p -D trasealla_db
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;
```

🎉
