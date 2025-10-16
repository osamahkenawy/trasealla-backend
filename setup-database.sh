#!/bin/bash

# Database Setup Script
# Run this on the server after MySQL is installed

set -e

echo "🗄️ Setting up Trasealla Database..."

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

# Database configuration
DB_NAME="trasealla_db"
DB_USER="trasealla_user"
DB_PASS=$(openssl rand -base64 32)

print_info "Database Name: $DB_NAME"
print_info "Database User: $DB_USER"
print_info "Database Password: $DB_PASS"
echo ""

# Create database and user
print_info "Creating database and user..."
mysql -u root << MYSQL_SCRIPT
-- Create database
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';

-- Grant privileges
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;

-- Show databases
SHOW DATABASES;
MYSQL_SCRIPT

print_success "Database created"

# Save credentials to file
print_info "Saving credentials..."
cat > /root/trasealla-db-credentials.txt << EOF
Database Configuration
=====================
Database Name: ${DB_NAME}
Database User: ${DB_USER}
Database Password: ${DB_PASS}
Database Host: localhost
Database Port: 3306

Add these to your .env file:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
EOF

chmod 600 /root/trasealla-db-credentials.txt
print_success "Credentials saved to /root/trasealla-db-credentials.txt"

# Test connection
print_info "Testing database connection..."
mysql -u ${DB_USER} -p${DB_PASS} -e "SELECT 'Connection successful!' AS status;"
print_success "Database connection successful"

print_success "Database setup completed!"
echo ""
print_info "IMPORTANT: Update your .env file with these credentials!"
echo ""
cat /root/trasealla-db-credentials.txt

