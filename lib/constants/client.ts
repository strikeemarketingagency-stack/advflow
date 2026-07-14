import { MaritalStatus } from "@/lib/repositories/types";

export const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao_estavel", label: "União estável" },
];

export function maritalStatusLabel(value: string): string {
  return MARITAL_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}
