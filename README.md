# ✈️ Trasealla Backend API

Complete backend API for Trasealla travel booking platform with flight search, booking, and ticket generation.

---

## 🎯 **Features**

### **Flight Booking System**
- ✈️ **Flight Search** - Search flights from multiple providers (Duffel, Amadeus)
- 💰 **Price Confirmation** - Real-time price validation
- 🎫 **Booking Management** - Complete booking flow
- 📥 **Ticket Generation** - Custom PDF tickets
- 🎟️ **Real E-Tickets** - Official airline tickets from Duffel

### **User Management**
- 🔐 **Authentication** - JWT-based auth with refresh tokens
- 👥 **User Roles** - Admin, Agent, Customer
- 📧 **Email Notifications** - Booking confirmations
- 🔒 **RBAC** - Role-based access control

### **Additional Features**
- 🌐 **Airport Search** - Local DB + Duffel API integration
- 📊 **Booking Analytics** - Stats and reporting
- 🔄 **Order Changes** - Modify bookings
- 💸 **Refunds** - Handle cancellations
- 🎒 **Ancillary Services** - Baggage, meals, etc.

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn

### **Installation**

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/trasealla-backend.git
cd trasealla-backend

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your configuration

# Setup database
mysql -u root -p < create-normalized-tables.sql
node scripts/createAdmin.js

# Start development server
npm run dev
```

---

## 📁 **Project Structure**

```
trasealla-backend/
├── config/           # Configuration files
│   ├── database.js   # Database connection
│   ├── duffel.js     # Duffel API config
│   └── amadeus.js    # Amadeus API config
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/           # Sequelize models
├── routes/           # API routes
├── services/         # Business logic
│   ├── providers/    # Flight provider integrations
│   └── payments/     # Payment providers
├── utils/            # Utility functions
├── scripts/          # Database & setup scripts
└── server.js         # Entry point
```

---

## 🔧 **Configuration**

### **Environment Variables**

See `env.example` for all available options.

**Essential Variables:**
```env
# Database
DB_HOST=localhost
DB_NAME=trasealla_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# APIs
DUFFEL_API_KEY=duffel_test_...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
```

---

## 📚 **API Documentation**

### **Base URL**
```
Development: http://localhost:5001
Production: https://api.trasealla.com
```

### **Authentication**
```http
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

### **Flight Booking Flow**
```http
# 1. Search flights
GET /api/flights/search?origin=JFK&destination=DXB&departureDate=2025-12-15

# 2. Confirm price
POST /api/flights/confirm-price

# 3. Book flight
POST /api/flights/create-order

# 4. Download ticket
GET /api/flights/orders/{orderId}/ticket/download

# 5. Get Duffel e-ticket (for Duffel orders)
GET /api/flights/orders/{orderId}/duffel-eticket
```

### **Order Management**
```http
GET /api/flights/my-orders
GET /api/flights/orders/{orderId}
DELETE /api/flights/orders/{orderId}
```

### **Additional Services**
```http
# Ancillary services
POST /api/flights/offers/services
POST /api/flights/orders/{orderId}/add-services

# Order changes
POST /api/flights/orders/{orderId}/change-options
POST /api/flights/orders/{orderId}/change

# Refunds
GET /api/flights/orders/{orderId}/refund-quote
POST /api/flights/orders/{orderId}/refund
```

**Full API documentation available in Postman collection**

---

## 🚀 **Deployment**

### **Production Deployment**

See `DEPLOYMENT_GUIDE.md` for complete instructions.

**Quick Deploy:**
```bash
# 1. Setup server
bash setup-server.sh

# 2. Setup database
bash setup-database.sh

# 3. Deploy code
git clone <your-repo>
npm install --production
pm2 start ecosystem.config.js --env production
```

---

## 🧪 **Testing**

### **Postman Collection**
Import `Trasealla_Production_APIs.postman_collection.json` into Postman.

### **Test Endpoints**
```bash
# Health check
curl http://localhost:5001/health

# API test
curl http://localhost:5001/api/auth/health
```

---

## 📦 **Dependencies**

### **Core**
- Express.js - Web framework
- Sequelize - ORM
- MySQL2 - Database driver
- JWT - Authentication

### **Flight Providers**
- Duffel SDK - Modern flight booking
- Amadeus SDK - Traditional GDS

### **Utilities**
- PDFKit - Ticket generation
- Nodemailer - Email sending
- Multer - File uploads
- Axios - HTTP client

---

## 🔐 **Security**

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- SQL injection protection (Sequelize ORM)
- XSS protection
- Rate limiting
- CORS configuration
- Environment variable protection

---

## 📊 **Monitoring**

### **PM2 Commands**
```bash
pm2 status              # View status
pm2 logs trasealla-backend  # View logs
pm2 monit              # Monitor resources
pm2 restart trasealla-backend  # Restart app
```

### **Health Endpoints**
```http
GET /health            # Server health
GET /api/auth/health   # API health
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 **License**

This project is proprietary and confidential.

---

## 📞 **Support**

- **Email:** support@trasealla.com
- **Documentation:** See `DEPLOYMENT_GUIDE.md`
- **Issues:** GitHub Issues

---

## 🗺️ **Roadmap**

- [x] Flight search and booking
- [x] User authentication
- [x] Ticket generation
- [x] Real Duffel e-tickets
- [x] Order management
- [ ] Hotel booking integration
- [ ] Tours and activities
- [ ] Multi-currency support
- [ ] Mobile app API

---

## 🙏 **Acknowledgments**

- Duffel API for modern flight booking
- Amadeus for traditional GDS access
- Node.js community

---

**Built with ❤️ by Trasealla Team** ✈️🌍

