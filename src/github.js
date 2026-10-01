const API_ROOT = 'https://api.github.com';

export function parseGitHubRepoUrl(value) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Enter a valid GitHub repository URL.');
  }

  if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) {
    throw new Error('AgentReady currently supports github.com repositories only.');
  }

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new Error('Use a repository URL like https://github.com/owner/repository.');
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, '');
  if (!owner || !repo) {
    throw new Error('Could not determine the repository owner and name.');
  }

  return { owner, repo };
}

async function requestJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  if (response.ok) return response.json();

  if (response.status === 404) {
    throw new Error('Repository not found. Make sure it is public and the URL is correct.');
  }
  if (response.status === 403) {
    throw new Error('GitHub API rate limit reached. Try again later or from a different network.');
  }

  throw new Error(`GitHub returned ${response.status}. Please try again.`);
}

export async function fetchRepositorySnapshot(owner, repo) {
  const metadata = await requestJson(`${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  const branch = metadata.default_branch;

  const tree = await requestJson(
    `${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`
  );

  const paths = (tree.tree || [])
    .filter((item) => item.type === 'blob' && typeof item.path === 'string')
    .map((item) => item.path);

  return {
    metadata: {
      name: metadata.name,
      fullName: metadata.full_name,
      description: metadata.description,
      language: metadata.language,
      stars: metadata.stargazers_count,
      defaultBranch: branch,
      htmlUrl: metadata.html_url
    },
    paths,
    truncated: Boolean(tree.truncated)
  };
}
