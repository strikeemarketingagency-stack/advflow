import { TemplateBlock, TemplateVariable } from "@/lib/repositories/types";

const TOKEN_REGEX = /\{\{([A-Z0-9_]+)\}\}/g;

export function extractTokensFromText(text: string): string[] {
  const tokens = new Set<string>();
  let match;
  const regex = new RegExp(TOKEN_REGEX);
  while ((match = regex.exec(text))) tokens.add(match[1]);
  return Array.from(tokens);
}

export function extractTokens(blocks: TemplateBlock[]): string[] {
  const tokens = new Set<string>();
  for (const block of blocks) {
    if (!block.text) continue;
    extractTokensFromText(block.text).forEach((t) => tokens.add(t));
  }
  return Array.from(tokens);
}

export function fillBlocks(blocks: TemplateBlock[], values: Record<string, string>): TemplateBlock[] {
  return blocks.map((block) => ({
    ...block,
    text: block.text
      ? block.text.replace(TOKEN_REGEX, (_, token: string) => values[token] ?? `{{${token}}}`)
      : block.text,
  }));
}

export function groupVariables(variables: TemplateVariable[]) {
  return {
    partes: variables.filter((v) => v.group === "partes"),
    informacoes: variables.filter((v) => v.group === "informacoes"),
    valores: variables.filter((v) => v.group === "valores"),
    outros: variables.filter((v) => v.group === "outros"),
  };
}
