# 🔧 Fix Microsoft 365 SMTP Authentication Error

## ❌ **Error:**
```
Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant
```

---

## ✅ **Solution: Enable SMTP Authentication**

### **Option 1: Microsoft 365 Admin Center** ⭐ Recommended

#### **Step-by-Step:**

1. **Login to Microsoft 365 Admin Center:**
   ```
   https://admin.microsoft.com
   ```
   Use your admin credentials

2. **Enable Organization-Wide SMTP:**
   - Click **Settings** (left sidebar)
   - Click **Org settings**
   - Click **Modern authentication**
   - Check: ✅ **"Enable SMTP AUTH protocol"**
   - Click **Save changes**
   - Wait 5-15 minutes for propagation

3. **Enable SMTP for Your Mailbox:**
   - Go to **Users** → **Active users**
   - Select your email account: `info@trasealla.com`
   - Click **Mail** tab
   - Click **Manage email apps**
   - Under **Protocols**, check: ✅ **"Authenticated SMTP"**
   - Click **Save changes**

4. **Test After 15 Minutes:**
   ```bash
   node test-email.js
   ```

---

### **Option 2: Exchange Admin Center**

1. **Login:**
   ```
   https://admin.exchange.microsoft.com
   ```

2. **Go to Recipients:**
   - Click **Recipients** → **Mailboxes**
   - Select your mailbox
   - Click **Manage email apps settings**

3. **Enable SMTP:**
   - Toggle ON: **Authenticated SMTP**
   - Click **Save**

---

### **Option 3: PowerShell** (Advanced)

```powershell
# Install module (if not installed)
Install-Module -Name ExchangeOnlineManagement -Force

# Connect
Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com

# Enable SMTP AUTH for specific mailbox
Set-CASMailbox -Identity "info@trasealla.com" -SmtpClientAuthenticationDisabled $false

# Verify it's enabled
Get-CASMailbox -Identity "info@trasealla.com" | Format-List SmtpClientAuthenticationDisabled

# Should show: SmtpClientAuthenticationDisabled : False

# Disconnect
Disconnect-ExchangeOnline
```

---

### **Option 4: Contact GoDaddy Support**

If you don't have admin access:

**Phone:** 1-480-505-8877  
**Chat:** https://www.godaddy.com/contact-us

**Say:** "I need to enable SMTP authentication for my Microsoft 365 mailbox"

**Provide:**
- Your domain: `trasealla.com`
- Email: `info@trasealla.com`
- Reason: "Need to send automated emails from my application"

---

## 🔐 **Alternative: Use App Password**

If SMTP can't be enabled, use an app password:

### **Step 1: Enable MFA (Required for App Passwords)**

1. Go to: https://account.microsoft.com/security
2. Click **"Additional security options"**
3. Enable **"Two-step verification"**

### **Step 2: Create App Password**

1. Go to: https://account.microsoft.com/security
2. Click **"Advanced security options"**
3. Under **"App passwords"**, click **"Create a new app password"**
4. Name: **"Trasealla Backend SMTP"**
5. Copy the generated password (e.g., `abcd-efgh-ijkl-mnop`)

### **Step 3: Update .env**

```env
EMAIL_USER=info@trasealla.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # Use app password
```

### **Step 4: Test**

```bash
node test-email.js
```

---

## ⏱️ **How Long Does It Take?**

- **Organization settings:** 5-30 minutes
- **Mailbox settings:** 5-15 minutes  
- **App password:** Immediate

**Be patient!** Changes can take up to 30 minutes to propagate.

---

## 🧪 **Testing**

### **Test 1: Check if SMTP is enabled**

```bash
# From terminal
telnet smtp.office365.com 587
```

Should connect successfully.

### **Test 2: Test authentication**

```bash
node test-email.js
```

Should now show:
```
✅ SMTP connection successful!
✅ Test email sent successfully!
```

---

## 🚨 **Common Issues**

### **Issue 1: Still Getting Error After Enabling**

**Wait longer:** Changes can take 30 minutes
```bash
# Wait 15-30 minutes, then:
node test-email.js
```

### **Issue 2: "Modern authentication is disabled"**

**Enable Modern Auth:**
1. Admin Center → Settings → Org settings
2. Click **Modern authentication**
3. Enable for: ✅ Exchange Online
4. Save and wait 15 minutes

### **Issue 3: "User is not authorized"**

**Check mailbox permissions:**
```bash
# PowerShell
Get-CASMailbox -Identity "info@trasealla.com" | Format-List *smtp*
```

---

## 📋 **Quick Checklist**

- [ ] Admin access to Microsoft 365
- [ ] SMTP AUTH enabled organization-wide
- [ ] SMTP AUTH enabled for mailbox
- [ ] Waited 15-30 minutes
- [ ] Tested with `node test-email.js`
- [ ] Email received in inbox

---

## 💡 **Pro Tips**

### **Tip 1: Use Dedicated Email**
Create a separate email for sending:
- `noreply@trasealla.com`
- `notifications@trasealla.com`

### **Tip 2: Monitor Usage**
Check email sending stats:
- Admin Center → Reports → Exchange

### **Tip 3: Set Sending Limits**
Be aware of limits:
- 10,000 recipients per day
- 500 recipients per message
- 30 messages per minute

---

## 🆘 **Still Not Working?**

### **Try These:**

1. **Verify credentials:**
   ```bash
   cat .env | grep EMAIL
   ```

2. **Check account status:**
   - Login to: https://outlook.office365.com
   - Verify you can send emails manually

3. **Test with telnet:**
   ```bash
   telnet smtp.office365.com 587
   ```

4. **Enable debug mode:**
   ```bash
   DEBUG=true node test-email.js
   ```

5. **Contact support:**
   - GoDaddy: 1-480-505-8877
   - Microsoft: https://support.microsoft.com

---

## ✅ **Success Indicators**

Once working, you should see:

```
📧 Testing Microsoft 365 Email Configuration...

1️⃣ Checking environment variables...
✅ All required variables present

2️⃣ Creating email transporter...
✅ Transporter created

3️⃣ Verifying SMTP connection...
✅ SMTP connection successful!

4️⃣ Sending test email...
✅ Test email sent successfully!

📬 Check your inbox!
```

---

## 📞 **Support Resources**

- **GoDaddy Microsoft 365:** https://www.godaddy.com/help/office-365
- **Microsoft Support:** https://support.microsoft.com
- **Enable SMTP:** https://aka.ms/smtp_auth_disabled

---

**Follow these steps and your email will work!** 📧✨

