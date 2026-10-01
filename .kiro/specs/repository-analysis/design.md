# Repository analysis design

Status: **draft baseline**. Review against current source before relying on it.

## Existing flow

app.js receives user input, calls parseGitHubRepoUrl in github.js, fetches repository metadata and the default branch tree, then passes blob paths to analyzeRepository in analyzer.js. The browser renders results using app.js and styles.css. server.js is a convenience static development server.

## Contracts

- `parseGitHubRepoUrl(string)` → `{ owner, repo }`, or an Error.
- `fetchRepositorySnapshot(owner, repo)` → `{ metadata, paths, truncated }`.
- `analyzeRepository(paths)` → score, label, checks, recommendations, signalsFound and topPriority.

RA-1 belongs to URL parsing and UI input handling. RA-2 belongs to snapshot retrieval/error UI. RA-3 belongs to pure path scoring. RA-4 belongs to score projection and display. RA-5 spans network/display boundaries.

## Current scoring

| Signal | Weight |
| --- | ---: |
| Agent instructions | 18 |
| Tests | 16 |
| README | 12 |
| CI | 12 |
| Build manifest | 12 |
| Architecture | 12 |
| Contribution guidance | 10 |
| .gitignore | 8 |

Checks are presence-based and case-insensitive. Missing checks produce recommendations sorted by weight. They do not read README contents or execute target project commands.

## Correctness properties

- P1 / RA-3: integer score in [0,100], consistent with passed checks.
- P2 / RA-3: identical reports after path permutation.
- P3 / RA-3: identical reports after exact duplication.
- P4 / RA-3: adding paths cannot lower score.
- P5 / RA-3: changing path casing preserves report detection.
- P6 / RA-1: supported generated GitHub URL forms preserve owner/repo.
- P7 / RA-3: irrelevant non-string/blank entries do not change results.

The package includes seeded generated-input tests, not native Kiro correctness-session evidence. Cases have seed/index diagnostics; there is no automatic shrinking.

## Boundaries and gaps

Rate limits, incomplete trees and path-only signals affect confidence. Do not claim a test command works because a tests directory exists. Current unit coverage is not API or browser integration coverage. Review the static development server before any production use; deployment hardening is outside this baseline spec.
