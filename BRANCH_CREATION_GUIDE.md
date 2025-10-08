# 🏢 Branch Creation Guide

## Why You Need an Agency First

### System Hierarchy:
```
┌─────────────────────────────────────┐
│  Agency (Trasealla Travel Agency)   │  ← Created by npm run init
│  - Settings, Currencies, Tax Rates  │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   ┌─────────┐         ┌─────────┐
   │  Main   │         │  Dubai  │  ← You create these
   │ Branch  │         │ Branch  │
   └─────────┘         └─────────┘
```

### Why This Design?

1. **Multi-Tenant Support**: One system can handle multiple travel agency companies
2. **Centralized Settings**: Tax rates, currencies set at agency level
3. **Branch Independence**: Each branch can have its own:
   - Manager
   - Working hours
   - Approval limits
   - Invoice permissions

---

## 📋 Complete Setup Process

### 1. Initialize System (Creates Default Agency)
```bash
npm run init
```

**What this creates:**
- ✅ Default agency: "Trasealla Travel Agency"
- ✅ Main branch (code: MAIN)
- ✅ System roles (super_admin, admin, agent, customer)
- ✅ Default currencies (USD, EUR, AED, SAR, etc.)

### 2. Create Admin User
```bash
npm run create:admin
```

**Already exists:**
- Email: `osama.admin@yopmail.com`
- Role: `admin`

### 3. Login to Get Admin Token

**In Postman:**
- Go to: **Authentication** > **Login**
- Use:
  ```json
  {
    "email": "osama.admin@yopmail.com",
    "password": "YOUR_PASSWORD"
  }
  ```
- Token auto-saves to `{{authToken}}`

**Via curl:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "osama.admin@yopmail.com",
    "password": "YOUR_PASSWORD"
  }'
```

Save the token from response!

### 4. Create Dubai Branch

**In Postman:**
- Go to: **Phase 1 - Core Foundation** > **Agency Settings & RBAC** > **Create Branch**
- Make sure `{{authToken}}` is set from Step 3
- Use your payload:
  ```json
  {
    "name": "Dubai Branch",
    "code": "DXB",
    "type": "branch",
    "address": "Dubai Marina, Dubai, UAE",
    "city": "Dubai",
    "country": "UAE",
    "phone": "+971501234567",
    "email": "dubai@trasealla.com",
    "managerName": "Ahmed Hassan",
    "managerEmail": "ahmed@trasealla.com"
  }
  ```
- Click **Send**

**Via curl:**
```bash
curl -X POST http://localhost:5001/api/agency/branches \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dubai Branch",
    "code": "DXB",
    "type": "branch",
    "address": "Dubai Marina, Dubai, UAE",
    "city": "Dubai",
    "country": "UAE",
    "phone": "+971501234567",
    "email": "dubai@trasealla.com",
    "managerName": "Ahmed Hassan",
    "managerEmail": "ahmed@trasealla.com"
  }'
```

---

## 🎯 Understanding the Error

### Error: "No active agency found"

**What it means:**
The `agencies` table was empty when you tried to create a branch.

**Why it happened:**
You hadn't run `npm run init` yet.

**How branches work:**
```javascript
// From controllers/agencyController.js
const agency = await Agency.findOne({ where: { isActive: true } });
if (!agency) {
  return res.status(400).json({
    success: false,
    message: 'No active agency found'  // ← This error
  });
}

const branch = await Branch.create({
  agencyId: agency.id,  // ← Branch needs agency ID
  name,
  code,
  // ... other fields
});
```

**The Fix:**
✅ Run `npm run init` (already done!)
✅ Now the agency exists
✅ You can create branches!

---

## 🔑 Quick Test Workflow

### Test the complete flow:

```bash
# 1. Login as admin
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "osama.admin@yopmail.com",
    "password": "YOUR_PASSWORD"
  }' | jq -r '.data.token'

# This will output your token, copy it!

# 2. Verify agency exists
curl http://localhost:5001/api/agency/settings \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# 3. Create Dubai branch
curl -X POST http://localhost:5001/api/agency/branches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dubai Branch",
    "code": "DXB",
    "type": "branch",
    "address": "Dubai Marina, Dubai, UAE",
    "city": "Dubai",
    "country": "UAE",
    "phone": "+971501234567",
    "email": "dubai@trasealla.com",
    "managerName": "Ahmed Hassan",
    "managerEmail": "ahmed@trasealla.com"
  }' | jq

# 4. List all branches
curl http://localhost:5001/api/agency/branches \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

---

## 🏢 Branch Configuration Options

### Required Fields:
- `name` - Branch name
- `code` - Unique branch code (3-10 chars)
- `address` - Physical address

### Optional Fields:
```json
{
  "type": "main | branch | franchise",  // Default: branch
  "city": "City name",
  "country": "Country name",
  "phone": "Phone number",
  "email": "Branch email",
  "managerName": "Manager full name",
  "managerEmail": "Manager email",
  "managerPhone": "Manager phone",
  "workingHours": {
    "sunday": { "open": "09:00", "close": "18:00" },
    "monday": { "open": "09:00", "close": "18:00" }
    // ... etc
  },
  "settings": {
    "canIssueInvoices": true,
    "canProcessPayments": true,
    "requiresApproval": false,
    "approvalLimit": 5000  // Amount that requires approval
  }
}
```

---

## 💡 Use Cases for Branches

### 1. **Geographic Distribution**
```
Main Branch (HQ)     → New York
Dubai Branch         → UAE Operations
London Branch        → European Operations
```

### 2. **Franchise Model**
```
Corporate HQ         → Type: main
Franchise A          → Type: franchise
Franchise B          → Type: franchise
```

### 3. **Department Separation**
```
Main Office          → General operations
Corporate Sales      → B2B/Corporate clients
Luxury Travel Desk   → Premium services
```

### 4. **Approval Workflows**
```
Branch Setting: approvalLimit = 5000

If booking > $5000:
  → Requires manager approval
  → Escalates to HQ

If booking ≤ $5000:
  → Agent can approve directly
```

---

## 🎬 Your Next Steps

1. ✅ System initialized (`npm run init` ✓)
2. ✅ Admin user exists (`osama.admin@yopmail.com` ✓)
3. 🔄 **Login as admin** in Postman
4. 🔄 **Create Dubai branch** using your payload
5. ✅ Done!

---

**Summary:** You needed to run `npm run init` first to create the default agency. Now you can create as many branches as you need! 🚀
