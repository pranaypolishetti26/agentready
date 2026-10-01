---
inclusion: always
---
# Structure

- index.html: application page and entry markup.
- src/app.js: browser events, state, rendering and report UI.
- src/github.js: URL parsing and public GitHub API snapshot retrieval.
- src/analyzer.js: pure readiness checks, weights, labels and recommendations.
- src/styles.css: responsive application styling.
- server.js: local static development server.
- tests/analyzer.test.js: current Node unit tests for analyzer and parser.
- .github/workflows/: existing GitHub Actions configuration.
- .kiro/: project context, draft specs, hooks, custom agent and Power source.

Keep scoring pure and independent of DOM/network access. Put new report serialization in src/report.js if the export spec is approved. Treat source code and executed tests as authoritative when draft documents disagree.
