# Supplement E-commerce Engine
## Mandatory Audit, Fixes & Refactor Plan

> **STRICT COMPLIANCE DOCUMENT**  
> This document MUST be followed by any developer / agent working on this codebase.

---

## 1. PROJECT STATUS – HONEST ASSESSMENT

### What Exists
- Laravel MVC foundation
- Admin + API separation
- Product, Category, Addon, Address basic CRUD
- Image upload handling

### What This Is NOT (Yet)
- ❌ Not a production-ready e-commerce engine
- ❌ Not legally compliant for supplements
- ❌ Not scalable without refactor

This project is currently a **CRUD-heavy Laravel application**, not a full commerce engine.

---

## 2. NON-NEGOTIABLE ARCHITECTURE RULES

### 2.1 Mandatory Layers
Controllers MUST NOT contain business logic.

Required layers:
```
app/
 ├── Controllers/
 ├── Services/
 ├── Repositories/
 ├── DTOs/
 ├── Enums/
 ├── Policies/
```

Controllers:
- Accept request
- Call Service
- Return response

---

### 2.2 Forbidden Patterns
❌ DB queries inside controllers  
❌ Hardcoded strings for status, currency, roles  
❌ Image upload logic inside controllers  
❌ Business rules inside routes

---

## 3. HARDCODING – MUST BE REMOVED

### Identified Hardcoding Issues
- Product status: `active`, `inactive`
- Currency assumptions (₹)
- Static pagination values
- Static image paths
- Role checks inside controllers

### Required Fix
- Use **Enums** for status, roles, order states
- Use config-driven values
- Media paths via filesystem abstraction

---

## 4. MODULE-BY-MODULE AUDIT & REQUIRED ACTIONS

---

### MODULE 1: CORE / FOUNDATION

**Issues**
- No service layer
- No repository abstraction

**Mandatory Fix**
- Introduce Service + Repository pattern
- Enforce SRP strictly

---

### MODULE 2: AUTH & AUTHORIZATION

**Missing**
- Role-permission matrix
- Policies & Gates
- Admin audit logs

**Fix**
- Laravel Policies
- Activity logging (who changed what)

---

### MODULE 3: CATEGORY MODULE

**Issues**
- Status hardcoded
- No hierarchy control

**Fix**
- CategoryService
- Status enum
- SEO metadata

---

### MODULE 4: PRODUCT MODULE (CRITICAL)

**What Exists**
- Basic product CRUD
- Images
- Attributes

**Missing (Critical)**
- Variants (SKU level)
- Inventory & stock
- Pricing rules
- Price history

**LEGAL COMPLIANCE – MANDATORY**
- FSSAI license number
- Ingredient list
- Nutrition table
- Batch number
- Manufacturing & expiry dates

⚠️ **Without these, the system MUST NOT go live.**

---

### MODULE 5: ADDONS

**Issues**
- Pricing logic hardcoded

**Fix**
- Addon rules engine
- Central price resolver service

---

### MODULE 6: ADDRESS MODULE

**Issues**
- Country-specific assumptions
- No GST / state logic

**Fix**
- Address abstraction
- GST state mapping (India)
- Validation per country

---

### MODULE 7: CART MODULE (MISSING)

**Status**
❌ Not implemented

**Required**
- Cart table
- Guest cart
- Cart rules engine
- Tax + shipping hooks

---

### MODULE 8: ORDER MODULE (MISSING)

**Status**
❌ Not implemented

**Mandatory**
- Order lifecycle
- Order status state machine
- Cancellation & refund support
- Invoice generation

⚠️ **Consumer Protection Act compliance required**

---

### MODULE 9: PAYMENT MODULE (MISSING)

**Required**
- Gateway abstraction
- Webhook handling
- Payment reconciliation

No direct gateway logic in controllers.

---

### MODULE 10: MEDIA MODULE

**Issues**
- Image logic inside controllers

**Fix**
- MediaService
- Image optimization
- CDN readiness

---

### MODULE 11: ANALYTICS & LOGGING

**Missing**
- Sales analytics
- Admin activity logs
- Error tracking

---

### MODULE 12: FEATURE / MODULE MANAGEMENT

**Missing**
- Feature flags
- Module enable / disable

**Fix**
- `features` table
- Config-driven access

---

## 5. LEGAL & REGULATORY COMPLIANCE (INDIA)

### MUST COMPLY WITH:
- Consumer Protection Act
- FSSAI supplement rules

### REQUIRED DATA TRACKING
- Price history
- Refund logs
- Batch & expiry
- Nutritional disclosure

---

## 6. FINAL VERDICT

🟢 Strong Laravel foundation  
🔴 Not production-ready  
🔴 Not compliant  
🔴 Not scalable without refactor

---

## 7. STRICT DIRECTIVE TO AGENT

> ❗ No new features may be added
> until ALL architectural violations
> and compliance gaps listed above
> are resolved.

---

**END OF MANDATORY DOCUMENT**