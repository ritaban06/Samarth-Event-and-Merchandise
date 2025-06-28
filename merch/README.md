# Samarth Merchandise System

A complete merchandise management system with admin panel and customer-facing store.

## Project Structure

```
merch/
├── admin/          # Admin panel (React + Vite)
├── backend/        # Node.js backend API
└── client/         # Customer store (React + Vite)
```

## Features

### Customer Store (Client)
- Browse products by category
- Add items to cart with size/color variants
- User authentication (Google OAuth + email/password)
- Order management and tracking
- Secure payment processing with Razorpay

### Admin Panel
- Dashboard with sales statistics
- Product management (CRUD operations)
- Order management and status updates
- Google Sheets integration for order export
- Admin authentication

### Backend API
- RESTful API with Express.js
- MongoDB integration with Mongoose
- JWT authentication
- Razorpay payment integration
- Google Sheets API integration

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Cloud project (for OAuth and Sheets API)
- Razorpay account (for payments)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd merch/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the following variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `GOOGLE_CREDENTIALS`: Google service account credentials JSON
     - `GOOGLE_SHEETS_ID`: Target Google Sheets ID
     - `JWT_SECRET`: Secret for JWT token generation
     - `RPG_ID` & `RPG_SECRET`: Razorpay credentials
     - `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Admin login credentials

4. Seed sample data:
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm start
   ```

   Server will run on `http://localhost:5000`

### Client Setup

1. Navigate to client directory:
   ```bash
   cd merch/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update:
     - `VITE_API_URL`: Backend API URL (http://localhost:5000/api)
     - `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
     - `RPG_ID`: Razorpay key ID

4. Start the development server:
   ```bash
   npm run dev
   ```

   Client will run on `http://localhost:3000`

### Admin Panel Setup

1. Navigate to admin directory:
   ```bash
   cd merch/admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update:
     - `VITE_API_URL`: Backend API URL (http://localhost:5000/api)

4. Start the development server:
   ```bash
   npm run dev
   ```

   Admin panel will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/otp` - OTP verification

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user` - Get user orders
- `GET /api/orders/:id` - Get single order

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/orders` - Get all orders (admin)
- `PATCH /api/admin/orders/:id/status` - Update order status
- `POST /api/admin/sync-orders` - Export orders to Google Sheets

## Default Admin Credentials

- **Email**: admin@merchandise.com
- **Password**: (as set in your .env file)

## Technologies Used

### Frontend
- React 19
- Vite
- Material-UI
- Tailwind CSS
- Framer Motion
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Google APIs
- Razorpay integration

## Production Deployment

1. Build the applications:
   ```bash
   # Client
   cd merch/client && npm run build
   
   # Admin
   cd merch/admin && npm run build
   ```

2. Deploy backend to your preferred platform (Vercel, Heroku, etc.)
3. Deploy frontend builds to static hosting (Vercel, Netlify, etc.)
4. Update environment variables for production URLs

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.
