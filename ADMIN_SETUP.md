# Fieldwork: ativação inicial e segurança

Supabase: projeto `xmvbzntawfmgnsuqhztw`. Site: `https://romulorasec.github.io/fieldwork/`.

## Dois passos administrativos necessários

As áreas privadas e a administração estão implementadas, mas o primeiro administrador ainda precisa ser ativado no Supabase. **Não existe endpoint público de bootstrap**, por segurança.

### 1. Desativar criação livre de contas

No Supabase Dashboard, vá a **Authentication > Providers > Email** e desative **Allow new users to sign up**. A home e o workspace já não expõem cadastro público. Até essa mudança, a API Auth ainda pode aceitar um cadastro sem vínculo: isso não dá acesso às tabelas protegidas, mas produz contas órfãs.

### 2. Criar a conta administradora e o workspace

No Dashboard, em **Authentication > Users**, crie administrativamente o usuário `romulorasec@gmail.com`, com e-mail confirmado pelo administrador e senha temporária forte. A senha não deve ficar em código nem mensagens.

No **SQL Editor**, confirme a conta:

```sql
select id, email from auth.users where lower(email) = 'romulorasec@gmail.com';
```

Se retornar exatamente uma conta, execute uma vez:

```sql
begin;
do $$
declare
  admin_id uuid;
  new_workspace_id uuid;
begin
  select id into strict admin_id
  from auth.users where lower(email) = 'romulorasec@gmail.com';

  if exists (select 1 from public.memberships where user_id=admin_id and role='admin') then
    raise exception 'Conta já possui vínculo administrativo. Verifique antes de repetir.';
  end if;

  insert into public.workspaces(name) values ('Fieldwork') returning id into new_workspace_id;
  insert into public.memberships(workspace_id,user_id,role,status)
    values (new_workspace_id,admin_id,'admin','active');
end $$;
commit;
```

No primeiro acesso a `cloud.html`, cadastre um autenticador TOTP para entrar no painel Admin. Os usuários criados depois recebem um link de uso único para definir senha; não há verificação automática de e-mail.

## Checagem antes de dados reais

- Sem login, `index.html` abre, `bluebook.html` leva ao login; `member_lessons` e `plan_days` não retornam linhas a `anon`.
- Login sem `membership` ativa não habilita conteúdo.
- Admin sem MFA AAL2 não acessa `admin-users`.
- Admin visualiza pedidos, prepara e confirma criação, copia link temporário e gerencia funções.
- `learner` acessa biblioteca, plano e próprias auditorias, mas não cria contas nem vê CRM alheio.
- `sales` cria próprios prospects e propostas. Parceiro só vê oportunidades atribuídas.
- Conta suspensa perde leitura e escrita. Testar com duas sessões.
- Evidências no Storage devem falhar sem autenticação e respeitar o proprietário.
- Testar dispositivos pequenos, teclado, feedback de erros e expiração de sessão.

## Limitações

- O histórico de um GitHub público pode conter versões antigas. A proteção atual cobre **dados atuais no Supabase**, não apaga cópias históricas.
- Pedidos de convite armazenam nome, e-mail e perfil; estabeleça uma rotina de retenção/remoção.
- Editor colaborativo, revisão editorial e métricas reais de conversão são extensões futuras.
- Não transforme hipóteses da auditoria em promessas de resultado financeiro.

## Deploy

Execute `npm run build` ao modificar TypeScript. O GitHub Pages serve os bundles compilados. A Edge Function mantém a chave `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor. Ao trocar domínio, atualize a origem CORS e o URL do link na função.
