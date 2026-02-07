# Complete API Reference

> Base URL: `{VITE_API_URL}/v1` (default: `http://127.0.0.1:8000/api/v1`)

---

## 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register new user |
| `POST` | `/auth/login` | ❌ | Login, returns tokens |
| `POST` | `/auth/forgot-password` | ❌ | Request password reset |
| `POST` | `/auth/reset-password` | ❌ | Reset password with token |
| `POST` | `/auth/logout` | ✅ | Logout user |
| `POST` | `/auth/refresh` | ✅ | Refresh access token |
| `GET` | `/auth/me` | ✅ | Get current user |
| `PUT` | `/auth/profile` | ✅ | Update profile |
| `PUT` | `/auth/password` | ✅ | Change password |

---

## 📦 Products (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List products (filterable) |
| `GET` | `/products/featured` | Featured products |
| `GET` | `/products/best-sellers` | Best sellers |
| `GET` | `/products/new-arrivals` | New arrivals |
| `GET` | `/products/categories` | All categories |
| `GET` | `/products/brands` | All brands |
| `GET` | `/products/{slug}` | Single product by slug |
| `GET` | `/products/{id}/related` | Related products |

### Product Filters
```
?category=supplements
?brand=optimum
?min_price=100
?max_price=500
?sort=price_asc|price_desc|newest
?page=1
```

---

## 🛒 Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/cart` | ❌ | Get cart |
| `POST` | `/cart/items` | ❌ | Add item |
| `PUT` | `/cart/items/{id}` | ❌ | Update quantity |
| `DELETE` | `/cart/items/{id}` | ❌ | Remove item |
| `DELETE` | `/cart/clear` | ❌ | Clear cart |
| `POST` | `/cart/coupon` | ❌ | Apply coupon |
| `DELETE` | `/cart/coupon` | ❌ | Remove coupon |
| `POST` | `/cart/merge` | ✅ | Merge guest cart |

### Headers
```
X-Cart-Session: guest_{32-char-hex}
```

---

## 📋 Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/orders` | ✅ | List user orders |
| `POST` | `/orders` | ✅ | Create order |
| `POST` | `/orders/validate` | ✅ | Pre-validate order |
| `GET` | `/orders/{id}` | ✅ | Get order |
| `GET` | `/orders/number/{num}` | ✅ | Get by order number |
| `POST` | `/orders/{id}/cancel` | ✅ | Cancel order |
| `GET` | `/orders/track/{num}` | ✅ | Track order |
| `POST` | `/orders/{id}/return` | ✅ | Request return |
| `POST` | `/orders/{id}/reorder` | ✅ | Reorder items |

### Create Order Payload
```json
{
  "payment_method": "card|paypal|cod",
  "payment_intent_id": "pi_xxx",
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "notes": "",
  "same_as_billing": true
}
```

---

## 💳 Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/payment/gateways` | ❌ | Available gateways |
| `POST` | `/payment/initiate` | ✅ | Initiate payment |
| `POST` | `/payment/verify` | ❌ | Verify payment |
| `POST` | `/payment/failed` | ❌ | Handle failure |
| `POST` | `/payment/webhook` | ❌ | Stripe webhook |
| `POST` | `/payments/create-intent` | ✅ | Create PaymentIntent |
| `GET` | `/payments/methods` | ✅ | Saved payment methods |
| `POST` | `/payments/methods` | ✅ | Save payment method |
| `DELETE` | `/payments/methods/{id}` | ✅ | Delete payment method |
| `POST` | `/orders/{id}/refund` | ✅ | Process refund |

---

## 📍 Addresses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/addresses` | ✅ | List addresses |
| `POST` | `/addresses` | ✅ | Create address |
| `GET` | `/addresses/{id}` | ✅ | Get address |
| `PUT` | `/addresses/{id}` | ✅ | Update address |
| `DELETE` | `/addresses/{id}` | ✅ | Delete address |
| `POST` | `/addresses/{id}/default` | ✅ | Set default |

---

## ❤️ Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/wishlist` | ✅ | Get wishlist |
| `POST` | `/wishlist` | ✅ | Add to wishlist |
| `DELETE` | `/wishlist/{productId}` | ✅ | Remove |
| `GET` | `/wishlist/check/{productId}` | ✅ | Check if in wishlist |

---

## ⭐ Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/products/{id}/reviews` | ❌ | Get reviews |
| `POST` | `/products/{id}/reviews` | ✅ | Create review |
| `PUT` | `/reviews/{id}` | ✅ | Update review |
| `DELETE` | `/reviews/{id}` | ✅ | Delete review |

---

## 🛠️ Product Variants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/attributes` | ❌ | All attributes |
| `GET` | `/products/{id}/variants` | ❌ | Product variants |
| `POST` | `/products/{id}/variants` | 🔒 | Create variant |
| `PUT` | `/variants/{id}` | 🔒 | Update variant |
| `DELETE` | `/variants/{id}` | 🔒 | Delete variant |
| `POST` | `/variants/bulk-stock` | 🔒 | Bulk update stock |
| `POST` | `/variants/generate-matrix` | 🔒 | Generate matrix |

---

## 🎁 Bundles & Offers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/bundles` | ❌ | Active bundles |
| `GET` | `/bundles/{id}` | ❌ | Bundle details |
| `GET` | `/offers` | ❌ | Active offers |
| `POST` | `/offers/calculate` | ❌ | Calculate price |
| `GET` | `/products/{id}/addons` | ❌ | Product addons |

---

## 🌐 Globalization

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/context` | ❌ | Get globalization context |
| `GET` | `/settings/currencies` | ❌ | List currencies |
| `POST` | `/settings/currency/switch` | ❌ | Switch currency |
| `GET` | `/settings/timezones` | ❌ | List timezones |
| `POST` | `/settings/timezone/switch` | ❌ | Switch timezone |

---

## ⚙️ System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/system/config` | ❌ | Get site config |
| `GET` | `/modules/features` | ❌ | Available features |
| `GET` | `/config/public` | ❌ | Public settings |

---

## 🔑 License

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/license/status` | ❌ | License status |
| `POST` | `/license/activate` | ❌ | Activate license |
| `GET` | `/license/check/{module}` | ❌ | Check module |
| `GET` | `/license/modules` | 🔒 | All modules |
| `POST` | `/license/revalidate` | 🔒 | Revalidate |
| `POST` | `/license/deactivate` | 🔒 | Deactivate |

---

# 🔒 Admin Panel APIs

> All admin endpoints require `auth:api` + `admin` middleware

---

## 📦 Admin Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/products` | List all products |
| `POST` | `/admin/products` | Create product |
| `GET` | `/admin/products/{id}` | Get product |
| `PUT` | `/admin/products/{id}` | Update product |
| `DELETE` | `/admin/products/{id}` | Delete product |
| `POST` | `/admin/products/bulk` | Bulk actions |

---

## 📁 Admin Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/categories` | List categories |
| `POST` | `/admin/categories` | Create category |
| `GET` | `/admin/categories/{id}` | Get category |
| `PUT` | `/admin/categories/{id}` | Update category |
| `DELETE` | `/admin/categories/{id}` | Delete category |

---

## 🏷️ Admin Attributes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/attributes` | List attributes |
| `GET` | `/admin/attributes/types` | Attribute types |
| `POST` | `/admin/attributes` | Create attribute |
| `GET` | `/admin/attributes/{id}` | Get attribute |
| `PUT` | `/admin/attributes/{id}` | Update attribute |
| `DELETE` | `/admin/attributes/{id}` | Delete attribute |

---

## 🏪 Admin Brands

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/brands` | List brands |

---

## 📤 Admin Image Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/upload/images` | Upload multiple |
| `POST` | `/admin/upload/image` | Upload single |
| `DELETE` | `/admin/upload/image` | Delete image |

---

## 💰 Admin Currencies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/currencies` | List currencies |
| `POST` | `/admin/currencies` | Create currency |
| `PUT` | `/admin/currencies/{id}` | Update currency |
| `DELETE` | `/admin/currencies/{id}` | Delete currency |
| `POST` | `/admin/currencies/{id}/toggle` | Toggle active |
| `POST` | `/admin/currencies/{id}/default` | Set default |

---

## 🕐 Admin Timezones

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/timezones` | List timezones |
| `GET` | `/admin/timezones/identifiers` | Valid identifiers |
| `POST` | `/admin/timezones` | Create timezone |
| `PUT` | `/admin/timezones/{id}` | Update timezone |
| `DELETE` | `/admin/timezones/{id}` | Delete timezone |
| `POST` | `/admin/timezones/{id}/toggle` | Toggle active |
| `POST` | `/admin/timezones/{id}/default` | Set default |

---

## 🎁 Admin Bundles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/bundles` | List bundles |
| `POST` | `/admin/bundles` | Create bundle |
| `PUT` | `/admin/bundles/{id}` | Update bundle |
| `DELETE` | `/admin/bundles/{id}` | Delete bundle |

---

## 🏷️ Admin Offers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/offers` | List offers |
| `GET` | `/admin/offers/{id}` | Get offer |
| `POST` | `/admin/offers` | Create offer |
| `PUT` | `/admin/offers/{id}` | Update offer |
| `DELETE` | `/admin/offers/{id}` | Delete offer |

---

## ➕ Admin Addons

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/addons` | List addons |
| `POST` | `/addons` | Create addon |
| `PUT` | `/addons/{id}` | Update addon |
| `DELETE` | `/addons/{id}` | Delete addon |
| `POST` | `/addons/{id}/attach` | Attach to products |

---

## 💳 Admin Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/payment/gateways` | List gateways |
| `PUT` | `/admin/payment/gateways/{id}` | Update gateway |
| `GET` | `/admin/payment/orders/{id}/transactions` | Order transactions |

---

## 🎨 Admin Customizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/customizations` | List all |
| `POST` | `/admin/customizations/{id}/approve` | Approve |
| `POST` | `/admin/customizations/{id}/reject` | Reject |

---

## 📊 Admin Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/analytics/dashboard` | Dashboard stats |

---

## 🛡️ Admin Fraud Detection

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/fraud/dashboard` | Fraud dashboard |
| `GET` | `/admin/fraud/checks` | Fraud checks |
| `GET` | `/admin/fraud/blocked` | Blocked entities |
| `POST` | `/admin/fraud/block` | Block entity |
| `DELETE` | `/admin/fraud/unblock/{id}` | Unblock |
| `GET` | `/admin/fraud/ip/{ip}` | IP history |
| `GET` | `/admin/fraud/failed-payments` | Failed payments |

---

## 🎨 Admin Theme

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/theme` | Get theme settings |
| `PUT` | `/admin/theme` | Update theme |
| `POST` | `/admin/theme/reset` | Reset to default |

---

## 🚚 Admin Shipping

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/modules/shipping/shiprocket/config` | Update config |
| `GET` | `/modules/shipping/shiprocket/test` | Test connection |
| `POST` | `/modules/shipping/shiprocket/orders` | Create shipment |

---

## 🧩 Admin Modules

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/modules` | List modules |
| `POST` | `/modules/{slug}/toggle` | Toggle module |
| `PUT` | `/modules/{slug}/config` | Update config |

---

## 📌 Legend

| Symbol | Meaning |
|--------|---------|
| ❌ | No auth required |
| ✅ | User auth required |
| 🔒 | Admin auth required |
