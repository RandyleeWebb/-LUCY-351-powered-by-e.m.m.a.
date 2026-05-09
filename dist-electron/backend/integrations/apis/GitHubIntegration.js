"use strict";
/**
 * GitHubIntegration.ts
 * Adapter for GitHub REST API integration.
 * Supports repository operations, issues, PRs, Actions, and search.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubIntegration = void 0;
const IIntegration_1 = require("../../core/integration/IIntegration");
const https = __importStar(require("https"));
class GitHubIntegration extends IIntegration_1.BaseIntegration {
    constructor(config) {
        super(config);
        this.apiBaseUrl = 'https://api.github.com';
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[GitHubIntegration] Initializing...`);
            this.status = IIntegration_1.IntegrationStatus.INITIALIZING;
            try {
                // Try to load GitHub token from environment or vault
                this.apiToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
                if (this.apiToken) {
                    // Verify token by making a test API call
                    const testResult = yield this.apiRequest('GET', '/user');
                    if (testResult.status === 200) {
                        this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                        this.version = 'v3'; // GitHub REST API version
                        console.log(`[GitHubIntegration] ✓ Authenticated as ${testResult.data.login}`);
                    }
                    else {
                        this.status = IIntegration_1.IntegrationStatus.ERROR;
                        console.log(`[GitHubIntegration] ✗ Token validation failed`);
                    }
                }
                else {
                    this.status = IIntegration_1.IntegrationStatus.OFFLINE;
                    console.log(`[GitHubIntegration] No GitHub token found. Set GITHUB_TOKEN environment variable.`);
                }
                this.lastStatusCheck = new Date();
            }
            catch (error) {
                this.status = IIntegration_1.IntegrationStatus.ERROR;
                console.error(`[GitHubIntegration] Initialization error:`, error);
            }
        });
    }
    execute(action) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
            const startTime = Date.now();
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError('GitHub integration not available. Check API token.', Date.now() - startTime);
            }
            try {
                switch (action.action) {
                    case 'get-user':
                        return yield this.getUser();
                    case 'list-repos':
                        return yield this.listRepos((_a = action.params) === null || _a === void 0 ? void 0 : _a.username);
                    case 'get-repo':
                        return yield this.getRepo((_b = action.params) === null || _b === void 0 ? void 0 : _b.owner, (_c = action.params) === null || _c === void 0 ? void 0 : _c.repo);
                    case 'create-repo':
                        return yield this.createRepo(action.params);
                    case 'list-issues':
                        return yield this.listIssues((_d = action.params) === null || _d === void 0 ? void 0 : _d.owner, (_e = action.params) === null || _e === void 0 ? void 0 : _e.repo, (_f = action.params) === null || _f === void 0 ? void 0 : _f.state);
                    case 'create-issue':
                        return yield this.createIssue((_g = action.params) === null || _g === void 0 ? void 0 : _g.owner, (_h = action.params) === null || _h === void 0 ? void 0 : _h.repo, (_j = action.params) === null || _j === void 0 ? void 0 : _j.title, (_k = action.params) === null || _k === void 0 ? void 0 : _k.body);
                    case 'list-prs':
                        return yield this.listPRs((_l = action.params) === null || _l === void 0 ? void 0 : _l.owner, (_m = action.params) === null || _m === void 0 ? void 0 : _m.repo, (_o = action.params) === null || _o === void 0 ? void 0 : _o.state);
                    case 'create-pr':
                        return yield this.createPR((_p = action.params) === null || _p === void 0 ? void 0 : _p.owner, (_q = action.params) === null || _q === void 0 ? void 0 : _q.repo, action.params);
                    case 'search-code':
                        return yield this.searchCode((_r = action.params) === null || _r === void 0 ? void 0 : _r.query);
                    case 'search-repos':
                        return yield this.searchRepos((_s = action.params) === null || _s === void 0 ? void 0 : _s.query);
                    case 'get-file':
                        return yield this.getFile((_t = action.params) === null || _t === void 0 ? void 0 : _t.owner, (_u = action.params) === null || _u === void 0 ? void 0 : _u.repo, (_v = action.params) === null || _v === void 0 ? void 0 : _v.path);
                    case 'create-file':
                        return yield this.createFile((_w = action.params) === null || _w === void 0 ? void 0 : _w.owner, (_x = action.params) === null || _x === void 0 ? void 0 : _x.repo, (_y = action.params) === null || _y === void 0 ? void 0 : _y.path, (_z = action.params) === null || _z === void 0 ? void 0 : _z.content, (_0 = action.params) === null || _0 === void 0 ? void 0 : _0.message);
                    default:
                        return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
                }
            }
            catch (error) {
                return this.createError(String(error), Date.now() - startTime);
            }
        });
    }
    getAvailableActions() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[GitHubIntegration] Shutting down...');
            this.status = IIntegration_1.IntegrationStatus.STOPPED;
        });
    }
    // ----------------------------
    // GitHub API Actions
    // ----------------------------
    getUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiRequest('GET', '/user');
            if (response.status === 200) {
                return this.createSuccess(response.data, `Authenticated as ${response.data.login}`);
            }
            return this.createError(`Failed to get user: ${response.status}`);
        });
    }
    listRepos(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = username ? `/users/${username}/repos` : '/user/repos';
            const response = yield this.apiRequest('GET', endpoint);
            if (response.status === 200) {
                return this.createSuccess(response.data, `Found ${response.data.length} repositories`);
            }
            return this.createError(`Failed to list repos: ${response.status}`);
        });
    }
    getRepo(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner || !repo) {
                return this.createError('owner and repo are required');
            }
            const response = yield this.apiRequest('GET', `/repos/${owner}/${repo}`);
            if (response.status === 200) {
                return this.createSuccess(response.data, `Repository: ${response.data.full_name}`);
            }
            return this.createError(`Failed to get repo: ${response.status}`);
        });
    }
    createRepo(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(params === null || params === void 0 ? void 0 : params.name)) {
                return this.createError('name is required');
            }
            const body = {
                name: params.name,
                description: params.description || '',
                private: params.private || false,
                auto_init: params.auto_init !== false,
            };
            const response = yield this.apiRequest('POST', '/user/repos', body);
            if (response.status === 201) {
                return this.createSuccess(response.data, `Repository created: ${response.data.full_name}`);
            }
            return this.createError(`Failed to create repo: ${response.status} - ${JSON.stringify(response.data)}`);
        });
    }
    listIssues(owner, repo, state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner || !repo) {
                return this.createError('owner and repo are required');
            }
            const stateParam = state || 'open';
            const response = yield this.apiRequest('GET', `/repos/${owner}/${repo}/issues?state=${stateParam}`);
            if (response.status === 200) {
                return this.createSuccess(response.data, `Found ${response.data.length} ${stateParam} issues`);
            }
            return this.createError(`Failed to list issues: ${response.status}`);
        });
    }
    createIssue(owner, repo, title, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner || !repo || !title) {
                return this.createError('owner, repo, and title are required');
            }
            const issueData = {
                title,
                body: body || '',
            };
            const response = yield this.apiRequest('POST', `/repos/${owner}/${repo}/issues`, issueData);
            if (response.status === 201) {
                return this.createSuccess(response.data, `Issue created: #${response.data.number} - ${response.data.title}`);
            }
            return this.createError(`Failed to create issue: ${response.status}`);
        });
    }
    listPRs(owner, repo, state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner || !repo) {
                return this.createError('owner and repo are required');
            }
            const stateParam = state || 'open';
            const response = yield this.apiRequest('GET', `/repos/${owner}/${repo}/pulls?state=${stateParam}`);
            if (response.status === 200) {
                return this.createSuccess(response.data, `Found ${response.data.length} ${stateParam} PRs`);
            }
            return this.createError(`Failed to list PRs: ${response.status}`);
        });
    }
    createPR(owner, repo, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner || !repo || !(params === null || params === void 0 ? void 0 : params.title) || !(params === null || params === void 0 ? void 0 : params.head) || !(params === null || params === void 0 ? void 0 : params.base)) {
                return this.createError('owner, repo, title, head, and base are required');
            }
            const prData = {
                title: params.title,
                head: params.head,
                base: params.base,
                body: params.body || '',
            };
            const response = yield this.apiRequest('POST', `/repos/${owner}/${repo}/pulls`, prData);
            if (response.status === 201) {
                return this.createSuccess(response.data, `PR created: #${response.data.number} - ${response.data.title}`);
            }
            return this.createError(`Failed to create PR: ${response.status}`);
        });
    }
    searchCode(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query) {
                return this.createError('query is required');
            }
            const encodedQuery = encodeURIComponent(query);
            const response = yield this.apiRequest('GET', `/search/code?q=${encodedQuery}`);
            if (response.status === 200) {
                return this.createSuccess(response.data, `Found ${response.data.total_count} code results`);
            }
            return this.createError(`Failed to search code: ${response.status}`);
        });
    }
    searchRepos(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query) {
                return this.createError('query is required');
            }
            const encodedQuery = encodeURIComponent(query);
            const response = yield this.apiRequest('GET', `/search/repositories?q=${encodedQuery}`);
            if (response.status === 200) {
                return this.createSuccess(response.data, `Found ${response.data.total_count} repositories`);
            }
            return this.createError(`Failed to search repos: ${response.status}`);
        });
    }
    getFile(owner, repo, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner || !repo || !filePath) {
                return this.createError('owner, repo, and path are required');
            }
            const response = yield this.apiRequest('GET', `/repos/${owner}/${repo}/contents/${filePath}`);
            if (response.status === 200) {
                const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
                return this.createSuccess(Object.assign(Object.assign({}, response.data), { decodedContent: content }), `File retrieved: ${filePath}`);
            }
            return this.createError(`Failed to get file: ${response.status}`);
        });
    }
    createFile(owner, repo, filePath, content, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner || !repo || !filePath || !content || !message) {
                return this.createError('owner, repo, path, content, and message are required');
            }
            const encodedContent = Buffer.from(content).toString('base64');
            const fileData = {
                message,
                content: encodedContent,
            };
            const response = yield this.apiRequest('PUT', `/repos/${owner}/${repo}/contents/${filePath}`, fileData);
            if (response.status === 201 || response.status === 200) {
                return this.createSuccess(response.data, `File created/updated: ${filePath}`);
            }
            return this.createError(`Failed to create/update file: ${response.status}`);
        });
    }
    // ----------------------------
    // Helper Methods
    // ----------------------------
    apiRequest(method, endpoint, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const url = new URL(endpoint, this.apiBaseUrl);
                const options = {
                    method,
                    headers: {
                        'User-Agent': 'Lucy-Sovereign-351',
                        'Accept': 'application/vnd.github+json',
                        'Authorization': `Bearer ${this.apiToken}`,
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                };
                if (body) {
                    options.headers['Content-Type'] = 'application/json';
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
                        }
                        catch (error) {
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
        });
    }
}
exports.GitHubIntegration = GitHubIntegration;
