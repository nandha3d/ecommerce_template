FRONTEND MUST ONLY CALL DECLARED APIs.

- No inline fetch/axios allowed in components
- All calls must go through:
  /services/*.api.ts

FAIL IF:
- Direct fetch found in JSX/TSX
- Hardcoded URL found
- Missing error handling
