import { operationSchemas, OPERATION_NAMES, type OperationName } from '@/lib/website/operations';
import { SECTION_META, SECTION_TYPES, sectionSchemas } from '@/lib/website/sections';
import { zodToJsonSchema, type JsonSchema } from './schema';

/**
 * The agent's tool surface.
 *
 * Document tools are backed 1:1 by the operations layer, so a tool call is
 * validated by the same zod schema that the editor's own buttons go through.
 * Project tools are handled by the API route because they touch the database
 * or an external service rather than the document.
 */

export type ToolKind = 'document' | 'project';

export type ToolSpec = {
  name: string;
  kind: ToolKind;
  description: string;
  inputSchema: JsonSchema;
};

const DOCUMENT_TOOL_DESCRIPTIONS: Record<OperationName, string> = {
  create_page: 'Create a new page. Inherits the site header/footer so navigation stays consistent.',
  update_page: 'Rename a page, change its URL path, or set its SEO title/description.',
  delete_page: 'Delete a page. The home page cannot be deleted.',
  add_section: 'Add a section to a page. Only pass the props you want to differ from the sensible defaults.',
  update_section: 'Change props on an existing section. This is a partial patch - untouched props keep their values. Use this for layout, variant and styling changes.',
  update_content: 'Change one specific field via a dot path, e.g. path "items.1.title". Best for surgical copy edits.',
  delete_section: 'Remove a section from its page.',
  duplicate_section: 'Copy a section and insert the copy directly below the original.',
  reorder_sections: 'Set the full section order for a page by listing every section id in the desired order.',
  move_section: 'Move a single section up, down, or to a specific index.',
  toggle_section: 'Hide or show a section without deleting it.',
  update_theme: 'Change the brand kit: colours, fonts, radius, button style, density, light/dark mode.',
  add_asset: 'Add an image URL to the project asset library.',
  set_section_image: 'Replace an image on a section. `path` is the dot path to the image, e.g. "image" or "images.2".',
};

const PROJECT_TOOLS: ToolSpec[] = [
  {
    name: 'deploy_project',
    kind: 'project',
    description: 'Build the current website and deploy it to Vercel production. Returns a deployment id.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_deployment_status',
    kind: 'project',
    description: 'Check the build status and production URL of the latest deployment.',
    inputSchema: {
      type: 'object',
      properties: { deploymentId: { type: 'string', description: 'Omit to use the latest deployment.' } },
      additionalProperties: false,
    },
  },
];

export const DOCUMENT_TOOLS: ToolSpec[] = OPERATION_NAMES.map((name) => ({
  name,
  kind: 'document' as const,
  description: DOCUMENT_TOOL_DESCRIPTIONS[name],
  inputSchema: zodToJsonSchema(operationSchemas[name]),
}));

export const ALL_TOOLS: ToolSpec[] = [...DOCUMENT_TOOLS, ...PROJECT_TOOLS];

export function toolsFor(kinds: ToolKind[] = ['document']): ToolSpec[] {
  return ALL_TOOLS.filter((tool) => kinds.includes(tool.kind));
}

/**
 * Compact catalogue for the prompt. Full JSON Schema per tool would dominate
 * the context window, so the prompt carries a signature-style summary and the
 * server does the authoritative validation - reporting precise errors back to
 * the model when a call does not fit.
 */
export function toolCatalogText(tools: ToolSpec[] = DOCUMENT_TOOLS): string {
  return tools
    .map((tool) => {
      const properties = (tool.inputSchema.properties ?? {}) as Record<string, JsonSchema>;
      const required = new Set((tool.inputSchema.required ?? []) as string[]);
      const args = Object.entries(properties)
        .map(([key, value]) => `${key}${required.has(key) ? '' : '?'}: ${describeType(value)}`)
        .join(', ');
      return `- ${tool.name}({ ${args} })\n    ${tool.description}`;
    })
    .join('\n');
}

function describeType(schema: JsonSchema): string {
  if (Array.isArray(schema.enum)) return (schema.enum as string[]).map((v) => `"${v}"`).join('|');
  if (schema.const !== undefined) return `"${String(schema.const)}"`;
  if (schema.anyOf) return (schema.anyOf as JsonSchema[]).map(describeType).join('|');
  if (schema.type === 'array') return `${describeType((schema.items ?? {}) as JsonSchema)}[]`;
  if (schema.type === 'object') return 'object';
  return String(schema.type ?? 'any');
}

/** Section library reference, so the model only ever picks a real type. */
export function sectionCatalogText(): string {
  return SECTION_TYPES.map((type) => `- ${type}: ${SECTION_META[type].description}`).join('\n');
}

/**
 * Per-type prop reference generated from the section schemas. The model needs
 * the real prop names to produce usable content, and generating this from zod
 * means the prompt can never drift from what the validator accepts.
 */
export function sectionPropsText(): string {
  return SECTION_TYPES.map((type) => {
    const schema = zodToJsonSchema(sectionSchemas[type]);
    const properties = (schema.properties ?? {}) as Record<string, JsonSchema>;
    const args = Object.entries(properties)
      .filter(([key]) => key !== 'type' && key !== 'id' && key !== 'hidden')
      .map(([key, value]) => `${key}: ${describeType(value)}`)
      .join(', ');
    return `${type} { ${args} }`;
  }).join('\n');
}
