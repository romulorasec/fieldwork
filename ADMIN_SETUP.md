# Fieldwork: ativação segura do workspace

Projeto Supabase: `xmvbzntawfmgnsuqhztw` (US West). Workspace GitHub Pages: `https://romulorasec.github.io/fieldwork/cloud.html`.

## Requisitos ainda pendentes antes de dados reais

1. **Desativar cadastro público no Supabase:** Authentication > Providers > Email > desativar a opção que permite novas inscrições (`Allow new users to sign up`). Apenas o admin, por Edge Function com MFA, poderá criar contas. A interface oculta cadastro, e todas as tabelas têm RLS, mas **sem essa configuração externa a API Auth pode aceitar inscrições sem vínculo a um workspace**.
2. **Definir e criar a conta administradora inicial:** será necessário um e-mail escolhido pelo proprietário. No Supabase Authentication > Users, crie essa conta por operação administrativa, com e-mail previamente verificado pelo proprietário e uma senha forte temporária. Não crie o primeiro admin por endpoints públicos ou via cliente web.
3. **Criar o workspace e a associação administrativa:** no SQL Editor, substitua o endereço de exemplo abaixo pelo e-mail exato da conta criada e execute uma única vez, após verificar que o usuário existe.

```sql
begin;
with first_workspace as (
  insert into public.workspaces(name) values ('Fieldwork') returning id
)
insert into public.memberships(workspace_id,user_id,role,status)
select w.id, u.id, 'admin', 'active'
from first_workspace w
join auth.users u on u.email = 'SUBSTITUIR-EMAIL-ADMIN@EXEMPLO.COM';
-- Confirme que uma membership foi criada antes de concluir.
select w.name,m.role,m.status,u.email
from public.memberships m join public.workspaces w on w.id=m.workspace_id
join auth.users u on u.id=m.user_id;
commit;
```

Se a busca não retornar o e-mail esperado, execute `rollback` antes do `commit`. Não compartilhe senhas ou links temporários em tickets públicos. A partir do primeiro login, o admin cadastra e verifica um autenticador TOTP para acessar a administração.

4. **Validar o primeiro login:** login por senha, configuração TOTP e reinício de sessão. Depois cadastrar um usuário de teste como `learner`, copiar o link de uso único e configurar sua senha. Não existe verificação obrigatória por e-mail: a identidade é validada pelo administrador antes de entregar o link.
5. **Testar isolamento antes de produção:** um aluno não deve conseguir criar usuários, alterar permissões ou ver CRM alheio. Um comercial deve conseguir cadastrar seus prospects. Um parceiro deve ver somente prospects atribuídos. Suspenda o aluno e confirme que suas leituras e gravações protegidas falham. Admin sem MFA deve ser barrado. Faça upload de uma captura e tente acessá-la sem autenticação, o acesso deve ser negado. Repita em celular.
6. **Revisar a retenção de dados:** não cole dados de pacientes, saúde, finanças ou informações de terceiros sem necessidade/consentimento. Os registros legados ficam no navegador; a importação para `user_snapshots` é opcional e cria cópia, não apaga o original nem faz migração estruturada para o CRM.

## Modelo funcional

| Papel | Acesso previsto na primeira versão |
| --- | --- |
| Administrador | Workspace, CRM, auditorias, tarefas, aprendizado e criação/suspensão de usuários, com TOTP obrigatório |
| Comercial | Próprios prospects e auditorias, pipeline, tarefas e aprendizado |
| Aluno | Próprias auditorias, tarefas e aprendizado |
| Parceiro | Somente leitura de prospects atribuídos e aprendizado |
| Contribuidor | Aprendizado; esquema para conteúdo editorial em rascunho preparado, ainda sem editor de publicação |
| Revisor | Aprendizado; revisão editorial ainda não publicada como interface |

Não há gravação de cookies de terceiros para medir leads nem cálculo inventado de receita perdida. Os diagnósticos registram observações declaradas e níveis de evidência. Somente medições autorizadas podem apoiar afirmações sobre conversão.

## Próximas entregas, ainda não implantadas

- Editor editorial de contribuidor, fluxo revisor/aprovação, versionamento de critério via administração.
- Propostas com escopo e preço, templates de ofertas e geração de PDF.
- Funil analítico com eventos verificados e integração consentida com tráfego e contato.
- IA assistida para pesquisas, supervisão de evidências e variações de propostas, com revisão humana e limites de custo.
- Migração estruturada dos registros legados, sem duplicar prospects.
- Testes E2E autenticados por papel em staging e políticas de retenção, consentimento e backup.

## Operação

- Alterações locais no banco ficam versionadas em `supabase/migrations/`.
- A Edge Function `admin-users` mantém a chave service role somente no ambiente Supabase. Nunca incluí-la no JS do navegador.
- Atualizações de `cloud.ts` exigem `npm run build:cloud`; o GitHub Pages serve `cloud.bundle.js`.
- Ao trocar o domínio, ajustar a origem CORS da Edge Function e o URL do link de ativação; por padrão a origem aceita é `https://romulorasec.github.io`.
