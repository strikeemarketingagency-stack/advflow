import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { TemplateVariable } from "@/lib/repositories/types";

const PLACEHOLDER: Record<TemplateVariable["type"], string> = {
  text: "Digite o valor",
  date: "Ex.: 14 de julho de 2026",
  currency: "Ex.: R$ 1.500,00",
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
};

interface FieldInputProps {
  variable: TemplateVariable;
  value: string;
  onChange: (value: string) => void;
}

export function FieldInput({ variable, value, onChange }: FieldInputProps) {
  return (
    <Field label={variable.label} required={variable.required}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDER[variable.type]}
      />
    </Field>
  );
}
