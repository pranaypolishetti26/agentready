---
inclusion: always
---
# Technology

- Vanilla HTML/CSS/JavaScript, native ES modules, no framework or bundler.
- Node.js 18+; package.json has "type": "module"; no installed runtime dependencies.
- `npm start` launches server.js at http://localhost:4173.
- `npm test` runs the existing Node test suite.
- `node .kiro/scripts/validate.mjs` additionally checks configuration, syntax and explicit generated-input tests.
- Browser fetch calls GitHub REST metadata and a recursive default-branch tree. No GitHub token belongs in frontend code.
- Do not claim build, lint or integration commands exist unless verified. There is no compilation step in this starter.
- Request approval for a new dependency or stack change. Prefer native browser/Node APIs.
