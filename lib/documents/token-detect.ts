import { TemplateBlock, TemplateVariable, VariableType } from "@/lib/repositories/types";
import { extractTokensFromText } from "@/lib/documents/block-model";

function guessType(token: string): VariableType {
  if (/CNPJ/.test(token)) return "cnpj";
  if (/CPF/.test(token)) return "cpf";
  if (/DATA/.test(token)) return "date";
  if (/VALOR|PRECO|PREÇO|HONORARIOS|HONORÁRIOS/.test(token)) return "currency";
  return "text";
}

function guessGroup(token: string): TemplateVariable["group"] {
  if (/NOME|CLIENTE|PARTE|OUTORGANTE|OUTORGADO|ADVOGADO|OAB|RG|CPF|CNPJ/.test(token)) return "partes";
  if (/VALOR|PRECO|PREÇO|DATA|PRAZO/.test(token)) return "valores";
  if (/ESCRITORIO|ESCRITÓRIO|FORO|RODAPE|RODAPÉ/.test(token)) return "outros";
  return "informacoes";
}

function humanizeLabel(token: string): string {
  return token
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function detectVariablesFromText(text: string): TemplateVariable[] {
  const tokens = extractTokensFromText(text);
  return tokens.map((token) => ({
    token,
    label: humanizeLabel(token),
    type: guessType(token),
    required: true,
    group: guessGroup(token),
  }));
}

function looksLikeClause(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 70) return false;
  const letters = trimmed.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length === 0) return false;
  return letters === letters.toUpperCase();
}

export function textToBlocks(rawText: string): TemplateBlock[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((line, index) => {
    if (index === 0 && looksLikeClause(line)) {
      return { id: crypto.randomUUID(), type: "heading", text: line, align: "center", bold: true };
    }
    if (looksLikeClause(line)) {
      return { id: crypto.randomUUID(), type: "clause", text: line, bold: true };
    }
    return { id: crypto.randomUUID(), type: "paragraph", text: line };
  });
}
