# Repository analysis requirements

Status: **draft baseline reconstructed from the starter source**. This is not a record of a Kiro-created spec or an approved workflow.

## RA-1: Public repository input

As a developer, I want to select a public GitHub repository.

- WHEN a supported GitHub URL is entered, THE system SHALL identify the owner and repository.
- WHEN the input is invalid or belongs to another host, THE system SHALL show a useful validation error.
- THE system SHALL support a .git suffix.
- Baseline caveat: the parser currently accepts extra path segments and does not restrict URL scheme. Hardening is a future decision, not existing behavior.

## RA-2: Snapshot retrieval

- WHEN analysis starts, THE system SHALL retrieve metadata and the recursive file tree for the default branch.
- THE system SHALL use file/blob paths for analysis.
- WHEN GitHub returns 404 or 403, THE system SHALL show the starter's useful error messages.
- WHEN a tree is truncated, THE system SHALL expose that limitation in the report UI.

## RA-3: Readiness scoring

- THE system SHALL check the eight documented signals with weights totaling 100.
- THE system SHALL return an integer score between 0 and 100.
- THE system SHALL return the same result for reordered or duplicated path inputs.
- THE system SHALL ignore non-string and blank path entries.
- THE system SHALL detect supported path markers case-insensitively.
- WHEN more paths are added, THE score SHALL not decrease.
- THE system SHALL label scores >=85 Agent-ready, >=65 Good foundation, >=40 Needs context, otherwise Early stage.

## RA-4: Report and recommendations

- THE system SHALL show checks, evidence and missing-signal recommendations.
- THE system SHALL order missing-signal recommendations by descending weight.
- THE system SHALL disclose that scoring is based on structural signals rather than a security or quality audit.

## RA-5: Runtime boundaries

- THE system SHALL run analysis in the browser without a database or model call.
- THE system SHALL not embed GitHub credentials in the frontend.
- Repository data SHALL be treated as untrusted display input.

## Review items

Verify each statement against current app.js and the rendered UI. Especially inspect truncation disclosure and safe DOM rendering. File presence is evidence of a heuristic only; source/test execution remains authoritative.
