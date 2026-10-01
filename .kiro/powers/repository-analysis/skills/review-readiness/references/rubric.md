# Repository review rubric

| Area | Inspect | Evidence needed |
| --- | --- | --- |
| Overview | README and setup instructions | Scope, prerequisites, real local commands |
| Agent context | AGENTS.md, scoped steering, equivalent files | Relevant boundaries and concise source links |
| Tests | Representative tests and runner configuration | Behavior covered, unit vs integration, runnable commands |
| CI | Workflow/pipeline files | Actual checks and remote gates |
| Build | Manifests and scripts | Stack, dependencies, reproducible setup |
| Architecture | Component/source boundaries and notes | Current data flow, external dependencies |
| Contributions | Branch/commit/PR guidance | Explicit conventions and review expectations |
| Hygiene | .gitignore and local state | Generated/secret files excluded without deleting needed context |

A structural signal is not a security assessment. Missing files may have equivalent conventions elsewhere. Ignored or external docs may not appear in a public tree. Do not inspect private files outside the requested scope.

Prefer a small actionable change over a long generic list. Every observation needs a source path; every unverified command must be labeled as unverified.
