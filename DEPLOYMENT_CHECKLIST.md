# ✅ Deployment Checklist

Complete checklist for deploying Trasealla Backend to production.

---

## 📋 **Pre-Deployment**

### **Code Preparation**
- [ ] All code committed to Git
- [ ] Tests passing
- [ ] No console.log statements in production code
- [ ] Environment variables documented
- [ ] API keys secured (not in code)
- [ ] .gitignore properly configured
- [ ] README.md updated

### **Configuration Files**
- [ ] `ecosystem.config.js` - PM2 configuration
- [ ] `nginx.conf` - Nginx reverse proxy
- [ ] `env.production.example` - Environment template
- [ ] Deployment scripts executable

### **GitHub Setup**
- [ ] Repository created
- [ ] Code pushed to main branch
- [ ] Deploy keys added (if private repo)
- [ ] Repository URL updated in scripts

---

## 🖥️ **Server Setup**

### **Initial Access**
- [ ] SSH access to server (root@72.61.177.109)
- [ ] Root password secured
- [ ] SSH key authentication configured

### **System Installation**
- [ ] Run `setup-server.sh`
  - [ ] Node.js 18.x installed
  - [ ] MySQL Server installed
  - [ ] Nginx installed
  - [ ] PM2 installed globally
  - [ ] Git installed
  - [ ] Firewall configured

### **MySQL Configuration**
- [ ] Run `mysql_secure_installation`
- [ ] Root password set
- [ ] Anonymous users removed
- [ ] Test database removed

### **Database Setup**
- [ ] Run `setup-database.sh`
- [ ] Database `trasealla_db` created
- [ ] User `trasealla_user` created
- [ ] Credentials saved
- [ ] Connection tested

---

## 📦 **Application Deployment**

### **Code Deployment**
- [ ] Repository cloned to `/var/www/trasealla-backend`
- [ ] Correct branch checked out (main)
- [ ] Dependencies installed (`npm install --production`)
- [ ] Node modules present

### **Environment Configuration**
- [ ] `.env` file created from `env.production.example`
- [ ] Database credentials updated
- [ ] JWT secrets generated and set
- [ ] API keys configured:
  - [ ] DUFFEL_API_KEY (production)
  - [ ] AMADEUS credentials (production)
  - [ ] STRIPE keys (if using)
- [ ] Email configuration set
- [ ] FRONTEND_URL set correctly
- [ ] BACKEND_URL set correctly
- [ ] NODE_ENV=production

### **Database Initialization**
- [ ] Database schema created (`create-normalized-tables.sql`)
- [ ] Tables created successfully
- [ ] Admin user created (`node scripts/createAdmin.js`)
- [ ] Admin login tested

---

## 🚀 **Application Launch**

### **PM2 Setup**
- [ ] Application started (`pm2 start ecosystem.config.js --env production`)
- [ ] PM2 process running
- [ ] PM2 startup script configured (`pm2 startup`)
- [ ] PM2 configuration saved (`pm2 save`)
- [ ] Application accessible on port 5001

### **Application Health**
- [ ] Server responding (`curl http://localhost:5001/health`)
- [ ] API endpoints working
- [ ] Database connection successful
- [ ] Logs clean (no errors)

---

## 🌐 **Nginx Configuration**

### **Nginx Setup**
- [ ] Configuration copied to `/etc/nginx/sites-available/`
- [ ] Symbolic link created in `/etc/nginx/sites-enabled/`
- [ ] Configuration tested (`nginx -t`)
- [ ] Nginx reloaded (`systemctl reload nginx`)
- [ ] HTTP access working

### **Domain Configuration**
- [ ] Domain DNS pointing to server IP (72.61.177.109)
- [ ] A record for api.trasealla.com
- [ ] DNS propagation completed

---

## 🔒 **SSL Certificate**

### **Let's Encrypt**
- [ ] Certbot installed
- [ ] SSL certificate obtained (`certbot --nginx -d api.trasealla.com`)
- [ ] Certificate active
- [ ] HTTPS working
- [ ] HTTP to HTTPS redirect working
- [ ] Auto-renewal configured
- [ ] Auto-renewal tested (`certbot renew --dry-run`)

---

## 🔐 **Security**

### **Server Security**
- [ ] Firewall enabled (`ufw enable`)
- [ ] Only necessary ports open (22, 80, 443)
- [ ] Fail2Ban installed (optional but recommended)
- [ ] Regular security updates scheduled

### **Application Security**
- [ ] .env file permissions set (`chmod 600 .env`)
- [ ] Sensitive files not publicly accessible
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

### **Database Security**
- [ ] Database user has minimum required permissions
- [ ] No remote root access
- [ ] Strong passwords used
- [ ] Regular backups configured

---

## 📊 **Monitoring Setup**

### **Application Monitoring**
- [ ] PM2 monitoring working (`pm2 status`)
- [ ] Logs accessible (`pm2 logs`)
- [ ] Log rotation configured

### **Server Monitoring**
- [ ] Nginx logs accessible
- [ ] Error logs checked
- [ ] Disk space monitored
- [ ] Memory usage normal

### **Alerts** (Optional)
- [ ] Email alerts configured
- [ ] Uptime monitoring service (e.g., UptimeRobot)
- [ ] Error tracking (e.g., Sentry)

---

## 🧪 **Testing**

### **API Endpoints**
- [ ] Health check: `https://api.trasealla.com/health`
- [ ] Authentication: `POST /api/auth/login`
- [ ] Flight search: `GET /api/flights/search`
- [ ] Booking flow tested end-to-end
- [ ] Ticket download working
- [ ] All critical endpoints tested

### **Performance**
- [ ] Response times acceptable (< 500ms for most requests)
- [ ] No memory leaks
- [ ] CPU usage normal
- [ ] Database queries optimized

---

## 📝 **Documentation**

### **Internal Documentation**
- [ ] README.md updated
- [ ] DEPLOYMENT_GUIDE.md complete
- [ ] API endpoints documented
- [ ] Environment variables documented

### **External Documentation**
- [ ] API documentation accessible
- [ ] Postman collection updated
- [ ] Frontend integration guide available

---

## 🔄 **Backup & Recovery**

### **Backup Setup**
- [ ] Database backup script created
- [ ] Automated backups scheduled (daily recommended)
- [ ] Backup location secured
- [ ] Restore procedure tested

### **Recovery Plan**
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Contact information available

---

## 🎯 **Post-Deployment**

### **Immediate Actions**
- [ ] Monitor logs for 24 hours
- [ ] Check error rates
- [ ] Verify all features working
- [ ] Test from different networks

### **Within First Week**
- [ ] Monitor performance metrics
- [ ] Check backup success
- [ ] Review security logs
- [ ] User feedback collected

### **Ongoing**
- [ ] Regular security updates
- [ ] Performance optimization
- [ ] Feature enhancements
- [ ] Regular backups verified

---

## 🚨 **Emergency Contacts**

```
Server: root@72.61.177.109
Database: /root/trasealla-db-credentials.txt
Repository: [Your GitHub URL]
Support: [Your contact email]
```

---

## 📞 **Quick Commands**

```bash
# Application
pm2 status
pm2 logs trasealla-backend
pm2 restart trasealla-backend

# Services
systemctl status nginx
systemctl status mysql

# Deployment
cd /var/www/trasealla-backend
git pull
npm install --production
pm2 reload trasealla-backend

# Logs
tail -f /var/log/nginx/trasealla-backend-access.log
tail -f /var/log/nginx/trasealla-backend-error.log

# Database
mysql -u trasealla_user -p trasealla_db

# Backup
mysqldump -u trasealla_user -p trasealla_db > backup_$(date +%Y%m%d).sql
```

---

## ✅ **Deployment Complete**

Once all items are checked, your application is successfully deployed!

**Production URL:** https://api.trasealla.com

---

**Need help? See `DEPLOYMENT_GUIDE.md` for detailed instructions.**

