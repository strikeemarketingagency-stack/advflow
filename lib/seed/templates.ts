import { Template, TemplateBlock, TemplateVariable } from "@/lib/repositories/types";

function block(partial: Omit<TemplateBlock, "id">): TemplateBlock {
  return { id: crypto.randomUUID(), ...partial };
}

function baseVariables(extra: TemplateVariable[]): TemplateVariable[] {
  return [
    { token: "NOME_CLIENTE", label: "Nome do cliente", type: "text", required: true, group: "partes" },
    { token: "CPF_CLIENTE", label: "CPF/CNPJ do cliente", type: "cpf", required: true, group: "partes" },
    { token: "NOME_ESCRITORIO", label: "Nome do escritório", type: "text", required: true, group: "outros" },
    { token: "DATA", label: "Data do documento", type: "date", required: true, group: "valores" },
    ...extra,
  ];
}

function contratoPrestacaoServicos(userId: string, now: string): Template {
  return {
    id: crypto.randomUUID(),
    userId,
    name: "Contrato de Prestação de Serviços",
    category: "contratos",
    isFavorite: false,
    isBuiltin: true,
    createdAt: now,
    updatedAt: now,
    variables: baseVariables([
      { token: "OBJETO_CONTRATO", label: "Objeto do contrato", type: "text", required: true, group: "informacoes" },
      { token: "VALOR", label: "Valor do serviço", type: "currency", required: true, group: "valores" },
      { token: "PRAZO", label: "Prazo de vigência", type: "text", required: false, group: "informacoes" },
      { token: "FORO", label: "Foro de eleição", type: "text", required: false, group: "outros" },
    ]),
    blocks: [
      block({ type: "heading", text: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS", align: "center", bold: true }),
      block({
        type: "paragraph",
        text: "Pelo presente instrumento particular, de um lado {{NOME_ESCRITORIO}}, doravante denominado CONTRATADO, e de outro lado {{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, doravante denominado(a) CONTRATANTE, têm entre si justo e contratado o presente instrumento, mediante as cláusulas seguintes.",
      }),
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

function procuracaoAdJudicia(userId: string, now: string): Template {
  return {
    id: crypto.randomUUID(),
    userId,
    name: "Procuração Ad Judicia",
    category: "procuracoes",
    isFavorite: false,
    isBuiltin: true,
    createdAt: now,
    updatedAt: now,
    variables: baseVariables([
      { token: "NOME_ADVOGADO", label: "Nome do advogado", type: "text", required: true, group: "partes" },
      { token: "OAB", label: "Número da OAB", type: "text", required: true, group: "partes" },
      { token: "PODERES", label: "Poderes outorgados", type: "text", required: false, group: "informacoes" },
    ]),
    blocks: [
      block({ type: "heading", text: "PROCURAÇÃO AD JUDICIA ET EXTRA", align: "center", bold: true }),
      block({
        type: "paragraph",
        text: "OUTORGANTE: {{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, pelo presente instrumento de mandato, nomeia e constitui seu(sua) bastante procurador(a):",
      }),
      block({
        type: "paragraph",
        text: "OUTORGADO(A): {{NOME_ADVOGADO}}, inscrito(a) na OAB sob o nº {{OAB}}, integrante de {{NOME_ESCRITORIO}}.",
      }),
      block({ type: "clause", text: "PODERES", bold: true }),
      block({
        type: "paragraph",
        text: "Confere-lhe amplos poderes para o foro em geral, com a cláusula ad judicia et extra, em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras até final decisão, {{PODERES}}.",
      }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine" }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}", align: "center" }),
    ],
  };
}

function notificacaoExtrajudicial(userId: string, now: string): Template {
  return {
    id: crypto.randomUUID(),
    userId,
    name: "Notificação Extrajudicial",
    category: "notificacoes",
    isFavorite: false,
    isBuiltin: true,
    createdAt: now,
    updatedAt: now,
    variables: baseVariables([
      { token: "NOME_NOTIFICADO", label: "Nome do notificado", type: "text", required: true, group: "partes" },
      { token: "MOTIVO", label: "Motivo da notificação", type: "text", required: true, group: "informacoes" },
      { token: "PRAZO_RESPOSTA", label: "Prazo para resposta", type: "text", required: false, group: "valores" },
    ]),
    blocks: [
      block({ type: "heading", text: "NOTIFICAÇÃO EXTRAJUDICIAL", align: "center", bold: true }),
      block({ type: "paragraph", text: "Ao(À) Sr(a). {{NOME_NOTIFICADO}}." }),
      block({
        type: "paragraph",
        text: "{{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, por intermédio de {{NOME_ESCRITORIO}}, vem, respeitosamente, NOTIFICAR Vossa Senhoria acerca do seguinte:",
      }),
      block({ type: "paragraph", text: "{{MOTIVO}}" }),
      block({
        type: "paragraph",
        text: "Fica Vossa Senhoria notificado(a) a se manifestar no prazo de {{PRAZO_RESPOSTA}}, sob pena de serem adotadas as medidas judiciais cabíveis.",
      }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine", imageRef: "signature" }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}", align: "center" }),
    ],
  };
}

function declaracaoHipossuficiencia(userId: string, now: string): Template {
  return {
    id: crypto.randomUUID(),
    userId,
    name: "Declaração de Hipossuficiência",
    category: "declaracoes",
    isFavorite: false,
    isBuiltin: true,
    createdAt: now,
    updatedAt: now,
    variables: baseVariables([
      { token: "RG_CLIENTE", label: "RG do cliente", type: "text", required: false, group: "partes" },
      { token: "ENDERECO_CLIENTE", label: "Endereço do cliente", type: "text", required: false, group: "partes" },
    ]),
    blocks: [
      block({ type: "heading", text: "DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA", align: "center", bold: true }),
      block({
        type: "paragraph",
        text: "Eu, {{NOME_CLIENTE}}, portador(a) do RG nº {{RG_CLIENTE}} e CPF nº {{CPF_CLIENTE}}, residente e domiciliado(a) em {{ENDERECO_CLIENTE}}, DECLARO, para os devidos fins de direito e sob as penas da lei, não possuir condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu sustento próprio ou de minha família.",
      }),
      block({ type: "paragraph", text: "Por ser expressão da verdade, firmo a presente declaração." }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine" }),
      block({ type: "paragraph", text: "{{NOME_CLIENTE}}", align: "center" }),
    ],
  };
}

function reciboPagamento(userId: string, now: string): Template {
  return {
    id: crypto.randomUUID(),
    userId,
    name: "Recibo de Pagamento de Honorários",
    category: "recibos",
    isFavorite: false,
    isBuiltin: true,
    createdAt: now,
    updatedAt: now,
    variables: baseVariables([
      { token: "VALOR", label: "Valor recebido", type: "currency", required: true, group: "valores" },
      { token: "REFERENTE_A", label: "Referente a", type: "text", required: true, group: "informacoes" },
    ]),
    blocks: [
      block({ type: "heading", text: "RECIBO DE PAGAMENTO", align: "center", bold: true }),
      block({
        type: "paragraph",
        text: "Recebi de {{NOME_CLIENTE}}, portador(a) do CPF/CNPJ nº {{CPF_CLIENTE}}, a importância de {{VALOR}}, referente a {{REFERENTE_A}}.",
      }),
      block({ type: "paragraph", text: "Para maior clareza, firmo o presente recibo, dando plena e geral quitação." }),
      block({ type: "paragraph", text: "{{DATA}}", align: "right" }),
      block({ type: "signatureLine", imageRef: "signature" }),
      block({ type: "paragraph", text: "{{NOME_ESCRITORIO}}", align: "center" }),
    ],
  };
}

export function builtinTemplates(userId: string): Template[] {
  const now = new Date().toISOString();
  return [
    contratoPrestacaoServicos(userId, now),
    procuracaoAdJudicia(userId, now),
    notificacaoExtrajudicial(userId, now),
    declaracaoHipossuficiencia(userId, now),
    reciboPagamento(userId, now),
  ];
}
