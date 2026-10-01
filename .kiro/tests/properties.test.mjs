import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRepository } from '../../src/analyzer.js';
import { parseGitHubRepoUrl } from '../../src/github.js';

// Dependency-free generated-input checks. Reproducible, without shrinking.
const RUNS = 500;
const SEED = Number(process.env.AGENTREADY_PROPERTY_SEED ?? 20260929) >>> 0;
const POOL = [
  'README.md', 'README.rst', 'README', 'AGENTS.md', 'CLAUDE.md',
  '.cursorrules', '.kiro/steering/product.md', '.gitignore',
  'package.json', 'pom.xml', 'pyproject.toml', 'Cargo.toml',
  'tests/unit.js', 'src/test/java/AppTest.java', 'src/lib.test.js',
  '.github/workflows/ci.yml', 'bitbucket-pipelines.yml',
  '.gitlab-ci.yml', 'Jenkinsfile', 'buildspec.yaml',
  'ARCHITECTURE.md', 'DESIGN.md', 'docs/architecture/index.md',
  'docs/design-overview.md', 'CONTRIBUTING.md', '.github/CONTRIBUTING.md',
  'src/README.md', 'package.json.bak', 'docs/index.md', 'README.md/'
];

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function token(rng, max = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-';
  const size = 1 + Math.floor(rng() * max);
  return Array.from({ length: size }, () => chars[Math.floor(rng() * chars.length)]).join('');
}

function paths(rng) {
  return Array.from({ length: Math.floor(rng() * 70) }, () =>
    rng() < 0.7 ? POOL[Math.floor(rng() * POOL.length)] : `src/${token(rng)}/${token(rng)}.js`
  );
}

function shuffle(values, rng) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function property(name, offset, check) {
  test(`${name} (${RUNS} generated cases; seed ${SEED})`, () => {
    const rng = random((SEED + offset) >>> 0);
    for (let i = 0; i < RUNS; i++) {
      try {
        check(rng);
      } catch (error) {
        error.message = `seed=${SEED}, offset=${offset}, case=${i}: ${error.message}`;
        throw error;
      }
    }
  });
}

property('P1: Score bounds and check consistency', 1, (rng) => {
  const input = paths(rng);
  const report = analyzeRepository(input);
  assert.ok(Number.isInteger(report.score), JSON.stringify(input));
  assert.ok(report.score >= 0 && report.score <= 100, JSON.stringify(input));
  assert.equal(report.score, report.checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0));
  assert.equal(report.signalsFound, report.checks.filter((c) => c.passed).length);
});

property('P2: Permutation invariance', 2, (rng) => {
  const input = paths(rng);
  assert.deepEqual(analyzeRepository(shuffle(input, rng)), analyzeRepository(input), JSON.stringify(input));
});

property('P3: Duplicate invariance', 3, (rng) => {
  const input = paths(rng);
  assert.deepEqual(analyzeRepository([...input, ...input]), analyzeRepository(input), JSON.stringify(input));
});

property('P4: Adding paths cannot lower score', 4, (rng) => {
  const input = paths(rng);
  const extra = paths(rng);
  assert.ok(analyzeRepository([...input, ...extra]).score >= analyzeRepository(input).score,
    JSON.stringify({ input, extra }));
});

property('P5: Case-insensitive signal detection', 5, (rng) => {
  const input = paths(rng);
  const recased = input.map((p) => [...p].map((c) => rng() < 0.5 ? c.toUpperCase() : c.toLowerCase()).join(''));
  assert.deepEqual(analyzeRepository(recased), analyzeRepository(input), JSON.stringify(input));
});

property('P6: Supported GitHub URL round trips', 6, (rng) => {
  const owner = `owner-${token(rng)}`;
  const repo = `repo-${token(rng)}`;
  const host = rng() < 0.5 ? 'github.com' : 'www.github.com';
  const suffix = rng() < 0.5 ? '.git' : '';
  const trailing = rng() < 0.5 ? '/' : '';
  const url = `https://${host}/${owner}/${repo}${suffix}${trailing}`;
  assert.deepEqual(parseGitHubRepoUrl(url), { owner, repo }, url);
});

property('P7: Ignore non-string and blank entries', 7, (rng) => {
  const input = paths(rng);
  const invalid = [null, undefined, rng(), false, {}, [], '', ' ', '\t'];
  assert.deepEqual(analyzeRepository(shuffle([...input, ...invalid], rng)), analyzeRepository(input), JSON.stringify(input));
});
