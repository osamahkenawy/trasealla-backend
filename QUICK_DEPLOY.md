# ⚡ Quick Deployment Guide

**Deploy Trasealla Backend to Hostinger VPS in 10 Minutes**

---

## 🚀 **Quick Start**

### **1. Prepare Your Local Machine**

```bash
# Navigate to project
cd /path/to/trasealla-backend

# Commit all changes
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

### **2. Initial Server Setup** (One-time)

```bash
# Copy setup scripts to server
scp setup-server.sh root@72.61.177.109:/root/
scp setup-database.sh root@72.61.177.109:/root/

# SSH to server
ssh root@72.61.177.109

# Run setup scripts
cd /root
chmod +x setup-server.sh setup-database.sh
bash setup-server.sh
bash setup-database.sh

# Save database credentials
cat /root/trasealla-db-credentials.txt
```

---

### **3. Deploy Application**

```bash
# Still on server

# Clone repository
cd /var/www/trasealla-backend
git clone https://github.com/YOUR_USERNAME/trasealla-backend.git .

# Configure environment
cp env.production.example .env
nano .env  # Update with your values

# Install dependencies
npm install --production

# Initialize database
mysql -u trasealla_user -p trasealla_db < create-normalized-tables.sql
node scripts/createAdmin.js

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configure Nginx
cp nginx.conf /etc/nginx/sites-available/trasealla-backend
ln -s /etc/nginx/sites-available/trasealla-backend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Setup SSL
certbot --nginx -d api.trasealla.com
```

---

### **4. Verify Deployment**

```bash
# Check PM2
pm2 status
pm2 logs

# Test API
curl https://api.trasealla.com/health
```

---

## 🔄 **Future Updates**

### **Method 1: Using Deploy Script** (Recommended)
```bash
# From your local machine
./deploy.sh
```

### **Method 2: Manual**
```bash
# SSH to server
ssh root@72.61.177.109

# Update code
cd /var/www/trasealla-backend
git pull origin main
npm install --production
pm2 reload trasealla-backend
```

---

## 📝 **Environment Variables to Update**

```env
# Database (from setup-database.sh)
DB_PASSWORD=<from /root/trasealla-db-credentials.txt>

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>

# Production APIs
DUFFEL_API_KEY=duffel_live_...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🚨 **Common Issues**

### **Port Already in Use:**
```bash
lsof -i :5001
kill -9 <PID>
pm2 restart trasealla-backend
```

### **Database Connection Failed:**
```bash
mysql -u trasealla_user -p
# Check credentials in /root/trasealla-db-credentials.txt
```

### **Nginx Configuration Error:**
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

---

## 📊 **Monitoring Commands**

```bash
# Application logs
pm2 logs trasealla-backend

# Server status
pm2 status
systemctl status nginx
systemctl status mysql

# System resources
df -h        # Disk space
free -h      # Memory
uptime       # Load average
```

---

## 🔐 **Security Checklist**

- [ ] Update all .env variables
- [ ] Secure MySQL (`mysql_secure_installation`)
- [ ] Configure firewall (`ufw enable`)
- [ ] Setup SSL certificate
- [ ] Change default passwords
- [ ] Restrict database user permissions

---

**Need detailed instructions? See `DEPLOYMENT_GUIDE.md`**

**Your backend is ready to deploy!** 🚀

