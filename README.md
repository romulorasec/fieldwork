# Fieldwork: diagnóstico de conversão em um workspace privado

O Fieldwork transforma observações verificáveis sobre sites de negócios locais em próximas ações, propostas e acompanhamento. A experiência pública apresenta o produto; a aplicação completa exige conta ativa.

## Fluxo de páginas

1. **`index.html` (pública):** apresentação curta, exemplo ilustrativo, botão de login e formulário de solicitação de convite. Não oferece diagnóstico, lições ou CRM.
2. **`cloud.html` (login e workspace):** autenticação Supabase, verificação de vínculo ativo, MFA obrigatório para admin e navegação por permissão.
3. **Workspace autenticado:** Hoje, plano de 30 dias, auditorias por nicho, CRM, tarefas, propostas e prática guiada, conforme função do usuário.
4. **`bluebook.html` (biblioteca privada):** exige sessão e vínculo ativo, consulta 59 tópicos na tabela protegida `member_lessons`. O HTML e seu bundle não contêm o texto completo; apenas a API Supabase fornece os dados após RLS.
5. **`admin-users` (Edge Function):** somente admin com MFA AAL2 pode ver pedidos, criar usuários, gerar links temporários de senha, atribuir funções e suspender contas.

Um pedido feito na home não registra uma conta nem envia e-mail automático. O administrador verifica a identidade e entrega o link à pessoa aprovada. Sem confirmação de e-mail no cadastro administrativo, essa conferência humana é indispensável.

## Organização e proteção

- `index.html`, `home.css`, `home.js`: landing pública e solicitação de convite.
- `cloud.html`, `cloud.css`, `cloud.ts` e `cloud-*.ts`: área privada.
- `bluebook.html`, `bluebook-private.ts`, `bluebook-private.css`: biblioteca por sessão.
- `cloud.bundle.js` e `bluebook.bundle.js`: arquivos gerados por `npm run build`.
- `supabase/migrations/`: tabelas, funções, índices e RLS.
- `supabase/functions/admin-users/`: administração por sessão, papel e MFA.
- `ADMIN_SETUP.md`: ativação inicial e checklist de segurança.

As 59 lições e os 30 dias do plano já estão no Supabase. Testes SQL com papel `anon` confirmaram zero resultados de `member_lessons` e `plan_days`, apesar de ambas conterem dados.

**Importante:** RLS é o controle real do conteúdo. Redirecionamentos no navegador não substituem segurança no banco. O histórico de um repositório público pode continuar revelando código de versões antigas; nunca coloque segredos ou dados sensíveis no Git.

## Desenvolver e verificar

```bash
npm install
npm run build
npm test
python3 -m http.server 8877
```

Se Chromium estiver disponível, execute `npm run test:browser` em outro terminal com o servidor ativo. Verifique 360, 390, 768 e 1280 px, URLs privadas sem sessão e isolamento entre papéis. Auditorias heurísticas não provam aumento de conversão sem dados medidos.
