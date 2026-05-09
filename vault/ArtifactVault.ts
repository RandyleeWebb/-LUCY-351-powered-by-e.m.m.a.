/**
 * WHAT THIS DOES:
 * Provides Lucy-core-AI's first ArtifactVault scaffold for recording build evidence:
 * artifacts, logs, diffs, screenshots, reports, rollback snapshots, and package outputs.
 *
 * WHY THIS EXISTS:
 * Randy needs to ask "what changed?" and Lucy must answer with proof. ArtifactVault
 * makes every build, validation, runtime test, and release traceable instead of relying
 * on memory or vague summaries.
 *
 * HOW THIS WORKS:
 * This first scaffold stores BuildArtifact records in memory. Each artifact has an id,
 * projectId, type, path, checksum placeholder, summary, timestamp, and relatedArtifacts.
 * Later versions will add filesystem persistence and DeltaVault linkage.
 *
 * HOW TO CHANGE IT:
 * Add new artifact types to BuildArtifactType as Lucy gains new domains. Do not remove
 * relatedArtifacts because that field links packages to logs, diffs, screenshots, and
 * rollback snapshots.
 *
 * DEBUG EXAMPLE:
 * If Lucy says a FiveM resource was packaged but Randy cannot find proof, call
 * vault.findByProject(projectId) and confirm the zip, validation report, log, diff, and
 * rollback snapshot are all linked by relatedArtifacts.
 */

export type BuildArtifactType =
  | 'zip'
  | 'resource'
  | 'ue5_package'
  | 'gta_dlcpack'
  | 'screenshot'
  | 'log'
  | 'report'
  | 'diff'
  | 'rollback_snapshot'
  | 'source_note';

export interface BuildArtifact {
  id: string;
  projectId: string;
  type: BuildArtifactType;
  path: string;
  relatedArtifacts: string[];
  createdAt: number;
  checksum: string;
  summary: string;
}

export class ArtifactVault {
  private readonly artifacts = new Map<string, BuildArtifact>();

  addArtifact(input: Omit<BuildArtifact, 'id' | 'createdAt'> & Partial<Pick<BuildArtifact, 'id' | 'createdAt'>>): BuildArtifact {
    const artifact: BuildArtifact = {
      ...input,
      id: input.id ?? this.makeId('artifact'),
      createdAt: input.createdAt ?? Date.now()
    };

    this.artifacts.set(artifact.id, artifact);
    return artifact;
  }

  getArtifact(id: string): BuildArtifact | undefined {
    return this.artifacts.get(id);
  }

  findByProject(projectId: string): BuildArtifact[] {
    return [...this.artifacts.values()].filter((artifact) => artifact.projectId === projectId);
  }

  listAll(): BuildArtifact[] {
    return [...this.artifacts.values()];
  }

  private makeId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
