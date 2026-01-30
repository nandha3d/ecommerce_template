# SupplePro - Supplement E-commerce Platform

A full-featured, production-grade supplement e-commerce web application built with React (Vite) frontend and Laravel (PHP) backend.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse, search, and filter supplements
- **Product Details**: Detailed product pages with images, nutrition facts, reviews
- **Shopping Cart**: Add/remove items, apply coupons, quantity management
- **User Authentication**: Register, login, JWT-based authentication
- **Checkout**: Multi-step checkout with address management
- **Order Management**: View order history and track shipments
- **Wishlist**: Save favorite products

### Admin Features
- **Dashboard**: Sales analytics, revenue stats, top products
- **Product Management**: CRUD operations, variants, images
- **Order Management**: View, update status, process orders
- **Category & Brand Management**: Organize product catalog
- **Customer Management**: View customer details and orders
- **Coupon Management**: Create and manage discount codes

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Redux Toolkit** for state management
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hook Form + Zod** for form validation

### Backend
- **PHP 8.2+** with Laravel 10
- **MySQL 8** database
- **JWT Authentication** (tymon/jwt-auth)
- **Redis** for caching

### DevOps
- **Docker & Docker Compose** for containerization
- Optional Nginx for production

## 📁 Project Structure

```
supplement-ecommerce/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # UI & Layout components
│   │   ├── features/         # Feature modules (auth, products, cart, admin)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── store/            # Redux store & slices
│   │   ├── types/            # TypeScript type definitions
│   │   └── App.tsx           # Main app with routing
│   ├── Dockerfile
│   └── package.json
│
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/ # API Controllers
│   │   ├── Models/           # Eloquent Models
│   │   ├── Services/         # Business Logic
│   │   └── Repositories/     # Data Access
│   ├── database/migrations/  # Database schema
│   ├── routes/api.php        # API routes
│   ├── Dockerfile
│   └── composer.json
│
├── docker-compose.yml        # Docker orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PHP 8.2+ and Composer
- MySQL 8+ (or use Docker)
- Docker & Docker Compose (optional)

### Option 1: Docker Development (Recommended)

```bash
# Clone and start all services
cd supplement-ecommerce
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# phpMyAdmin: http://localhost:8080
```

### Option 2: Manual Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:5173
```

#### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve
# API at http://localhost:8000
```

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    # Register new user
POST   /api/v1/auth/login       # Login
POST   /api/v1/auth/logout      # Logout
POST   /api/v1/auth/refresh     # Refresh JWT token
GET    /api/v1/auth/me          # Get current user
```

### Products
```
GET    /api/v1/products              # List products (with filters)
GET    /api/v1/products/featured     # Featured products
GET    /api/v1/products/best-sellers # Best sellers
GET    /api/v1/products/{slug}       # Product details
GET    /api/v1/products/categories   # All categories
GET    /api/v1/products/brands       # All brands
```

### Cart
```
GET    /api/v1/cart              # Get cart
POST   /api/v1/cart/items        # Add item
PUT    /api/v1/cart/items/{id}   # Update quantity
DELETE /api/v1/cart/items/{id}   # Remove item
POST   /api/v1/cart/coupon       # Apply coupon
```

### Orders
```
GET    /api/v1/orders            # List user orders
POST   /api/v1/orders            # Create order
GET    /api/v1/orders/{id}       # Order details
POST   /api/v1/orders/{id}/cancel # Cancel order
```

## 🎨 Design System

The application uses a professional healthcare-inspired color palette:

- **Primary (Teal)**: Trust, health, professionalism
- **Secondary (Navy)**: Authority, stability
- **Accent (Orange)**: Energy, action, CTA buttons
- **Success/Warning/Danger**: Status indicators

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)
```
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:...

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=supplepro
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your-jwt-secret

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
php artisan test
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for fitness enthusiasts
