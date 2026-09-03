import { z } from 'zod';

/**
 * Minimal zod -> JSON Schema converter.
 *
 * Covers exactly the constructs used by the operation schemas. It exists so
 * the operations layer stays the single source of truth: the same zod schemas
 * that validate a tool call also describe it to the model. When a provider's
 * native function calling is wired up, these are the schemas it receives.
 */

export type JsonSchema = Record<string, unknown>;

export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const def = schema._def as { typeName?: string } & Record<string, unknown>;

  switch (def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodObject: {
      const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = zodToJsonSchema(value as z.ZodTypeAny);
        if (!(value as z.ZodTypeAny).isOptional()) required.push(key);
      }
      return { type: 'object', properties, ...(required.length ? { required } : {}), additionalProperties: false };
    }
    case z.ZodFirstPartyTypeKind.ZodString: {
      const checks = (def.checks ?? []) as Array<{ kind: string; value?: number }>;
      const out: JsonSchema = { type: 'string' };
      for (const check of checks) {
        if (check.kind === 'min') out.minLength = check.value;
        if (check.kind === 'max') out.maxLength = check.value;
      }
      if (schema.description) out.description = schema.description;
      return out;
    }
    case z.ZodFirstPartyTypeKind.ZodNumber: {
      const checks = (def.checks ?? []) as Array<{ kind: string; value?: number }>;
      const out: JsonSchema = { type: 'number' };
      for (const check of checks) {
        if (check.kind === 'min') out.minimum = check.value;
        if (check.kind === 'max') out.maximum = check.value;
        if (check.kind === 'int') out.type = 'integer';
      }
      return out;
    }
    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return { type: 'boolean' };
    case z.ZodFirstPartyTypeKind.ZodLiteral:
      return { const: def.value };
    case z.ZodFirstPartyTypeKind.ZodEnum:
      return { type: 'string', enum: def.values as string[] };
    case z.ZodFirstPartyTypeKind.ZodArray: {
      const inner = zodToJsonSchema(def.type as z.ZodTypeAny);
      const out: JsonSchema = { type: 'array', items: inner };
      const max = (def.maxLength as { value: number } | null)?.value;
      const min = (def.minLength as { value: number } | null)?.value;
      if (typeof max === 'number') out.maxItems = max;
      if (typeof min === 'number') out.minItems = min;
      return out;
    }
    case z.ZodFirstPartyTypeKind.ZodUnion:
    case z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion: {
      const options = (def.options as z.ZodTypeAny[] | Map<string, z.ZodTypeAny>) ?? [];
      const list = Array.isArray(options) ? options : Array.from(options.values());
      return { anyOf: list.map(zodToJsonSchema) };
    }
    case z.ZodFirstPartyTypeKind.ZodRecord:
      return { type: 'object', additionalProperties: true };
    case z.ZodFirstPartyTypeKind.ZodOptional:
    case z.ZodFirstPartyTypeKind.ZodNullable:
    case z.ZodFirstPartyTypeKind.ZodDefault:
    case z.ZodFirstPartyTypeKind.ZodCatch: {
      const inner = zodToJsonSchema((def.innerType ?? def.type) as z.ZodTypeAny);
      const description = schema.description;
      return description ? { ...inner, description } : inner;
    }
    case z.ZodFirstPartyTypeKind.ZodEffects:
      return zodToJsonSchema(def.schema as z.ZodTypeAny);
    default:
      return {};
  }
}
