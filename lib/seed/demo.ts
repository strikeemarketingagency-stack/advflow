import { localAuthRepo } from "@/lib/repositories/local/auth-repo";
import { RepoError } from "@/lib/repositories/types";
import { writeJson, newId, nowIso } from "@/lib/repositories/local/json-store";
import { userKey } from "@/lib/repositories/local/storage-keys";
import { builtinTemplates } from "@/lib/seed/templates";
import { fillBlocks } from "@/lib/documents/block-model";
import type {
  Client,
  Office,
  Template,
  GeneratedDocument,
  ActivityItem,
  ActivityType,
  MaritalStatus,
} from "@/lib/repositories/types";

// Conta de demonstração isolada, com dados fictícios, usada apenas para fins
// de prova social/apresentação — nunca é o ponto de partida de uma conta real
// criada via /signup, que segue vazia pelo onboarding normal.
const DEMO_EMAIL = "demo@advflow.com.br";
const DEMO_PASSWORD = "advflow-demo-2026";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function buildClient(
  userId: string,
  fullName: string,
  docNumber: string,
  rg: string,
  maritalStatus: MaritalStatus | "",
  profession: string,
  phone: string,
  email: string,
  address: string,
  notes: string
): Client {
  const now = nowIso();
  return {
    id: newId(),
    userId,
    fullName,
    docNumber,
    rg,
    maritalStatus,
    profession,
    phone,
    email,
    address,
    notes,
    files: [],
    createdAt: now,
    updatedAt: now,
  };
}

function buildActivity(userId: string, type: ActivityType, message: string, createdAt: string): ActivityItem {
  return { id: newId(), userId, type, message, entityId: null, createdAt };
}

// Sempre usa o backend local (localAuthRepo), nunca o authRepo trocável de
// lib/repositories — a demo é uma vitrine estática e independe de
// NEXT_PUBLIC_DATA_BACKEND. Sem isso, uma vez os outros repos migrando pra
// Supabase, seedDemoData (que escreve direto no localStorage via writeJson)
// ficaria "invisível": a sessão autenticaria contra o Postgres normalmente,
// mas clientRepo/templateRepo/etc já não leriam mais do localStorage onde os
// dados fictícios foram gravados.
async function ensureDemoSession(): Promise<string> {
  try {
    const session = await localAuthRepo.signUp(DEMO_EMAIL, DEMO_PASSWORD);
    return session.user.id;
  } catch (err) {
    if (err instanceof RepoError && err.code === "email_taken") {
      const session = await localAuthRepo.signIn(DEMO_EMAIL, DEMO_PASSWORD);
      return session.user.id;
    }
    throw err;
  }
}

function seedDemoData(userId: string) {
  const now = nowIso();

  const office: Office = {
    userId,
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
    logoFileId: null,
    signatureFileId: null,
    onboardingComplete: true,
    createdAt: now,
    updatedAt: now,
  };
  writeJson(userKey(userId, "office"), office);

  const clients: Client[] = [
    buildClient(userId, "Marcos Vinícius Tavares", "184.552.930-04", "32.556.221-0", "casado", "Engenheiro civil", "(11) 98211-4432", "marcos.tavares@gmail.com", "Rua Barão de Itapetininga, 210, São Paulo/SP", "Cliente desde 2022, contratos recorrentes de consultoria."),
    buildClient(userId, "Construtora Horizonte Ltda", "12.345.678/0001-90", "", "", "Pessoa jurídica", "(11) 3345-2210", "juridico@horizonteconstrutora.com.br", "Av. Eng. Luís Carlos Berrini, 1500, São Paulo/SP", "Cliente corporativo, obras residenciais na zona sul."),
    buildClient(userId, "Fernanda Ribeiro Dias", "302.884.117-55", "28.114.900-1", "solteiro", "Socióloga", "(11) 97765-9012", "fernanda.dias@outlook.com", "Rua Harmonia, 88, São Paulo/SP", ""),
    buildClient(userId, "Grupo Nordeste Comércio S.A.", "09.887.234/0001-15", "", "", "Pessoa jurídica", "(85) 3223-7788", "contato@gruponordeste.com.br", "Av. Beira Mar, 3200, Fortaleza/CE", "Contrato de distribuição em revisão."),
    buildClient(userId, "João Pedro Salgado", "445.221.990-32", "40.221.775-3", "casado", "Autônomo", "(11) 99001-2277", "jp.salgado@gmail.com", "Alameda Santos, 700, São Paulo/SP", ""),
    buildClient(userId, "Beatriz Souza Lima", "218.774.660-21", "35.667.809-2", "solteiro", "Arquiteta", "(21) 98123-5540", "beatriz.lima@gmail.com", "Rua Voluntários da Pátria, 45, Rio de Janeiro/RJ", ""),
  ];
  writeJson(userKey(userId, "clients"), clients);

  const templates: Template[] = builtinTemplates(userId).map((t, i) => (i === 0 ? { ...t, isFavorite: true } : t));
  writeJson(userKey(userId, "templates"), templates);
  const [contractTpl, procuracaoTpl, notificacaoTpl, declaracaoTpl, reciboTpl] = templates;

  function makeDoc(
    client: Client,
    template: Template,
    status: GeneratedDocument["status"],
    fieldValues: Record<string, string>,
    createdAt: string
  ): GeneratedDocument {
    return {
      id: newId(),
      userId,
      clientId: client.id,
      clientName: client.fullName,
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      status,
      blocks: fillBlocks(template.blocks, fieldValues),
      fieldValues,
      createdAt,
      updatedAt: createdAt,
    };
  }

  const documents: GeneratedDocument[] = [
    makeDoc(clients[0], contractTpl, "concluido", {
      NOME_CLIENTE: clients[0].fullName,
      CPF_CLIENTE: clients[0].docNumber,
      NOME_ESCRITORIO: office.officeName,
      OBJETO_CONTRATO: "Consultoria jurídica preventiva em contratos de engenharia civil",
      VALOR: "R$ 4.200,00",
      PRAZO: "12 meses",
      FORO: "São Paulo/SP",
      DATA: "10 de julho de 2026",
    }, hoursAgo(2)),
    makeDoc(clients[1], procuracaoTpl, "concluido", {
      NOME_CLIENTE: clients[1].fullName,
      CPF_CLIENTE: clients[1].docNumber,
      NOME_ESCRITORIO: office.officeName,
      NOME_ADVOGADO: office.lawyerName,
      OAB: office.oab,
      PODERES: "inclusive para transigir e firmar acordos",
      DATA: "8 de julho de 2026",
    }, hoursAgo(26)),
    makeDoc(clients[2], notificacaoTpl, "rascunho", {
      NOME_CLIENTE: clients[2].fullName,
      CPF_CLIENTE: clients[2].docNumber,
      NOME_ESCRITORIO: office.officeName,
      NOME_NOTIFICADO: "Condomínio Edifício Harmonia",
      MOTIVO: "reparos não realizados em área comum conforme acordado previamente",
      PRAZO_RESPOSTA: "10 dias úteis",
      DATA: "7 de julho de 2026",
    }, hoursAgo(70)),
    makeDoc(clients[4], declaracaoTpl, "concluido", {
      NOME_CLIENTE: clients[4].fullName,
      CPF_CLIENTE: clients[4].docNumber,
      NOME_ESCRITORIO: office.officeName,
      RG_CLIENTE: clients[4].rg,
      ENDERECO_CLIENTE: clients[4].address,
      DATA: "28 de junho de 2026",
    }, hoursAgo(140)),
    makeDoc(clients[5], reciboTpl, "concluido", {
      NOME_CLIENTE: clients[5].fullName,
      CPF_CLIENTE: clients[5].docNumber,
      NOME_ESCRITORIO: office.officeName,
      VALOR: "R$ 1.800,00",
      REFERENTE_A: "honorários de consultoria em regularização de imóvel",
      DATA: "24 de junho de 2026",
    }, hoursAgo(190)),
  ];
  writeJson(userKey(userId, "documents"), documents);

  const activity: ActivityItem[] = [
    buildActivity(userId, "document_generated", `Contrato de Prestação de Serviços gerado para ${clients[0].fullName}`, hoursAgo(2)),
    buildActivity(userId, "client_created", `${clients[2].fullName} cadastrada como cliente`, hoursAgo(5)),
    buildActivity(userId, "document_generated", `Procuração Ad Judicia gerada para ${clients[1].fullName}`, hoursAgo(26)),
    buildActivity(userId, "template_created", "Modelo Contrato de Prestação de Serviços favoritado", hoursAgo(48)),
    buildActivity(userId, "office_updated", "Perfil do escritório configurado", hoursAgo(72)),
    buildActivity(userId, "document_generated", `Recibo de Pagamento gerado para ${clients[5].fullName}`, hoursAgo(190)),
    buildActivity(userId, "client_created", `${clients[4].fullName} cadastrado como cliente`, hoursAgo(210)),
  ];
  writeJson(userKey(userId, "activity"), activity);
}

/**
 * Entra (criando se necessário) na conta de demonstração fixa do AdvFlow e
 * reseta seus dados para o conjunto fictício padrão — garante uma vitrine
 * consistente a cada acesso, mesmo que a demo tenha sido usada/alterada antes.
 * Não afeta contas reais nem o fluxo normal de /signup.
 */
export async function enterDemoMode(): Promise<void> {
  const userId = await ensureDemoSession();
  seedDemoData(userId);
}
