import { analyzeRepository } from './analyzer.js';
import { fetchRepositorySnapshot, parseGitHubRepoUrl } from './github.js';

const $ = (selector) => document.querySelector(selector);

const form = $('#repo-form');
const input = $('#repo-url');
const button = $('#analyze-button');
const errorBox = $('#error');
const results = $('#results');

function setLoading(loading) {
  button.disabled = loading;
  button.textContent = loading ? 'Analyzing…' : 'Analyze repository';
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
}

function checkMarkup(check) {
  const status = check.passed ? 'pass' : 'warn';
  const icon = check.passed ? '✓' : '!';
  const evidence = check.evidence.length
    ? `<div class="check-evidence">${check.evidence.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>`
    : '';

  return `
    <article class="check ${status}">
      <div class="check-icon" aria-hidden="true">${icon}</div>
      <div>
        <div class="check-title-row">
          <h4>${escapeHtml(check.title)}</h4>
          <span class="weight">${check.weight} pts</span>
        </div>
        <p>${escapeHtml(check.message)}</p>
        ${evidence}
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function render(snapshot, analysis) {
  const { metadata } = snapshot;
  $('#repo-name').innerHTML = `<a href="${escapeHtml(metadata.htmlUrl)}" target="_blank" rel="noreferrer">${escapeHtml(metadata.fullName)}</a>`;

  const metaParts = [metadata.language || 'Language unknown', `${snapshot.paths.length.toLocaleString()} files scanned`, `default: ${metadata.defaultBranch}`];
  if (snapshot.truncated) metaParts.push('large repository: partial tree');
  $('#repo-meta').textContent = metaParts.join(' · ');

  $('#score-value').textContent = analysis.score;
  $('#score-ring').style.setProperty('--score', `${analysis.score * 3.6}deg`);
  $('#score-label').textContent = analysis.label;
  $('#signals-found').textContent = `${analysis.signalsFound}/${analysis.checks.length}`;
  $('#top-priority').textContent = analysis.topPriority;
  $('#checks').innerHTML = analysis.checks.map(checkMarkup).join('');

  const recommendations = analysis.recommendations.length
    ? analysis.recommendations.slice(0, 5)
    : [{ title: 'Keep context current', text: 'The main repository signals are present. Keep documentation and validation commands aligned with the codebase.' }];

  $('#recommendations').innerHTML = recommendations
    .map((item) => `<li><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></li>`)
    .join('');

  const evidence = analysis.checks.flatMap((check) => check.evidence.map((item) => ({ item, source: check.title })));
  $('#evidence').innerHTML = evidence.length
    ? evidence.map(({ item, source }) => `<div class="evidence-chip"><span>${escapeHtml(item)}</span><small>${escapeHtml(source)}</small></div>`).join('')
    : '<p class="muted">No common readiness signals were detected.</p>';

  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  setLoading(true);

  try {
    const { owner, repo } = parseGitHubRepoUrl(input.value);
    const snapshot = await fetchRepositorySnapshot(owner, repo);
    const analysis = analyzeRepository(snapshot.paths);
    render(snapshot, analysis);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Something went wrong.');
  } finally {
    setLoading(false);
  }
});
