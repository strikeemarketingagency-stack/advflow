import { authRepo, officeRepo, clientRepo, templateRepo, documentRepo, activityRepo } from "@/lib/repositories";
import { fillBlocks } from "@/lib/documents/block-model";
import type { Client, ClientInput, GeneratedDocument, Template } from "@/lib/repositories/types";

// Conta de demonstração isolada, com dados fictícios, usada apenas para fins
// de prova social/apresentação — nunca é o ponto de partida de uma conta real
// criada via /signup, que segue vazia pelo onboarding normal.
const DEMO_EMAIL = "demo@advflow.com.br";
const DEMO_PASSWORD = "advflow-demo-2026";

// Usa os repos trocáveis de lib/repositories (não os locais direto) — a
// demo precisa funcionar tanto em modo mock quanto com o backend real do
// Supabase. Uma versão anterior forçava sempre o backend local pra
// autenticação, o que quebrava silenciosamente assim que
// NEXT_PUBLIC_DATA_BACKEND=supabase: a sessão da demo ficava só no
// localStorage, mas o resto do app (AuthGuard, AuthProvider) já lia sessão
// do Supabase via cookie — a demo "entrava" num lugar que mais ninguém
// olhava, e o app mandava de volta pro /login na hora.
async function ensureDemoSession(): Promise<string> {
  try {
    const session = await authRepo.signUp(DEMO_EMAIL, DEMO_PASSWORD);
    return session.user.id;
  } catch {
    // Primeira vez: signUp cria a conta. Da segunda em diante, a conta já
    // existe e signUp falha (motivo varia por backend) — signIn resolve os
    // dois casos sem depender do código de erro exato de cada backend.
    const session = await authRepo.signIn(DEMO_EMAIL, DEMO_PASSWORD);
    return session.user.id;
  }
}

function findTemplate(templates: Template[], name: string): Template | undefined {
  return templates.find((t) => t.name === name);
}

async function makeDoc(
  client: Client,
  template: Template | undefined,
  status: GeneratedDocument["status"],
  fieldValues: Record<string, string>
): Promise<GeneratedDocument | null> {
  if (!template) return null;
  return documentRepo.create({
    clientId: client.id,
    clientName: client.fullName,
    templateId: template.id,
    templateName: template.name,
    category: template.category,
    status,
    blocks: fillBlocks(template.blocks, fieldValues),
    fieldValues,
  });
}

/**
 * Semeia o conjunto fictício de dados da demo — só roda uma vez (checa
 * officeRepo.get() primeiro). Diferente da versão anterior (que sobrescrevia
 * tudo a cada entrada), não há como "limpar" atividades já geradas via os
 * repos (ActivityRepository não tem remove()) — então, em vez de resetar,
 * entradas seguintes na demo só reaproveitam os dados já semeados.
 */
async function seedDemoData(): Promise<void> {
  const existing = await officeRepo.get();
  if (existing?.onboardingComplete) return;

  const office = await officeRepo.save({
    lawyerName: "Camila Ferraz",
    officeName: "Almeida & Ferraz Advocacia",
    oab: "OAB/SP 198.432",
    state: "SP",
    city: "São Paulo",
    specialty: "Direito Civil",
    phone: "(11) 3221-4590",
    email: "contato@almeidaferraz.adv.br",
    address: "Av. Paulista, 1471 — Conj. 82, São Paulo/SP",
    footerText: "Este documento foi gerado eletronicamente por Almeida & Ferraz Advocacia.",
    onboardingComplete: true,
  });
  await activityRepo.log("office_updated", "Perfil do escritório configurado.");

  const clientDefs: ClientInput[] = [
    { fullName: "Marcos Vinícius Tavares", docNumber: "184.552.930-04", rg: "32.556.221-0", maritalStatus: "casado", profession: "Engenheiro civil", phone: "(11) 98211-4432", email: "marcos.tavares@gmail.com", address: "Rua Barão de Itapetininga, 210, São Paulo/SP", notes: "Cliente desde 2022, contratos recorrentes de consultoria." },
    { fullName: "Construtora Horizonte Ltda", docNumber: "12.345.678/0001-90", rg: "", maritalStatus: "", profession: "Pessoa jurídica", phone: "(11) 3345-2210", email: "juridico@horizonteconstrutora.com.br", address: "Av. Eng. Luís Carlos Berrini, 1500, São Paulo/SP", notes: "Cliente corporativo, obras residenciais na zona sul." },
    { fullName: "Fernanda Ribeiro Dias", docNumber: "302.884.117-55", rg: "28.114.900-1", maritalStatus: "solteiro", profession: "Socióloga", phone: "(11) 97765-9012", email: "fernanda.dias@outlook.com", address: "Rua Harmonia, 88, São Paulo/SP", notes: "" },
    { fullName: "Grupo Nordeste Comércio S.A.", docNumber: "09.887.234/0001-15", rg: "", maritalStatus: "", profession: "Pessoa jurídica", phone: "(85) 3223-7788", email: "contato@gruponordeste.com.br", address: "Av. Beira Mar, 3200, Fortaleza/CE", notes: "Contrato de distribuição em revisão." },
    { fullName: "João Pedro Salgado", docNumber: "445.221.990-32", rg: "40.221.775-3", maritalStatus: "casado", profession: "Autônomo", phone: "(11) 99001-2277", email: "jp.salgado@gmail.com", address: "Alameda Santos, 700, São Paulo/SP", notes: "" },
    { fullName: "Beatriz Souza Lima", docNumber: "218.774.660-21", rg: "35.667.809-2", maritalStatus: "solteiro", profession: "Arquiteta", phone: "(21) 98123-5540", email: "beatriz.lima@gmail.com", address: "Rua Voluntários da Pátria, 45, Rio de Janeiro/RJ", notes: "" },
  ];
  const clients: Client[] = [];
  for (const input of clientDefs) clients.push(await clientRepo.create(input));
  await activityRepo.log("client_created", `${clients[2].fullName} cadastrada como cliente.`, clients[2].id);
  await activityRepo.log("client_created", `${clients[4].fullName} cadastrado como cliente.`, clients[4].id);

  // Modelos de sistema já existem (linhas compartilhadas, semeadas via
  // supabase/seed_modelos_sistema.sql em produção, ou via o seed lazy local
  // em modo mock) — busca por nome em vez de assumir uma ordem/índice fixo,
  // já que em produção a lista vem ordenada por atualização, não por
  // inserção.
  const templates = await templateRepo.list();
  const contractTpl = findTemplate(templates, "Contrato de Prestação de Serviços");
  const procuracaoTpl = findTemplate(templates, "Procuração Ad Judicia");
  const notificacaoTpl = findTemplate(templates, "Notificação Extrajudicial");
  const declaracaoTpl = findTemplate(templates, "Declaração de Hipossuficiência");
  const reciboTpl = findTemplate(templates, "Recibo de Pagamento de Honorários");

  if (contractTpl && !contractTpl.isFavorite) {
    await templateRepo.toggleFavorite(contractTpl.id);
    await activityRepo.log("template_created", "Modelo Contrato de Prestação de Serviços favoritado.");
  }

  const doc0 = await makeDoc(clients[0], contractTpl, "concluido", {
    NOME_CLIENTE: clients[0].fullName,
    CPF_CLIENTE: clients[0].docNumber,
    NOME_ESCRITORIO: office.officeName,
    OBJETO_CONTRATO: "Consultoria jurídica preventiva em contratos de engenharia civil",
    VALOR: "R$ 4.200,00",
    PRAZO: "12 meses",
    FORO: "São Paulo/SP",
    DATA: "10 de julho de 2026",
  });
  if (doc0) await activityRepo.log("document_generated", `Contrato de Prestação de Serviços gerado para ${clients[0].fullName}.`, doc0.id);

  const doc1 = await makeDoc(clients[1], procuracaoTpl, "concluido", {
    NOME_CLIENTE: clients[1].fullName,
    CPF_CLIENTE: clients[1].docNumber,
    NOME_ESCRITORIO: office.officeName,
    NOME_ADVOGADO: office.lawyerName,
    OAB: office.oab,
    PODERES: "inclusive para transigir e firmar acordos",
    DATA: "8 de julho de 2026",
  });
  if (doc1) await activityRepo.log("document_generated", `Procuração Ad Judicia gerada para ${clients[1].fullName}.`, doc1.id);

  await makeDoc(clients[2], notificacaoTpl, "rascunho", {
    NOME_CLIENTE: clients[2].fullName,
    CPF_CLIENTE: clients[2].docNumber,
    NOME_ESCRITORIO: office.officeName,
    NOME_NOTIFICADO: "Condomínio Edifício Harmonia",
    MOTIVO: "reparos não realizados em área comum conforme acordado previamente",
    PRAZO_RESPOSTA: "10 dias úteis",
    DATA: "7 de julho de 2026",
  });

  await makeDoc(clients[4], declaracaoTpl, "concluido", {
    NOME_CLIENTE: clients[4].fullName,
    CPF_CLIENTE: clients[4].docNumber,
    NOME_ESCRITORIO: office.officeName,
    RG_CLIENTE: clients[4].rg,
    ENDERECO_CLIENTE: clients[4].address,
    DATA: "28 de junho de 2026",
  });

  const doc4 = await makeDoc(clients[5], reciboTpl, "concluido", {
    NOME_CLIENTE: clients[5].fullName,
    CPF_CLIENTE: clients[5].docNumber,
    NOME_ESCRITORIO: office.officeName,
    VALOR: "R$ 1.800,00",
    REFERENTE_A: "honorários de consultoria em regularização de imóvel",
    DATA: "24 de junho de 2026",
  });
  if (doc4) await activityRepo.log("document_generated", `Recibo de Pagamento gerado para ${clients[5].fullName}.`, doc4.id);
}

/**
 * Entra (criando se necessário) na conta de demonstração fixa do AdvFlow.
 * Na primeira vez, semeia o conjunto fictício padrão; nas seguintes, só
 * autentica na mesma conta já semeada (ver seedDemoData). Não afeta contas
 * reais nem o fluxo normal de /signup.
 */
export async function enterDemoMode(): Promise<void> {
  await ensureDemoSession();
  await seedDemoData();
}
