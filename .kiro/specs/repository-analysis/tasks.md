# Baseline review tasks

Status: **unperformed review tasks**. The existing application was supplied separately; these boxes do not imply it was built through this spec.

- [ ] 1. Review RA-1 and RA-2 against github.js and app.js.
  - Document URL edge cases, rate-limit behavior and truncation disclosure.
  - _Requirements: RA-1, RA-2_

- [ ] 2. Review RA-3 and RA-4 against analyzer.js and report rendering.
  - Verify weights, thresholds, evidence and recommendation order.
  - _Requirements: RA-3, RA-4_

- [ ] 3. Execute existing unit tests and bundled properties in Kiro.
  - Run `node .kiro/scripts/validate.mjs`; record actual result and seed.
  - _Requirements: RA-1, RA-3_

- [ ] 4. Add appropriate mocked API integration coverage where missing.
  - Exercise successful metadata/tree flow, 404, 403 and truncated tree.
  - _Requirements: RA-2, RA-5_

- [ ] 5. Exercise real Kiro configuration.
  - Verify steering, a real hook trigger, repo-analyzer, authenticated MCP read and installed Power activation.
  - Record observations in EVIDENCE.md.
  - _Requirements: RA-3, RA-5_
