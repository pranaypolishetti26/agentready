import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRepository } from '../src/analyzer.js';
import { parseGitHubRepoUrl } from '../src/github.js';

test('scores a well-documented repository highly', () => {
  const analysis = analyzeRepository([
    'README.md',
    'AGENTS.md',
    '.gitignore',
    'package.json',
    'tests/app.test.js',
    '.github/workflows/ci.yml',
    'ARCHITECTURE.md',
    'CONTRIBUTING.md'
  ]);

  assert.equal(analysis.score, 100);
  assert.equal(analysis.label, 'Agent-ready');
  assert.equal(analysis.recommendations.length, 0);
});

test('returns zero for an empty repository tree', () => {
  const analysis = analyzeRepository([]);
  assert.equal(analysis.score, 0);
  assert.equal(analysis.signalsFound, 0);
  assert.equal(analysis.topPriority, 'Agent instructions');
});

test('detects Spring tests and Maven build', () => {
  const analysis = analyzeRepository(['pom.xml', 'src/test/java/com/acme/AppTest.java']);
  const build = analysis.checks.find((check) => check.id === 'build');
  const tests = analysis.checks.find((check) => check.id === 'tests');
  assert.equal(build.passed, true);
  assert.equal(tests.passed, true);
});

test('detects Kiro directory as agent context', () => {
  const analysis = analyzeRepository(['.kiro/steering/product.md']);
  const check = analysis.checks.find((item) => item.id === 'agent-instructions');
  assert.equal(check.passed, true);
});

test('detects Bitbucket CI', () => {
  const analysis = analyzeRepository(['bitbucket-pipelines.yml']);
  const check = analysis.checks.find((item) => item.id === 'ci');
  assert.equal(check.passed, true);
});

test('deduplicates paths', () => {
  const a = analyzeRepository(['README.md', 'README.md']);
  const b = analyzeRepository(['README.md']);
  assert.equal(a.score, b.score);
});

test('parses normal GitHub URLs', () => {
  assert.deepEqual(parseGitHubRepoUrl('https://github.com/openai/openai-node'), {
    owner: 'openai',
    repo: 'openai-node'
  });
});

test('parses .git suffix', () => {
  assert.deepEqual(parseGitHubRepoUrl('https://github.com/acme/demo.git'), {
    owner: 'acme',
    repo: 'demo'
  });
});

test('rejects non-GitHub hosts', () => {
  assert.throws(() => parseGitHubRepoUrl('https://gitlab.com/acme/demo'), /github\.com/i);
});

test('rejects incomplete GitHub URLs', () => {
  assert.throws(() => parseGitHubRepoUrl('https://github.com/acme'), /repository URL/i);
});
