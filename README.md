# 🛒 E-Commerce Engine

### Enterprise-Grade Supplement E-Commerce Platform

A **full-featured, production-ready** e-commerce web application built with **React (Vite)** frontend and **Laravel (PHP)** backend. Designed for supplement stores, health products, and fitness retailers with advanced product management, dynamic theming, and shared hosting compatibility.

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Laravel-10.x-FF2D20?logo=laravel" alt="Laravel 10" />
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php" alt="PHP 8.2+" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/License-Commercial-green" alt="License" />
</p>

---

## 📑 Table of Contents

1. [✨ Key Features](#-key-features)
2. [🖼️ Screenshots](#️-screenshots)
3. [🏗️ Architecture](#️-architecture)
4. [🛠️ Tech Stack](#️-tech-stack)
5. [📁 Project Structure](#-project-structure)
6. [🚀 Quick Start](#-quick-start)
7. [📡 API Reference](#-api-reference)
8. [🗄️ Database Schema](#️-database-schema)
9. [🎨 Theming System](#-theming-system)
10. [📐 Store Layout Variants](#-store-layout-variants)
11. [🔐 Authentication & Security](#-authentication--security)
12. [📦 Modular Architecture](#-modular-architecture)
13. [🌐 SEO Engine](#-seo-engine)
14. [☁️ Deployment](#️-deployment)
15. [⚙️ Configuration](#️-configuration)
16. [🧪 Testing](#-testing)
17. [🛣️ Roadmap](#️-roadmap)
18. [📄 License](#-license)

---

## ✨ Key Features

### 🛍️ Customer Storefront

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse, search, and filter products with advanced faceted filtering (category, brand, price range, attributes) |
| **Product Details** | Rich product pages with image galleries, zoom functionality, auto-rotating images, variant selectors, nutrition facts |
| **5 Layout Variants** | Choose from 5 different product page layouts including Amazon-style 3-column layout |
| **Shopping Cart** | Persistent cart with real-time quantity updates, coupon application, and price calculations |
| **Multi-Step Checkout** | Address management, shipping options, order review, and payment integration |
| **User Accounts** | Registration, login, profile management, address book, order history |
| **Wishlist** | Save favorite products for later purchase |
| **Reviews & Ratings** | Customer reviews with star ratings and helpful votes |
| **Responsive Design** | Fully responsive across desktop, tablet, and mobile devices |

### 🔧 Admin Panel

| Page | Functionality |
|------|--------------|
| **Dashboard** | Real-time analytics, revenue charts, top products, recent orders, customer insights |
| **Products** | Full CRUD with variants, attributes, image galleries, SEO fields, inventory tracking |
| **Categories** | Hierarchical category management with drag-and-drop ordering |
| **Attributes** | Create product attributes (Size, Color, Flavor) with visual swatches (image/color) |
| **Orders** | View, process, and fulfill orders with status management |
| **Customers** | Customer profiles, order history, activity tracking |
| **Settings** | Theme configuration, store settings, layout variants, currency options |
| **Modules** | Enable/disable feature modules dynamically |
| **License** | Commercial license activation and validation |
| **Analytics** | Detailed sales analytics and traffic reports |
| **Marketing** | Abandoned cart recovery, coupon management, tier pricing |
| **Security** | Fraud detection, payment velocity checks, security audit logs |

### 🚀 Advanced Commerce Features

- **Tiered Pricing**: Configure different price points based on customer groups or order volume.
- **Abandoned Cart Recovery**: Automatically track and recover lost sales with customizable email triggers.
- **Fraud Detection**: Built-in velocity checks and blocked entity management to prevent malicious activity.
- **Bundle & Add-ons**: Create complex product bundles and customizable add-on groups.
- **Digital Downloads**: Support for secure digital product delivery with download expiration.
- **Dynamic Pricing Rules**: A JSON-based engine to execute stackable marketing campaigns.

### 🎨 Advanced Theming

- **10+ Color Presets**: Ocean Blue, Forest Green, Sunset Orange, Dark Mode, and more
- **Independent Color & Layout**: Change colors without affecting layout preferences
- **Admin Theme Customization**: Full control over admin panel appearance
- **Storefront Primary Color**: Theme the storefront with your brand color
- **Dark Mode Support**: Complete dark mode with glassmorphism effects

### 📐 Store Layout System

Choose from **5 different layouts** for each page type:

| Page | Layout Options |
|------|---------------|
| **Home** | Hero carousel, featured products grid, category showcase |
| **Product Detail** | Standard 2-column, reversed, single column, gallery focus, **Amazon-style 3-column** |
| **Cart** | Compact, detailed, side-by-side |
| **Checkout** | Single page, multi-step, accordion |

### 🔌 Modular Monolith Architecture

Located in `/backend/core/`:

| Module | Description |
|--------|-------------|
| `Analytics` | Sales and traffic analytics tracking |
| `Cart` | Shopping cart with session & database persistence |
| `Inventory` | Stock tracking, reservation, and low-stock alerts |
| `Order` | Order lifecycle, status management, fulfillment |
| `Payment` | Payment gateway integrations with abstraction layer |
| `Pricing` | Dynamic pricing rules, discounts, and custom offer engine |
| `Product` | Product entity, variations, and complex media management |
| `System` | Core settings, feature flags, and license management |
| `User` | Customer profiles, addresses, and membership tiers |
| `Compliance` | Tax calculation (GST/VAT) and invoice auditing |

---

## 🖼️ Screenshots

> **Note**: Screenshots can be added here to showcase the application.

<details>
<summary>📸 Click to view screenshot placeholders</summary>

### Storefront
```
├── Home Page (Hero + Featured Products)
├── Product Listing (Grid with Filters)
├── Product Detail (Layout Variants 1-5)
├── Shopping Cart
├── Checkout Flow
└── User Account Pages
```

### Admin Panel
```
├── Dashboard (Analytics & Charts)
├── Product Management (Edit with Variants)
├── Order Management
├── Category Tree
├── Attribute & Swatch Editor
├── Theme Settings
└── Module Manager
```

</details>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐       ┌─────────────────────────────┐  │
│  │   React SPA (Vite)  │       │      Tailwind CSS           │  │
│  │   ├── Storefront    │       │   Design System + Themes    │  │
│  │   └── Admin Panel   │       └─────────────────────────────┘  │
│  └─────────────────────┘                                         │
└────────────────────▲────────────────────────────────────────────┘
                     │ HTTP/JSON API
┌────────────────────▼────────────────────────────────────────────┐
│                    LARAVEL BACKEND                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  API Controllers│  │   Middleware    │  │   Services      │  │
│  │  ├── Auth       │  │  ├── JWT Auth   │  │  ├── SEO        │  │
│  │  ├── Products   │  │  ├── CORS       │  │  ├── License    │  │
│  │  ├── Cart       │  │  └── Admin      │  │  └── Module     │  │
│  │  ├── Orders     │  └─────────────────┘  └─────────────────┘  │
│  │  └── Admin      │                                             │
│  └─────────────────┘                                             │
├─────────────────────────────────────────────────────────────────┤
│                    MODULAR CORE (/core/)                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │Analytics│ │  Cart   │ │Inventory│ │  Order  │ │ Payment │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Pricing │ │ Product │ │ System  │                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
├─────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                    │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │   Eloquent ORM      │  │          MySQL 8.x              │   │
│  │   Repositories      │  │   (or MariaDB / PostgreSQL)     │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library with hooks and functional components |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Vite** | 7.x | Fast development server and optimized builds |
| **Redux Toolkit** | 2.x | Global state management |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Axios** | 1.x | HTTP client for API calls |
| **React Hook Form** | 7.x | Form handling and validation |
| **Zod** | 3.x | Schema validation |
| **Lucide React** | - | Icon library |
| **React Hot Toast** | - | Toast notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **PHP** | 8.2+ | Server-side language |
| **Laravel** | 10.x | PHP framework |
| **MySQL** | 8.x | Primary database |
| **JWT Auth** | tymon/jwt-auth | Token-based authentication |
| **Livewire** | 3.x | Dynamic UI components (optional) |
| **Redis** | 7.x | Caching layer (optional) |

### DevOps & Tooling

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization (optional) |
| **Git** | Version control |
| **GitHub Actions** | CI/CD pipelines |
| **ESLint + Prettier** | Code quality |
| **PHPUnit** | Backend testing |
| **Vitest** | Frontend testing |

---

## 📁 Project Structure

```
supplement-ecommerce/
├── frontend/                          # React SPA Application
│   ├── src/
│   │   ├── components/                # Shared UI Components
│   │   │   ├── layout/                # Header, Footer, ProductCard, etc.
│   │   │   └── ui/                    # Button, Modal, Badge, Loader, etc.
│   │   │
│   │   ├── features/                  # Feature Modules (Domain-based)
│   │   │   ├── admin/                 # Admin Panel
│   │   │   │   ├── pages/             # Dashboard, Products, Orders, Settings...
│   │   │   │   ├── components/        # Admin-specific components
│   │   │   │   └── theme/             # AdminThemeProvider, themes.ts
│   │   │   ├── auth/                  # Authentication (Login, Register)
│   │   │   ├── cart/                  # Shopping Cart
│   │   │   ├── checkout/              # Checkout Flow
│   │   │   ├── orders/                # Order History
│   │   │   ├── products/              # Product Listing & Details
│   │   │   └── user/                  # User Account Pages
│   │   │
│   │   ├── core/                      # Core Utilities
│   │   │   └── config/                # ConfigContext, ConfigProvider
│   │   │
│   │   ├── hooks/                     # Custom React Hooks
│   │   │   ├── useRedux.ts            # Typed Redux hooks
│   │   │   └── useAuth.ts             # Authentication hook
│   │   │
│   │   ├── services/                  # API Service Layer
│   │   │   ├── api.ts                 # Axios instance with interceptors
│   │   │   ├── authService.ts         # Auth API calls
│   │   │   ├── productService.ts      # Product API calls
│   │   │   └── adminService.ts        # Admin API calls
│   │   │
│   │   ├── store/                     # Redux Store
│   │   │   ├── index.ts               # Store configuration
│   │   │   └── slices/                # Feature slices (auth, cart, products)
│   │   │
│   │   ├── storeLayout/               # Store Layout System
│   │   │   ├── StoreLayoutProvider.tsx
│   │   │   └── storeLayoutSettings.ts
│   │   │
│   │   ├── types/                     # TypeScript Definitions
│   │   │   └── index.ts               # All shared types
│   │   │
│   │   ├── utils/                     # Utility Functions
│   │   │   └── imageUtils.ts          # Image URL helpers
│   │   │
│   │   ├── App.tsx                    # Main App with Routing
│   │   └── main.tsx                   # Entry Point
│   │
│   ├── public/                        # Static Assets
│   ├── tailwind.config.js             # Tailwind Configuration
│   ├── vite.config.ts                 # Vite Configuration
│   ├── tsconfig.json                  # TypeScript Configuration
│   └── package.json
│
├── backend/                           # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Admin/             # Admin Controllers
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   └── AttributeController.php
│   │   │   │   ├── Api/               # API Controllers
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── CartController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   └── WishlistController.php
│   │   │   │   ├── MetaController.php # SEO Meta Rendering
│   │   │   │   └── SitemapController.php
│   │   │   │
│   │   │   └── Middleware/
│   │   │       ├── JwtMiddleware.php
│   │   │       └── AdminMiddleware.php
│   │   │
│   │   ├── Models/                    # Eloquent Models
│   │   │   ├── User.php
│   │   │   ├── Product.php
│   │   │   ├── ProductVariant.php
│   │   │   ├── ProductAttribute.php
│   │   │   ├── Category.php
│   │   │   ├── Brand.php
│   │   │   ├── Order.php
│   │   │   ├── OrderItem.php
│   │   │   ├── Cart.php
│   │   │   ├── CartItem.php
│   │   │   └── Review.php
│   │   │
│   │   ├── Services/                  # Business Logic Services
│   │   │   ├── Seo/                   # SEO Services
│   │   │   │   ├── SeoEscaper.php
│   │   │   │   ├── MetaBuilder.php
│   │   │   │   ├── SchemaBuilder.php
│   │   │   │   ├── HtmlInjector.php
│   │   │   │   └── SeoRenderer.php
│   │   │   ├── LicenseManager.php
│   │   │   └── ModuleManager.php
│   │   │
│   │   └── Repositories/              # Data Access Layer
│   │       ├── ProductRepository.php
│   │       └── OrderRepository.php
│   │
│   ├── core/                          # Modular Monolith Core
│   │   ├── Analytics/                 # Analytics Module
│   │   ├── Base/                      # Base Classes
│   │   ├── Boot/                      # Module Bootstrapping
│   │   ├── Cart/                      # Cart Module
│   │   ├── Inventory/                 # Inventory Module
│   │   ├── Order/                     # Order Module
│   │   ├── Payment/                   # Payment Module
│   │   ├── Pricing/                   # Pricing Module
│   │   ├── Product/                   # Product Module
│   │   └── System/                    # System Configuration Module
│   │
│   ├── database/
│   │   ├── migrations/                # Database Migrations
│   │   └── seeders/                   # Database Seeders
│   │
│   ├── resources/
│   │   └── views/                     # Blade Templates
│   │
│   ├── routes/
│   │   ├── api.php                    # API Routes (v1)
│   │   └── web.php                    # Web Routes
│   │
│   ├── storage/                       # File Storage
│   ├── .env.example                   # Environment Template
│   └── composer.json
│
├── CURRENT_ARCHITECTURE.md            # Architecture Documentation
├── perfect_seo_shared_hosting_guide.md # Deployment Guide
└── README.md                          # This File
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Required for frontend |
| npm | 9+ | Package manager |
| PHP | 8.2+ | Required for backend |
| Composer | 2.x | PHP package manager |
| MySQL | 8.x | Database (MariaDB or PostgreSQL also supported) |
| Redis | 7.x | Optional, for caching |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-org/supplement-ecommerce.git
cd supplement-ecommerce
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Configure database in .env
# DB_DATABASE=ecommerce
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Run migrations and seed data
php artisan migrate --seed

# Create storage symlink
php artisan storage:link

# Start development server
php artisan serve
# API available at http://localhost:8000
```

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install node dependencies
npm install

# Configure API URL
# Create .env file with:
# VITE_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
# Application available at http://localhost:5173
```

### 4️⃣ Access the Application

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Storefront |
| `http://localhost:5173/admin` | Admin Panel |
| `http://localhost:8000` | Backend API |

### Default Admin Credentials

```
Email: admin@example.com
Password: password
```

---

## 📡 API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login and get JWT token | ❌ |
| `POST` | `/auth/logout` | Logout and invalidate token | ✅ |
| `POST` | `/auth/refresh` | Refresh JWT token | ✅ |
| `GET` | `/auth/me` | Get current user profile | ✅ |

#### Login Request
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password",
  "remember": true
}
```

#### Login Response
```json
{
  "access_token": "eyJ0eXAiOiJKV1...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

---

### Product Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/products` | List products with filters | ❌ |
| `GET` | `/products/featured` | Featured products | ❌ |
| `GET` | `/products/best-sellers` | Best selling products | ❌ |
| `GET` | `/products/new-arrivals` | New arrivals | ❌ |
| `GET` | `/products/{slug}` | Product details by slug | ❌ |
| `GET` | `/products/{slug}/related` | Related products | ❌ |
| `GET` | `/categories` | All categories | ❌ |
| `GET` | `/brands` | All brands | ❌ |

#### Product List Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (default: 12) |
| `category` | string | Filter by category slug |
| `brand` | string | Filter by brand slug |
| `min_price` | float | Minimum price filter |
| `max_price` | float | Maximum price filter |
| `sort` | string | `price_asc`, `price_desc`, `name_asc`, `newest` |
| `search` | string | Search in product name and description |

---

### Cart Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/cart` | Get current cart | ✅ |
| `POST` | `/cart/items` | Add item to cart | ✅ |
| `PUT` | `/cart/items/{id}` | Update item quantity | ✅ |
| `DELETE` | `/cart/items/{id}` | Remove item from cart | ✅ |
| `POST` | `/cart/coupon` | Apply coupon code | ✅ |
| `DELETE` | `/cart/coupon` | Remove coupon | ✅ |

#### Add to Cart Request
```json
POST /api/v1/cart/items
{
  "product_id": 1,
  "variant_id": 5,
  "quantity": 2,
  "addons": [
    { "group_id": 1, "option_ids": [3, 4] }
  ]
}
```

---

### Order Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/orders` | List user's orders | ✅ |
| `POST` | `/orders` | Create new order | ✅ |
| `GET` | `/orders/{id}` | Order details | ✅ |
| `POST` | `/orders/{id}/cancel` | Cancel order | ✅ |

---

### Admin Endpoints

All admin endpoints require `admin` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Dashboard analytics |
| `GET` | `/admin/products` | List all products |
| `POST` | `/admin/products` | Create product |
| `PUT` | `/admin/products/{id}` | Update product |
| `DELETE` | `/admin/products/{id}` | Delete product |
| `GET` | `/admin/orders` | List all orders |
| `PUT` | `/admin/orders/{id}/status` | Update order status |
| `GET` | `/admin/customers` | List customers |
| `GET` | `/admin/settings` | Get site settings |
| `PUT` | `/admin/settings` | Update settings |
| `GET` | `/admin/modules` | List modules |
| `PUT` | `/admin/modules/{id}` | Toggle module |
| `POST` | `/admin/license/activate` | Activate license |

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users & Authentication
users                    -- Customer and admin accounts
password_resets          -- Password reset tokens
personal_access_tokens   -- API tokens

-- Products & Variations
products                 -- Main product entity
product_images           -- Product gallery images
product_variants         -- Complex variations (SKU-level)
product_attributes       -- Attribute definitions (Size, Flavor)
product_attribute_options -- Values for attributes (e.g., 'Chocolate')
product_attribute_values -- Variant to attribute mappings
product_addons           -- Optional service/product attachments
product_bundles          -- Product grouping / Multi-packs
product_customizations   -- Custom user input for products
product_downloads        -- Digital file delivery links

-- Catalog Management
categories               -- Hierarchical category tree
brands                   -- Brand/Manufacturer registry
category_product         -- Many-to-many product mapping
tier_settings            -- Pricing tier definitions

-- Shopping & Marketing
carts                    -- Cart persistence (database-backed)
cart_items               -- Cart line items with metadata
cart_pricing_rules       -- Dynamic calculation logic
coupons                  -- Marketing discount codes
abandoned_carts          -- Sales recovery tracking
price_offers             -- Negotiation/Dynamic offer results

-- Orders & Fulfillment
orders                   -- Master order record
order_items              -- Snapshot of products at purchase
order_status_history     -- State machine transition logs
inventory_reservations   -- Temporary stock holds during checkout

-- Customer Experience
addresses                -- Multi-type address registry
wishlists                -- Save-for-later items
reviews                  -- Product feedback & verification

-- Finance & Compliance
currencies               -- Multi-currency support
currency_rates           -- Live/Manual exchange rates
tax_rules                -- Regional tax calculation logic
failed_payments          -- Diagnostic logs for issues

-- Security & Governance
blocked_entities         -- IP/Email blacklist
fraud_checks             -- Transaction risk scores
payment_velocity         -- Rate limiting for payments
security_audit_logs      -- System access trail
licenses                 -- Commercial license validation
site_settings            -- Enterprise configuration
modules                  -- Dynamic feature registry
timezones                -- User locale synchronization
```

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   brands    │     │    products     │     │ categories  │
├─────────────┤     ├─────────────────┤     ├─────────────┤
│ id          │◄────│ brand_id        │     │ id          │
│ name        │     │ name            │     │ name        │
│ slug        │     │ slug            │     │ parent_id   │──┐
└─────────────┘     │ price           │     └─────────────┘  │
                    │ sale_price      │           ▲          │
                    │ stock_quantity  │           │          │
                    └────────┬────────┘     ┌─────┴─────┐    │
                             │              │ product_  │    │
                             │              │ categories│    │
                             ▼              └───────────┘    │
              ┌──────────────────────────┐                   │
              │    product_variants      │                   │
              ├──────────────────────────┤                   │
              │ id                       │                   │
              │ product_id               │                   │
              │ sku                      │                   │
              │ price                    │                   │
              │ stock_quantity           │                   │
              └──────────────────────────┘                   │
                                                             │
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐  │
│   users     │     │     orders      │     │ order_items │  │
├─────────────┤     ├─────────────────┤     ├─────────────┤  │
│ id          │◄────│ user_id         │◄────│ order_id    │  │
│ name        │     │ status          │     │ product_id  │  │
│ email       │     │ total           │     │ variant_id  │  │
│ role        │     │ shipping_addr   │     │ quantity    │  │
└─────────────┘     └─────────────────┘     └─────────────┘  │
                                                             ▼
                    ┌─────────────────┐               (self-referencing
                    │   addresses     │                for hierarchy)
                    ├─────────────────┤
                    │ user_id         │
                    │ type            │
                    │ address_line_1  │
                    │ city, state     │
                    └─────────────────┘
```

---

## 🎨 Theming System

### Admin Theme Architecture

The admin panel uses a sophisticated theming system with:

```
AdminThemeProvider
├── Theme Presets (10+ color schemes)
├── Token Overrides (customize individual colors)
├── Layout Overrides (nav style, density)
└── Persistence (localStorage)
```

### Available Theme Presets

| Preset | Primary Color | Style |
|--------|---------------|-------|
| **Ocean Blue** | `#3B82F6` | Light, professional |
| **Forest Green** | `#10B981` | Light, natural |
| **Sunset Orange** | `#F97316` | Light, energetic |
| **Royal Purple** | `#8B5CF6` | Light, creative |
| **Crimson Red** | `#EF4444` | Light, bold |
| **Dark Executive** | `#6366F1` | Dark, sleek |
| **Dark Emerald** | `#10B981` | Dark, nature |
| **Midnight** | `#818CF8` | Dark, professional |
| **Charcoal** | `#F59E0B` | Dark, warm |
| **Deep Ocean** | `#06B6D4` | Dark, modern |

### Theme Configuration

```typescript
// frontend/src/features/admin/theme/themes.ts

interface AdminThemeTokens {
  primary: string;       // Primary brand color
  sidebarBg: string;     // Sidebar background
  sidebarText: string;   // Sidebar text color
  surfaceBg: string;     // Content background
  cardBg: string;        // Card backgrounds
  textPrimary: string;   // Primary text
  textSecondary: string; // Secondary text
  border: string;        // Border color
  accent: string;        // Accent color
}
```

### Storefront Theming

The storefront uses CSS custom properties for theming:

```css
:root {
  /* Primary color scale - themeable */
  --color-primary-50: #f0fdf4;
  --color-primary-500: #10b981;  /* Main brand color */
  --color-primary-900: #064e3b;
  
  /* Neutral colors - fixed for contrast */
  --color-neutral-50: #fafafa;
  --color-neutral-900: #171717;
}
```

---

## 📐 Store Layout Variants

### Product Detail Page Layouts

| Layout | Description | Use Case |
|--------|-------------|----------|
| **Layout 1** | Standard 2-column (Images | Info) | Default, clean |
| **Layout 2** | Reversed 2-column (Info | Images) | Text-focused |
| **Layout 3** | **Amazon-style 3-column** (Images | Info | Buy Box) | High conversion |
| **Layout 4** | Gallery-focused (70/30 split) | Visual products |
| **Layout 5** | Related products first | Cross-selling focus |

### Layout 3: Amazon-Style 3-Column

```
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb                                                    │
├─────────────────┬───────────────────────┬────────────────────┤
│                 │                       │                    │
│  Product Images │  Title & Brand        │  ┌──────────────┐  │
│                 │  Rating ★★★★☆         │  │ $29.99       │  │
│  [Main Image]   │  Short Description    │  │ In Stock ✓   │  │
│                 │                       │  │              │  │
│  [Thumbnails]   │  Variant Selectors    │  │ Qty: [1] [+] │  │
│                 │  □ Size: S M L XL     │  │              │  │
│                 │  ● Color: ● ● ●       │  │ [Add to Cart]│  │
│                 │                       │  │ [Buy Now]    │  │
│                 │                       │  │              │  │
│                 │                       │  │ 🚚 Free Ship │  │
│                 │                       │  │ 🔒 Secure    │  │
│                 │                       │  │ ↩️ 30-Day    │  │
│                 │                       │  └──────────────┘  │
├─────────────────┴───────────────────────┴────────────────────┤
│ Tabs: Description | Reviews | Specifications                 │
└──────────────────────────────────────────────────────────────┘
```

### Configuring Layouts

Layouts are configured in Admin Settings → Store Layout Variants:

```typescript
// storeLayoutSettings.ts
interface StoreLayoutSettings {
  home: 1 | 2 | 3 | 4 | 5;
  productDetail: 1 | 2 | 3 | 4 | 5;
  cart: 1 | 2 | 3 | 4 | 5;
  checkout: 1 | 2 | 3 | 4 | 5;
}
```

---

## 🔐 Authentication & Security

### JWT-Based Authentication

The application uses **tymon/jwt-auth** for stateless authentication:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │   Laravel   │         │   MySQL     │
├─────────────┤         ├─────────────┤         ├─────────────┤
│             │         │             │         │             │
│  POST       │───1────>│  Validate   │───2────>│   Users     │
│  /login     │         │  Credentials│         │             │
│             │<───3────│  Generate   │         │             │
│  JWT Token  │         │  JWT        │         │             │
│             │         │             │         │             │
│  GET        │───4────>│  Validate   │         │             │
│  /products  │ Bearer  │  JWT        │         │             │
│             │<───5────│  Return     │         │             │
│  Response   │         │  Data       │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Token Configuration

```php
// config/jwt.php
return [
    'ttl' => 60,              // Token lifetime (minutes)
    'refresh_ttl' => 20160,   // Refresh window (2 weeks)
    'algo' => 'HS256',        // Hashing algorithm
];
```

### Protected Routes

```php
// routes/api.php
Route::middleware('jwt.auth')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    // ... other protected routes
});

Route::middleware(['jwt.auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    // ... admin routes
});
```

### Security Features

- ✅ **CORS Configuration**: Properly configured for cross-origin requests
- ✅ **Rate Limiting**: API request throttling
- ✅ **CSRF Protection**: For web routes
- ✅ **Input Validation**: Request validation on all endpoints
- ✅ **SQL Injection Prevention**: Eloquent ORM & parameterized queries
- ✅ **XSS Prevention**: Output escaping in Blade templates
- ✅ **Password Hashing**: bcrypt with work factor 12

---

## 📦 Modular Architecture

The backend uses a **Modular Monolith** pattern, organizing business logic into cohesive modules:

### Module Structure

```
core/
├── Analytics/
│   ├── AnalyticsService.php
│   └── Events/
│
├── Cart/
│   ├── CartService.php
│   ├── CartRepository.php
│   ├── Models/
│   │   ├── Cart.php
│   │   └── CartItem.php
│   └── Events/
│
├── Inventory/
│   ├── InventoryService.php
│   └── StockReservation.php
│
├── Order/
│   ├── OrderService.php
│   ├── OrderRepository.php
│   └── StateMachine/
│
├── Payment/
│   ├── PaymentGateway.php
│   ├── Gateways/
│   │   ├── StripeGateway.php
│   │   └── PayPalGateway.php
│   └── Events/
│
├── Pricing/
│   ├── PriceCalculator.php
│   ├── CouponEngine.php
│   └── Rules/
│
├── Product/
│   └── ProductService.php
│
└── System/
    ├── SettingService.php
    └── ConfigLoader.php
```

### Module Manager

```php
// Enable/disable modules dynamically
$modules = ModuleManager::list();
// Returns: ['analytics' => true, 'payment' => true, ...]

ModuleManager::toggle('payment', false);
```

---

## 🌐 SEO Engine

### Architecture

The SEO system uses a modular service architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     MetaController                           │
│  (Thin orchestrator - resolves route, fetches model)        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SeoRenderer                             │
│  (Coordinates all SEO services)                             │
└─────┬─────────────┬─────────────┬─────────────┬─────────────┘
      ▼             ▼             ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│SeoEscaper │ │MetaBuilder│ │SchemaBuilder│ │HtmlInjector│
│           │ │           │ │           │ │           │
│ Sanitizes │ │ Builds    │ │ Creates   │ │ Injects   │
│ content   │ │ meta tags │ │ JSON-LD   │ │ into HTML │
└───────────┘ └───────────┘ └───────────┘ └───────────┘
```

### Generated SEO Elements

1. **Meta Tags**
   - `<title>` - Dynamic page title
   - `<meta name="description">` - SEO description
   - `<meta name="keywords">` - Keywords (optional)
   - `<link rel="canonical">` - Canonical URL

2. **Open Graph Tags**
   - `og:title`, `og:description`, `og:image`
   - `og:type` (product, article, website)
   - `og:url`, `og:site_name`

3. **Twitter Cards**
   - `twitter:card`, `twitter:title`
   - `twitter:description`, `twitter:image`

4. **Schema.org JSON-LD**
   - `Product` schema with price, availability, reviews
   - `Organization` schema
   - `BreadcrumbList` schema
   - `WebSite` with SearchAction

### Example Output

```html
<head>
  <title>Whey Protein 2kg - Premium Supplements | YourStore</title>
  <meta name="description" content="Buy premium Whey Protein 2kg. 24g protein per serving. Free shipping on orders over $50.">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Whey Protein 2kg">
  <meta property="og:type" content="product">
  <meta property="og:image" content="https://example.com/images/whey.jpg">
  
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Whey Protein 2kg",
    "image": "https://example.com/images/whey.jpg",
    "offers": {
      "@type": "Offer",
      "price": "49.99",
      "priceCurrency": "USD",
      "availability": "InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "127"
    }
  }
  </script>
</head>
```

---

## ☁️ Deployment

### Shared Hosting Deployment

Designed for easy deployment on cPanel, DirectAdmin, and similar environments.

#### Step-by-Step Guide

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   # Creates dist/ folder with production assets
   ```

2. **Upload to Server**
   ```
   public_html/
   ├── api/                    # Laravel public/ contents
   │   ├── index.php
   │   └── .htaccess
   ├── app/                    # Frontend dist/ contents
   │   ├── index.html
   │   └── assets/
   └── laravel/                # Laravel app (outside public_html ideally)
       ├── app/
       ├── core/
       ├── storage/
       └── ...
   ```

3. **Configure Environment**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com
   
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=your_db
   DB_USERNAME=your_user
   DB_PASSWORD=your_password
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```

5. **Web Installer** (Optional)
   Access `/install` for guided setup wizard.

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=db
    depends_on:
      - db
      
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
      
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: ecommerce
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

---

## ⚙️ Configuration

### Frontend Environment Variables

```env
# frontend/.env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=MyStore
VITE_ENABLE_ANALYTICS=true
```

### Backend Environment Variables

```env
# backend/.env

# Application
APP_NAME="Supplement Store"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce
DB_USERNAME=root
DB_PASSWORD=

# JWT Authentication
JWT_SECRET=your-super-secret-key
JWT_TTL=60
JWT_REFRESH_TTL=20160

# Cache & Session
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Redis (optional)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025

# Storage
FILESYSTEM_DISK=public

# Stripe (optional)
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# License
LICENSE_API_URL=https://license.yourserver.com
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test --filter=ProductTest
```

### Test Structure

```
backend/tests/
├── Feature/
│   ├── Api/
│   │   ├── AuthTest.php
│   │   ├── ProductTest.php
│   │   └── CartTest.php
│   └── Admin/
│       └── DashboardTest.php
└── Unit/
    ├── Services/
    └── Repositories/

frontend/src/__tests__/
├── components/
├── features/
└── hooks/
```

---

## 🛣️ Roadmap

### Phase 1: Core Enhancement ✅
- [x] Product variants and attributes
- [x] Admin panel with full CRUD
- [x] JWT authentication
- [x] SEO engine with Schema.org
- [x] Theme customization system
- [x] Multiple layout variants

### Phase 2: E-commerce Features 🚧
- [ ] Stripe payment integration
- [ ] PayPal payment integration
- [ ] Inventory ledger system
- [ ] Advanced pricing rules engine
- [ ] Email notification templates
- [ ] Order fulfillment workflow

### Phase 3: Advanced Features 📋
- [ ] Multi-currency support
- [ ] Multi-language (i18n)
- [ ] Product bundles
- [ ] Subscription products
- [ ] Affiliate tracking
- [ ] Advanced analytics dashboard

### Phase 4: Performance & Scale 📋
- [ ] Redis caching layer
- [ ] Elasticsearch integration
- [ ] CDN image optimization
- [ ] Queue-based processing
- [ ] Horizontal scaling support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

**Commercial License** - This is proprietary software. Contact for licensing options.

For evaluation and development purposes only. Production use requires a valid license key.

---

## 🙏 Acknowledgements

- [Laravel](https://laravel.com) - The PHP framework
- [React](https://reactjs.org) - UI library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Vite](https://vitejs.dev) - Build tool
- [Lucide Icons](https://lucide.dev) - Icon library

---

<p align="center">
  <strong>Built with ❤️ for fitness enthusiasts and health-conscious shoppers</strong>
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-deployment">Deploy</a>
</p>
