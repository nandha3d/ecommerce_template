# E-Commerce Project Fix Instructions for AI Agent

## CONTEXT
You are tasked with fixing critical issues in an e-commerce project. This project currently has serious flaws that can cause:
- Financial loss (double charges, payment failures)
- Data corruption (orphaned orders, inventory desyncs)
- Security vulnerabilities (unauthorized admin access)
- Unreliable operations (race conditions, state inconsistencies)

## YOUR MISSION
Fix all identified issues following the exact phase order. **DO NOT skip phases or reorder tasks.**

---

## ⚠️ CRITICAL RULE: PHASE 1 MUST BE COMPLETED FIRST
**Skipping Phase 1 can result in real money loss. Complete all Phase 1 tasks before proceeding.**

---

## 🔴 PHASE 1: CRITICAL SECURITY & DATA INTEGRITY

### Task 1.1: Implement Safe Checkout Flow
**Current Problem:**
- Cart, inventory, orders, and payments are handled independently
- Failures leave inconsistent data (charged users without orders, failed payments with reduced inventory)

**Required Implementation:**
1. Create a single `CheckoutService` class (PHP)
2. Implement atomic checkout process with this exact sequence:
   ```
   START TRANSACTION
   → Validate cart
   → Lock inventory (temporary reservation)
   → Calculate final price
   → Create order record
   → Create payment intent
   COMMIT or ROLLBACK on any failure
   ```
3. Use database transactions to ensure atomicity
4. Inventory must NOT be permanently reduced before payment confirmation

**Success Criteria:**
- [ ] Every order has a corresponding payment intent
- [ ] Every payment has a corresponding order
- [ ] Failed checkouts leave zero orphaned records
- [ ] All checkout operations are wrapped in database transactions

---

### Task 1.2: Prevent Duplicate Payments
**Current Problem:**
- Same payment request can be processed multiple times
- Webhooks from payment providers are not verified
- Risk of double-charging customers

**Required Implementation:**
1. **Idempotency System:**
   - Generate unique idempotency key for each checkout request
   - Store key in database with associated result
   - Return cached result if same key is reused
   
2. **Webhook Verification:**
   - Verify webhook signatures using provider's secret key
   - Validate webhook authenticity before processing
   - Reject unsigned or invalid webhook requests

**Success Criteria:**
- [ ] Duplicate payment requests return cached results (no double charge)
- [ ] Invalid webhooks are rejected
- [ ] All webhooks are cryptographically verified

---

### Task 1.3: Fix Inventory Race Conditions
**Current Problem:**
- Multiple users can purchase the same last item simultaneously
- No proper locking mechanism for stock levels
- Inventory reservations are not session-bound

**Required Implementation:**
1. **Reservation System:**
   - Link inventory holds to checkout session IDs
   - Set expiration time (e.g., 15 minutes)
   - Use database row-level locking (`SELECT ... FOR UPDATE`)
   
2. **Automatic Cleanup:**
   - Background job to release expired reservations
   - Restore inventory when checkout sessions timeout

**Success Criteria:**
- [ ] Stock cannot be oversold under concurrent requests
- [ ] Abandoned carts automatically release inventory
- [ ] Database locks prevent race conditions

---

### Task 1.4: Strengthen Security Controls
**Current Problem:**
- Admin routes may lack proper authorization
- JWT tokens alone are insufficient
- License validation is not cryptographically verified
- Sensitive files (logs, .env, temp files) present in repository

**Required Implementation:**
1. **Authorization:**
   - Implement role-based access control (RBAC) on all admin routes
   - Verify roles server-side (never trust client-provided roles)
   - Use middleware to enforce permission checks

2. **License Validation:**
   - Verify license responses with digital signatures
   - Implement license key cryptographic validation

3. **Repository Cleanup:**
   - Remove all files matching:
     - `*.log`
     - `*.zip`
     - Temporary scripts
     - `.env` files (ensure they're gitignored)

**Success Criteria:**
- [ ] Admin routes cannot be accessed without proper authorization
- [ ] Roles are verified server-side on every request
- [ ] No sensitive files in repository
- [ ] `.env` is in `.gitignore`

---

## 🟠 PHASE 2: CODE STRUCTURE & LOGIC

### Task 2.1: Refactor Controllers
**Current Problem:**
- Controllers contain business logic
- Logic scattered across controllers, models, and utility modules

**Required Implementation:**
1. Create service layer classes (e.g., `OrderService`, `CartService`, `PaymentService`)
2. Move all business logic to services
3. Controllers should only:
   - Validate incoming requests
   - Call appropriate service method
   - Format and return response

**Success Criteria:**
- [ ] Controllers are < 50 lines each
- [ ] All business logic resides in service classes
- [ ] Controllers have no direct database queries

---

### Task 2.2: Enforce State Machines
**Current Problem:**
- Cart, Order, and Payment states can transition invalidly
- No enforcement of allowed state flows

**Required Implementation:**
1. Define explicit state machines:
   ```
   Cart:     active → checkout → completed | expired
   Order:    pending → paid → shipped → completed | cancelled
   Payment:  created → processing → success | failed
   ```

2. Implement state transition validation:
   - Block invalid transitions (e.g., paid → pending)
   - Log all state changes with timestamps

**Success Criteria:**
- [ ] Invalid state transitions throw exceptions
- [ ] State change history is persisted
- [ ] All entities have explicit current state

---

### Task 2.3: Standardize API Responses
**Current Problem:**
- Inconsistent response formats across endpoints
- Frontend must handle varying error structures

**Required Implementation:**
1. Create standard response wrapper:
   ```json
   {
     "success": boolean,
     "error_code": string | null,
     "message": string,
     "data": object | null
   }
   ```

2. Apply to all `/api/v1` endpoints
3. Maintain backward compatibility

**Success Criteria:**
- [ ] All API responses follow identical structure
- [ ] Error codes are documented
- [ ] Frontend can rely on consistent format

---

## 🟡 PHASE 3: TESTING & OBSERVABILITY

### Task 3.1: Add Critical Path Tests
**Current Problem:**
- Tests exist but miss core scenarios
- No regression protection

**Required Implementation:**
1. Write integration tests for:
   - Successful complete checkout flow
   - Payment failure scenarios
   - Out-of-stock inventory handling
   - Duplicate payment attempts (idempotency)
   
2. Add regression tests for every bug fix

**Success Criteria:**
- [ ] 100% coverage of checkout flow
- [ ] CI pipeline fails on test failures
- [ ] All Phase 1 fixes have corresponding tests

---

### Task 3.2: Improve Logging & Tracing
**Current Problem:**
- Logs exist but are fragmented
- Cannot trace individual checkout flows

**Required Implementation:**
1. Add correlation IDs:
   - Generate unique ID for each checkout request
   - Attach to all related operations (inventory, order, payment, webhooks)

2. Log critical events:
   - `inventory.reserved`
   - `order.created`
   - `payment.intent_created`
   - `payment.success` / `payment.failed`
   - Include timestamps and correlation ID

**Success Criteria:**
- [ ] Failed checkouts can be traced end-to-end using correlation ID
- [ ] Structured logging format (JSON recommended)

---

## 🟢 PHASE 4: DOCUMENTATION ALIGNMENT

### Task 4.1: Update README
**Current Problem:**
- README claims "production ready" but system has critical flaws
- Documentation describes ideal state, not reality

**Required Implementation:**
1. Rewrite README to include:
   - Current maturity level (e.g., "Beta - Not Production Ready")
   - **What IS safe:** (list verified components)
   - **What is NOT ready:** (list incomplete features)
   - **Before Production Checklist:**
     - [ ] All Phase 1 tasks completed
     - [ ] Security audit performed
     - [ ] Load testing completed
     - [ ] Payment provider integration verified

**Success Criteria:**
- [ ] No false "production ready" claims
- [ ] Honest assessment of system state
- [ ] Clear path to production readiness

---

## ✅ PROJECT COMPLETION CRITERIA

The project is considered **fixed and safe** when ALL of the following are true:

- [ ] **Payments:** Cannot be charged twice (idempotency enforced)
- [ ] **Inventory:** Cannot desync or oversell (locking + reservations)
- [ ] **Orders:** Cannot exist in broken states (transaction atomicity)
- [ ] **Security:** Admin access fully protected (RBAC enforced)
- [ ] **Testing:** Core flows have integration tests
- [ ] **Documentation:** README reflects actual system guarantees

---

## 🤖 AI AGENT EXECUTION GUIDELINES

1. **Start with Phase 1 - NO EXCEPTIONS**
   - Complete all 4 tasks in Phase 1 before any other work
   
2. **Verify each task** before moving to next:
   - Write tests to confirm fix
   - Check success criteria
   
3. **Preserve existing functionality:**
   - Do not break working features
   - Maintain API compatibility where possible
   
4. **Ask for clarification if:**
   - Payment provider integration is unclear
   - Database schema is ambiguous
   - Existing code patterns are contradictory

5. **Provide progress updates:**
   - After completing each task
   - When encountering blockers
   - Before making breaking changes

---

## 📋 SUGGESTED EXECUTION ORDER

```
1. Review existing codebase structure
2. Identify payment provider integration points
3. Implement Task 1.1 (Safe Checkout)
4. Implement Task 1.2 (Idempotency)
5. Implement Task 1.3 (Inventory Locking)
6. Implement Task 1.4 (Security Hardening)
7. Run all tests - verify Phase 1 complete
8. Proceed to Phase 2...
```

---

**Remember: Phase 1 protects against money loss. It is non-negotiable.**