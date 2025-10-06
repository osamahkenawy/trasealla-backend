# Trasealla Backend - Complete Setup Guide

Step-by-step guide to set up and run the Trasealla Travel Agency backend.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## 🚀 Quick Start

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trasealla_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_change_this_in_production
JWT_REFRESH_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email Configuration (Optional - for sending emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Payment Gateway (Optional - for later implementation)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Set Up MySQL Database

Open MySQL and create the database:

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE trasealla_db;

# Verify database was created
SHOW DATABASES;

# Exit MySQL
EXIT;
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Database connected successfully
🔄 Database synchronized
🚀 Server running on port 5000
📊 Environment: development
🌐 Health check: http://localhost:5000/health
```

### 6. Test the API

Open your browser or use a tool like Postman/Thunder Client:

```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "success",
  "message": "Trasealla API is running",
  "timestamp": "2024-03-20T10:30:00.000Z"
}
```

## 📊 Database Models

The backend includes the following database models:

### Core Models
- **User** - User authentication and profiles
- **Destination** - Travel destinations
- **Tour** - Tour packages
- **Activity** - Activities and experiences
- **Flight** - Flight information
- **Hotel** - Hotel listings

### Booking & Payment Models
- **Booking** - Unified booking system
- **Payment** - Payment transactions

### Additional Models
- **Review** - User reviews and ratings
- **VisaApplication** - Visa applications
- **Contact** - Contact form submissions
- **Newsletter** - Newsletter subscriptions
- **Blog** - Blog posts and articles

## 🔐 Default User Roles

The system supports three user roles:

1. **customer** - Regular users (default)
2. **agent** - Travel agents
3. **admin** - System administrators

## 🛣 API Routes Overview

### Public Routes (No authentication required)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/destinations` - Browse destinations
- `GET /api/tours` - Browse tours
- `GET /api/flights/search` - Search flights
- `GET /api/hotels` - Browse hotels
- `GET /api/activities` - Browse activities
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `GET /api/content/blog` - Browse blog posts

### Protected Routes (Authentication required)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `GET /api/bookings` - User's bookings
- `POST /api/bookings` - Create booking
- `POST /api/reviews` - Create review
- `POST /api/visas/apply` - Apply for visa

### Admin/Agent Routes (Special permissions)
- `POST /api/destinations` - Create destination
- `POST /api/tours` - Create tour
- `POST /api/hotels` - Create hotel
- `GET /api/contact` - View all contacts
- `GET /api/newsletter/subscribers` - View subscribers

## 🧪 Testing the API

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Save the token from the response!

### 3. Get Current User (using token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Submit Contact Form

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Tour Inquiry",
    "message": "I would like to know more about Paris tours"
  }'
```

### 5. Subscribe to Newsletter

```bash
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "name": "Newsletter Reader"
  }'
```

## 🔧 Common Issues & Solutions

### Issue: Database Connection Failed

**Solution:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check database credentials in `.env` file
3. Ensure database exists: `SHOW DATABASES;`
4. Check MySQL port (default: 3306)

### Issue: Port Already in Use

**Solution:**
1. Change PORT in `.env` file
2. Or kill process using port 5000:
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: JWT Token Errors

**Solution:**
1. Ensure JWT_SECRET is set in `.env`
2. Token must be sent as: `Authorization: Bearer <token>`
3. Check token expiration

### Issue: Validation Errors

**Solution:**
- Check API documentation for required fields
- Ensure data types match (string, number, date)
- Email must be valid format
- Password must meet requirements (min 6 chars, uppercase, lowercase, number)

## 📚 Next Steps

### Implement Controllers

The route files are set up, but you need to implement the full controllers for:

1. **Destinations Controller** - CRUD operations for destinations
2. **Tours Controller** - Tour management and search
3. **Activities Controller** - Activity management
4. **Bookings Controller** - Complete booking workflow
5. **Payments Controller** - Payment processing
6. **Reviews Controller** - Review management
7. **Visas Controller** - Visa application workflow
8. **Hotels Controller** - Hotel search and booking
9. **Flights Controller** - Flight search integration

### Add External Integrations

- **Payment Gateway**: Stripe, PayPal
- **Email Service**: SendGrid, AWS SES, Mailgun
- **Flight API**: Amadeus, Skyscanner
- **Hotel API**: Booking.com, Hotels.com
- **Map Service**: Google Maps, Mapbox
- **SMS Service**: Twilio (for notifications)

### Enhance Security

- Add rate limiting per user
- Implement email verification
- Add two-factor authentication
- Set up API key authentication for mobile apps
- Add request logging and monitoring

### Performance Optimization

- Implement Redis caching
- Add database query optimization
- Set up CDN for static files
- Implement pagination everywhere
- Add database indexes

### Documentation

- Add Swagger/OpenAPI documentation
- Create Postman collection
- Write unit tests
- Set up CI/CD pipeline

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Best Practices](https://jwt.io/introduction)
- [REST API Design](https://restfulapi.net/)

## 🤝 Support

For help and support:
- Email: support@trasealla.com
- Documentation: See `API_DOCUMENTATION.md`
- Issues: Create an issue in the repository

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🚀**
