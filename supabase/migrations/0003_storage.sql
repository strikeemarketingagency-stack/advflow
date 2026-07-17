-- Buckets de Storage + policies. escritorio-assets é público (logo/assinatura,
-- baixa sensibilidade, URL pública direta sem expirar — mais simples e
-- compatível com os call sites atuais, que buscam a URL uma vez no mount).
-- clientes-arquivos é privado (documentos pessoais de clientes) — acesso via
-- signed URL gerada sob demanda pelo repo (storage.getUrl).

insert into storage.buckets (id, name, public)
values ('escritorio-assets', 'escritorio-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('clientes-arquivos', 'clientes-arquivos', false)
on conflict (id) do nothing;

-- Convenção de path em ambos os buckets: primeiro segmento = auth.uid() do
-- dono (`{user_id}/logo.png`, `{user_id}/{cliente_id}/{uuid}-arquivo.pdf`),
-- então (storage.foldername(name))[1] = auth.uid()::text é o dono.

create policy "escritorio_assets_own_write" on storage.objects
  for all using (
    bucket_id = 'escritorio-assets' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'escritorio-assets' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "escritorio_assets_public_read" on storage.objects
  for select using (bucket_id = 'escritorio-assets');

create policy "clientes_arquivos_own" on storage.objects
  for all using (
    bucket_id = 'clientes-arquivos' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'clientes-arquivos' and (storage.foldername(name))[1] = auth.uid()::text
  );
