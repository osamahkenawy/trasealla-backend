# Trasealla Backend API

Backend API for Trasealla Travel Agency built with Express.js and MySQL.

## 🚀 Features

### Core Services
- **User Authentication & Authorization** - JWT-based auth with role-based access (customer, admin, agent)
- **Destination Management** - CRUD operations for travel destinations with images and metadata
- **Tour Package Management** - Complete tour management system with itineraries and pricing
- **Flight Search & Booking** - Flight search and booking capabilities with multiple airlines
- **Hotel Search & Booking** - Hotel listings with room types, amenities, and availability
- **Activity Management** - Travel activities and experiences with booking

### Booking & Payment
- **Unified Booking System** - Consolidated booking management for tours, flights, hotels, and activities
- **Payment Processing** - Secure payment handling with multiple payment methods
- **Booking Tracking** - Real-time booking status and history

### Additional Services
- **Visa Services** - Visa application, document upload, and tracking
- **Review System** - User reviews and ratings for tours, activities, destinations, and hotels
- **Contact Management** - Contact form with inquiry tracking and admin responses
- **Newsletter** - Email subscription management with preferences
- **Content Management** - Blog posts, team profiles, and testimonials

### Admin Features
- **Dashboard Analytics** - Statistics for bookings, contacts, and newsletters
- **User Management** - Manage users and roles
- **Content Moderation** - Review approval and response system
- **Inquiry Management** - Track and respond to customer inquiries

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trasealla/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=trasealla_db
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE trasealla_db;
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints Summary

### Authentication (`/api/auth`)
- Register, Login, Profile Management, Password Change, Token Refresh

### Destinations (`/api/destinations`)
- Browse, Search, Create, Update, Delete destinations

### Tours (`/api/tours`)
- Browse, Search, Featured, Popular, Create, Update, Delete tours

### Flights (`/api/flights`)
- Search flights, Flight details, Book flights

### Hotels (`/api/hotels`)
- Browse, Search, Room availability, Book hotels

### Activities (`/api/activities`)
- Browse, Search, Book activities

### Bookings (`/api/bookings`)
- View bookings, Create booking, Cancel booking, Booking history

### Payments (`/api/payments`)
- Create payment intent, Confirm payment, Payment history

### Visa Services (`/api/visas`)
- Visa requirements, Apply for visa, Track applications

### Reviews (`/api/reviews`)
- View reviews, Create review, Update/Delete review, Mark helpful

### Contact (`/api/contact`)
- Submit inquiry, View contacts (Admin), Respond to inquiries (Admin)

### Newsletter (`/api/newsletter`)
- Subscribe, Unsubscribe, View subscribers (Admin), Statistics (Admin)

### Content (`/api/content`)
- Blog posts, Team members, Testimonials

**📖 For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

The backend includes **14 comprehensive database models**:

### Core Models
- **Users** - Authentication, profiles, roles (customer/admin/agent)
- **Destinations** - Travel destinations with images and metadata
- **Tours** - Tour packages with itineraries and pricing
- **Activities** - Activities and experiences linked to destinations
- **Flights** - Flight information with multiple airlines
- **Hotels** - Hotel listings with rooms and amenities

### Transaction Models
- **Bookings** - Unified booking system for all services
- **Payments** - Payment transactions and history

### Engagement Models
- **Reviews** - User reviews and ratings (5-star system)
- **VisaApplications** - Visa applications with document tracking
- **Contact** - Contact form submissions and inquiries
- **Newsletter** - Email subscription management
- **Blog** - Blog posts and articles

All models include:
- Automatic timestamps (createdAt, updatedAt)
- Proper relationships and foreign keys
- Database indexes for performance
- Data validation at model level

## 🧪 Testing

```bash
npm test
```

## 📝 API Documentation

API documentation will be available at `/api-docs` when Swagger is implemented.

## 🚀 Deployment

1. Set `NODE_ENV=production` in your environment variables
2. Ensure your MySQL database is properly configured
3. Use a process manager like PM2 for production
4. Set up reverse proxy with Nginx
5. Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
