# 🔄 Backend Update Workflow

Simple guide to update your production backend from local changes.

---

## 🎯 **Three Methods to Deploy Updates**

---

## **Method 1: Automatic Deploy Script** ⭐ **Recommended**

### **From Your Local Mac:**

```bash
cd /Users/usama/Desktop/trasealla/trasealla/trasealla-backend

# Make sure deploy script is executable
chmod +x deploy.sh

# Deploy (automatically commits, pushes, and updates server)
./deploy.sh
```

**That's it!** The script will:
- ✅ Check for uncommitted changes
- ✅ Push to GitHub
- ✅ SSH to server
- ✅ Pull latest code
- ✅ Install dependencies
- ✅ Restart PM2

---

## **Method 2: Manual Git Workflow**

### **On Your Local Mac:**

```bash
cd /Users/usama/Desktop/trasealla/trasealla/trasealla-backend

# Step 1: Check status
git status

# Step 2: Add changes
git add .

# Step 3: Commit
git commit -m "Description of changes"

# Step 4: Push to GitHub
git push origin main
```

### **On Your Server:**

```bash
# Step 1: Navigate to backend
cd /var/www/trasealla/trasealla-backend

# Step 2: Pull latest code
git pull origin main

# Step 3: Install dependencies (if package.json changed)
npm install --production

# Step 4: Restart application
pm2 restart trasealla-backend

# Step 5: Check logs
pm2 logs trasealla-backend --lines 20
```

---

## **Method 3: One-Line SSH Command**

### **From Your Local Mac:**

```bash
# Push to GitHub first
git push origin main

# Then SSH and update in one command
ssh root@72.61.177.109 "cd /var/www/trasealla/trasealla-backend && git pull origin main && npm install --production && pm2 restart trasealla-backend"
```

---

## 📋 **Quick Reference Commands**

### **Local (Mac):**

```bash
# Quick commit and push
git add .
git commit -m "Update"
git push origin main

# Or use deploy script
./deploy.sh
```

### **Server:**

```bash
# Quick update
cd /var/www/trasealla/trasealla-backend
git pull && npm install --production && pm2 restart trasealla-backend

# Check status
pm2 status
pm2 logs trasealla-backend
```

---

## 🚀 **Recommended Workflow**

### **For Small Changes:**

```bash
# On Mac
git add .
git commit -m "Fix bug in flight controller"
git push

# One-line server update
ssh root@72.61.177.109 "cd /var/www/trasealla/trasealla-backend && git pull && pm2 restart trasealla-backend"
```

### **For Major Changes:**

```bash
# On Mac
./deploy.sh

# This handles everything automatically!
```

---

## ⚙️ **What Happens After Pull**

After pulling code, you usually need to:

1. **Always:** Restart PM2
   ```bash
   pm2 restart trasealla-backend
   ```

2. **If package.json changed:** Install dependencies
   ```bash
   npm install --production
   ```

3. **If database schema changed:** Run migrations
   ```bash
   node scripts/migrateDatabase.js
   ```

4. **If .env variables added:** Update .env
   ```bash
   nano .env
   # Add new variables
   ```

---

## 🔍 **Check Deployment Success**

```bash
# On server, check:
pm2 status
pm2 logs trasealla-backend --lines 20

# Test API
curl https://trasealla.com/health
curl https://trasealla.com/api/auth/health
```

---

## 🆘 **Troubleshooting**

### **If Pull Fails:**

```bash
# Stash local changes
git stash

# Pull
git pull origin main

# Apply stashed changes
git stash pop
```

### **If Application Won't Start:**

```bash
# Check logs
pm2 logs trasealla-backend --err --lines 50

# Check .env file
cat .env | grep DB_

# Test database connection
mysql -h 127.0.0.1 -u trasealla_user -p trasealla_db
```

### **If Dependencies Fail:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install --production
pm2 restart trasealla-backend
```

---

## 📊 **Monitoring After Update**

```bash
# Watch logs in real-time
pm2 logs trasealla-backend

# Monitor resources
pm2 monit

# Check status
pm2 status

# View nginx logs
tail -f /var/log/nginx/trasealla-error.log
```

---

## 🎯 **Complete Update Workflow**

### **Typical Update Process:**

```bash
# === ON LOCAL MAC ===
cd /Users/usama/Desktop/trasealla/trasealla/trasealla-backend

# 1. Make your code changes
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# 4. Deploy automatically
./deploy.sh

# === DONE! ===
```

The `deploy.sh` script handles everything on the server automatically!

---

## 📝 **Alternative: Create Update Alias**

Add this to your Mac's `~/.zshrc`:

```bash
alias deploy-trasealla="cd /Users/usama/Desktop/trasealla/trasealla/trasealla-backend && git add . && git commit -m 'Update' && git push && ./deploy.sh"
```

Then just run:
```bash
deploy-trasealla
```

---

## ✅ **Summary**

**Easiest Method:**
```bash
./deploy.sh
```

**Manual Method:**
```bash
# Mac
git push origin main

# Server
cd /var/www/trasealla/trasealla-backend
git pull && npm install --production && pm2 restart trasealla-backend
```

**One-Liner:**
```bash
git push && ssh root@72.61.177.109 "cd /var/www/trasealla/trasealla-backend && git pull && npm install --production && pm2 restart trasealla-backend"
```

---

**Use `./deploy.sh` for automatic deployment!** 🚀✨

Want to test it now? Make a small change and try deploying!
