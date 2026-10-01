# AgentReady

AgentReady is a lightweight web app that analyzes a **public GitHub repository** for structural signals that make AI coding agents easier to use safely and effectively.

It looks for repository context such as documentation, tests, CI, build manifests, agent instructions, architecture notes, contribution guidance, and workspace hygiene, then produces a readiness score and prioritized recommendations.

## Why this exists

AI coding agents perform better when a repository clearly explains how it is built, tested, reviewed, and structured. AgentReady turns those conventions into a quick structural health check.

## Features

- Analyze any public `github.com` repository
- 0–100 readiness score
- Detect common agent-context files such as `AGENTS.md` and `.kiro/`
- Detect automated tests and common CI systems
- Detect build/dependency manifests across several ecosystems
- Detect architecture and contribution documentation
- Prioritized recommendations based on missing signals
- No backend or database required
- No GitHub login required for basic use

## Run locally

Requirements: Node.js 18+

```bash
npm start
```

Open:

```text
http://localhost:4173
```

## Run tests

```bash
npm test
```

The tests use Node's built-in test runner, so there are no dependencies to install.

## How it works

AgentReady calls GitHub's public REST API in the browser:

1. Fetch repository metadata.
2. Fetch the default branch's recursive file tree.
3. Analyze file paths for readiness signals.
4. Generate a score, evidence list, and recommendations locally in the browser.

No repository contents are persisted by AgentReady.

## Current scoring model

| Signal | Weight |
| --- | ---: |
| Agent instructions | 18 |
| Automated tests | 16 |
| Repository overview | 12 |
| Continuous integration | 12 |
| Build/dependency manifest | 12 |
| Architecture context | 12 |
| Contribution workflow | 10 |
| Workspace hygiene | 8 |
| **Total** | **100** |

This score is an opinionated developer-experience heuristic, not a security or code-quality score.

## GitHub API limitation

Unauthenticated GitHub API requests are rate-limited. If the public API limit is reached, AgentReady shows an error and can be retried later.

## GitHub Pages

This project is fully static in the browser, so it can also be hosted with GitHub Pages. The included Node server is only for convenient local development.

## Kiro University note

If you are using this project for the 2026 Kiro University Challenge, read [`KIRO-NEXT-STEPS.md`](./KIRO-NEXT-STEPS.md) before submitting. The base project intentionally does not fabricate `.kiro` lesson evidence; the challenge-specific Kiro artifacts should come from meaningful work performed with Kiro.

## License

MIT
