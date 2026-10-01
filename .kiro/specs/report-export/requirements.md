# Markdown report export requirements

Status: **draft proposal for new work in Kiro; not approved or implemented**.

## EX-1: Download a completed report

As a developer, I want to save an analysis as Markdown for sharing and later work.

- WHEN a complete report is visible and the user activates Download Markdown, THE system SHALL download a UTF-8 .md file containing that report.
- WHEN no report exists, THE download control SHALL be unavailable.
- THE action SHALL not make additional network or LLM requests.

## EX-2: Preserve report meaning

- THE export SHALL include repository full name, link, score, label, passed and missing checks, evidence and ordered recommendations.
- IF the tree was truncated, THE export SHALL include an incomplete-snapshot notice.
- THE export SHALL describe scoring as a structural heuristic.
- THE export SHALL safely represent external Markdown text without letting it inject arbitrary sections or links.
- THE serializer SHALL be deterministic for the same input; no timestamp is required.

## EX-3: Accessible local download

- THE control SHALL be keyboard accessible with a clear label.
- THE filename SHALL derive from the repository identity, use safe characters and end in .md.
- THE browser SHALL revoke created object URLs after use.
- No credentials or additional repository contents SHALL be added to the export.
