---
inclusion: manual
---
# Git conventions

Read this before creating branches, commits or pull requests.

Branch: `feature/<ticket-or-short-id>/<kebab-case-description>` or `bugfix/<ticket-or-short-id>/<kebab-case-description>`. Do not invent a Jira ticket. If no ticket exists, agree a short descriptive identifier.

Commit subject: `feat|fix|chore|docs|test: Capitalized imperative subject`.
A body is required, with concrete "- " bullets. Avoid "done", "did" and "implemented".

Example:
```text
feat: Add Markdown report export

- Add report serialization and browser download
- Cover report contents and filename handling
```

PR text should explain the requirement or bug, resulting behavior and actual verification. Inspect repository-specific PR conventions first.

Local commits are allowed when authorized. Before remote push, complete unit and relevant integration tests. Obtain an explicit exception if integration coverage is unavailable. Creating a commit does not authorize sending a PR or publishing evidence.
