-- AdvFlow — schema inicial (perfis, office, clientes, modelos, documentos,
-- atividades) + RLS. Rodar uma vez no SQL Editor do projeto Supabase, antes
-- de supabase/seed_modelos_sistema.sql e 0002_limites_plano.sql.

-- ---------- perfis ----------
-- Extensão mínima do usuário do Supabase Auth: só o que rege plano/cobrança.
-- Nome, OAB, logo etc já têm casa própria na tabela `office` (1:1 por
-- usuário) — não duplicamos esses campos aqui.
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  plano text not null default 'basico' check (plano in ('basico', 'premium')),
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "perfis_select_own" on public.perfis
  for select using (auth.uid() = id);
create policy "perfis_update_own" on public.perfis
  for update using (auth.uid() = id);
create policy "perfis_insert_own" on public.perfis
  for insert with check (auth.uid() = id);

-- ---------- office ----------
-- Espelha lib/repositories/types.ts::Office — perfil profissional/escritório,
-- 1:1 por usuário. logo_path/signature_path são caminhos no bucket de
-- Storage `escritorio-assets`, não mais IDs de blob local.
create table public.office (
  user_id uuid primary key references public.perfis (id) on delete cascade,
  lawyer_name text not null,
  oab text not null,
  specialty text not null,
  office_name text not null,
  state text not null,
  city text not null,
  address text not null default '',
  phone text not null,
  email text not null,
  footer_text text not null default '',
  logo_path text,
  signature_path text,
  onboarding_complete boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.office enable row level security;

create policy "office_all_own" on public.office
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- clientes ----------
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  full_name text not null,
  doc_number text not null,
  rg text not null default '',
  marital_status text not null default '',
  profession text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  notes text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index clientes_perfil_id_idx on public.clientes (perfil_id);

alter table public.clientes enable row level security;

create policy "clientes_all_own" on public.clientes
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

-- ---------- cliente_arquivos ----------
-- Tabela própria (não jsonb) para os anexos de um cliente — mais idiomático
-- e permite RLS por linha. storage_path aponta pro bucket privado
-- `clientes-arquivos`.
create table public.cliente_arquivos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  storage_path text not null,
  name text not null,
  mime_type text not null,
  size bigint not null,
  criado_em timestamptz not null default now()
);

create index cliente_arquivos_cliente_id_idx on public.cliente_arquivos (cliente_id);

alter table public.cliente_arquivos enable row level security;

create policy "cliente_arquivos_all_own" on public.cliente_arquivos
  for all using (
    cliente_id in (select id from public.clientes where perfil_id = auth.uid())
  ) with check (
    cliente_id in (select id from public.clientes where perfil_id = auth.uid())
  );

-- ---------- modelos ----------
-- perfil_id null = modelo de sistema (is_modelo_sistema = true), uma linha
-- compartilhada por todos os usuários, não uma cópia por usuário — ver
-- decisão #4 do plano.
create table public.modelos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid references public.perfis (id) on delete cascade,
  titulo text not null,
  categoria text not null,
  blocks jsonb not null default '[]'::jsonb,
  variables jsonb not null default '[]'::jsonb,
  is_favorite boolean not null default false,
  is_modelo_sistema boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint modelos_sistema_sem_dono check (
    (is_modelo_sistema and perfil_id is null) or (not is_modelo_sistema and perfil_id is not null)
  )
);

create index modelos_perfil_id_idx on public.modelos (perfil_id);

alter table public.modelos enable row level security;

create policy "modelos_all_own" on public.modelos
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);
-- Leitura pública (autenticado) dos modelos de sistema — sem policy de
-- escrita correspondente, então só o service role consegue escrever aqui.
create policy "modelos_select_sistema" on public.modelos
  for select using (is_modelo_sistema = true);

-- ---------- documentos ----------
create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  cliente_id uuid references public.clientes (id) on delete set null,
  cliente_nome text not null,
  modelo_id uuid references public.modelos (id) on delete set null,
  modelo_nome text not null,
  categoria text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'concluido')),
  blocks jsonb not null default '[]'::jsonb,
  field_values jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index documentos_perfil_id_idx on public.documentos (perfil_id);
create index documentos_cliente_id_idx on public.documentos (cliente_id);

alter table public.documentos enable row level security;

create policy "documentos_all_own" on public.documentos
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

-- ---------- atividades ----------
create table public.atividades (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  tipo text not null,
  mensagem text not null,
  entidade_id uuid,
  criado_em timestamptz not null default now()
);

create index atividades_perfil_id_idx on public.atividades (perfil_id, criado_em desc);

alter table public.atividades enable row level security;

create policy "atividades_all_own" on public.atividades
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);
