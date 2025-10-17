# 🚀 Complete Trasealla Deployment Guide

Deploy all three projects to one domain: `trasealla.com`

---

## 📋 **Project Structure**

```
https://trasealla.com/              → Landing page (React)
https://trasealla.com/api/          → Backend API (Node.js)
https://trasealla.com/login         → Admin Portal (React/Next.js)
https://trasealla.com/dashboard     → Dashboard
```

### **Server Directory Structure:**

```
/var/www/trasealla/
├── trasealla-frontend/          → Landing page
│   └── dist/                    → Built React app
├── trasealla-backend/           → API Backend
│   ├── server.js
│   └── ...
└── trasealla-portal/            → Admin Portal
    └── dist/                    → Built React app
```

---

## 🌐 **Step 1: DNS Configuration (GoDaddy)**

### **EDIT (Don't Create New) These Records:**

**1. Edit Existing @ Record:**
- Find: `A  @  WebsiteBuilder Site`
- Click **Edit** (pencil icon)
- Change value to: `72.61.177.109`
- TTL: 600 seconds
- Save

**2. Keep www CNAME:**
- Type: CNAME
- Name: www
- Value: trasealla.com
- (Already correct - keep it)

**3. Keep ALL Email Records:**
- ✅ MX records
- ✅ CNAME: autodiscover, email, etc.
- ✅ TXT: SPF, DMARC
- ✅ SRV: Microsoft 365 records

### **After Editing:**

Wait 10-30 minutes, then verify:
```bash
# From your Mac
ping trasealla.com
nslookup trasealla.com
# Should show: 72.61.177.109
```

---

## 📁 **Step 2: Create Directory Structure on Server**

```bash
# On server
mkdir -p /var/www/trasealla/trasealla-frontend/dist
mkdir -p /var/www/trasealla/trasealla-backend
mkdir -p /var/www/trasealla/trasealla-portal/dist

# Set permissions
chown -R www-data:www-data /var/www/trasealla
chmod -R 755 /var/www/trasealla
```

---

## 🔧 **Step 3: Deploy Backend** (Already Done)

```bash
cd /var/www/trasealla/trasealla-backend

# Already deployed and running with PM2
pm2 status
pm2 logs trasealla-backend
```

---

## 🌐 **Step 4: Configure Nginx**

### **Upload New Nginx Config:**

**From your Mac:**
```bash
cd /Users/usama/Desktop/trasealla/trasealla/trasealla-backend

scp nginx-complete.conf root@72.61.177.109:/etc/nginx/sites-available/trasealla
```

### **On Server:**

```bash
# Remove old configs
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/trasealla-backend
rm -f /etc/nginx/sites-available/trasealla-backend

# Enable new config
ln -s /etc/nginx/sites-available/trasealla /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

---

## 🔒 **Step 5: Get SSL Certificate**

```bash
# Install certbot (if not installed)
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d trasealla.com -d www.trasealla.com

# Follow prompts:
# - Email: info@trasealla.com
# - Agree: Y
# - Share email: N
# - Redirect HTTP→HTTPS: 2 (Yes)
```

### **Test Auto-Renewal:**

```bash
certbot renew --dry-run
```

---

## 📦 **Step 6: Deploy Frontend Projects**

### **Frontend (Landing Page):**

```bash
# Build on your Mac (in frontend project)
npm run build

# Upload to server
scp -r dist/* root@72.61.177.109:/var/www/trasealla/trasealla-frontend/dist/
```

### **Portal (Admin Dashboard):**

```bash
# Build on your Mac (in portal project)
npm run build

# Upload to server
scp -r dist/* root@72.61.177.109:/var/www/trasealla/trasealla-portal/dist/
```

---

## 🧪 **Step 7: Test All Projects**

### **From Your Mac:**

```bash
# Test landing page
curl https://trasealla.com/
open https://trasealla.com

# Test backend API
curl https://trasealla.com/health
curl https://trasealla.com/api/auth/health

# Test portal
curl https://trasealla.com/login
open https://trasealla.com/login

# Test flight search
curl "https://trasealla.com/api/flights/search?origin=DXB&destination=CAI&departureDate=2025-11-01&adults=1"
```

---

## 📊 **Project Deployment Status**

| Project | Location | Status |
|---------|----------|--------|
| **Backend API** | `/var/www/trasealla/trasealla-backend` | ✅ Deployed |
| **Landing Page** | `/var/www/trasealla/trasealla-frontend/dist` | ⏳ Pending |
| **Admin Portal** | `/var/www/trasealla/trasealla-portal/dist` | ⏳ Pending |

---

## 🎯 **Current Steps to Complete**

### **Right Now:**

1. ✅ **DNS:** Edit @ A record in GoDaddy → 72.61.177.109
2. ⏳ **Wait:** 10-30 minutes for DNS propagation
3. ⏳ **Upload:** nginx-complete.conf to server
4. ⏳ **SSL:** Run certbot
5. ⏳ **Frontend:** Deploy landing page
6. ⏳ **Portal:** Deploy admin portal

---

## 📝 **Backend .env Updates**

Make sure your backend `.env` has:

```env
BACKEND_URL=https://trasealla.com
FRONTEND_URL=https://trasealla.com
ALLOWED_ORIGINS=https://trasealla.com,https://www.trasealla.com

# CORS settings for frontend
CORS_ORIGIN=https://trasealla.com
```

---

## 🔄 **Alternative: Subdomains (If Preferred)**

If you want to use subdomains instead:

```
https://trasealla.com              → Landing page
https://api.trasealla.com          → Backend API
https://portal.trasealla.com       → Admin Portal
```

Add DNS records:
```
A    api      72.61.177.109
A    portal   72.61.177.109
```

---

## 🎯 **Immediate Next Steps**

### **1. Fix DNS (Right Now):**
- Edit @ A record in GoDaddy
- Change to: `72.61.177.109`
- Save

### **2. While DNS Propagates:**
```bash
# On server - upload nginx config
cd /var/www/trasealla/trasealla-backend
# (Upload nginx-complete.conf from Mac)

# Configure nginx
ln -s /etc/nginx/sites-available/trasealla /etc/nginx/sites-enabled/
nginx -t
```

### **3. After DNS Works:**
```bash
# Get SSL
certbot --nginx -d trasealla.com -d www.trasealla.com
```

### **4. Deploy Frontend Projects:**
- Build and upload landing page
- Build and upload portal

---

## 📞 **Quick Summary**

**GoDaddy DNS:**
- Edit existing @ A record → 72.61.177.109
- Keep www CNAME → trasealla.com
- Keep all email records

**Server Structure:**
```
/var/www/trasealla/
├── trasealla-frontend/dist/  (landing page)
├── trasealla-backend/        (API - running)
└── trasealla-portal/dist/    (admin portal)
```

**Nginx:** Routes /api/ → backend, / → frontend, /login → portal

---

**First action: Edit the @ A record in GoDaddy to point to 72.61.177.109** ✏️🌐

Let me know when DNS is updated!

