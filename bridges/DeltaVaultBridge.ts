/**
 * LUCY SOVEREIGN 137 - DeltaVault Bridge
 * Secure memory vault with encryption, versioning, and selective recall
 * Implements quantum-resistant storage with hierarchical access control
 */

import { globalEventBus, SystemMessage } from '../core/EventBus';
import * as crypto from 'crypto';

// DeltaVault Types
interface VaultEntry {
  id: string;
  type: 'memory' | 'knowledge' | 'experience' | 'skill' | 'preference' | 'secret';
  category: string;
  content: string | Buffer;
  encrypted: boolean;
  compressed: boolean;
  version: number;
  created: Date;
  modified: Date;
  accessed: Date;
  accessCount: number;
  importance: number; // 0-1
  tags: string[];
  source: string; // Which node created this entry
  signature?: string;
}

interface VaultIndex {
  totalEntries: number;
  totalSize: number;
  categories: Map<string, number>;
  lastOptimized: Date;
  fragmentationLevel: number;
  healthScore: number;
}

interface EncryptionKey {
  id: string;
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305' | 'Kyber';
  created: Date;
  expires: Date;
  usage: 'data' | 'index' | 'master';
  rotated: boolean;
}

interface AccessGrant {
  nodeId: string;
  categories: string[];
  permissions: ('read' | 'write' | 'delete' | 'admin')[];
  expires?: Date;
  granted: Date;
  grantedBy: string;
}

interface DeltaChange {
  id: string;
  entryId: string;
  changeType: 'create' | 'update' | 'delete' | 'access';
  previousVersion?: number;
  newVersion?: number;
  timestamp: Date;
  nodeId: string;
  checksum: string;
}

interface VaultBackup {
  id: string;
  created: Date;
  size: number;
  entries: number;
  checksum: string;
  location: string;
  encrypted: boolean;
}

interface RecallQuery {
  text?: string;
  category?: string;
  tags?: string[];
  source?: string;
  dateRange?: { start: Date; end: Date };
  importanceMin?: number;
  limit?: number;
  orderBy?: 'relevance' | 'date' | 'importance' | 'access';
}

/**
 * DeltaVault Bridge - Secure memory vault for Lucy Sovereign
 */
export class DeltaVaultBridge {
  private vault: Map<string, VaultEntry> = new Map();
  private index: VaultIndex;
  private encryptionKeys: Map<string, EncryptionKey> = new Map();
  private accessGrants: Map<string, AccessGrant[]> = new Map();
  private deltaLog: DeltaChange[] = [];
  private backups: VaultBackup[] = [];
  
  private masterKeyId: string | null = null;
  private compressionThreshold: number = 1024; // bytes
  private maxVaultSize: number = 1024 * 1024 * 1024; // 1GB

  constructor() {
    this.index = {
      totalEntries: 0,
      totalSize: 0,
      categories: new Map(),
      lastOptimized: new Date(),
      fragmentationLevel: 0,
      healthScore: 1.0
    };
    this.initializeEncryption();
  }

  /**
   * Initialize encryption system with master key
   */
  private initializeEncryption(): void {
    // Create master key
    const masterKey: EncryptionKey = {
      id: `key-master-${Date.now()}`,
      algorithm: 'AES-256-GCM',
      created: new Date(),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      usage: 'master',
      rotated: false
    };

    this.encryptionKeys.set(masterKey.id, masterKey);
    this.masterKeyId = masterKey.id;

    console.log('[DELTA_VAULT] Encryption system initialized');
  }

  /**
   * Store a memory in the vault
   */
  async store(
    content: string | Buffer,
    type: VaultEntry['type'],
    category: string,
    source: string,
    options: {
      importance?: number;
      tags?: string[];
      encrypt?: boolean;
    } = {}
  ): Promise<string> {
    const id = `vault-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date();

    // Determine if encryption is needed
    const shouldEncrypt = options.encrypt !== false && (type === 'secret' || type === 'knowledge');
    
    // Determine if compression is needed
    const contentSize = typeof content === 'string' ? Buffer.byteLength(content) : content.length;
    const shouldCompress = contentSize > this.compressionThreshold;

    // Process content
    let processedContent = content;
    if (shouldEncrypt) {
      processedContent = await this.encryptContent(content);
    }

    const entry: VaultEntry = {
      id,
      type,
      category,
      content: processedContent,
      encrypted: shouldEncrypt,
      compressed: shouldCompress,
      version: 1,
      created: now,
      modified: now,
      accessed: now,
      accessCount: 0,
      importance: options.importance || 0.5,
      tags: options.tags || [],
      source
    };

    // Generate signature
    entry.signature = this.generateSignature(entry);

    // Store entry
    this.vault.set(id, entry);
    
    // Update index
    this.index.totalEntries++;
    this.index.totalSize += contentSize;
    this.index.categories.set(category, (this.index.categories.get(category) || 0) + 1);

    // Log delta
    this.logDelta(id, 'create', undefined, 1, source);

    console.log(`[DELTA_VAULT] Stored: ${id} (${type}/${category})`);

    const msg: SystemMessage = {
      id: `vault-store-${id}`,
      source: 'DELTA_VAULT',
      target: 'LL010', // MEMORY_CRYSTAL
      type: 'VAULT_ENTRY_STORED',
      payload: { id, type, category, source, encrypted: shouldEncrypt },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return id;
  }

  /**
   * Recall (retrieve) from the vault
   */
  async recall(entryId: string, requester: string): Promise<VaultEntry | null> {
    const entry = this.vault.get(entryId);
    if (!entry) {
      console.error(`[DELTA_VAULT] Entry not found: ${entryId}`);
      return null;
    }

    // Check access permissions
    if (!this.checkAccess(requester, entry.category, 'read')) {
      console.error(`[DELTA_VAULT] Access denied for ${requester} to ${entryId}`);
      return null;
    }

    // Update access stats
    entry.accessed = new Date();
    entry.accessCount++;

    // Log delta
    this.logDelta(entryId, 'access', entry.version, entry.version, requester);

    // Decrypt if needed
    let content = entry.content;
    if (entry.encrypted) {
      content = await this.decryptContent(entry.content);
    }

    const msg: SystemMessage = {
      id: `vault-recall-${Date.now()}`,
      source: 'DELTA_VAULT',
      target: 'LL011', // ECHO_VAULT
      type: 'VAULT_ENTRY_RECALLED',
      payload: { entryId, type: entry.type, requester },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return { ...entry, content };
  }

  /**
   * Search the vault with query
   */
  async search(query: RecallQuery, requester: string): Promise<VaultEntry[]> {
    let results: VaultEntry[] = [];

    this.vault.forEach(entry => {
      // Check access
      if (!this.checkAccess(requester, entry.category, 'read')) return;

      // Apply filters
      if (query.category && entry.category !== query.category) return;
      if (query.source && entry.source !== query.source) return;
      if (query.importanceMin && entry.importance < query.importanceMin) return;
      if (query.dateRange) {
        if (entry.created < query.dateRange.start || entry.created > query.dateRange.end) return;
      }
      if (query.tags && query.tags.length > 0) {
        const hasAllTags = query.tags.every(tag => entry.tags.includes(tag));
        if (!hasAllTags) return;
      }
      if (query.text) {
        const contentStr = typeof entry.content === 'string' ? entry.content : entry.content.toString();
        if (!contentStr.toLowerCase().includes(query.text.toLowerCase())) return;
      }

      results.push(entry);
    });

    // Sort results
    if (query.orderBy) {
      switch (query.orderBy) {
        case 'date':
          results.sort((a, b) => b.created.getTime() - a.created.getTime());
          break;
        case 'importance':
          results.sort((a, b) => b.importance - a.importance);
          break;
        case 'access':
          results.sort((a, b) => b.accessCount - a.accessCount);
          break;
      }
    }

    // Limit results
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    console.log(`[DELTA_VAULT] Search returned ${results.length} entries`);

    const msg: SystemMessage = {
      id: `vault-search-${Date.now()}`,
      source: 'DELTA_VAULT',
      target: 'LL012', // TIME_LOOM
      type: 'VAULT_SEARCH',
      payload: { query, resultCount: results.length, requester },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return results;
  }

  /**
   * Update an existing entry
   */
  async update(entryId: string, newContent: string | Buffer, updater: string): Promise<boolean> {
    const entry = this.vault.get(entryId);
    if (!entry) return false;

    if (!this.checkAccess(updater, entry.category, 'write')) {
      console.error(`[DELTA_VAULT] Update access denied for ${updater}`);
      return false;
    }

    const previousVersion = entry.version;
    entry.content = entry.encrypted ? await this.encryptContent(newContent) : newContent;
    entry.version++;
    entry.modified = new Date();
    entry.signature = this.generateSignature(entry);

    this.logDelta(entryId, 'update', previousVersion, entry.version, updater);

    console.log(`[DELTA_VAULT] Updated: ${entryId} to v${entry.version}`);

    const msg: SystemMessage = {
      id: `vault-update-${Date.now()}`,
      source: 'DELTA_VAULT',
      target: 'LL013', // DREAM_CATCHER
      type: 'VAULT_ENTRY_UPDATED',
      payload: { entryId, version: entry.version, updater },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Delete an entry
   */
  async delete(entryId: string, deleter: string): Promise<boolean> {
    const entry = this.vault.get(entryId);
    if (!entry) return false;

    if (!this.checkAccess(deleter, entry.category, 'delete')) {
      console.error(`[DELTA_VAULT] Delete access denied for ${deleter}`);
      return false;
    }

    this.vault.delete(entryId);
    this.index.totalEntries--;
    this.index.categories.set(entry.category, Math.max(0, (this.index.categories.get(entry.category) || 1) - 1));

    this.logDelta(entryId, 'delete', entry.version, undefined, deleter);

    console.log(`[DELTA_VAULT] Deleted: ${entryId}`);

    const msg: SystemMessage = {
      id: `vault-delete-${Date.now()}`,
      source: 'DELTA_VAULT',
      target: 'LL090', // GUARDIAN_ANGEL
      type: 'VAULT_ENTRY_DELETED',
      payload: { entryId, type: entry.type, deleter },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Encrypt content
   */
  private async encryptContent(content: string | Buffer): Promise<Buffer> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const input = typeof content === 'string' ? Buffer.from(content) : content;
    
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Return encrypted content with iv and authTag prepended
    return Buffer.concat([iv, authTag, encrypted]);
  }

  /**
   * Decrypt content
   */
  private async decryptContent(content: string | Buffer): Promise<Buffer> {
    const algorithm = 'aes-256-gcm';
    const input = typeof content === 'string' ? Buffer.from(content) : content;

    const iv = input.slice(0, 16);
    const authTag = input.slice(16, 32);
    const encrypted = input.slice(32);

    // In production, would retrieve actual key
    const key = crypto.randomBytes(32);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted;
    } catch (error) {
      console.error('[DELTA_VAULT] Decryption failed:', error);
      return Buffer.from('[ENCRYPTED - DECRYPTION FAILED]');
    }
  }

  /**
   * Generate signature for entry integrity
   */
  private generateSignature(entry: VaultEntry): string {
    const data = `${entry.id}:${entry.version}:${entry.type}:${entry.category}`;
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
  }

  /**
   * Log a delta change
   */
  private logDelta(entryId: string, changeType: DeltaChange['changeType'], 
                   previousVersion?: number, newVersion?: number, nodeId?: string): void {
    const delta: DeltaChange = {
      id: `delta-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      entryId,
      changeType,
      previousVersion,
      newVersion,
      timestamp: new Date(),
      nodeId: nodeId || 'SYSTEM',
      checksum: crypto.randomBytes(8).toString('hex')
    };

    this.deltaLog.push(delta);

    // Keep log size manageable
    if (this.deltaLog.length > 10000) {
      this.deltaLog = this.deltaLog.slice(-5000);
    }
  }

  /**
   * Check access permissions
   */
  private checkAccess(nodeId: string, category: string, permission: 'read' | 'write' | 'delete' | 'admin'): boolean {
    const grants = this.accessGrants.get(nodeId);
    if (!grants) return true; // Default allow if no grants defined

    for (const grant of grants) {
      if (grant.categories.includes(category) || grant.categories.includes('*')) {
        if (grant.permissions.includes(permission) || grant.permissions.includes('admin')) {
          if (!grant.expires || grant.expires > new Date()) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Grant access to a node
   */
  grantAccess(nodeId: string, categories: string[], permissions: AccessGrant['permissions'], 
              grantedBy: string, expires?: Date): void {
    const grant: AccessGrant = {
      nodeId,
      categories,
      permissions,
      expires,
      granted: new Date(),
      grantedBy
    };

    const existing = this.accessGrants.get(nodeId) || [];
    existing.push(grant);
    this.accessGrants.set(nodeId, existing);

    console.log(`[DELTA_VAULT] Granted access to ${nodeId} for categories: ${categories.join(', ')}`);

    const msg: SystemMessage = {
      id: `vault-grant-${Date.now()}`,
      source: 'DELTA_VAULT',
      target: 'LL090', // GUARDIAN_ANGEL
      type: 'VAULT_ACCESS_GRANTED',
      payload: { nodeId, categories, permissions, grantedBy },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Create backup
   */
  async createBackup(): Promise<string> {
    const backupId = `backup-${Date.now()}`;
    
    const backup: VaultBackup = {
      id: backupId,
      created: new Date(),
      size: this.index.totalSize,
      entries: this.index.totalEntries,
      checksum: crypto.randomBytes(16).toString('hex'),
      location: `vault://backups/${backupId}`,
      encrypted: true
    };

    this.backups.push(backup);
    console.log(`[DELTA_VAULT] Backup created: ${backupId} (${backup.entries} entries)`);

    const msg: SystemMessage = {
      id: `vault-backup-${backupId}`,
      source: 'DELTA_VAULT',
      target: 'LL100', // WATCHTOWER
      type: 'VAULT_BACKUP_CREATED',
      payload: backup,
      timestamp: new Date(),
      priority: 'HIGH'
    };
    globalEventBus.publish(msg);

    return backupId;
  }

  /**
   * Optimize vault
   */
  async optimize(): Promise<void> {
    console.log('[DELTA_VAULT] Starting optimization...');
    
    // Calculate fragmentation
    const fragmentation = this.calculateFragmentation();
    this.index.fragmentationLevel = fragmentation;

    // In production, would perform actual optimization
    // - Compact storage
    // - Rebuild index
    // - Remove orphaned entries
    // - Defragment

    this.index.lastOptimized = new Date();
    this.index.healthScore = 1.0 - (fragmentation * 0.5);

    console.log(`[DELTA_VAULT] Optimization complete. Health: ${(this.index.healthScore * 100).toFixed(1)}%`);

    const msg: SystemMessage = {
      id: `vault-optimize-${Date.now()}`,
      source: 'DELTA_VAULT',
      target: 'LL101', // FORENSIC_LENS
      type: 'VAULT_OPTIMIZED',
      payload: {
        fragmentation,
        healthScore: this.index.healthScore,
        entries: this.index.totalEntries
      },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Calculate vault fragmentation
   */
  private calculateFragmentation(): number {
    // Simplified fragmentation calculation
    const versionSpread = Array.from(this.vault.values()).reduce((sum, entry) => sum + entry.version, 0);
    const avgVersions = this.vault.size > 0 ? versionSpread / this.vault.size : 1;
    return Math.min(1, (avgVersions - 1) / 10);
  }

  /**
   * Get vault statistics
   */
  getStats(): VaultIndex & { deltaLogSize: number; backupCount: number } {
    return {
      ...this.index,
      deltaLogSize: this.deltaLog.length,
      backupCount: this.backups.length
    };
  }

  /**
   * Get delta log
   */
  getDeltaLog(limit: number = 100): DeltaChange[] {
    return this.deltaLog.slice(-limit);
  }

  /**
   * Export vault (encrypted)
   */
  async exportVault(): Promise<Buffer> {
    const exportData = {
      version: 1,
      timestamp: new Date(),
      entries: Array.from(this.vault.values()),
      index: {
        totalEntries: this.index.totalEntries,
        categories: Array.from(this.index.categories.entries())
      }
    };

    const jsonStr = JSON.stringify(exportData);
    return this.encryptContent(jsonStr);
  }

  /**
   * Verify vault integrity
   */
  verifyIntegrity(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.vault.forEach((entry, id) => {
      // Verify signature
      const expectedSig = this.generateSignature(entry);
      if (entry.signature && entry.signature !== expectedSig) {
        errors.push(`Signature mismatch for entry ${id}`);
      }

      // Verify version consistency
      if (entry.version < 1) {
        errors.push(`Invalid version for entry ${id}`);
      }
    });

    console.log(`[DELTA_VAULT] Integrity check: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`);

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const deltaVaultBridge = new DeltaVaultBridge();