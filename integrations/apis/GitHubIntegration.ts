/**
 * GitHubIntegration.ts
 * Adapter for GitHub REST API integration.
 * Supports repository operations, issues, PRs, Actions, and search.
 */

import { BaseIntegration, IntegrationAction, IntegrationActionResult, IntegrationStatus, IntegrationConfig } from '../../core/integration/IIntegration';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';

interface GitHubResponse {
  status: number;
  data: any;
  headers: any;
}

export class GitHubIntegration extends BaseIntegration {
  private apiToken?: string;
  private apiBaseUrl = 'https://api.github.com';

  constructor(config: IntegrationConfig) {
	super(config);
  }

  async initialize(): Promise<void> {
	console.log(`[GitHubIntegration] Initializing...`);
	this.status = IntegrationStatus.INITIALIZING;

	try {
	  // Try to load GitHub token from environment or vault
	  this.apiToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

	  if (this.apiToken) {
		// Verify token by making a test API call
		const testResult = await this.apiRequest('GET', '/user');
		if (testResult.status === 200) {
		  this.status = IntegrationStatus.AVAILABLE;
		  this.version = 'v3'; // GitHub REST API version
		  console.log(`[GitHubIntegration] ✓ Authenticated as ${testResult.data.login}`);
		} else {
		  this.status = IntegrationStatus.ERROR;
		  console.log(`[GitHubIntegration] ✗ Token validation failed`);
		}
	  } else {
		this.status = IntegrationStatus.OFFLINE;
		console.log(`[GitHubIntegration] No GitHub token found. Set GITHUB_TOKEN environment variable.`);
	  }

	  this.lastStatusCheck = new Date();
	} catch (error) {
	  this.status = IntegrationStatus.ERROR;
	  console.error(`[GitHubIntegration] Initialization error:`, error);
	}
  }

  async execute(action: IntegrationAction): Promise<IntegrationActionResult> {
	const startTime = Date.now();

	if (this.status !== IntegrationStatus.AVAILABLE) {
	  return this.createError('GitHub integration not available. Check API token.', Date.now() - startTime);
	}

	try {
	  switch (action.action) {
		case 'get-user':
		  return await this.getUser();
		case 'list-repos':
		  return await this.listRepos(action.params?.username);
		case 'get-repo':
		  return await this.getRepo(action.params?.owner, action.params?.repo);
		case 'create-repo':
		  return await this.createRepo(action.params);
		case 'list-issues':
		  return await this.listIssues(action.params?.owner, action.params?.repo, action.params?.state);
		case 'create-issue':
		  return await this.createIssue(action.params?.owner, action.params?.repo, action.params?.title, action.params?.body);
		case 'list-prs':
		  return await this.listPRs(action.params?.owner, action.params?.repo, action.params?.state);
		case 'create-pr':
		  return await this.createPR(action.params?.owner, action.params?.repo, action.params);
		case 'search-code':
		  return await this.searchCode(action.params?.query);
		case 'search-repos':
		  return await this.searchRepos(action.params?.query);
		case 'get-file':
		  return await this.getFile(action.params?.owner, action.params?.repo, action.params?.path);
		case 'create-file':
		  return await this.createFile(action.params?.owner, action.params?.repo, action.params?.path, action.params?.content, action.params?.message);
		default:
		  return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
	  }
	} catch (error) {
	  return this.createError(String(error), Date.now() - startTime);
	}
  }

  async getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>> {
	return [
	  { name: 'get-user', description: 'Get authenticated user info', params: [] },
	  { name: 'list-repos', description: 'List repositories', params: ['username'] },
	  { name: 'get-repo', description: 'Get repository details', params: ['owner', 'repo'] },
	  { name: 'create-repo', description: 'Create a new repository', params: ['name', 'description', 'private'] },
	  { name: 'list-issues', description: 'List issues in a repository', params: ['owner', 'repo', 'state'] },
	  { name: 'create-issue', description: 'Create a new issue', params: ['owner', 'repo', 'title', 'body'] },
	  { name: 'list-prs', description: 'List pull requests', params: ['owner', 'repo', 'state'] },
	  { name: 'create-pr', description: 'Create a pull request', params: ['owner', 'repo', 'title', 'head', 'base', 'body'] },
	  { name: 'search-code', description: 'Search code across GitHub', params: ['query'] },
	  { name: 'search-repos', description: 'Search repositories', params: ['query'] },
	  { name: 'get-file', description: 'Get file contents from repo', params: ['owner', 'repo', 'path'] },
	  { name: 'create-file', description: 'Create or update a file', params: ['owner', 'repo', 'path', 'content', 'message'] },
	];
  }

  async shutdown(): Promise<void> {
	console.log('[GitHubIntegration] Shutting down...');
	this.status = IntegrationStatus.STOPPED;
  }

  // ----------------------------
  // GitHub API Actions
  // ----------------------------

  private async getUser(): Promise<IntegrationActionResult> {
	const response = await this.apiRequest('GET', '/user');
	if (response.status === 200) {
	  return this.createSuccess(response.data, `Authenticated as ${response.data.login}`);
	}
	return this.createError(`Failed to get user: ${response.status}`);
  }

  private async listRepos(username?: string): Promise<IntegrationActionResult> {
	const endpoint = username ? `/users/${username}/repos` : '/user/repos';
	const response = await this.apiRequest('GET', endpoint);

	if (response.status === 200) {
	  return this.createSuccess(response.data, `Found ${response.data.length} repositories`);
	}
	return this.createError(`Failed to list repos: ${response.status}`);
  }

  private async getRepo(owner?: string, repo?: string): Promise<IntegrationActionResult> {
	if (!owner || !repo) {
	  return this.createError('owner and repo are required');
	}

	const response = await this.apiRequest('GET', `/repos/${owner}/${repo}`);

	if (response.status === 200) {
	  return this.createSuccess(response.data, `Repository: ${response.data.full_name}`);
	}
	return this.createError(`Failed to get repo: ${response.status}`);
  }

  private async createRepo(params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (!params?.name) {
	  return this.createError('name is required');
	}

	const body = {
	  name: params.name,
	  description: params.description || '',
	  private: params.private || false,
	  auto_init: params.auto_init !== false,
	};

	const response = await this.apiRequest('POST', '/user/repos', body);

	if (response.status === 201) {
	  return this.createSuccess(response.data, `Repository created: ${response.data.full_name}`);
	}
	return this.createError(`Failed to create repo: ${response.status} - ${JSON.stringify(response.data)}`);
  }

  private async listIssues(owner?: string, repo?: string, state?: string): Promise<IntegrationActionResult> {
	if (!owner || !repo) {
	  return this.createError('owner and repo are required');
	}

	const stateParam = state || 'open';
	const response = await this.apiRequest('GET', `/repos/${owner}/${repo}/issues?state=${stateParam}`);

	if (response.status === 200) {
	  return this.createSuccess(response.data, `Found ${response.data.length} ${stateParam} issues`);
	}
	return this.createError(`Failed to list issues: ${response.status}`);
  }

  private async createIssue(owner?: string, repo?: string, title?: string, body?: string): Promise<IntegrationActionResult> {
	if (!owner || !repo || !title) {
	  return this.createError('owner, repo, and title are required');
	}

	const issueData = {
	  title,
	  body: body || '',
	};

	const response = await this.apiRequest('POST', `/repos/${owner}/${repo}/issues`, issueData);

	if (response.status === 201) {
	  return this.createSuccess(response.data, `Issue created: #${response.data.number} - ${response.data.title}`);
	}
	return this.createError(`Failed to create issue: ${response.status}`);
  }

  private async listPRs(owner?: string, repo?: string, state?: string): Promise<IntegrationActionResult> {
	if (!owner || !repo) {
	  return this.createError('owner and repo are required');
	}

	const stateParam = state || 'open';
	const response = await this.apiRequest('GET', `/repos/${owner}/${repo}/pulls?state=${stateParam}`);

	if (response.status === 200) {
	  return this.createSuccess(response.data, `Found ${response.data.length} ${stateParam} PRs`);
	}
	return this.createError(`Failed to list PRs: ${response.status}`);
  }

  private async createPR(owner?: string, repo?: string, params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (!owner || !repo || !params?.title || !params?.head || !params?.base) {
	  return this.createError('owner, repo, title, head, and base are required');
	}

	const prData = {
	  title: params.title,
	  head: params.head,
	  base: params.base,
	  body: params.body || '',
	};

	const response = await this.apiRequest('POST', `/repos/${owner}/${repo}/pulls`, prData);

	if (response.status === 201) {
	  return this.createSuccess(response.data, `PR created: #${response.data.number} - ${response.data.title}`);
	}
	return this.createError(`Failed to create PR: ${response.status}`);
  }

  private async searchCode(query?: string): Promise<IntegrationActionResult> {
	if (!query) {
	  return this.createError('query is required');
	}

	const encodedQuery = encodeURIComponent(query);
	const response = await this.apiRequest('GET', `/search/code?q=${encodedQuery}`);

	if (response.status === 200) {
	  return this.createSuccess(response.data, `Found ${response.data.total_count} code results`);
	}
	return this.createError(`Failed to search code: ${response.status}`);
  }

  private async searchRepos(query?: string): Promise<IntegrationActionResult> {
	if (!query) {
	  return this.createError('query is required');
	}

	const encodedQuery = encodeURIComponent(query);
	const response = await this.apiRequest('GET', `/search/repositories?q=${encodedQuery}`);

	if (response.status === 200) {
	  return this.createSuccess(response.data, `Found ${response.data.total_count} repositories`);
	}
	return this.createError(`Failed to search repos: ${response.status}`);
  }

  private async getFile(owner?: string, repo?: string, filePath?: string): Promise<IntegrationActionResult> {
	if (!owner || !repo || !filePath) {
	  return this.createError('owner, repo, and path are required');
	}

	const response = await this.apiRequest('GET', `/repos/${owner}/${repo}/contents/${filePath}`);

	if (response.status === 200) {
	  const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
	  return this.createSuccess({
		...response.data,
		decodedContent: content,
	  }, `File retrieved: ${filePath}`);
	}
	return this.createError(`Failed to get file: ${response.status}`);
  }

  private async createFile(owner?: string, repo?: string, filePath?: string, content?: string, message?: string): Promise<IntegrationActionResult> {
	if (!owner || !repo || !filePath || !content || !message) {
	  return this.createError('owner, repo, path, content, and message are required');
	}

	const encodedContent = Buffer.from(content).toString('base64');
	const fileData = {
	  message,
	  content: encodedContent,
	};

	const response = await this.apiRequest('PUT', `/repos/${owner}/${repo}/contents/${filePath}`, fileData);

	if (response.status === 201 || response.status === 200) {
	  return this.createSuccess(response.data, `File created/updated: ${filePath}`);
	}
	return this.createError(`Failed to create/update file: ${response.status}`);
  }

  // ----------------------------
  // Helper Methods
  // ----------------------------

  private async apiRequest(method: string, endpoint: string, body?: any): Promise<GitHubResponse> {
	return new Promise((resolve, reject) => {
	  const url = new URL(endpoint, this.apiBaseUrl);

	  const options: https.RequestOptions = {
		method,
		headers: {
		  'User-Agent': 'Lucy-Sovereign-351',
		  'Accept': 'application/vnd.github+json',
		  'Authorization': `Bearer ${this.apiToken}`,
		  'X-GitHub-Api-Version': '2022-11-28',
		},
	  };

	  if (body) {
		options.headers!['Content-Type'] = 'application/json';
	  }

	  const req = https.request(url, options, (res) => {
		let data = '';

		res.on('data', (chunk) => {
		  data += chunk;
		});

		res.on('end', () => {
		  try {
			const parsed = data ? JSON.parse(data) : {};
			resolve({
			  status: res.statusCode || 500,
			  data: parsed,
			  headers: res.headers,
			});
		  } catch (error) {
			resolve({
			  status: res.statusCode || 500,
			  data: { raw: data },
			  headers: res.headers,
			});
		  }
		});
	  });

	  req.on('error', (error) => {
		reject(error);
	  });

	  if (body) {
		req.write(JSON.stringify(body));
	  }

	  req.end();
	});
  }
}
