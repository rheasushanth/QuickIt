# QuickIT E-Commerce Platform

A modern, full-stack e-commerce application built with **React**, **Node.js**, **Express**, and **MongoDB**. QuickIT provides a seamless online shopping experience with features like product browsing, cart management, secure checkout, and order tracking.

<img width="1896" height="989" alt="image" src="https://github.com/user-attachments/assets/2da2fd3b-c161-4225-ba03-b5d242a9b8b3" />

<img width="1888" height="976" alt="image" src="https://github.com/user-attachments/assets/c6754e52-a48d-4404-aeea-6bb2c1dc307b" />


---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Features in Detail](#-features-in-detail)
- [Screenshots](#-screenshots)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🛍️ Customer Features
- **Product Browsing**
  - Browse products by categories (Laptops, Smartphones, Tablets, etc.)
  - View product details with images, descriptions, and specifications
  - See similar product recommendations
  - Search products by name or description
  - Filter products by category and subcategory
 
    

- **Shopping Cart**
  - Add/remove items with real-time price updates
  - Adjust quantities directly in cart
  - Persistent cart (saved to database for logged-in users)
  - View cart summary with total amount
  - Quick cart popup for easy access
 
    <img width="1904" height="994" alt="image" src="https://github.com/user-attachments/assets/0c383475-aee3-4cf2-a404-c72b8f1a1f79" />


- **User Authentication**
  - Secure registration with email and password
  - Login with JWT token-based authentication
  - Automatic token refresh for seamless experience
  - Protected routes for authenticated users
  - Secure logout functionality

- **Checkout & Orders**
  - Multi-step checkout process
  - Address management (add/edit delivery addresses)
  - Multiple payment method options
  - Order confirmation with unique order ID
  - Order history with status tracking
  - Cancel orders (before confirmation)
  - View detailed order information

- **User Profile**
  - Manage personal information
  - Save multiple delivery addresses
  - View order history
  - Track order status

### 🔐 Admin Features
- **Product Management**
  - Add new products with images and specifications
  - Edit existing product details
  - Delete products from inventory
  - Manage product categories and subcategories
  <img width="1916" height="807" alt="image" src="https://github.com/user-attachments/assets/e54120c5-ac01-43b4-9304-49db6ae7fd97" />


- **Category Management**
  - Create new categories
  - Add subcategories under main categories
  - Edit/delete categories
  - Organize product hierarchy

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Navigation and routing
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling with responsive design
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie handling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Choose one option:
  - Local installation - [Download here](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (Cloud) - [Sign up here](https://www.mongodb.com/atlas)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

---


## 📁 Project Structure

```
QuickIT--main2/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── controllers/
│   │   ├── userController.js        # User auth logic
│   │   ├── productController.js     # Product CRUD operations
│   │   ├── cartController.js        # Cart management
│   │   ├── orderController.js       # Order processing
│   │   ├── categoryController.js    # Category management
│   │   └── subcategoryController.js # Subcategory management
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   │
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Product.js               # Product schema
│   │   ├── Category.js              # Category schema
│   │   ├── Subcategory.js           # Subcategory schema
│   │   ├── Cart.js                  # Cart schema
│   │   └── Order.js                 # Order schema
│   │
│   ├── routes/
│   │   ├── userRoutes.js            # User API routes
│   │   ├── productRoutes.js         # Product API routes
│   │   ├── cartRoutes.js            # Cart API routes
│   │   ├── orderRoutes.js           # Order API routes
│   │   ├── categoryRoutes.js        # Category API routes
│   │   └── subcategoryRoutes.js     # Subcategory API routes
│   │
│   ├── services/
│   │   └── emailService.js          # Email notification service
│   │
│   ├── data/
│   │   └── seedData.js              # Sample data for seeding
│   │
│   ├── seedDatabase.js              # Database seeding script
│   ├── seedAllProducts.js           # Comprehensive product seeder
│   ├── server.js                    # Express app setup
│   ├── package.json
│   └── .env                         # Environment variables
│
└── frontend/
    ├── public/
    │   └── assets/                  # Product images and icons
    │
    ├── src/
    │   ├── components/
    │   │   ├── Navbar/              # Navigation bar
    │   │   ├── Header/              # Page header
    │   │   ├── ExploreCategories/   # Category display
    │   │   ├── ProductDisplay/      # Product grid
    │   │   ├── LoginPopup/          # Authentication modal
    │   │   ├── CartPopup/           # Cart sidebar
    │   │   └── Footer/              # Page footer
    │   │
    │   ├── Context/
    │   │   └── StoreContext.jsx     # Global state management
    │   │
    │   ├── pages/
    │   │   ├── Home/                # Homepage
    │   │   ├── ProductDetail/       # Product detail page
    │   │   ├── Cart/                # Shopping cart
    │   │   ├── Payment/             # Payment method selection
    │   │   ├── PlaceOrder/          # Order placement
    │   │   ├── MyOrders/            # Order history
    │   │   ├── Address/             # Address management
    │   │   └── Admin/               # Admin dashboard
    │   │       ├── AdminPanel.jsx
    │   │       └── ProductManagement/
    │   │
    │   ├── assets/                  # Static assets
    │   ├── App.jsx                  # Main app component
    │   ├── main.jsx                 # App entry point
    │   └── index.css                # Global styles
    │
    ├── package.json
    └── vite.config.js               # Vite configuration
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "user": { "id", "name", "email" },
  "accessToken": "jwt_token_here"
}
```

#### Logout User
```http
POST /api/users/logout
Cookie: refreshToken=<token>
```

#### Refresh Access Token
```http
POST /api/users/refresh-token
Cookie: refreshToken=<token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products
Query Parameters:
  - category (optional): Filter by category
  - subcategory (optional): Filter by subcategory
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Get Similar Products
```http
GET /api/products/:id/similar
```

#### Search Products
```http
GET /api/products/search?q=laptop
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 999.99,
  "category": "category_id",
  "subcategory": "subcategory_id",
  "image": "image_url",
  "stock": 50
}
```

### Cart Endpoints (Protected)

#### Get User Cart
```http
GET /api/cart
Authorization: Bearer <access_token>
```

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 1
}
```

#### Update Cart Item
```http
PUT /api/cart/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

#### Remove from Cart
```http
DELETE /api/cart/remove/:productId
Authorization: Bearer <access_token>
```

### Order Endpoints (Protected)

#### Create Order
```http
POST /api/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country",
    "phone": "1234567890"
  },
  "paymentMethod": "COD"
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <access_token>
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <access_token>
```

#### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <access_token>
```

---

## 🖼️ Screenshots

### Homepage
- Hero section with featured products
- Category navigation
- Product grid with filters

### Product Detail Page
- Large product images
- Detailed specifications
- Similar product recommendations
- Add to cart button

### Shopping Cart
- Cart items with quantities
- Price breakdown
- Proceed to checkout

### Checkout Flow
- Address form
- Payment method selection
- Order review

### My Orders
- Order list with status
- Order details view
- Cancel order option

---

## 🧪 Testing the Application

### 1. User Registration & Login
```
1. Click "Sign In" button in navbar
2. Click "Create Account" in popup
3. Fill registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
4. Click "Create Account"
5. Login with same credentials
```

### 2. Browse Products
```
1. View products on homepage
2. Click on category to filter
3. Click on product card to view details
4. See similar products at bottom
```

### 3. Shopping Cart
```
1. Click "Add to Cart" on product detail page
2. Click cart icon in navbar to view cart popup
3. Adjust quantities using +/- buttons
4. Click "View Cart" to see full cart page
5. Click "Remove" to delete items
```

### 4. Place Order
```
1. From cart page, click "Proceed to Checkout"
2. Fill delivery address form
3. Click "Proceed to Payment"
4. Select payment method
5. Click "Proceed to Place Order"
6. Review order details
7. Click "Place Order"
8. View order confirmation
```

### 5. View Orders
```
1. Click "My Orders" in navbar
2. View list of all orders
3. Click on order to see details
4. Cancel order if status is "Pending"
```

### 6. Admin Features (if admin user)
```
1. Navigate to /admin route
2. Add new product with details
3. Create categories/subcategories
4. Edit existing products
5. Delete products
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** `MongoNetworkError: failed to connect to server`
```
Solutions:
1. Check if MongoDB service is running:
   - Windows: net start MongoDB
   - Mac/Linux: sudo systemctl start mongod

2. Verify MONGODB_URI in .env file

3. For MongoDB Atlas:
   - Check IP whitelist
   - Verify username/password in connection string
   - Ensure cluster is active
```

### CORS Errors

**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`
```
Solutions:
1. Ensure backend is running on port 5000
2. Check CORS configuration in server.js:
   cors({
     origin: 'http://localhost:5173',
     credentials: true
   })
3. Verify frontend is making requests to correct backend URL
```

### JWT Authentication Errors

**Problem:** `Invalid token` or `Token expired`
```
Solutions:
1. Clear browser cookies
2. Logout and login again
3. Check JWT_SECRET in .env matches
4. Ensure tokens are being sent with requests
5. Verify token expiry times in .env
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID_NUMBER> /F

# Or change PORT in .env file
PORT=5001
```

### Frontend Build Issues

**Problem:** `Module not found` or dependency errors
```powershell
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
npm install
```

### Cart Not Persisting

**Problem:** Cart items disappear after page refresh
```
Solutions:
1. Ensure user is logged in (check auth token)
2. Check browser console for API errors
3. Verify cart API is working:
   GET http://localhost:5000/api/cart
4. Check MongoDB for cart collection
```

### Images Not Loading

**Problem:** Product images showing broken
```
Solutions:
1. Check image paths in public/assets folder
2. Verify image URLs in database
3. Ensure frontend public folder is correctly configured
4. Check Vite static asset serving
```

### Seeding Database Fails

**Problem:** Error running `npm run seed`
```
Solutions:
1. Ensure MongoDB is connected
2. Check if collections already exist (drop them)
3. Verify seedData.js file exists
4. Check for duplicate key errors
```

---

## 🚀 Deployment

### Backend Deployment (Heroku/Render)
```powershell
# Install Heroku CLI
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
heroku create quickit-backend
git push heroku main
heroku config:set MONGODB_URI=your_atlas_uri
heroku config:set JWT_SECRET=your_secret
```

### Frontend Deployment (Vercel/Netlify)
```powershell
# Build frontend
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

---

## 📝 Environment Variables Reference

### Backend .env
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/quickit
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickit

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_REFRESH_SECRET=different_refresh_secret_also_32_characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Configuration (for future email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Admin Configuration
ADMIN_EMAIL=admin@quickit.com
ADMIN_PASSWORD=admin123456
```

---

## 🎉 You're All Set!

Your QuickIT e-commerce platform is now fully set up and ready to use! 

### What's Included:
✅ Complete user authentication with JWT
✅ Product browsing with categories
✅ Shopping cart functionality
✅ Full checkout process
✅ Order management system
✅ Admin dashboard for product management
✅ Responsive design for all devices
✅ Secure API with protected routes

### Next Steps:
1. Customize the design and branding
2. Add more product categories
3. Integrate real payment gateway
4. Set up email notifications
5. Add product reviews and ratings
6. Implement wishlist feature
7. Add advanced filters and sorting

Happy coding! 🚀🛍️
