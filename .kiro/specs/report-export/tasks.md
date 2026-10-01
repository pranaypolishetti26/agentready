# Markdown report export tasks

Status: **draft, all tasks pending**. Implement with Kiro after review.

- [ ] 1. Review requirements against current UI and approve scope.
  - Confirm EX-1 through EX-3 and integration-test approach.
  - _Requirements: EX-1, EX-2, EX-3_

- [ ] 2. Review design and implement pure serialization and filename handling.
  - Add src/report.js and unit tests; keep existing scoring behavior.
  - _Requirements: EX-2, EX-3_

- [ ] 3. Add generated-input properties for the agreed export contract.
  - Record seed/counterexample and any fixes.
  - _Requirements: EX-2, EX-3_

- [ ] 4. Wire accessible download into existing successful report state.
  - Blob download, control state and object URL cleanup.
  - _Requirements: EX-1, EX-3_

- [ ] 5. Add meaningful integration coverage and complete browser checks.
  - Prove exported data matches the visible report and no new fetch occurs.
  - Run existing unit tests, properties and the selected integration suite.
  - _Requirements: EX-1, EX-2, EX-3_

- [ ] 6. Record actual results, update usage docs and review changes.
  - Document what Kiro actually contributed; mark only completed tasks.
  - _Requirements: EX-1, EX-2, EX-3_
