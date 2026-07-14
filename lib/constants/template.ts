import { TemplateCategory } from "@/lib/repositories/types";

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "contratos", label: "Contratos" },
  { value: "procuracoes", label: "Procurações" },
  { value: "notificacoes", label: "Notificações" },
  { value: "declaracoes", label: "Declarações" },
  { value: "recibos", label: "Recibos" },
  { value: "outros", label: "Outros" },
];

export function categoryLabel(value: string): string {
  return TEMPLATE_CATEGORIES.find((c) => c.value === value)?.label ?? "Outros";
}
