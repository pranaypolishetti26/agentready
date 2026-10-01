const lower = (value) => value.toLowerCase();

function pathSet(paths) {
  return new Set(paths.map(lower));
}

function hasExact(set, candidates) {
  return candidates.some((candidate) => set.has(lower(candidate)));
}

function hasMatch(paths, matcher) {
  return paths.some((path) => matcher.test(path));
}

function hasDirectory(paths, directory) {
  const prefix = `${directory.toLowerCase().replace(/\/$/, '')}/`;
  return paths.some((path) => lower(path).startsWith(prefix));
}

const SIGNALS = [
  {
    id: 'readme',
    title: 'Repository overview',
    weight: 12,
    good: 'README documentation is present.',
    bad: 'No root README was detected.',
    recommendation: 'Add a root README that explains the project purpose, setup, and common development commands.',
    evidence: (paths, set) => hasExact(set, ['README.md', 'README.rst', 'README.txt', 'README']) ? ['README'] : [],
    test: (paths, set) => hasExact(set, ['README.md', 'README.rst', 'README.txt', 'README'])
  },
  {
    id: 'agent-instructions',
    title: 'Agent instructions',
    weight: 18,
    good: 'Agent-specific instructions or Kiro context were detected.',
    bad: 'No AGENTS.md, .kiro context, or equivalent agent instructions were detected.',
    recommendation: 'Add concise repository-level agent instructions covering architecture, commands, boundaries, and validation expectations.',
    evidence: (paths, set) => [
      hasExact(set, ['AGENTS.md']) ? 'AGENTS.md' : null,
      hasDirectory(paths, '.kiro') ? '.kiro/' : null,
      hasExact(set, ['CLAUDE.md']) ? 'CLAUDE.md' : null,
      hasExact(set, ['.cursorrules']) ? '.cursorrules' : null
    ].filter(Boolean),
    test: (paths, set) => hasExact(set, ['AGENTS.md', 'CLAUDE.md', '.cursorrules']) || hasDirectory(paths, '.kiro')
  },
  {
    id: 'tests',
    title: 'Automated tests',
    weight: 16,
    good: 'Test files or test directories were detected.',
    bad: 'No clear automated test suite was detected.',
    recommendation: 'Add an automated test suite and document the exact command agents should run before proposing changes.',
    evidence: (paths) => {
      const found = [];
      if (hasDirectory(paths, 'test') || hasDirectory(paths, 'tests') || hasDirectory(paths, 'src/test')) found.push('test directory');
      if (hasMatch(paths, /(^|\/).*\.(test|spec)\.[a-z0-9]+$/i)) found.push('*.test / *.spec files');
      return found;
    },
    test: (paths) => hasDirectory(paths, 'test') || hasDirectory(paths, 'tests') || hasDirectory(paths, 'src/test') || hasMatch(paths, /(^|\/).*\.(test|spec)\.[a-z0-9]+$/i)
  },
  {
    id: 'ci',
    title: 'Continuous integration',
    weight: 12,
    good: 'CI configuration was detected.',
    bad: 'No common CI configuration was detected.',
    recommendation: 'Add CI that runs the same build, test, and lint checks expected from local development.',
    evidence: (paths, set) => [
      hasDirectory(paths, '.github/workflows') ? '.github/workflows/' : null,
      hasExact(set, ['bitbucket-pipelines.yml']) ? 'bitbucket-pipelines.yml' : null,
      hasExact(set, ['.gitlab-ci.yml']) ? '.gitlab-ci.yml' : null,
      hasExact(set, ['Jenkinsfile']) ? 'Jenkinsfile' : null,
      hasExact(set, ['buildspec.yml', 'buildspec.yaml']) ? 'AWS CodeBuild buildspec' : null
    ].filter(Boolean),
    test: (paths, set) => hasDirectory(paths, '.github/workflows') || hasExact(set, ['bitbucket-pipelines.yml', '.gitlab-ci.yml', 'Jenkinsfile', 'buildspec.yml', 'buildspec.yaml'])
  },
  {
    id: 'build',
    title: 'Build and dependency manifest',
    weight: 12,
    good: 'A standard build or dependency manifest was detected.',
    bad: 'No common build or dependency manifest was detected.',
    recommendation: 'Commit the project build/dependency manifest so an agent can reliably determine setup and validation commands.',
    evidence: (paths, set) => ['package.json', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'pyproject.toml', 'requirements.txt', 'go.mod', 'Cargo.toml', 'Gemfile'].filter((name) => hasExact(set, [name])),
    test: (paths, set) => hasExact(set, ['package.json', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'pyproject.toml', 'requirements.txt', 'go.mod', 'Cargo.toml', 'Gemfile'])
  },
  {
    id: 'architecture',
    title: 'Architecture context',
    weight: 12,
    good: 'Architecture or design documentation was detected.',
    bad: 'No obvious architecture/design documentation was detected.',
    recommendation: 'Add a short architecture note describing the main components, data flow, external dependencies, and important boundaries.',
    evidence: (paths, set) => [
      hasExact(set, ['ARCHITECTURE.md', 'DESIGN.md']) ? 'architecture/design document' : null,
      hasDirectory(paths, 'docs/architecture') ? 'docs/architecture/' : null,
      hasMatch(paths, /(^|\/)(architecture|design)[-_ ].*\.md$/i) ? 'architecture/design markdown' : null
    ].filter(Boolean),
    test: (paths, set) => hasExact(set, ['ARCHITECTURE.md', 'DESIGN.md']) || hasDirectory(paths, 'docs/architecture') || hasMatch(paths, /(^|\/)(architecture|design)[-_ ].*\.md$/i)
  },
  {
    id: 'contributing',
    title: 'Contribution workflow',
    weight: 10,
    good: 'Contribution guidance was detected.',
    bad: 'No contribution guidance was detected.',
    recommendation: 'Document branch, commit, PR, and review expectations so human and agent changes follow the same workflow.',
    evidence: (paths, set) => hasExact(set, ['CONTRIBUTING.md', '.github/CONTRIBUTING.md']) ? ['CONTRIBUTING.md'] : [],
    test: (paths, set) => hasExact(set, ['CONTRIBUTING.md', '.github/CONTRIBUTING.md'])
  },
  {
    id: 'gitignore',
    title: 'Workspace hygiene',
    weight: 8,
    good: 'A .gitignore file is present.',
    bad: 'No .gitignore was detected.',
    recommendation: 'Add a .gitignore so generated files, secrets, local state, and build artifacts stay out of agent-generated changes.',
    evidence: (paths, set) => hasExact(set, ['.gitignore']) ? ['.gitignore'] : [],
    test: (paths, set) => hasExact(set, ['.gitignore'])
  }
];

export function analyzeRepository(paths) {
  const normalizedPaths = Array.from(new Set(paths.filter((path) => typeof path === 'string' && path.trim())));
  const set = pathSet(normalizedPaths);

  const checks = SIGNALS.map((signal) => {
    const passed = signal.test(normalizedPaths, set);
    return {
      id: signal.id,
      title: signal.title,
      passed,
      weight: signal.weight,
      message: passed ? signal.good : signal.bad,
      recommendation: signal.recommendation,
      evidence: signal.evidence(normalizedPaths, set)
    };
  });

  const score = checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
  const recommendations = checks
    .filter((check) => !check.passed)
    .sort((a, b) => b.weight - a.weight)
    .map((check) => ({ title: check.title, text: check.recommendation, impact: check.weight }));

  const label = score >= 85 ? 'Agent-ready' : score >= 65 ? 'Good foundation' : score >= 40 ? 'Needs context' : 'Early stage';

  return {
    score,
    label,
    checks,
    recommendations,
    signalsFound: checks.filter((check) => check.passed).length,
    topPriority: recommendations[0]?.title || 'Maintain current standards'
  };
}
