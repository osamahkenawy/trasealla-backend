# ⚡ Microsoft 365 Email - Quick Setup

**Get your GoDaddy Microsoft 365 email working in 5 minutes**

---

## 🎯 **Quick Configuration**

### **Step 1: Get Your Email Details**

From your GoDaddy account:
- Email: `info@trasealla.com` (your domain email)
- Password: Your Microsoft 365 email password

---

### **Step 2: Update .env File**

Open `.env` and add:

```env
# Microsoft 365 Email Configuration
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=info@trasealla.com
EMAIL_PASS=YourPassword123
EMAIL_FROM=info@trasealla.com
EMAIL_NAME=Trasealla Travel Agency
EMAIL_SECURE=false
EMAIL_TLS=true
```

**Replace:**
- `info@trasealla.com` with your actual email
- `YourPassword123` with your actual password

---

### **Step 3: Test Email**

```bash
node test-email.js
```

You should see:
```
✅ SMTP connection successful!
✅ Test email sent successfully!
📬 Check your inbox!
```

---

## 🔐 **Enable SMTP Authentication** (If needed)

1. **Login:** https://admin.microsoft.com
2. **Go to:** Settings → Mail → SMTP
3. **Enable:** "Authenticated SMTP"
4. **Save**

---

## 🧪 **Test Email Examples**

### **Basic Test:**
```bash
node test-email.js
```

### **Send to Specific Email:**
```bash
node test-email.js customer@example.com
```

### **Debug Mode:**
```bash
DEBUG=true node test-email.js
```

---

## 🚨 **Common Issues**

### **Authentication Failed?**
✅ Check email and password
✅ Enable SMTP in Microsoft 365 admin
✅ Verify account is not locked

### **Connection Timeout?**
✅ Use `smtp.office365.com`
✅ Port should be `587`
✅ Check firewall settings

### **Email Not Sending?**
✅ `EMAIL_FROM` must match `EMAIL_USER`
✅ Account must be active
✅ Check sending limits

---

## 📧 **Complete Example**

```env
# Working Microsoft 365 Configuration
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=info@trasealla.com
EMAIL_PASS=MySecurePassword123!
EMAIL_FROM=info@trasealla.com
EMAIL_NAME=Trasealla Travel Agency
EMAIL_SECURE=false
EMAIL_TLS=true
```

---

## ✅ **Verification**

Once configured, your backend can send:
- ✈️ Flight booking confirmations
- 🎫 E-tickets to passengers
- 📧 Order notifications
- 🔐 Password reset emails

---

## 🚀 **Next Steps**

1. ✅ Configure email (done!)
2. Test with: `node test-email.js`
3. Restart backend: `pm2 restart trasealla-backend`
4. Book a flight and check email delivery

---

**Need detailed help? See `EMAIL_SETUP_GUIDE.md`**

**Your email is ready!** 📧✨

