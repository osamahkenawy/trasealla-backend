# 🔒 SSL Certificate & Domain Setup Guide

Complete guide to set up SSL for `trasealla.com` with backend at `https://trasealla.com/api/`

---

## 🌐 **Step 1: Configure DNS in GoDaddy**

### **Login to GoDaddy:**
1. Go to: https://dcc.godaddy.com/domains
2. Find `trasealla.com`
3. Click **DNS** or **Manage DNS**

### **Add/Update DNS Records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 72.61.177.109 | 600 |
| A | www | 72.61.177.109 | 600 |

**Save changes** and wait 5-30 minutes for DNS propagation.

### **Verify DNS:**

From your Mac:
```bash
# Check DNS propagation
ping trasealla.com
nslookup trasealla.com

# Should show: 72.61.177.109
```

---

## 🔧 **Step 2: Configure Nginx**

### **On Your Server:**

```bash
# Remove old config
rm -f /etc/nginx/sites-enabled/trasealla-backend
rm -f /etc/nginx/sites-available/trasealla-backend

# Upload new config
cd /var/www/trasealla/trasealla-backend
```

### **From Your Mac, Upload Config:**

```bash
cd /Users/usama/Desktop/trasealla/trasealla/trasealla-backend

# Upload new nginx config
scp nginx-production.conf root@72.61.177.109:/etc/nginx/sites-available/trasealla
```

### **On Server:**

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/trasealla /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

---

## 🔒 **Step 3: Install SSL Certificate (Let's Encrypt)**

### **Install Certbot:**

```bash
# Install certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

### **Get SSL Certificate:**

```bash
# Get certificate for your domain
certbot --nginx -d trasealla.com -d www.trasealla.com

# Follow the prompts:
# - Enter email address
# - Agree to terms: Yes
# - Share email: No (optional)
# - Redirect HTTP to HTTPS: Yes (option 2)
```

### **Test Auto-Renewal:**

```bash
# Test certificate renewal
certbot renew --dry-run

# Should show: Congratulations, all simulated renewals succeeded
```

---

## ✅ **Step 4: Verify SSL is Working**

### **From Your Mac:**

```bash
# Test HTTPS
curl https://trasealla.com/health

# Test API endpoint
curl https://trasealla.com/api/auth/health

# Test flight search
curl "https://trasealla.com/api/flights/search?origin=DXB&destination=CAI&departureDate=2025-11-01&adults=1"
```

### **In Browser:**

Open: https://trasealla.com/health

Should show:
```json
{"status":"ok"}
```

---

## 🎯 **Your Backend URLs**

After setup, your backend will be accessible at:

| URL | Purpose |
|-----|---------|
| `https://trasealla.com/api/*` | All API endpoints |
| `https://trasealla.com/health` | Health check |
| `https://trasealla.com/uploads/*` | Static files |
| `https://trasealla.com/` | Frontend (future) |

### **Example API Calls:**

```bash
# Login
POST https://trasealla.com/api/auth/login

# Search flights
GET https://trasealla.com/api/flights/search

# Book flight
POST https://trasealla.com/api/flights/create-order

# Download ticket
GET https://trasealla.com/api/flights/orders/{id}/ticket/download
```

---

## 🔄 **Update Backend Configuration**

### **Update .env on Server:**

```bash
nano /var/www/trasealla/trasealla-backend/.env
```

Change:
```env
BACKEND_URL=https://trasealla.com
FRONTEND_URL=https://trasealla.com
ALLOWED_ORIGINS=https://trasealla.com,https://www.trasealla.com
```

### **Restart Application:**

```bash
pm2 restart trasealla-backend
pm2 logs trasealla-backend
```

---

## 📋 **Complete Setup Commands**

### **On Server:**

```bash
# 1. Wait for DNS propagation
ping trasealla.com

# 2. Configure Nginx (upload nginx-production.conf first)
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/trasealla /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 3. Install Certbot
apt-get install -y certbot python3-certbot-nginx

# 4. Get SSL certificate
certbot --nginx -d trasealla.com -d www.trasealla.com

# 5. Test renewal
certbot renew --dry-run

# 6. Update firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 7. Restart backend
pm2 restart trasealla-backend
```

---

## 🧪 **Test from Your Mac:**

```bash
# Test HTTPS
curl https://trasealla.com/health

# Test API
curl https://trasealla.com/api/auth/health

# Test in browser
open https://trasealla.com/health
```

---

## 🚨 **If Certbot Fails**

### **Common Issues:**

**1. DNS not propagated:**
```bash
# Wait longer, then test
nslookup trasealla.com
```

**2. Port 80 blocked:**
```bash
# Check firewall
ufw allow 80/tcp
ufw status
```

**3. Nginx not running:**
```bash
systemctl status nginx
systemctl restart nginx
```

---

## 📊 **Monitoring SSL Certificate**

```bash
# Check certificate status
certbot certificates

# Check expiry
openssl s_client -connect trasealla.com:443 -servername trasealla.com 2>/dev/null | openssl x509 -noout -dates

# Renew manually
certbot renew
```

---

## 🎯 **Summary**

1. ✅ **GoDaddy DNS:** Point trasealla.com → 72.61.177.109
2. ✅ **Upload nginx-production.conf** to server
3. ✅ **Install Certbot** on server
4. ✅ **Get SSL certificate** with certbot
5. ✅ **Test:** https://trasealla.com/api/

---

**Start with DNS configuration in GoDaddy, then we'll set up SSL!** 🌐🔒

Have you configured the DNS records in GoDaddy yet?
