# 🔧 User Status Update - Complete Guide

## ⚠️ The Issue You're Experiencing

**Problem:** When you update user status, `isActive` still shows as `true`

**Cause:** You're likely using a **customer token** instead of an **admin token**

---

## ✅ Step-by-Step Solution (Postman)

### Step 1: Login as Admin

1. Go to: **Authentication** > **Login**
2. Update the body to:
   ```json
   {
     "email": "admin@trasealla.com",
     "password": "Admin123456!"
   }
   ```
3. Click **Send**
4. ✅ Token is auto-saved to `{{authToken}}`

**Verify:** Check the response - should show `"role": "admin"`

---

### Step 2: Update User Status

1. Go to: **User Management** > **Update User Status (Admin)**
2. The URL should be: `{{baseUrl}}/api/users/3/status` (change `3` to your user ID)
3. Body:
   ```json
   {
     "isActive": false
   }
   ```
4. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": 3,
    "email": "user@example.com",
    "isActive": false  ← Should be false now!
  }
}
```

---

### Step 3: Verify the Change

1. Go to: **User Management** > **Get User by ID (Admin)**
2. URL: `{{baseUrl}}/api/users/3`
3. Click **Send**

**Check the response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 3,
      "isActive": false  ← Verify it's false
    }
  }
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "User role customer is not authorized"

**Problem:** You're using a customer token

**Fix:**
1. Login as admin (email: `admin@trasealla.com`)
2. Use the admin token for all user management endpoints

---

### Issue 2: isActive still shows true

**Possible Causes:**

#### A. Wrong User ID
- Check you're updating the correct user
- User ID 1 might be admin (can't deactivate themselves)

**Fix:** Use a different user ID (e.g., user 2, 3, 4)

#### B. Caching in Postman
- Postman might show cached response

**Fix:**
1. Close and reopen the request
2. Or use **Get User by ID** to verify fresh from database

#### C. Using GET Instead of PUT
- Make sure method is **PUT**, not GET

**Fix:** Verify the request method is PUT

---

### Issue 3: "You cannot deactivate your own account"

**Problem:** Trying to deactivate yourself

**Fix:** Use a different user ID (not your own admin ID)

---

## 🔑 Admin Credentials

```
Email: admin@trasealla.com
Password: Admin123456!
Role: admin
```

---

## 📝 Quick Test Checklist

- [ ] Logged in as **admin** (not customer)
- [ ] Token saved to `{{authToken}}`
- [ ] Using correct endpoint: `PUT /api/users/:id/status`
- [ ] Body contains: `{"isActive": false}` or `{"isActive": true}`
- [ ] User ID is NOT your own admin user ID
- [ ] Checked response shows updated value

---

## 🎯 Complete Example (Postman)

### Deactivate User ID 2:

**Request:**
```
PUT {{baseUrl}}/api/users/2/status
Authorization: Bearer {{authToken}}
Content-Type: application/json

Body:
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": 2,
    "email": "test1759920135@example.com",
    "isActive": false
  }
}
```

### Reactivate User ID 2:

**Request:**
```
PUT {{baseUrl}}/api/users/2/status
Authorization: Bearer {{authToken}}

Body:
{
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": 2,
    "email": "test1759920135@example.com",
    "isActive": true
  }
}
```

---

## 💡 Pro Tips

1. **Always login as admin first** before user management operations
2. **Check the response** for the updated value
3. **Use "Get User by ID"** to verify changes persisted
4. **Cannot deactivate yourself** - it's a safety feature
5. **Deactivation is soft delete** - user data remains in database

---

## 🔍 Debugging Steps

If it's still not working:

1. **Check you're logged in as admin:**
   ```
   GET /api/auth/me
   ```
   Response should show: `"role": "admin"`

2. **Check the user exists:**
   ```
   GET /api/users/3
   ```
   Should return user data

3. **Try the update again:**
   ```
   PUT /api/users/3/status
   Body: {"isActive": false}
   ```

4. **Verify in database directly:**
   ```sql
   SELECT id, email, is_active FROM users WHERE id = 3;
   ```

---

**The API works correctly!** Just make sure you're using an admin token. 🚀

Try it now with the admin credentials provided above!
