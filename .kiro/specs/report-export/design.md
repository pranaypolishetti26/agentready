# Markdown report export design

Status: **draft proposal**, dependent on requirement approval.

## Small implementation

Add a pure `serializeReport(snapshot, analysis)` function to src/report.js. Use the existing snapshot and analysis contracts; do not change scoring. Place escaping and safe filename helpers beside the serializer. Keep network and DOM operations out of that module.

In app.js retain the successfully rendered snapshot/report in existing state. Enable a Download Markdown button after success. Use Blob with a UTF-8 text MIME type, a temporary anchor with download, and a short deferred URL.revokeObjectURL call after click. Verify browser behavior, including repeated downloads and starting another analysis.

## Requirement mapping

- EX-1: existing success state plus browser Blob download.
- EX-2: pure serialization, explicit truncation disclosure and escaped external text.
- EX-3: actual button semantics, sanitized filename and object URL cleanup.

Export structured sections using generated headings. Render external values as escaped plain text; validate any emitted repository link as an https github.com URL. Exclude external descriptions initially to keep content predictable.

## Verification

Unit tests: fixture with all signal states; exact deterministic output; truncation warning; Markdown metacharacters; unsafe filename input; empty recommendation list.

Properties: serialization determinism, filename always ending in .md without separators, and external text not injecting headings/links. Implement these with generated inputs after the public contract is agreed.

Integration: exercise app export wiring with controlled snapshot data and validate that no new fetch occurs. Add a suitable integration approach rather than relabeling unit tests. Browser smoke: keyboard activation, loading/error states, repeat download and inspect saved text.

Open question: select a lightweight browser integration tool or existing harness before adding dependencies. This package does not install a new testing framework.
