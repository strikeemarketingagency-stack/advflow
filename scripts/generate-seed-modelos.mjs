// Gera supabase/seed_modelos_sistema.sql a partir do MESMO conteúdo de
// lib/seed/templates.ts (builtinTemplates) — mantém uma única fonte de
// verdade para o texto dos 5 modelos padrão. Rode com `node
// scripts/generate-seed-modelos.mjs` sempre que lib/seed/templates.ts mudar,
// e cole o resultado em supabase/seed_modelos_sistema.sql.
import { writeFileSync } from "node:fs";

function block(partial) {
  return { id: crypto.randomUUID(), ...partial };
}

function baseVariables(extra) {
  return [
    { token: "NOME_CLIENTE", label: "Nome do cliente", type: "text", required: true, group: "partes" },
    { token: "CPF_CLIENTE", label: "CPF/CNPJ do cliente", type: "cpf", required: true, group: "partes" },
    { token: "NOME_ESCRITORIO", label: "Nome do escritório", type: "text", required: true, group: "outros" },
    { token: "DATA", label: "Data do documento", type: "date", required: true, group: "valores" },
    ...extra,
  ];
}

function contratoPrestacaoServicos() {
  return {
    name: "Contrato de Prestação de Serviços",
    category: "contratos",
    variables: baseVariables([
      { token: "OBJETO_CONTRATO", label: "Objeto do contrato", type: "text", required: true, group: "informacoes" },
      { token: "VALOR", label: "Valor do serviço", type: "currency", required: true, group: "valores" },
      { token: "PRAZO", label: "Prazo de vigência", type: "text", required: false, group: "informacoes" },
      { token: "FORO", label: "Foro de eleição", type: "text", required: false, group: "outros" },
    ]),
    blocks: [
      block({ type: "heading", text: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS", align: "center", bold: true }),
      block({ type: "paragraph", text: "Pelo presente instrumento particular, de um lado {{NOME_ESCRITORIO}}, doravante denominado CONTRATADO, e de outro lado {{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, doravante denominado(a) CONTRATANTE, têm entre si justo e contratado o presente instrumento, mediante as cláusulas seguintes." }),
      block({ type: "clause", text: "CLÁUSULA 1ª — DO OBJETO", bold: true }),
      block({ type: "paragraph", text: "O presente contrato tem por objeto: {{OBJETO_CONTRATO}}." }),
      block({ type: "clause", text: "CLÁUSULA 2ª — DOS HONORÁRIOS", bold: true }),
      block({ type: "paragraph", text: "Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO o valor de {{VALOR}}, nas condições acordadas entre as partes." }),
      block({ type: "clause", text: "CLÁUSULA 3ª — DO PRAZO", bold: true }),
      block({ type: "paragraph", text: "O presente contrato vigorará pelo prazo de {{PRAZO}}, podendo ser renovado mediante acordo entre as partes." }),
      block({ type: "clause", text: "CLÁUSULA 4ª — DO FORO", bold: true }),
      block({ type: "paragraph", text: "Fica eleito o foro de {{FORO}} para dirimir quaisquer dúvidas oriundas do presente contrato." }),
      block({ type: "paragraph", text: "E por estarem justos e contratados, firmam o presente instrumento em duas vias de igual teor." }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine", imageRef: "signature" }),
      block({ type: "paragraph", text: "{{NOME_ESCRITORIO}}", align: "center" }),
      block({ type: "signatureLine" }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}", align: "center" }),
    ],
  };
}

function procuracaoAdJudicia() {
  return {
    name: "Procuração Ad Judicia",
    category: "procuracoes",
    variables: baseVariables([
      { token: "NOME_ADVOGADO", label: "Nome do advogado", type: "text", required: true, group: "partes" },
      { token: "OAB", label: "Número da OAB", type: "text", required: true, group: "partes" },
      { token: "PODERES", label: "Poderes outorgados", type: "text", required: false, group: "informacoes" },
    ]),
    blocks: [
      block({ type: "heading", text: "PROCURAÇÃO AD JUDICIA ET EXTRA", align: "center", bold: true }),
      block({ type: "paragraph", text: "OUTORGANTE: {{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, pelo presente instrumento de mandato, nomeia e constitui seu(sua) bastante procurador(a):" }),
      block({ type: "paragraph", text: "OUTORGADO(A): {{NOME_ADVOGADO}}, inscrito(a) na OAB sob o nº {{OAB}}, integrante de {{NOME_ESCRITORIO}}." }),
      block({ type: "clause", text: "PODERES", bold: true }),
      block({ type: "paragraph", text: "Confere-lhe amplos poderes para o foro em geral, com a cláusula ad judicia et extra, em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras até final decisão, {{PODERES}}." }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine" }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}", align: "center" }),
    ],
  };
}

function notificacaoExtrajudicial() {
  return {
    name: "Notificação Extrajudicial",
    category: "notificacoes",
    variables: baseVariables([
      { token: "NOME_NOTIFICADO", label: "Nome do notificado", type: "text", required: true, group: "partes" },
      { token: "MOTIVO", label: "Motivo da notificação", type: "text", required: true, group: "informacoes" },
      { token: "PRAZO_RESPOSTA", label: "Prazo para resposta", type: "text", required: false, group: "valores" },
    ]),
    blocks: [
      block({ type: "heading", text: "NOTIFICAÇÃO EXTRAJUDICIAL", align: "center", bold: true }),
      block({ type: "paragraph", text: "Ao(À) Sr(a). {{NOME_NOTIFICADO}}." }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, por intermédio de {{NOME_ESCRITORIO}}, vem, respeitosamente, NOTIFICAR Vossa Senhoria acerca do seguinte:" }),
      block({ type: "paragraph", text: "{{MOTIVO}}" }),
      block({ type: "paragraph", text: "Fica Vossa Senhoria notificado(a) a se manifestar no prazo de {{PRAZO_RESPOSTA}}, sob pena de serem adotadas as medidas judiciais cabíveis." }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine", imageRef: "signature" }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}", align: "center" }),
    ],
  };
}

function declaracaoHipossuficiencia() {
  return {
    name: "Declaração de Hipossuficiência",
    category: "declaracoes",
    variables: baseVariables([
      { token: "RG_CLIENTE", label: "RG do cliente", type: "text", required: false, group: "partes" },
      { token: "ENDERECO_CLIENTE", label: "Endereço do cliente", type: "text", required: false, group: "partes" },
    ]),
    blocks: [
      block({ type: "heading", text: "DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA", align: "center", bold: true }),
      block({ type: "paragraph", text: "Eu, {{NOME_CLIENTE}}, portador(a) do RG nº {{RG_CLIENTE}} e CPF nº {{CPF_CLIENTE}}, residente e domiciliado(a) em {{ENDERECO_CLIENTE}}, DECLARO, para os devidos fins de direito e sob as penas da lei, não possuir condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu sustento próprio ou de minha família." }),
      block({ type: "paragraph", text: "Por ser expressão da verdade, firmo a presente declaração." }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine" }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}", align: "center" }),
    ],
  };
}

function reciboPagamento() {
  return {
    name: "Recibo de Pagamento de Honorários",
    category: "recibos",
    variables: baseVariables([
      { token: "VALOR", label: "Valor recebido", type: "currency", required: true, group: "valores" },
      { token: "REFERENTE_A", label: "Referente a", type: "text", required: true, group: "informacoes" },
    ]),
    blocks: [
      block({ type: "heading", text: "RECIBO DE PAGAMENTO", align: "center", bold: true }),
      block({ type: "paragraph", text: "Recebi de {{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, a importância de {{VALOR}}, referente a {{REFERENTE_A}}." }),
      block({ type: "paragraph", text: "Para maior clareza, firmo o presente recibo, dando plena e geral quitação." }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine", imageRef: "signature" }),
      block({ type: "paragraph", text: "{{NOME_ESCRITORIO}}", align: "center" }),
    ],
  };
}

const templates = [
  contratoPrestacaoServicos(),
  procuracaoAdJudicia(),
  notificacaoExtrajudicial(),
  declaracaoHipossuficiencia(),
  reciboPagamento(),
];

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

const values = templates
  .map((t) => {
    const id = crypto.randomUUID();
    return `  (${sqlString(id)}, ${sqlString(t.name)}, ${sqlString(t.category)}, ${sqlString(
      JSON.stringify(t.blocks)
    )}::jsonb, ${sqlString(JSON.stringify(t.variables))}::jsonb, true, true)`;
  })
  .join(",\n");

const sql = `-- Gerado por scripts/generate-seed-modelos.mjs a partir de lib/seed/templates.ts
-- Roda uma vez no SQL Editor do Supabase. is_modelo_sistema = true,
-- perfil_id null (linha compartilhada, ver plano de migração).
insert into public.modelos
  (id, titulo, categoria, blocks, variables, is_favorite, is_modelo_sistema)
values
${values};
`;

writeFileSync(new URL("../supabase/seed_modelos_sistema.sql", import.meta.url), sql, "utf8");
console.log("supabase/seed_modelos_sistema.sql gerado.");
