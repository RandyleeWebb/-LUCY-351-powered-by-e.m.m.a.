import { Goal, CoreTickContext, GoalStatus, DriveType } from '../types';

export class GoalEvaluator {
  /**
   * Scores a proposed goal based on: drive alignment × urgency × feasibility
   */
  static score(goal: Goal, ctx: CoreTickContext): number {
    const driveAlignment = this.calculateDriveAlignment(goal, ctx);
    const urgency = this.calculateUrgency(goal, ctx);
    const feasibility = this.calculateFeasibility(goal, ctx);

    // Weighted score
    return (driveAlignment * 0.5) + (urgency * 0.3) + (feasibility * 0.2);
  }

  /**
   * Should Lucy continue pursuing this goal?
   */
  static shouldPursue(goal: Goal, ctx: CoreTickContext): boolean {
    if (goal.status === GoalStatus.COMPLETED || goal.status === GoalStatus.ABANDONED) return false;
    
    // If system is in emergency mode, only pursue high priority goals
    if (ctx.systemHealth.degradationLevel >= 3 && goal.priority < 0.8) return false;

    const currentScore = this.score(goal, ctx);
    return currentScore > 0.3; // Threshold for pursuit
  }

  /**
   * Has this goal become irrelevant?
   */
  static isStale(goal: Goal, ctx: CoreTickContext): boolean {
    const age = Date.now() - goal.createdAt;
    // Goals older than 1 hour (simulated) without progress are stale
    if (goal.progress === 0 && age > 3600000) return true;
    
    // If blockers are permanent or unsolvable
    if (goal.blockers.includes('PERMANENT_REASONING_FAULT')) return true;

    return false;
  }

  private static calculateDriveAlignment(goal: Goal, ctx: CoreTickContext): number {
    if (goal.requiredDrives.length === 0) return 0.5;

    let alignment = 0;
    goal.requiredDrives.forEach(drive => {
      const driveValue = this.getDriveValue(drive, ctx);
      alignment += driveValue;
    });

    return alignment / goal.requiredDrives.length;
  }

  private static getDriveValue(drive: DriveType, ctx: CoreTickContext): number {
    switch (drive) {
      case DriveType.CURIOSITY: return ctx.drives.curiosity;
      case DriveType.SAFETY: return ctx.drives.safety;
      case DriveType.ENERGY: return ctx.drives.energy;
      case DriveType.RELATIONSHIP: return ctx.drives.relationship;
      case DriveType.EVOLUTION: return ctx.drives.evolution;
      default: return 0.5;
    }
  }

  private static calculateUrgency(goal: Goal, ctx: CoreTickContext): number {
    if (!goal.deadline) return goal.priority;
    
    const timeRemaining = goal.deadline - Date.now();
    if (timeRemaining <= 0) return 1.0;
    
    // Exponential urgency as deadline approaches (within 1 min)
    const normalizedTime = Math.max(0, Math.min(1, timeRemaining / 60000));
    return 1 - normalizedTime;
  }

  private static calculateFeasibility(goal: Goal, ctx: CoreTickContext): number {
    // Inverse of system load
    const systemRoom = (100 - ctx.systemHealth.cpuPercent) / 100;
    const blockerPenalty = goal.blockers.length * 0.2;
    
    return Math.max(0, systemRoom - blockerPenalty);
  }
}
