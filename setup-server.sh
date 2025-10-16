#!/bin/bash

# Server Setup Script for Hostinger VPS
# Run this script on the server: bash setup-server.sh

set -e

echo "🚀 Setting up Trasealla Backend on Hostinger VPS..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system
print_info "Updating system packages..."
apt-get update
apt-get upgrade -y
print_success "System updated"

# Install Node.js 18.x
print_info "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
print_success "Node.js installed: $(node --version)"
print_success "NPM installed: $(npm --version)"

# Install PM2 globally
print_info "Installing PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
print_success "PM2 installed"

# Install MySQL
print_info "Installing MySQL Server..."
apt-get install -y mysql-server
systemctl start mysql
systemctl enable mysql
print_success "MySQL installed and started"

# Install Nginx
print_info "Installing Nginx..."
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installed and started"

# Install Git
print_info "Installing Git..."
apt-get install -y git
print_success "Git installed: $(git --version)"

# Create application directory
print_info "Creating application directory..."
mkdir -p /var/www/trasealla-backend
mkdir -p /var/www/trasealla-backend/logs
mkdir -p /var/www/trasealla-backend/uploads
print_success "Directories created"

# Configure firewall
print_info "Configuring firewall..."
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw allow 5001/tcp # API (optional, if direct access needed)
print_success "Firewall configured"

# Set up log rotation
print_info "Setting up log rotation..."
cat > /etc/logrotate.d/trasealla-backend << 'EOF'
/var/www/trasealla-backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 root root
}
EOF
print_success "Log rotation configured"

print_success "Server setup completed!"
echo ""
print_info "Next steps:"
echo "1. Secure MySQL: mysql_secure_installation"
echo "2. Create database: bash setup-database.sh"
echo "3. Clone repository: cd /var/www/trasealla-backend && git clone YOUR_REPO ."
echo "4. Configure environment: cp env.production.example .env"
echo "5. Install dependencies: npm install --production"
echo "6. Start application: pm2 start ecosystem.config.js --env production"
echo "7. Configure Nginx: cp nginx.conf /etc/nginx/sites-available/trasealla-backend"

