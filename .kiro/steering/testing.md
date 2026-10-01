---
inclusion: fileMatch
fileMatchPattern: ["src/**/*.js", "tests/**/*", ".kiro/tests/**/*", "server.js"]
---
# Testing

Use node:test and node:assert/strict. Unit tests should check observable behavior, including boundaries and errors; do not mirror internal implementation.

Keep generated-input properties independent of exact implementation: score bounds, permutation invariance, duplicate invariance, monotonic score with added paths, case-insensitive detection and valid GitHub URL round trips. Record seed and case on failure. The bundled generator is deliberately lightweight and has no shrinking; a mature property-testing library can be proposed if needed.

Mock GitHub fetch responses for integration checks. Cover 404, rate limit, truncated trees and partial failure without live network dependence. For UI changes, exercise empty/loading/success/error and narrow-screen states.

Commands:
- Existing suite: `npm test`.
- Explicit properties: `node --test .kiro/tests/properties.test.mjs`.
- Combined verification: `node .kiro/scripts/validate.mjs`.

Do not say a hook guarantees a push gate. Failures reported by post-event hooks still require action. Add the combined command to CI separately if desired.
