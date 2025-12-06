# QuickIT E-Commerce Platform Setup Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local installation or MongoDB Atlas)
- Git

### MongoDB Setup Options

#### Option 1: MongoDB Atlas (Recommended - Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Whitelist your IP address
6. Get your connection string
7. Replace `MONGODB_URI` in `.env` with your Atlas connection string

#### Option 2: Local MongoDB Installation
```powershell
# Using Chocolatey (Windows)
choco install mongodb

# Or download from mongodb.com/try/download/community
# Start MongoDB service
net start MongoDB
```

#### Option 3: Docker MongoDB
```powershell
docker run -d -p 27017:27017 --name quickit-mongo mongo:latest
```

### 🛠️ Installation Steps

#### 1. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and update values
# Update MongoDB URI, JWT secrets, etc.

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

#### 2. Frontend Setup
```powershell
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

### 📋 Environment Configuration

#### Backend (.env file)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickit
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/quickit
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_different_from_above
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 🎯 Package.json Scripts

#### Backend Scripts
Add these to your backend package.json:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seedDatabase.js"
  }
}
```

### 🌐 Running the Application

1. **Start Backend**: 
   ```powershell
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

2. **Start Frontend**: 
   ```powershell
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### 🔧 API Endpoints

#### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `POST /api/users/refresh-token` - Refresh access token

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/similar` - Get similar products
- `GET /api/products/search?q=query` - Search products

#### Cart (Protected routes)
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove item from cart

#### Orders (Protected routes)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order

### 🎨 Features Implemented

#### Frontend Features
✅ **Product Listing**: Display products by category
✅ **Product Detail Page**: Individual product view with similar products
✅ **Shopping Cart**: Add/remove items, quantity management
✅ **Checkout Flow**: Address form, payment method selection
✅ **Order Management**: View order history and status
✅ **User Authentication**: Login/signup with JWT
✅ **Responsive Design**: Mobile-friendly interface

#### Backend Features
✅ **RESTful APIs**: Complete CRUD operations
✅ **JWT Authentication**: Access & refresh tokens
✅ **MongoDB Integration**: User, Product, Cart, Order models
✅ **Order Management**: Status tracking, cancellation
✅ **Search & Filtering**: Product search and category filtering
✅ **Cart Management**: Persistent cart across sessions

### 🧪 Testing the Application

1. **Register a new user** via the Sign In button
2. **Browse products** on the home page
3. **Click on a product** to view details and similar products
4. **Add items to cart** and view cart
5. **Proceed to checkout** and place an order
6. **View your orders** in the My Orders section

### 🐛 Troubleshooting

#### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - For Atlas: verify IP whitelist and credentials

2. **CORS Errors**
   - Backend CORS is configured for frontend
   - Ensure backend is running on port 5000

3. **JWT Errors**
   - Generate secure JWT secrets (at least 32 characters)
   - Ensure JWT_SECRET and JWT_REFRESH_SECRET are different

4. **Port Already in Use**
   ```powershell
   # Kill process on port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

### 📱 Next Steps for Production

1. **Environment Setup**
   - Use production MongoDB cluster
   - Generate secure JWT secrets
   - Set up proper CORS origins

2. **Security Enhancements**
   - Add rate limiting
   - Implement input validation
   - Add HTTPS

3. **Additional Features**
   - Payment gateway integration
   - Email notifications
   - Real-time order tracking
   - Admin dashboard

### 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure both frontend and backend are running
4. Check MongoDB connection

### 🎉 You're All Set!

Your QuickIT e-commerce platform is now ready! The application includes:
- Complete user authentication
- Product browsing with similar product recommendations
- Shopping cart functionality
- Full checkout process
- Order management system

Happy coding! 🚀