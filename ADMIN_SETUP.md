# Fieldwork: ativação inicial e segurança

Supabase: projeto `xmvbzntawfmgnsuqhztw`. Site: `https://romulorasec.github.io/fieldwork/`.

## Estado atual e segurança

O usuário `romulorasec@gmail.com` já existe e possui associação de administrador ativa no projeto. Não existe endpoint público de criação de administrador.

### 1. Desativar criação livre de contas

No Supabase Dashboard, vá a **Authentication > Providers > Email** e desative **Allow new users to sign up**. A home e o workspace já não expõem cadastro público. Até essa mudança, a API Auth ainda pode aceitar um cadastro sem vínculo: isso não dá acesso às tabelas protegidas, mas produz contas órfãs.

### 2. Entrar no workspace como administrador

Entre em `cloud.html` com `romulorasec@gmail.com` e a senha definida no Supabase Auth. **O aplicativo autenticador não é mais obrigatório** para acessar o workspace nem o painel de administração. O vínculo ativo como `admin` continua obrigatório e é verificado no servidor.

Como o segundo fator deixou de ser exigido, use uma senha longa, exclusiva e armazenada em um gerenciador de senhas. Os usuários criados pelo administrador recebem um link de uso único para definir a própria senha; não há verificação automática de e-mail.

## Checagem antes de dados reais

- Sem login, `index.html` abre, `bluebook.html` leva ao login; `member_lessons` e `plan_days` não retornam linhas a `anon`.
- Login sem `membership` ativa não habilita conteúdo.
- Apenas contas com vínculo ativo de `admin` acessam `admin-users`, mesmo sem segundo fator.
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
