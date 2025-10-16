# 🚀 Trasealla Backend Deployment Guide

Complete guide for deploying the Trasealla Backend to Hostinger VPS.

---

## 📋 **Prerequisites**

- Hostinger VPS server (Ubuntu 20.04/22.04)
- Root access: `root@72.61.177.109`
- Domain name: `api.trasealla.com` (pointed to server IP)
- GitHub repository for code
- SSL certificate (Let's Encrypt recommended)

---

## 🎯 **Deployment Overview**

1. **Server Setup** - Install Node.js, MySQL, Nginx, PM2
2. **Database Setup** - Create database and user
3. **Code Deployment** - Clone from GitHub
4. **Configuration** - Set environment variables
5. **Application Start** - Run with PM2
6. **Nginx Configuration** - Set up reverse proxy
7. **SSL Setup** - Configure HTTPS

---

## 📦 **Step 1: Initial Server Setup**

### **Connect to Server:**
```bash
ssh root@72.61.177.109
```

### **Upload Setup Script:**
```bash
# From your local machine
scp setup-server.sh root@72.61.177.109:/root/
scp setup-database.sh root@72.61.177.109:/root/
```

### **Run Server Setup:**
```bash
# On the server
cd /root
chmod +x setup-server.sh
bash setup-server.sh
```

This will install:
- ✅ Node.js 18.x
- ✅ MySQL Server
- ✅ Nginx
- ✅ PM2
- ✅ Git

---

## 🗄️ **Step 2: Database Setup**

### **Secure MySQL:**
```bash
mysql_secure_installation
```

Answer:
- Set root password: **YES**
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

### **Create Database:**
```bash
chmod +x setup-database.sh
bash setup-database.sh
```

This creates:
- Database: `trasealla_db`
- User: `trasealla_user`
- Password: (generated and saved)

**Save the credentials!** They're in `/root/trasealla-db-credentials.txt`

---

## 📂 **Step 3: Clone Repository**

### **Set up Git:**
```bash
cd /var/www/trasealla-backend

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy this key and add to GitHub Deploy Keys
```

### **Add Deploy Key to GitHub:**
1. Go to your repository on GitHub
2. Settings → Deploy Keys → Add deploy key
3. Paste the public key
4. Check "Allow write access"

### **Clone Repository:**
```bash
cd /var/www/trasealla-backend
git clone git@github.com:YOUR_USERNAME/trasealla-backend.git .
```

---

## ⚙️ **Step 4: Configure Environment**

### **Create .env File:**
```bash
cp env.production.example .env
nano .env
```

### **Update These Values:**
```env
# Database (from setup-database.sh output)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trasealla_db
DB_USER=trasealla_user
DB_PASSWORD=<from credentials file>

# JWT Secrets (generate secure random strings)
JWT_SECRET=<generate with: openssl rand -base64 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 64>

# Server
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://trasealla.com
BACKEND_URL=https://api.trasealla.com

# APIs
DUFFEL_API_KEY=<your production key>
AMADEUS_CLIENT_ID=<your production id>
AMADEUS_CLIENT_SECRET=<your production secret>

# Email
EMAIL_USER=<your email>
EMAIL_PASS=<app password>
```

### **Generate Secure Secrets:**
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate refresh secret
openssl rand -base64 64
```

---

## 📦 **Step 5: Install Dependencies**

```bash
cd /var/www/trasealla-backend
npm install --production
```

---

## 🗄️ **Step 6: Initialize Database**

### **Run Migrations:**
```bash
# If you have migration scripts
mysql -u trasealla_user -p trasealla_db < create-normalized-tables.sql
```

### **Create Admin User:**
```bash
node scripts/createAdmin.js
```

---

## 🚀 **Step 7: Start Application**

### **Start with PM2:**
```bash
cd /var/www/trasealla-backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **Check Status:**
```bash
pm2 status
pm2 logs trasealla-backend
```

---

## 🌐 **Step 8: Configure Nginx**

### **Copy Nginx Configuration:**
```bash
cp /var/www/trasealla-backend/nginx.conf /etc/nginx/sites-available/trasealla-backend
ln -s /etc/nginx/sites-available/trasealla-backend /etc/nginx/sites-enabled/
```

### **Test Configuration:**
```bash
nginx -t
```

### **Reload Nginx:**
```bash
systemctl reload nginx
```

---

## 🔒 **Step 9: Setup SSL Certificate**

### **Install Certbot:**
```bash
apt-get install -y certbot python3-certbot-nginx
```

### **Get Certificate:**
```bash
certbot --nginx -d api.trasealla.com
```

### **Test Auto-Renewal:**
```bash
certbot renew --dry-run
```

---

## 🔄 **Continuous Deployment**

### **Update ecosystem.config.js:**
Edit the deploy section with your repository URL:
```javascript
deploy: {
  production: {
    user: 'root',
    host: '72.61.177.109',
    ref: 'origin/main',
    repo: 'git@github.com:YOUR_USERNAME/trasealla-backend.git',
    path: '/var/www/trasealla-backend',
    'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
  }
}
```

### **From Local Machine:**
```bash
# Make deploy.sh executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

Or manually:
```bash
git push origin main
ssh root@72.61.177.109 "cd /var/www/trasealla-backend && git pull && npm install --production && pm2 reload ecosystem.config.js"
```

---

## 📊 **Monitoring**

### **PM2 Monitoring:**
```bash
# View logs
pm2 logs trasealla-backend

# Monitor resources
pm2 monit

# View status
pm2 status

# Restart
pm2 restart trasealla-backend

# Stop
pm2 stop trasealla-backend
```

### **Nginx Logs:**
```bash
# Access logs
tail -f /var/log/nginx/trasealla-backend-access.log

# Error logs
tail -f /var/log/nginx/trasealla-backend-error.log
```

---

## 🔧 **Maintenance**

### **Update Application:**
```bash
cd /var/www/trasealla-backend
git pull origin main
npm install --production
pm2 reload trasealla-backend
```

### **Database Backup:**
```bash
# Create backup
mysqldump -u trasealla_user -p trasealla_db > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u trasealla_user -p trasealla_db < backup_20250115.sql
```

### **Monitor Disk Space:**
```bash
df -h
du -sh /var/www/trasealla-backend/*
```

---

## 🚨 **Troubleshooting**

### **Application Won't Start:**
```bash
# Check PM2 logs
pm2 logs trasealla-backend --lines 100

# Check if port is in use
lsof -i :5001

# Test direct start
cd /var/www/trasealla-backend
node server.js
```

### **Database Connection Issues:**
```bash
# Test MySQL connection
mysql -u trasealla_user -p trasealla_db

# Check if MySQL is running
systemctl status mysql

# Restart MySQL
systemctl restart mysql
```

### **Nginx Issues:**
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### **SSL Certificate Issues:**
```bash
# Check certificate status
certbot certificates

# Renew manually
certbot renew

# Test renewal
certbot renew --dry-run
```

---

## 📋 **Checklist**

- [ ] Server setup completed
- [ ] MySQL installed and secured
- [ ] Database created with user
- [ ] Code cloned from GitHub
- [ ] .env file configured
- [ ] Dependencies installed
- [ ] Database initialized
- [ ] PM2 started and saved
- [ ] Nginx configured
- [ ] SSL certificate obtained
- [ ] Application accessible via HTTPS
- [ ] Admin user created
- [ ] Logs monitored

---

## 🔐 **Security Best Practices**

### **1. Firewall:**
```bash
ufw status
ufw enable
```

### **2. Fail2Ban (SSH Protection):**
```bash
apt-get install -y fail2ban
systemctl enable fail2ban
```

### **3. Regular Updates:**
```bash
apt-get update && apt-get upgrade -y
```

### **4. Secure .env:**
```bash
chmod 600 /var/www/trasealla-backend/.env
```

### **5. Database User Permissions:**
Only grant necessary permissions, never ALL on all databases.

---

## 📞 **Support Commands**

### **Health Check:**
```bash
curl https://api.trasealla.com/health
```

### **API Test:**
```bash
curl https://api.trasealla.com/api/auth/health
```

### **Full System Status:**
```bash
# Check all services
systemctl status nginx
systemctl status mysql
pm2 status

# Check disk space
df -h

# Check memory
free -h

# Check system load
uptime
```

---

## 🎯 **Production URLs**

- **API Base:** https://api.trasealla.com
- **Health Check:** https://api.trasealla.com/health
- **API Documentation:** https://api.trasealla.com/api-docs

---

**Your Trasealla Backend is now deployed and production-ready!** 🚀✨

