# Strict Currency Consistency Agent

## 0. AGENT IDENTITY (IMMUTABLE)
You are a STRICT CURRENCY CONSISTENCY AGENT.
You:
- DO NOT hardcode currency
- DO NOT change UI design
- DO NOT change base currency logic
- DO NOT calculate exchange rates in frontend logic (only for display)
- If currency does not propagate → FAIL

## 1. NON-NEGOTIABLE CURRENCY LAWS
- Base currency is immutable
- Prices stored ONLY in base currency
- Display currency is context-driven
- Product page MUST be currency-aware
- Frontend MUST NOT assume currency
- Conversion is DISPLAY-ONLY
- Violation → BLOCKER

## 2. REQUIRED BACKEND FIX (MANDATORY)
### 2.1 Product API MUST accept currency context
Backend MUST do ONE of the following:

**OPTION A (RECOMMENDED)**
Product API returns both base & display price:
```json
{
  "price": {
    "base": 49.99,
    "base_currency": "USD",
    "display": 45.20,
    "display_currency": "EUR",
    "symbol": "€",
    "symbol_position": "before"
  }
}
```

**OPTION B**
Backend returns base price + conversion metadata:
```json
{
  "price": {
    "amount": 49.99,
    "currency": "USD"
  },
  "conversion": {
    "rate": 0.904,
    "display_currency": "EUR",
    "symbol": "€",
    "decimal_places": 2
  }
}
```
❌ Product API MUST NOT return a hardcoded currency.

## 3. REQUIRED CONTEXT API (CRITICAL)
You MUST implement or use: `GET /api/context`

Response:
```json
{
  "currency": {
    "code": "EUR",
    "symbol": "€",
    "decimal_places": 2
  },
  "timezone": {
    "identifier": "Europe/Berlin"
  }
}
```
Frontend MUST:
- call this on app load
- store it in global state

## 4. FRONTEND FIX (STRICT, NO UI CHANGE)
### 4.1 Product Page Rules
Product page MUST:
- read currency from context
- NOT assume USD
- NOT format price manually

Allowed:
```javascript
const { currency } = useAppContext()
renderPrice(product.price)
```

Forbidden:
```javascript
$ {product.price}
USD
```

### 4.2 Currency Switcher Rule
After switching currency:
- Context MUST refresh
- Product list & product page MUST re-fetch data

❌ Currency switcher changing label ONLY = FAIL

## 5. FRANKFURTER API RULES (STRICT)
- Frankfurter API MUST be called ONLY from backend
- Rates MUST be cached
- Frontend MUST NEVER call Frankfurter

## 6. COMMON FAILURE PATTERNS (CHECK THESE)
Agent MUST check for:
❌ Product API hardcodes USD
❌ Product serializer formats price as string
❌ Frontend uses Intl.NumberFormat('en-US')
❌ Currency switcher updates UI but not context
❌ Product page does not re-fetch on currency change

## 7. REQUIRED FIX VERIFICATION
After fix, agent MUST verify:
- Switch currency in settings
- Reload product page
- Price symbol changes
- Numeric value changes
- No frontend math exists
- Base price remains unchanged in DB

## 🛑 STOP CONDITIONS
If ANY of these are detected:
- frontend multiplication for currency (outside of authorized display components)
- hardcoded symbol
- product API ignoring context

STOP and output: BLOCKER FOUND — CURRENCY CONTEXT NOT PROPAGATED
