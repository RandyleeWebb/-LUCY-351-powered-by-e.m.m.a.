import { EarthEvent, DropPolicy, StreamConfig } from '../types';

export class StreamManager {
  private queues: Map<string, EarthEvent[]> = new Map();
  private sampleCounters: Map<string, number> = new Map();
  private configs: Map<string, StreamConfig> = new Map();

  constructor(configs: StreamConfig[]) {
    configs.forEach(config => {
      this.configs.set(config.source, config);
      this.queues.set(config.source, []);
      this.sampleCounters.set(config.source, 0);
    });
  }

  processEvent(event: EarthEvent): EarthEvent[] | null {
    const config = this.configs.get(event.source);
    const queue = this.queues.get(event.source);

    if (!config || !queue) return [event]; // Default pass if no config

    if (queue.length < config.maxQueueSize) {
      queue.push(event);
      return [event];
    }

    // Backpressure logic
    switch (config.dropPolicy) {
      case DropPolicy.DROP_OLDEST: {
        queue.shift();
        queue.push(event);
        return [event];
      }

      case DropPolicy.DROP_LOW_PRIORITY: {
        if (event.severity >= config.priorityThreshold) {
          const lowIdx = queue.findIndex(e => e.severity < config.priorityThreshold);
          if (lowIdx >= 0) {
            queue.splice(lowIdx, 1);
            queue.push(event);
            return [event];
          }
        }
        return null; // Drop
      }

      case DropPolicy.SAMPLE: {
        const counter = (this.sampleCounters.get(event.source) || 0) + 1;
        this.sampleCounters.set(event.source, counter);
        if (counter % (config.sampleRate || 10) === 0) {
          queue.shift(); // keep queue size stable
          queue.push(event);
          return [event];
        }
        return null;
      }

      case DropPolicy.AGGREGATE: {
        const window = config.aggregationWindow || 5000;
        const recentIdx = queue.findIndex(e => 
          event.timestamp - e.timestamp < window && e.type === event.type
        );

        if (recentIdx >= 0) {
          const existing = queue[recentIdx];
          // Simple aggregation: keep higher severity, update timestamp
          const nextHistory = [...existing.severityHistory, event.severity].slice(-20);
          const aggregated: EarthEvent = {
            ...existing,
            severity: Math.max(existing.severity, event.severity),
            severityHistory: nextHistory,
            timestamp: event.timestamp,
            description: `Aggregated: ${existing.description}`
          };
          queue[recentIdx] = aggregated;
          return [aggregated];
        }
        
        queue.shift();
        queue.push(event);
        return [event];
      }

      default:
        return [event];
    }
  }

  getQueue(source: string): EarthEvent[] {
    return this.queues.get(source) || [];
  }
}
