/**
 * WHAT THIS DOES:
 * Provides Lucy-core-AI's first real BuilderOS execution pipeline. It can build a
 * complete starter FiveM resource into a local output folder using the safe repository
 * edit layer, validation, artifact recording, and delta decision recording.
 *
 * WHY THIS EXISTS:
 * Previous BuilderOS phases established contracts, tests, persistence, and safe file
 * editing. Randy asked to start building Lucy for real, so this pipeline turns a formal
 * FiveMResourceSpec into actual files while preserving auditability and rollback proof.
 *
 * HOW THIS WORKS:
 * buildFiveMResource() plans the resource, validates the plan, generates file contents,
 * applies each file through SafeRepoEditor, records artifact evidence, records DeltaVault
 * rationale, and returns a structured BuilderExecutionResult. It does not deploy, restart
 * servers, run SQL, or bypass ActionEngine.
 *
 * HOW TO CHANGE IT:
 * Add new domain pipelines beside buildFiveMResource(), such as buildTypeScriptProject(),
 * buildPythonTool(), buildUE5Plugin(), or buildGtaMapPack(). Keep risky commands routed
 * through BuilderSafetyGate and ActionEngine before execution.
 *
 * DEBUG EXAMPLE:
 * If a generated FiveM file is missing, inspect result.generatedFiles, result.appliedEdits,
 * and result.validation. If validation failed, no files should be written. If an edit
 * failed, use the returned snapshots to roll back before retrying.
 */

import { ArtifactVault, BuildArtifact } from '../vault/ArtifactVault.js';
import { DeltaRecord, DeltaVault } from '../memory/DeltaVault.js';
import { SafeRepoEditor, SafeRepoEditResult } from '../repo/SafeRepoEditor.js';
import { FiveMResourceBuilder, FiveMResourcePlan, FiveMResourceSpec } from '../gamedev/fivem/FiveMResourceBuilder.js';
import { FiveMValidationResult, FiveMValidator } from '../gamedev/fivem/FiveMValidator.js';
import { FiveMResourceFileGenerator, GeneratedFiveMFile } from '../gamedev/fivem/FiveMResourceFileGenerator.js';

export interface BuilderExecutionPipelineOptions {
  artifactVault?: ArtifactVault;
  deltaVault?: DeltaVault;
  resourceBuilder?: FiveMResourceBuilder;
  fileGenerator?: FiveMResourceFileGenerator;
  validator?: FiveMValidator;
}

export interface FiveMBuildExecutionInput {
  projectId: string;
  outputRoot: string;
  spec: FiveMResourceSpec;
  requestedBy: string;
  traceId?: string;
}

export interface BuilderExecutionResult {
  projectId: string;
  traceId: string;
  resourceName: string;
  success: boolean;
  summary: string;
  plan: FiveMResourcePlan;
  validation: FiveMValidationResult;
  generatedFiles: GeneratedFiveMFile[];
  appliedEdits: SafeRepoEditResult[];
  artifacts: BuildArtifact[];
  deltaRecords: DeltaRecord[];
  nextSteps: string[];
}

export class BuilderExecutionPipeline {
  private readonly artifactVault: ArtifactVault;
  private readonly deltaVault: DeltaVault;
  private readonly resourceBuilder: FiveMResourceBuilder;
  private readonly fileGenerator: FiveMResourceFileGenerator;
  private readonly validator: FiveMValidator;

  constructor(options: BuilderExecutionPipelineOptions = {}) {
    this.artifactVault = options.artifactVault ?? new ArtifactVault();
    this.deltaVault = options.deltaVault ?? new DeltaVault();
    this.resourceBuilder = options.resourceBuilder ?? new FiveMResourceBuilder();
    this.fileGenerator = options.fileGenerator ?? new FiveMResourceFileGenerator();
    this.validator = options.validator ?? new FiveMValidator();
  }

  async buildFiveMResource(input: FiveMBuildExecutionInput): Promise<BuilderExecutionResult> {
    const traceId = input.traceId ?? this.makeId('trace');
    const plan = this.resourceBuilder.planResource(input.spec);
    const validation = this.validator.validatePlan(plan);
    const deltaRecords: DeltaRecord[] = [];
    const artifacts: BuildArtifact[] = [];
    const generatedFiles = validation.passed ? this.fileGenerator.generateFiles(input.spec) : [];
    const appliedEdits: SafeRepoEditResult[] = [];

    deltaRecords.push(
      this.deltaVault.addRecord({
        traceId,
        source: 'BuilderExecutionPipeline',
        decisionType: 'build_started',
        summary: `Started FiveM resource build for ${input.spec.name}.`,
        rationale: [
          'Formal FiveMResourceSpec was provided.',
          'BuilderExecutionPipeline is limited to local file generation.',
          'Deployment, SQL execution, and service restarts are not enabled.'
        ],
        outcome: 'pending',
        relatedArtifacts: []
      })
    );

    if (!validation.passed) {
      deltaRecords.push(
        this.deltaVault.addRecord({
          traceId,
          source: 'BuilderExecutionPipeline',
          decisionType: 'validation_failed',
          summary: `FiveM resource plan failed validation for ${input.spec.name}.`,
          rationale: validation.issues.map((issue) => `${issue.severity}:${issue.code}:${issue.message}`),
          outcome: 'failure',
          relatedArtifacts: []
        })
      );

      return {
        projectId: input.projectId,
        traceId,
        resourceName: input.spec.name,
        success: false,
        summary: `FiveM resource ${input.spec.name} was not written because validation failed.`,
        plan,
        validation,
        generatedFiles,
        appliedEdits,
        artifacts,
        deltaRecords,
        nextSteps: [
          'Fix validation issues.',
          'Regenerate the resource after validation passes.',
          'Keep deployment disabled until ActionEngine approval flow is wired.'
        ]
      };
    }

    const editor = new SafeRepoEditor(input.outputRoot);

    for (const generatedFile of generatedFiles) {
      const result = await editor.applyEdit({
        relativePath: `${input.spec.name}/${generatedFile.path}`,
        operation: 'create',
        newContent: generatedFile.content,
        reason: `Generate ${generatedFile.path}: ${generatedFile.purpose}`
      });

      appliedEdits.push(result);
    }

    const resourceArtifact = this.artifactVault.addArtifact({
      projectId: input.projectId,
      type: 'resource',
      path: `${input.outputRoot}/${input.spec.name}`,
      relatedArtifacts: [],
      checksum: 'pending-real-checksum',
      summary: `Generated FiveM resource folder for ${input.spec.name}.`
    });
    artifacts.push(resourceArtifact);

    for (const generatedFile of generatedFiles) {
      artifacts.push(
        this.artifactVault.addArtifact({
          projectId: input.projectId,
          type: 'source_note',
          path: `${input.outputRoot}/${input.spec.name}/${generatedFile.path}`,
          relatedArtifacts: [resourceArtifact.id],
          checksum: 'pending-real-checksum',
          summary: generatedFile.purpose
        })
      );
    }

    deltaRecords.push(
      this.deltaVault.addRecord({
        traceId,
        source: 'BuilderExecutionPipeline',
        decisionType: 'build_completed',
        summary: `Generated FiveM resource ${input.spec.name} with ${generatedFiles.length} files.`,
        rationale: [
          'Plan validation passed.',
          'All files were applied through SafeRepoEditor.',
          'ArtifactVault recorded resource and generated source notes.',
          'No deployment, SQL execution, or server restart was performed.'
        ],
        outcome: 'success',
        relatedArtifacts: artifacts.map((artifact) => artifact.id)
      })
    );

    return {
      projectId: input.projectId,
      traceId,
      resourceName: input.spec.name,
      success: true,
      summary: `FiveM resource ${input.spec.name} generated safely with ${generatedFiles.length} files.`,
      plan,
      validation,
      generatedFiles,
      appliedEdits,
      artifacts,
      deltaRecords,
      nextSteps: [
        'Review generated files and diff snapshots.',
        'Run deeper FiveM validation against actual files.',
        'Package the resource only after review.',
        'Deploy only through ActionEngine-approved workflow.'
      ]
    };
  }

  private makeId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}