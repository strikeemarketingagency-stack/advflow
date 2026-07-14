export class RepoError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "RepoError";
  }
}

export type ID = string;

// ---------- Auth ----------

export interface AuthUser {
  id: ID;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
}

export type AuthStateListener = (session: AuthSession | null) => void;

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>;
  signUp(email: string, password: string): Promise<AuthSession>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  onAuthStateChange(listener: AuthStateListener): () => void;
}

// ---------- Office / lawyer profile ----------

export interface Office {
  userId: ID;
  lawyerName: string;
  officeName: string;
  oab: string;
  state: string;
  city: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  footerText: string;
  logoFileId: ID | null;
  signatureFileId: ID | null;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OfficeInput = Omit<Office, "userId" | "createdAt" | "updatedAt" | "onboardingComplete">;

export interface OfficeRepository {
  get(): Promise<Office | null>;
  save(input: Partial<OfficeInput> & { onboardingComplete?: boolean }): Promise<Office>;
}

// ---------- Clients ----------

export type MaritalStatus = "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel";

export interface ClientFileRef {
  id: ID;
  fileId: ID;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface Client {
  id: ID;
  userId: ID;
  fullName: string;
  docNumber: string;
  rg: string;
  maritalStatus: MaritalStatus | "";
  profession: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  files: ClientFileRef[];
  createdAt: string;
  updatedAt: string;
}

export type ClientInput = Omit<Client, "id" | "userId" | "files" | "createdAt" | "updatedAt">;

export interface ClientRepository {
  list(): Promise<Client[]>;
  get(id: ID): Promise<Client | null>;
  create(input: ClientInput): Promise<Client>;
  update(id: ID, input: Partial<ClientInput>): Promise<Client>;
  remove(id: ID): Promise<void>;
  addFile(id: ID, file: Omit<ClientFileRef, "id" | "createdAt">): Promise<Client>;
  removeFile(id: ID, fileRefId: ID): Promise<Client>;
}

// ---------- Templates ----------

export type TemplateCategory =
  | "contratos"
  | "procuracoes"
  | "notificacoes"
  | "declaracoes"
  | "recibos"
  | "outros";

export type TemplateBlockType =
  | "heading"
  | "paragraph"
  | "clause"
  | "signatureLine"
  | "list-item"
  | "image";

export interface TemplateBlock {
  id: ID;
  type: TemplateBlockType;
  text?: string;
  imageRef?: "logo" | "signature" | null;
  align?: "left" | "center" | "right";
  bold?: boolean;
}

export type VariableType = "text" | "date" | "currency" | "cpf" | "cnpj";

export interface TemplateVariable {
  token: string;
  label: string;
  type: VariableType;
  required: boolean;
  group: "partes" | "informacoes" | "valores" | "outros";
}

export interface Template {
  id: ID;
  userId: ID;
  name: string;
  category: TemplateCategory;
  blocks: TemplateBlock[];
  variables: TemplateVariable[];
  isFavorite: boolean;
  isBuiltin: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TemplateInput = Omit<
  Template,
  "id" | "userId" | "isFavorite" | "isBuiltin" | "createdAt" | "updatedAt"
>;

export interface TemplateRepository {
  list(): Promise<Template[]>;
  get(id: ID): Promise<Template | null>;
  create(input: TemplateInput): Promise<Template>;
  update(id: ID, input: Partial<TemplateInput>): Promise<Template>;
  duplicate(id: ID): Promise<Template>;
  remove(id: ID): Promise<void>;
  toggleFavorite(id: ID): Promise<Template>;
}

// ---------- Documents (generated) ----------

export type DocumentStatus = "rascunho" | "concluido";

export interface GeneratedDocument {
  id: ID;
  userId: ID;
  clientId: ID | null;
  clientName: string;
  templateId: ID | null;
  templateName: string;
  category: TemplateCategory;
  status: DocumentStatus;
  blocks: TemplateBlock[];
  fieldValues: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type DocumentInput = Omit<GeneratedDocument, "id" | "userId" | "createdAt" | "updatedAt">;

export interface DocumentRepository {
  list(): Promise<GeneratedDocument[]>;
  get(id: ID): Promise<GeneratedDocument | null>;
  create(input: DocumentInput): Promise<GeneratedDocument>;
  update(id: ID, input: Partial<DocumentInput>): Promise<GeneratedDocument>;
  duplicate(id: ID): Promise<GeneratedDocument>;
  remove(id: ID): Promise<void>;
  listByClient(clientId: ID): Promise<GeneratedDocument[]>;
}

// ---------- Activity ----------

export type ActivityType =
  | "client_created"
  | "template_created"
  | "document_generated"
  | "office_updated";

export interface ActivityItem {
  id: ID;
  userId: ID;
  type: ActivityType;
  message: string;
  entityId: ID | null;
  createdAt: string;
}

export interface ActivityRepository {
  list(limit?: number): Promise<ActivityItem[]>;
  log(type: ActivityType, message: string, entityId?: ID | null): Promise<ActivityItem>;
}

// ---------- Storage ----------

export interface StoredFile {
  id: ID;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface StorageRepository {
  upload(file: File | Blob, name: string, mimeType: string): Promise<StoredFile>;
  getUrl(fileId: ID): Promise<string | null>;
  getBlob(fileId: ID): Promise<Blob | null>;
  remove(fileId: ID): Promise<void>;
}
