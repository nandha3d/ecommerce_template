# Ultra‑Pro Shop Engine
## Agentic IDE Execution & Reconstruction Specification

> **Purpose**: This markdown is written **for an agentic IDE / autonomous coding agent**.  
> The agent must **analyze the existing codebase (ZIP)**, **identify gaps**, **refactor safely**, and **build missing systems** to evolve the project into an **Ultra‑Pro Shop Engine**.

---

## 1. Agent Operating Rules (MANDATORY)

1. **DO NOT rewrite the project from scratch**
2. **DO NOT break existing user‑facing flows** (product → cart → checkout)
3. **DO NOT introduce new frameworks unless unavoidable**
4. **Refactor by extraction, not deletion**
5. **All new logic must live in isolated modules**
6. **Backward compatibility is mandatory until Phase‑3**
7. **Prefer deterministic logic over async/queues**

## 1.1 Technology Constraints (STRICT)

❌ **Forbidden in Core Modules:**
- Laravel Facades (`DB`, `Log`, `Event`)
- Artisan Commands (`php artisan make:...`)
- Eloquent Models (extending `Illuminate\Database\Eloquent\Model`)
- Laravel Service Providers (in `Core` namespace)
- Laravel Migrations (`database/migrations`)

✅ **Required:**
- Framework-agnostic PHP 8.2+
- Dependency Injection for all externals
- Repository Pattern for DB access (PDO/Query Builder)
- Custom Migration Scripts (`tools/migrate.php`)
- Plain PHP Entities/DTOs

---

## 2. Initial Agent Tasks (Discovery Phase)

### 2.1 Codebase Mapping

Agent must:
- Scan entire repository
- Identify:
  - Controllers
  - Models / DB access
  - Cart logic
  - Pricing logic
  - Checkout logic
  - Order creation
  - Inventory deduction

Output required:
- `CURRENT_ARCHITECTURE.md`
- Dependency map of business logic

---

## 3. Target Architecture (End State)

### 3.1 Architecture Style

**Modular Monolith with Internal Event System**

```
/core
  /Product
  /Pricing
  /Cart
  /Checkout
  /Order
  /Inventory
  /Payment
  /Shipping
  /Tax
  /User
  /Analytics
  /System

/app
  /Controllers
  /Views
  /Middlewares

/infrastructure
  /Database
  /Cache
  /Events

/admin
/api
```

Agent must migrate logic **into `/core` modules**.

---

## 4. Mandatory Core Modules (Build or Refactor)

### 4.1 Product Engine

**If exists → Refactor**
**If missing → Build**

Responsibilities:
- Typed product tables
- Product types enum
- Attribute schema
- Variant matrix engine
- SEO fields

❌ No meta‑based product storage

---

### 4.2 Pricing & Rules Engine (CRITICAL)

Agent must:
- Locate existing pricing logic
- Extract into `core/Pricing`

#### Required Capabilities
- JSON‑based rule definitions
- Rule priority
- Stackable conditions
- Cart & product rules

Example rule format:
```json
{
  "conditions": [{"field": "cart.total", "operator": ">=", "value": 5000}],
  "action": {"type": "percentage_discount", "value": 10}
}
```

---

### 4.3 Cart Engine

Replace session‑bound logic.

Requirements:
- Signed cart tokens
- Guest + user cart merge
- Persistent cart storage
- Cart versioning

Agent must ensure:
- Existing UI works unchanged

---

### 4.4 Checkout Engine

Responsibilities:
- Atomic order creation
- Address handling
- Payment initiation
- Failure recovery

Rule:
> No order is created unless payment intent exists

---

### 4.5 Order Management System (OMS)

Agent must introduce:
- Order state machine
- Immutable orders after payment
- Partial fulfillment support

States:
```
draft → pending → paid → processing → shipped → delivered → returned → refunded
```

---

### 4.6 Inventory Engine

Agent must replace direct stock mutation.

Required:
- Stock ledger
- Reservation during checkout
- Adjustment audit logs

All stock changes must be transactional.

---

### 4.7 Payment Orchestration

Agent must isolate payment logic.

Required:
- Gateway abstraction
- Webhook verification
- Retry safety
- Refund handling

Payment ≠ Order logic.

---

### 4.8 Shipping Engine

Agent must:
- Extract shipping logic
- Implement rule‑based rate calculation
- Abstract carrier logic

---

### 4.9 Tax & Compliance Engine

Agent must implement:
- GST breakup
- Inclusive/exclusive pricing
- HSN/SAC mapping
- Invoice compliance

Tax must be deterministic.

---

## 5. Internal Event System (MANDATORY)

Agent must implement lightweight event dispatcher:

Examples:
- `cart.updated`
- `order.created`
- `payment.success`
- `inventory.reserved`

Purpose:
- Decouple logic
- Enable future async

---

## 6. Database Migration Rules

1. **No destructive migrations in Phase‑1**
2. Introduce new tables in parallel
3. Gradually shift reads → new tables
4. Remove legacy tables only after validation

Agent must generate:
- `DB_MIGRATION_PLAN.md`

---

## 7. Performance Constraints

Agent must ensure:
- No N+1 queries
- Indexed foreign keys
- Cached rule evaluations
- Minimal joins on checkout path

Target:
- Checkout execution < 2s

---

## 8. Admin & Tooling

Agent must not break admin.

Enhance gradually:
- Order lifecycle UI
- Inventory dashboard
- Pricing rule editor (basic)

---

## 9. Phase‑Wise Execution Plan

### Phase‑1: Stabilization
- Code mapping
- Logic extraction
- Zero feature change

### Phase‑2: Core Engine
- Product
- Cart
- Pricing
- Orders

### Phase‑3: Ultra‑Pro Features
- Rules UI
- Analytics
- Automation hooks

---

## 10. Validation Checklist (Agent Must Self‑Verify)

- [ ] Existing checkout works
- [ ] No UI regressions
- [ ] Pricing matches legacy
- [ ] Orders are atomic
- [ ] Inventory is consistent
- [ ] Performance not degraded

---

## 11. Final Instruction to Agent

> **You are upgrading a real production codebase into a commerce engine.**  
> **Stability > Features. Architecture > Hacks.**

Do not proceed to next phase until all checkboxes pass.

---

### End of Specification

