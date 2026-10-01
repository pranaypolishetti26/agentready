import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const local = (name) => path.join(root, name);
const json = (name) => JSON.parse(fs.readFileSync(local(name), 'utf8'));
const read = (name) => fs.readFileSync(local(name), 'utf8');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return [];
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full);
    return [full];
  });
}

function runNode(args, label, compact = false) {
  const result = spawnSync(process.execPath, args, {
    cwd: root, encoding: 'utf8', timeout: 45000, maxBuffer: 5 * 1024 * 1024,
    env: process.env
  });
  if (result.status !== 0 || result.error) {
    throw new Error(`${label} failed\n${result.stdout ?? ''}\n${result.stderr ?? ''}\n${result.error?.message ?? ''}`);
  }
  if (compact) {
    const match = result.stdout.match(/^# tests (\d+)/m);
    console.log(`PASS ${label}${match ? ` (${match[1]} tests)` : ''}`);
  }
}

try {
  assert.ok(Number(process.versions.node.split('.')[0]) >= 18, 'Node.js 18+ required');
  const pkg = json('package.json');
  assert.equal(pkg.type, 'module', 'Expected the AgentReady ES-module project');
  for (const name of ['src/analyzer.js', 'src/github.js', 'src/app.js', 'server.js', 'tests/analyzer.test.js']) {
    assert.ok(fs.existsSync(local(name)), `Missing AgentReady source: ${name}`);
  }

  for (const file of walk(local('.kiro')).filter((file) => file.endsWith('.json'))) {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const hooks = json('.kiro/hooks/validation.json');
  assert.equal(hooks.version, 'v1');
  assert.ok(Array.isArray(hooks.hooks) && hooks.hooks.length > 0);
  for (const hook of hooks.hooks) {
    assert.ok(['PostFileSave', 'PostTaskExec'].includes(hook.trigger));
    assert.equal(hook.action.type, 'command');
    assert.equal(hook.action.command, 'node .kiro/scripts/validate.mjs');
    if (hook.matcher) {
      const matcher = new RegExp(hook.matcher);
      for (const name of ['src/app.js', 'tests/analyzer.test.js', 'server.js', '.kiro/tests/properties.test.mjs']) {
        assert.ok(matcher.test(name), `Hook does not match ${name}`);
      }
      assert.ok(!matcher.test('.kiro/README.md'));
    }
  }
  const agent = json('.kiro/agents/repo-analyzer.json');
  assert.equal(agent.name, 'repo-analyzer');
  assert.deepEqual(agent.tools, ['read', '@github']);
  for (const resource of agent.resources) {
    assert.ok(resource.startsWith('file://'));
    assert.ok(fs.existsSync(local(resource.slice(7))), `Missing agent resource ${resource}`);
  }
  const mcp = json('.kiro/settings/mcp.json').mcpServers.github;
  assert.equal(mcp.url, 'https://api.githubcopilot.com/mcp/x/repos/readonly');
  assert.equal(mcp.headers.Authorization, 'Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}');
  assert.ok(typeof mcp.disabled === 'boolean');

  const power = json('.kiro/powers/repository-analysis/plugin.json');
  assert.equal(power.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.match(power.name, /^[a-z0-9-]+$/);
  assert.match(power.version, /^\d+\.\d+\.\d+$/);
  assert.ok(power.author.name && power.keywords.length);
  const skill = read('.kiro/powers/repository-analysis/skills/review-readiness/SKILL.md');
  assert.match(skill, /^---\nname: review-readiness\ndescription: .+\n---\n/);
  assert.ok(fs.existsSync(local('.kiro/powers/repository-analysis/skills/review-readiness/references/rubric.md')));

  for (const name of ['repository-analysis', 'report-export']) {
    for (const doc of ['requirements.md', 'design.md', 'tasks.md']) {
      assert.ok(fs.existsSync(local(`.kiro/specs/${name}/${doc}`)));
    }
  }
  console.log('PASS configuration shapes and file references (local checks, not official schema validation)');

  const sources = [...walk(local('src')), local('server.js'), ...walk(local('.kiro/scripts')), ...walk(local('.kiro/tests'))]
    .filter((file) => /\.(js|mjs)$/.test(file));
  for (const source of sources) runNode(['--check', source], `Syntax ${path.relative(root, source)}`);
  console.log(`PASS JavaScript syntax (${sources.length} files)`);

  const tests = walk(local('tests')).filter((file) => /\.(test|spec)\.(js|mjs)$/.test(file));
  assert.ok(tests.length > 0, 'No unit tests found');
  runNode(['--test', '--test-reporter=tap', ...tests], 'existing unit suite', true);
  runNode(['--test', '--test-reporter=tap', '.kiro/tests/properties.test.mjs'], '7 generated-input properties, 500 cases each', true);
  console.log('Validation passed. Live Kiro activation and integration checks are separate.');
} catch (error) {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
}
