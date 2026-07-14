import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Client, Office, TemplateVariable } from "@/lib/repositories/types";

const CLIENT_TOKEN_MAP: Record<string, (client: Client) => string> = {
  NOME_CLIENTE: (c) => c.fullName,
  CPF_CLIENTE: (c) => c.docNumber,
  CNPJ_CLIENTE: (c) => c.docNumber,
  CPF: (c) => c.docNumber,
  CNPJ: (c) => c.docNumber,
  RG_CLIENTE: (c) => c.rg,
  RG: (c) => c.rg,
  ENDERECO_CLIENTE: (c) => c.address,
  ENDERECO: (c) => c.address,
  TELEFONE_CLIENTE: (c) => c.phone,
  EMAIL_CLIENTE: (c) => c.email,
  PROFISSAO_CLIENTE: (c) => c.profession,
};

const OFFICE_TOKEN_MAP: Record<string, (office: Office) => string> = {
  NOME_ESCRITORIO: (o) => o.officeName,
  NOME_ADVOGADO: (o) => o.lawyerName,
  OAB: (o) => o.oab,
  FORO: (o) => `${o.city}/${o.state}`,
};

export function buildAutofillValues(
  variables: TemplateVariable[],
  client: Client | null,
  office: Office | null
): Record<string, string> {
  const values: Record<string, string> = {};
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  for (const variable of variables) {
    if (variable.token === "DATA") {
      values[variable.token] = today;
      continue;
    }
    if (client && CLIENT_TOKEN_MAP[variable.token]) {
      const value = CLIENT_TOKEN_MAP[variable.token](client);
      if (value) {
        values[variable.token] = value;
        continue;
      }
    }
    if (office && OFFICE_TOKEN_MAP[variable.token]) {
      const value = OFFICE_TOKEN_MAP[variable.token](office);
      if (value) values[variable.token] = value;
    }
  }
  return values;
}
