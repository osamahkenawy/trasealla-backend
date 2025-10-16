# 📧 Email Configuration Guide - Microsoft 365 (GoDaddy)

Complete guide to configure Microsoft 365 email for Trasealla Backend.

---

## 🎯 **Microsoft 365 SMTP Configuration**

### **SMTP Settings for Microsoft 365:**

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SECURE=false
EMAIL_TLS=true
```

---

## 📋 **Step-by-Step Setup**

### **Step 1: Get Your Email Credentials**

From your GoDaddy Microsoft 365 setup:
- **Email Address:** `info@trasealla.com` (or your custom domain email)
- **Password:** Your Microsoft 365 email password

---

### **Step 2: Configure .env File**

Open your `.env` file and update:

```env
# Email Configuration for Microsoft 365
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=info@trasealla.com
EMAIL_PASS=YourEmailPassword123
EMAIL_FROM=info@trasealla.com
EMAIL_SECURE=false
EMAIL_TLS=true

# Optional: Additional email settings
EMAIL_NAME=Trasealla Travel Agency
EMAIL_REPLY_TO=support@trasealla.com
```

---

### **Step 3: Enable SMTP Authentication** (If needed)

For Microsoft 365 purchased from GoDaddy:

1. **Login to Microsoft 365 Admin:**
   - Go to: https://admin.microsoft.com
   - Login with your admin account

2. **Enable SMTP AUTH:**
   - Go to **Settings** → **Mail**
   - Click **SMTP** settings
   - Enable **Authenticated SMTP**

---

## 🔐 **Security Options**

### **Option 1: Use Regular Password** (Simplest)

```env
EMAIL_USER=info@trasealla.com
EMAIL_PASS=YourRegularPassword
```

### **Option 2: Use App Password** (More Secure - Recommended)

If you have 2FA enabled:

1. **Enable 2-Factor Authentication:**
   - Go to Microsoft 365 Security settings
   - Enable 2FA for your account

2. **Generate App Password:**
   - Go to https://account.microsoft.com/security
   - Select "App passwords"
   - Create new password for "Mail app"
   - Copy the generated password

3. **Use in .env:**
```env
EMAIL_USER=info@trasealla.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # App password
```

---

## 🔧 **Complete Configuration Example**

### **Production .env:**
```env
# ============================================
# EMAIL CONFIGURATION - MICROSOFT 365
# ============================================

# SMTP Server Settings
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=info@trasealla.com
EMAIL_PASS=YourPassword123!

# Email Identity
EMAIL_FROM=info@trasealla.com
EMAIL_NAME=Trasealla Travel Agency
EMAIL_REPLY_TO=support@trasealla.com

# Connection Settings
EMAIL_SECURE=false  # Set to false for port 587
EMAIL_TLS=true      # Enable TLS encryption

# Email Service
EMAIL_SERVICE=office365

# Optional: Email Templates
EMAIL_BOOKING_SUBJECT=Your Flight Booking Confirmation
EMAIL_TICKET_SUBJECT=Your E-Ticket
```

---

## 🧪 **Test Email Configuration**

### **Create Test Script:**

Create `test-email.js` in your project root:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('📧 Testing Microsoft 365 Email Configuration...\n');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });

  // Verify connection
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful!');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
    return;
  }

  // Send test email
  const mailOptions = {
    from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: 'Test Email from Trasealla Backend',
    text: 'This is a test email from Trasealla Backend API.',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">✅ Email Configuration Successful!</h2>
        <p>This is a test email from your Trasealla Backend.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>SMTP Host: ${process.env.EMAIL_HOST}</li>
          <li>SMTP Port: ${process.env.EMAIL_PORT}</li>
          <li>Email User: ${process.env.EMAIL_USER}</li>
        </ul>
        <p>Your email system is working correctly! 🎉</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\n✅ Test Email Sent Successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipient: ${mailOptions.to}`);
    console.log('\n📬 Check your inbox!');
  } catch (error) {
    console.error('\n❌ Failed to Send Email:', error.message);
    if (error.response) {
      console.error('   Server Response:', error.response);
    }
  }
}

testEmail().catch(console.error);
```

### **Run Test:**
```bash
node test-email.js
```

---

## 🔍 **Troubleshooting**

### **Common Issues & Solutions:**

#### **1. Authentication Failed**
```
Error: Invalid login: 535 5.7.139 Authentication unsuccessful
```

**Solutions:**
- ✅ Verify email and password are correct
- ✅ Enable "Authenticated SMTP" in Microsoft 365 admin
- ✅ Check if account is not locked
- ✅ Try using app password instead

#### **2. Connection Timeout**
```
Error: Connection timeout
```

**Solutions:**
- ✅ Verify EMAIL_HOST=smtp.office365.com
- ✅ Use PORT=587
- ✅ Check firewall/network settings
- ✅ Ensure server can access external SMTP

#### **3. TLS/SSL Error**
```
Error: self signed certificate in certificate chain
```

**Solutions:**
Add to transporter config:
```javascript
tls: {
  rejectUnauthorized: false
}
```

#### **4. Email Not Sending**
```
Error: Message rejected
```

**Solutions:**
- ✅ Verify EMAIL_FROM matches EMAIL_USER
- ✅ Check recipient email is valid
- ✅ Ensure email account is active
- ✅ Check Microsoft 365 sending limits

---

## 📧 **Alternative Ports**

If port 587 doesn't work, try:

### **Port 25 (May be blocked by some hosts):**
```env
EMAIL_PORT=25
EMAIL_SECURE=false
EMAIL_TLS=true
```

### **Port 465 (SSL):**
```env
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_TLS=false
```

---

## 🚀 **Quick Setup Commands**

### **1. Update .env:**
```bash
nano .env
```

Paste:
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=info@trasealla.com
EMAIL_PASS=YourPassword
EMAIL_FROM=info@trasealla.com
EMAIL_SECURE=false
EMAIL_TLS=true
```

### **2. Test Configuration:**
```bash
node test-email.js
```

### **3. Restart Application:**
```bash
pm2 restart trasealla-backend
```

---

## 📋 **Email Features in Your Backend**

Your backend will use email for:

1. **Booking Confirmations** 📧
   - Sent after successful flight booking
   - Includes booking details and PNR

2. **E-Ticket Delivery** 🎫
   - PDF ticket attached to email
   - Sent to passenger's email

3. **Password Reset** 🔐
   - Reset password links
   - Account verification

4. **Notifications** 📬
   - Order updates
   - Flight changes
   - Cancellations

---

## 🔐 **Security Best Practices**

### **1. Never Commit .env:**
```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

### **2. Use Environment-Specific Files:**
- `.env.development` - Local testing
- `.env.production` - Production server (never commit!)

### **3. Restrict Email Permissions:**
- Only grant "Send As" permission
- Don't use admin account for sending

### **4. Monitor Email Usage:**
- Check Microsoft 365 admin for sending stats
- Watch for unusual activity

---

## 📊 **Microsoft 365 Sending Limits**

Be aware of Microsoft 365 limits:
- **Recipients per day:** 10,000
- **Recipients per message:** 500
- **Rate limit:** 30 messages per minute

For high volume, consider:
- SendGrid
- Amazon SES
- Mailgun

---

## 🎯 **Complete Example Configuration**

### **Your Final .env should look like:**

```env
# ============================================
# PRODUCTION CONFIGURATION
# ============================================

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trasealla_db
DB_USER=trasealla_user
DB_PASSWORD=your_secure_db_password

# JWT
JWT_SECRET=your_jwt_secret_min_64_chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_64_chars
JWT_REFRESH_EXPIRE=30d

# Server
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://trasealla.com
BACKEND_URL=https://api.trasealla.com

# Email Configuration - Microsoft 365
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=info@trasealla.com
EMAIL_PASS=YourPassword123!
EMAIL_FROM=info@trasealla.com
EMAIL_NAME=Trasealla Travel Agency
EMAIL_SECURE=false
EMAIL_TLS=true

# Flight APIs
DUFFEL_API_KEY=duffel_live_...
DUFFEL_ORG_ID=org_...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...

# Default Provider
DEFAULT_FLIGHT_PROVIDER=duffel
```

---

## ✅ **Verification Checklist**

- [ ] Microsoft 365 email account active
- [ ] SMTP authentication enabled in Microsoft 365 admin
- [ ] Email credentials added to .env
- [ ] Test email sent successfully
- [ ] Application restarted
- [ ] Booking confirmation emails working
- [ ] Ticket emails sending correctly

---

## 📞 **Need Help?**

### **Microsoft 365 Support:**
- GoDaddy Support: https://www.godaddy.com/help
- Microsoft 365 Admin: https://admin.microsoft.com

### **Test Commands:**
```bash
# Test SMTP connection
telnet smtp.office365.com 587

# Check if email service is running
curl -I smtp.office365.com:587

# View application logs
pm2 logs trasealla-backend
```

---

**Your email is now configured and ready to send flight bookings and tickets!** 📧✈️

