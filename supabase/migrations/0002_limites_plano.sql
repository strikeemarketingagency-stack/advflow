-- Limites do plano Básico (30 clientes/mês, 10 modelos salvos) — aplicados
-- via trigger BEFORE INSERT, não via CHECK constraint rígida (permite trocar
-- o número sem nova migration, e dá uma mensagem legível em vez de um erro
-- de constraint cru). Roda no banco, então não pode ser burlado chamando a
-- API do Supabase direto — só o service role (que não passa por aqui) escapa
-- disso, e isso é intencional. lib/repositories/supabase/client-repo.ts e
-- template-repo.ts capturam a exception e a convertem em RepoError("plan_limit", ...).

create or replace function public.checar_limite_clientes()
returns trigger as $$
declare
  plano_atual text;
  total_mes int;
begin
  select plano into plano_atual from public.perfis where id = new.perfil_id;

  if plano_atual = 'basico' then
    select count(*) into total_mes
    from public.clientes
    where perfil_id = new.perfil_id
      and date_trunc('month', criado_em) = date_trunc('month', now());

    if total_mes >= 30 then
      raise exception 'Limite do plano Básico atingido: até 30 clientes ativos por mês. Faça upgrade para o Premium para continuar.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger clientes_checar_limite
  before insert on public.clientes
  for each row execute function public.checar_limite_clientes();

create or replace function public.checar_limite_modelos()
returns trigger as $$
declare
  plano_atual text;
  total int;
begin
  -- Modelos de sistema (perfil_id null) nunca contam pro limite do usuário.
  if new.perfil_id is null then
    return new;
  end if;

  select plano into plano_atual from public.perfis where id = new.perfil_id;

  if plano_atual = 'basico' then
    select count(*) into total from public.modelos where perfil_id = new.perfil_id;

    if total >= 10 then
      raise exception 'Limite do plano Básico atingido: até 10 modelos salvos. Faça upgrade para o Premium para continuar.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger modelos_checar_limite
  before insert on public.modelos
  for each row execute function public.checar_limite_modelos();
