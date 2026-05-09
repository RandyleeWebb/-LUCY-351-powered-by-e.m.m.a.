/**
 * WHAT THIS DOES:
 * Defines BuilderOS, Lucy-core-AI's private development workbench. BuilderOS routes
 * supported FiveM build tasks into the real BuilderExecutionPipeline and can now run a
 * read-only FiveM world analysis mode using FiveMWorldScanner and FiveMWorldIntelligence.
 *
 * WHY THIS EXISTS:
 * Lucy needs one central builder interface for FiveM resources, UE5 projects, GTA V map
 * mods, automation scripts, dashboards, and internal modules. Phase 23 lets BuilderOS
 * understand an existing FiveM world before generating anything, preserving Randy's
 * requirement that uploaded worlds can be inspected without being fixed or changed.
 *
 * HOW THIS WORKS:
 * BuildTask accepts either a fivemSpec for real local resource generation or a
 * fivemWorldAnalysis input for read-only world inspection. FiveM generation remains
 * routed through BuilderExecutionPipeline. FiveM world analysis scans the provided root,
 * builds a planning intelligence report, and returns it on BuildResult.worldAnalysis.
 *
 * HOW TO CHANGE IT:
 * Add new domain-specific task payloads beside fivemSpec and fivemWorldAnalysis, then
 * route them through their own pipelines. Keep risky actions sandboxed and route
 * deployment, service restarts, SQL execution, and production mutation through
 * BuilderSafetyGate and ActionEngine.
 *
 * DEBUG EXAMPLE:
 * If Lucy claims a FiveM resource was built but no artifact exists, inspect
 * BuildResult.execution?.artifacts and the BuilderExecutionPipeline result. If a world
 * analysis task returns no resources, inspect BuildResult.worldAnalysis?.profile and
 * confirm fivemWorldAnalysis.rootPath points to the folder containing fxmanifest.lua
 * resources.
 */

import { FiveMResourceSpec } from '../gamedev/fivem/FiveMResourceBuilder.js';
import {
  FiveMWorldIntelligenceBuilder,
  FiveMWorldIntelligenceReport
} from '../gamedev/fivem/FiveMWorldIntelligence.js';
import { FiveMWorldProfile, FiveMWorldScanner } from '../gamedev/fivem/FiveMWorldScanner.js';
import {
  LucyAdditiveProposals,
  LucyFiveMWorldPlanner
} from '../gamedev/fivem/LucyFiveMWorldPlanner.js';
import {
  ProposalPreviewEngine,
  ProposalPreviewSet
} from '../gamedev/fivem/ProposalPreviewEngine.js';
import {
  ProposalExecutionEngine,
  ProposalExecutionReport
} from '../gamedev/fivem/ProposalExecutionEngine.js';
import {
  LucyFiveMMainOrchestrator,
  OrchestratorResult,
  LucyOrchestratorConfig
} from '../gamedev/fivem/LucyFiveMMainOrchestrator.js';
import { BuilderExecutionPipeline, BuilderExecutionResult } from './BuilderExecutionPipeline.js';

export type BuildDomain = 'fivem' | 'ue5' | 'gta5_map' | 'python' | 'typescript' | 'mixed';

export interface FiveMWorldAnalysisInput {
  rootPath: string;
  purpose?: string;
  readOnly?: true;
  generateAdditiveProposals?: true;
  generatePreviews?: true;
  executeProposals?: true;
  stopOnFirstError?: boolean;
  orchestratorConfig?: LucyOrchestratorConfig;
}

export interface FiveMWorldAnalysisResult {
  mode: 'read_only_world_analysis';
  profile: FiveMWorldProfile;
  intelligence: FiveMWorldIntelligenceReport;
  generateAdditiveProposals?: true;
}

export interface BuildTask {
  id: string;
  domain: BuildDomain;
  projectPath: string;
  goal: string;
  requestedBy: string;
  createdAt: number;
  traceId?: string;
  fivemSpec?: FiveMResourceSpec;
  fivemWorldAnalysis?: FiveMWorldAnalysisInput;
}

export interface BuildResult {
  taskId: string;
  success: boolean;
  summary: string;
  artifacts: string[];
  nextSteps: string[];
  execution?: BuilderExecutionResult;
  worldAnalysis?: FiveMWorldAnalysisResult;
  additiveProposals?: LucyAdditiveProposals;
  proposalPreviews?: ProposalPreviewSet;
  proposalExecution?: ProposalExecutionReport;
  orchestratorResult?: OrchestratorResult;
}

export interface BuilderOSOptions {
  executionPipeline?: BuilderExecutionPipeline;
  worldScanner?: FiveMWorldScanner;
  worldIntelligenceBuilder?: FiveMWorldIntelligenceBuilder;
  worldPlanner?: LucyFiveMWorldPlanner;
}

export class BuilderOS {
  private readonly executionPipeline: BuilderExecutionPipeline;
  private readonly worldScanner: FiveMWorldScanner;
  private readonly worldIntelligenceBuilder: FiveMWorldIntelligenceBuilder;
  private readonly worldPlanner: LucyFiveMWorldPlanner;

  constructor(options: BuilderOSOptions = {}) {
    this.executionPipeline = options.executionPipeline ?? new BuilderExecutionPipeline();
    this.worldScanner = options.worldScanner ?? new FiveMWorldScanner();
    this.worldIntelligenceBuilder = options.worldIntelligenceBuilder ?? new FiveMWorldIntelligenceBuilder();
    this.worldPlanner = options.worldPlanner ?? new LucyFiveMWorldPlanner();
  }

  async run(task: BuildTask): Promise<BuildResult> {
    if (task.domain === 'fivem') {
      return this.runFiveMTask(task);
    }

    return this.unsupportedDomainResult(task);
  }

  private async runFiveMTask(task: BuildTask): Promise<BuildResult> {
    if (task.fivemSpec) {
      return this.runFiveMGenerationTask(task);
    }

    if (task.fivemWorldAnalysis) {
      return this.runFiveMWorldAnalysisTask(task);
    }

    return {
      taskId: task.id,
      success: false,
      summary: 'BuilderOS received a FiveM task, but no formal fivemSpec or fivemWorldAnalysis input was provided.',
      artifacts: [],
      nextSteps: [
        'Provide a FiveMResourceSpec to generate a new local FiveM resource.',
        'Or provide fivemWorldAnalysis.rootPath to scan an existing FiveM world in read-only mode.',
        'Keep deployment disabled until ActionEngine approval flow is wired.'
      ]
    };
  }

  private async runFiveMGenerationTask(task: BuildTask): Promise<BuildResult> {
    if (!task.fivemSpec) {
      throw new Error('runFiveMGenerationTask requires task.fivemSpec.');
    }

    const execution = await this.executionPipeline.buildFiveMResource({
      projectId: task.id,
      outputRoot: task.projectPath,
      spec: task.fivemSpec,
      requestedBy: task.requestedBy,
      traceId: task.traceId
    });

    return {
      taskId: task.id,
      success: execution.success,
      summary: execution.summary,
      artifacts: execution.artifacts.map((artifact) => artifact.id),
      nextSteps: execution.nextSteps,
      execution
    };
  }

  private async runFiveMWorldAnalysisTask(task: BuildTask): Promise<BuildResult> {
    if (!task.fivemWorldAnalysis) {
      throw new Error('runFiveMWorldAnalysisTask requires task.fivemWorldAnalysis.');
    }

    const profile = await this.worldScanner.scanWorld(task.fivemWorldAnalysis.rootPath);
    const intelligence = this.worldIntelligenceBuilder.buildWorldIntelligence(profile);
    const worldAnalysis = {
      mode: 'read_only_world_analysis' as const,
      profile,
      intelligence
    };

    const baseResult: BuildResult = {
      taskId: task.id,
      success: true,
      summary: `BuilderOS completed read-only FiveM world analysis for ${profile.resources.length} resource(s).`,
      artifacts: [],
      nextSteps: [
        ...intelligence.safeAdditiveOpportunities,
        'Use this worldAnalysis result as planning context before generating or editing any resource.',
        'Route any future file-writing task through SafeRepoEditor, BuilderSafetyGate, and ActionEngine.'
      ],
      worldAnalysis
    };

    if (!task.fivemWorldAnalysis.generateAdditiveProposals) {
      return baseResult;
    }

    const additiveProposals = this.worldPlanner.generateAdditiveProposals(worldAnalysis);

    const extendedNextSteps = [
      ...baseResult.nextSteps,
      ...additiveProposals.nextSteps
    ];

    if (!task.fivemWorldAnalysis.generatePreviews) {
      return {
        ...baseResult,
        summary: `${baseResult.summary} Generated ${additiveProposals.proposals.length} safe additive proposals.`,
        nextSteps: extendedNextSteps,
        additiveProposals
      };
    }

    const previewEngine = new ProposalPreviewEngine(worldAnalysis.profile.rootPath);
    const proposalPreviews = await previewEngine.generatePreviews(additiveProposals);

    if (!task.fivemWorldAnalysis.executeProposals) {
      return {
        ...baseResult,
        summary: `${baseResult.summary} Generated ${additiveProposals.proposals.length} proposals. Previewed ${proposalPreviews.safeToApplyCount} safe proposals.`,
        nextSteps: extendedNextSteps,
        additiveProposals,
        proposalPreviews
      };
    }

    // Check if orchestrator mode is enabled (Lucy AI integration)
    if (task.fivemWorldAnalysis.orchestratorConfig) {
      const orchestrator = new LucyFiveMMainOrchestrator(
        worldAnalysis.profile.rootPath,
        task.fivemWorldAnalysis.orchestratorConfig
      );
      await orchestrator.start();
      const orchestratorResult = await orchestrator.orchestrateModification(
        worldAnalysis.intelligence,
        task.goal,
        task.requestedBy
      );

      return {
        ...baseResult,
        summary: orchestratorResult.summary,
        nextSteps: [
          ...extendedNextSteps,
          ...(orchestratorResult.rollbackAvailable ? ['Rollback available for all changes.'] : [])
        ],
        additiveProposals,
        proposalPreviews,
        orchestratorResult
      };
    }

    // Standard execution mode (non-AI)
    const executionEngine = new ProposalExecutionEngine(worldAnalysis.profile.rootPath);
    const stopOnError = task.fivemWorldAnalysis.stopOnFirstError ?? false;
    const proposalExecution = await executionEngine.executeApprovedProposals(additiveProposals.proposals, { stopOnFirstError: stopOnError });

    return {
      ...baseResult,
      summary: `${baseResult.summary} Generated ${additiveProposals.proposals.length} proposals. Executed ${proposalExecution.executedCount} proposals successfully. ${proposalExecution.failedCount} failed.`,
      nextSteps: extendedNextSteps,
      additiveProposals,
      proposalPreviews,
      proposalExecution
    };
  }

  private unsupportedDomainResult(task: BuildTask): BuildResult {
    return {
      taskId: task.id,
      success: false,
      summary: `BuilderOS scaffold received ${task.domain} task. Concrete ${task.domain} build loop is not enabled yet.`,
      artifacts: [],
      nextSteps: [
        'Keep this task recorded as a future domain build request.',
        'Add a domain-specific spec payload and execution pipeline.',
        'Wire ProjectGraph inspection for the domain.',
        'Route risky commands through BuilderSafetyGate and ActionEngine.',
        'Add smoke tests before enabling real file generation for this domain.'
      ]
    };
  }
}