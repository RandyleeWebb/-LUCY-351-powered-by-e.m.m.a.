import { z } from 'zod';
import { GoalStatus, DriveType, GoalOrigin, DegradationLevel } from '../types';

// --- API Response Schemas ---

export const USGSSchema = z.object({
  features: z.array(z.object({
    id: z.string(),
    properties: z.object({
      mag: z.number().nullable().optional(),
      place: z.string().nullable().optional(),
      time: z.number().optional()
    }),
    geometry: z.object({
      coordinates: z.array(z.number())
    })
  })).optional()
});

export const NOAASchema = z.array(z.object({
  flux: z.number().optional()
})).optional();

export const NOAAProtonSchema = z.array(z.object({
  flux: z.number().optional(),
  energy: z.string().optional()
})).optional();

export const NOAAMagnetometerSchema = z.array(z.object({
  arc_terminator: z.boolean().optional(),
  hp: z.number().optional(),
  he: z.number().optional(),
  hn: z.number().optional(),
  total: z.number().optional()
})).optional();

export const OpenMeteoSchema = z.object({
  current: z.object({
    surface_pressure: z.number()
  })
});

// --- User Input / Command Schemas ---

export const GoalSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  origin: z.nativeEnum(GoalOrigin),
  priority: z.number().min(0).max(1),
  status: z.nativeEnum(GoalStatus).optional(),
  progress: z.number().min(0).max(1).optional(),
  requiredDrives: z.array(z.nativeEnum(DriveType)).optional(),
  relatedPatterns: z.array(z.string()).optional(),
  blockers: z.array(z.string()).optional(),
});

export const AddGoalParamsSchema = z.object({
  goal: GoalSchema
});

export const AdjustDriveParamsSchema = z.object({
  drive: z.nativeEnum(DriveType),
  delta: z.number()
});

export const TriggerSimParamsSchema = z.object({
  type: z.string().optional(),
  objective: z.string().optional(),
  stability: z.number().optional(),
  resonance: z.number().optional(),
  parameters: z.record(z.string(), z.any()).optional()
});

export const StopSimParamsSchema = z.object({
  type: z.string()
});

export const MitigateAlertParamsSchema = z.object({
  id: z.string()
});

export const RemoveGoalParamsSchema = z.object({
  id: z.string()
});

// --- WebSocket Message Schemas ---

export const CommandMessageSchema = z.object({
  type: z.literal('COMMAND'),
  command: z.string(),
  params: z.any().optional(),
  timestamp: z.number()
});

export const StateSyncMessageSchema = z.object({
  type: z.literal('STATE_SYNC'),
  payload: z.any() // Complex, maybe just partial validation for now
});

export const RequestStateMessageSchema = z.object({
  type: z.literal('REQUEST_STATE'),
  timestamp: z.number()
});

export const EventMessageSchema = z.object({
  type: z.literal('EVENT'),
  payload: z.any()
});

export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  CommandMessageSchema,
  StateSyncMessageSchema,
  RequestStateMessageSchema,
  EventMessageSchema
]);

/**
 * Validates data against a schema and returns the parsed data.
 * Throws a formatted error if validation fails.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('Validation Error:', result.error.format());
    throw new Error(`Data Validation Failed: ${result.error.issues.map(i => i.path.join('.') + ': ' + i.message).join(', ')}`);
  }
  return result.data;
}
