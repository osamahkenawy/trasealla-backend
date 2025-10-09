# 👥 User Status System

## 📊 Three Status Levels

Your system now supports **three distinct user statuses**:

```
┌──────────┐
│  Active  │  ✅ User can login and use all features
└──────────┘

┌───────────┐
│ Inactive  │  🚫 User account deactivated (soft delete)
└───────────┘

┌────────────┐
│ Suspended  │  ⏸️  Temporarily suspended (policy violation, etc.)
└────────────┘
```

---

## 🎯 Status Meanings

### 1. **Active** ✅
- User can login
- All features accessible
- Can make bookings
- Can update profile
- Default status for new users

**Use Cases:**
- Normal users
- Active customers
- Staff members in good standing

---

### 2. **Inactive** 🚫
- User cannot login
- Account is deactivated
- Soft delete (data preserved)
- Can be reactivated

**Use Cases:**
- User requested account deletion
- Closed accounts
- Duplicate accounts
- Test accounts to remove

---

### 3. **Suspended** ⏸️
- User cannot login
- Temporary restriction
- Can be reactivated
- Usually has a reason/duration

**Use Cases:**
- Policy violations
- Pending verification
- Fraud investigation
- Payment disputes
- Temporary ban

---

## 🔧 API Usage

### Update User Status

**Endpoint:** `PUT /api/users/:id/status`

**Request Body:**
```json
{
  "status": "active"
}
```

**Valid Status Values:**
- `"active"` - Activate user
- `"inactive"` - Deactivate user  
- `"suspended"` - Suspend user

---

## 📝 Examples

### 1. Activate User
```bash
curl -X PUT http://localhost:5001/api/users/3/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": 3,
    "status": "active",
    "isActive": true,
    ...
  }
}
```

---

### 2. Deactivate User
```bash
curl -X PUT http://localhost:5001/api/users/3/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": 3,
    "status": "inactive",
    "isActive": false,
    ...
  }
}
```

---

### 3. Suspend User
```bash
curl -X PUT http://localhost:5001/api/users/3/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended"}'
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "id": 3,
    "status": "suspended",
    "isActive": false,
    ...
  }
}
```

---

## 🔄 Backward Compatibility

The API still supports the old `isActive` boolean field:

```json
{"isActive": false}  → Converts to status: "inactive"
{"isActive": true}   → Converts to status: "active"
```

But **recommended to use the new `status` field** going forward!

---

## 🎨 Frontend Integration

### React/Vue Example:
```javascript
const updateUserStatus = async (userId, newStatus) => {
  const response = await fetch(`http://localhost:5001/api/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  });
  
  const data = await response.json();
  console.log(data.message); // "User suspended successfully"
  return data;
};

// Usage:
updateUserStatus(3, 'suspended');
updateUserStatus(3, 'active');
updateUserStatus(3, 'inactive');
```

### Dropdown Component:
```javascript
<select onChange={(e) => updateUserStatus(userId, e.target.value)}>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="suspended">Suspended</option>
</select>
```

---

## 🔐 Authentication Behavior

### Login Checks:

```javascript
// In auth middleware
if (user.status !== 'active') {
  return res.status(401).json({
    message: user.status === 'suspended' 
      ? 'Your account has been suspended. Please contact support.'
      : 'Your account is inactive. Please contact support to reactivate.'
  });
}
```

---

## 📊 Database Schema

### User Table Fields:
```
status      ENUM('active', 'inactive', 'suspended')  ← New field
isActive    BOOLEAN                                  ← Legacy field (auto-synced)
```

**Relationship:**
- `status: 'active'` → `isActive: true`
- `status: 'inactive'` → `isActive: false`
- `status: 'suspended'` → `isActive: false`

---

## 🎯 Postman Examples

I've added 4 requests to the collection:

1. **Update User Status (Admin)** - Generic updater
2. **Activate User (Admin)** - Quick activate
3. **Deactivate User (Admin)** - Quick deactivate
4. **Suspend User (Admin)** - Quick suspend

All in: **User Management** section

---

## 💡 Use Case Scenarios

### Scenario 1: User Violates Terms
```
Action: Suspend user
Status: suspended
Message: "Account suspended for policy violation"
Duration: 7 days
```

### Scenario 2: User Requests Account Deletion
```
Action: Deactivate user
Status: inactive
Message: "Account deactivated per user request"
Data: Retained for 30 days
```

### Scenario 3: Reactivate After Suspension
```
Action: Activate user
Status: active
Message: "Welcome back! Your account is now active"
```

---

## 🔍 Filtering Users by Status

### Get all suspended users:
```bash
curl "http://localhost:5001/api/users?status=suspended" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get all active users:
```bash
curl "http://localhost:5001/api/users?status=active" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🎬 Quick Start

**Your exact request format:**
```bash
curl -X PUT 'http://localhost:5001/api/users/4/status' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{"status":"suspended"}'
```

**Works with:**
- `"status": "active"` ✅
- `"status": "inactive"` ✅
- `"status": "suspended"` ✅

---

**The API now matches your UI dropdown perfectly!** 🎉
