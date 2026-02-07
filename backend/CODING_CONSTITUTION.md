# PROJCT CODING CONSTITUTION & ARCHITECTURE STANDARDS

## 1. CORE PHILOSOPHY
**System Integrity > Feature Delivery.**
This project prioritizes maintainability, security, and architectural purity/correctness over speed or shortcuts.

## 2. ABSOLUTE PROHIBITIONS (CI ENFORCED)
The following are strictly forbidden and will fail the build:
- **Hardcoded Strings**: No 'active', 'pending', 'USD', 'admin' in code. Use ENUMS.
- **Magic Numbers**: No `10`, `100` in logic. Use Config or Constants.
- **Direct Environment Access**: No `env()` calls outside of `/config`. Use `config()`.
- **Controller Logic**: No `DB::` queries, no business logic, no status decisions in Controllers.
- **Mixed Concerns**: No formatting logic in Services, no DB logic in Views.

## 3. ARCHITECTURAL LAYERS (STRICT)

### A. CONTROLLERS (The Traffic Cop)
- **Role**: Validate input, Call Service, Return Response (DTO/Resource).
- **Prohibited**: DB queries, Business Logic, State calculations.
- **Allowed**: `Service::call()`, `Request::validate()`, `Response::json()`.

### B. SERVICES (The Brain)
- **Role**: Business logic, State Machine transitions, Third-party integrations.
- **Input**: Strictly Typed DTOs.
- **Output**: Typed DTOs or Models.
- **Prohibited**: Direct HTTP responses (json), Direct Request access.

### C. REPOSITORIES (The Storage)
- **Role**: Database queries, Pagination, Filtering.
- **Prohibited**: Business logic, Request handling.
- **Mandatory**: Return Types on all methods.

### D. ENUMS (The Vocabulary)
- **Role**: Single source of truth for Statuses, Roles, Types, Currencies.
- **Mandatory**: All fixed sets of strings MUST be Enums.

## 4. CODE STYLE & STANDARDS
- **Strict Types**: `declare(strict_types=1);` in all PHP files.
- **Type Hinting**: All method arguments and return values must be typed.
- **Error Handling**: Use Custom Exceptions, not generic `\Exception`.
- **Logging**: Log state transitions and critical failures (Compliance).

## 5. COMPLIANCE & SECURITY
- **Traceability**: All Admin actions must be logged.
- **Auditing**: History tables for Price, Status, and Stock changes.
- **Sanitization**: All inputs validated via FormRequests.

## 6. WORKFLOW
1. Define Enums/Contracts.
2. Implement Repository.
3. Implement Service (with DTOs).
4. Implement Controller (thin).
5. Add Routes.
6. **Verify CI Pass.**

---
*This document is enforced by `backend/ci/hardcode_guard.sh` and GitHub Actions.*
