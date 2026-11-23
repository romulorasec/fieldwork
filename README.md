# Fieldwork: diagnóstico de conversão em um workspace privado

O Fieldwork transforma observações verificáveis sobre sites de negócios locais em próximas ações, propostas e acompanhamento. A experiência pública apresenta o produto; a aplicação completa exige conta ativa.

## Fluxo de páginas

1. **`index.html` (pública):** apresentação curta, exemplo ilustrativo, botão de login e formulário de solicitação de convite. Não oferece diagnóstico, lições ou CRM.
2. **`cloud.html` (login e workspace):** autenticação Supabase por e-mail e senha, verificação de vínculo ativo e navegação por permissão. Não exige aplicativo autenticador.
3. **Workspace autenticado:** Começar / Continuar abre a próxima missão do plano de 30 dias, com procedimento, motivo, exemplo, entrega verificável, ajuda para destravar e detalhes técnicos opcionais. Cada conclusão salva uma anotação curta. Mapa dos 30 dias, auditorias, CRM, tarefas e propostas ficam disponíveis conforme a função.
4. **`bluebook.html` (biblioteca privada):** exige sessão e vínculo ativo, consulta 59 tópicos na tabela protegida `member_lessons`. O HTML e seu bundle não contêm o texto completo; apenas a API Supabase fornece os dados após RLS.
5. **`admin-users` (Edge Function):** somente administradores autenticados com vínculo ativo podem ver pedidos, criar usuários, gerar links temporários de senha, atribuir funções e suspender contas.

Um pedido feito na home não registra uma conta nem envia e-mail automático. O administrador verifica a identidade e entrega o link à pessoa aprovada. Sem confirmação de e-mail no cadastro administrativo, essa conferência humana é indispensável.

## Organização e proteção

- `index.html`, `home.css`, `home.js`: landing pública e solicitação de convite.
- `cloud.html`, `cloud.css`, `cloud.ts` e `cloud-*.ts`: área privada.
- `bluebook.html`, `bluebook-private.ts`, `bluebook-private.css`: biblioteca por sessão.
- `cloud.bundle.js` e `bluebook.bundle.js`: arquivos gerados por `npm run build`.
- `supabase/migrations/`: tabelas, funções, índices e RLS.
- `supabase/functions/admin-users/`: administração por sessão e papel, com isolamento entre workspaces.
- `ADMIN_SETUP.md`: ativação inicial e checklist de segurança.

As 59 lições e os 30 dias do plano já estão no Supabase. Testes SQL com papel `anon` confirmaram zero resultados de `member_lessons` e `plan_days`, apesar de ambas conterem dados.

As 140 ações do plano correspondem a 40 modelos de instruções específicas em `plan-guides.ts`. Cada modelo liga a ação à aula exata do Blue Book, sem obrigar o novato a estudar todas as lições primeiro. O CRM registra origem e data de retorno, e diferencia contratos marcados de entradas recebidas. Diagnósticos por nicho não reutilizam respostas de outro nicho e exibem o relatório após salvar.

**Importante:** RLS é o controle real do conteúdo. Redirecionamentos no navegador não substituem segurança no banco. O histórico de um repositório público pode continuar revelando código de versões antigas; nunca coloque segredos ou dados sensíveis no Git.

## Desenvolver e verificar

```bash
npm install
npm run build
npm test
python3 -m http.server 8877
```

Se Chromium estiver disponível, execute `npm run test:browser` em outro terminal com o servidor ativo. Verifique 360, 390, 768 e 1280 px, URLs privadas sem sessão e isolamento entre papéis. Auditorias heurísticas não provam aumento de conversão sem dados medidos.

## Fieldwork 2.0: Conversão Reversa (2026-11-22)

A navegação **Começar / Continuar** e **Missões e método** utiliza o novo motor em `fieldwork-v2.js`, com conteúdo em `fieldwork-method.js` e estilos em `fieldwork-v2.css`. O login, as permissões, o CRM, as propostas e a biblioteca continuam usando a estrutura anterior, sem retirar dados existentes.

- **30 dias são o prazo total do sprint**, não uma restrição para avançar etapas; é possível executar várias missões no mesmo dia.
- Cada prospect possui **10 missões independentes**: entender negócio, aquisição, objetivo comercial, referência do site ideal, comparação, oportunidade, abordagem, descoberta, proposta e fechamento.
- O sistema exige resultado descritivo antes de concluir uma missão; o usuário também pode salvar um rascunho e retomar em outro dispositivo.
- Contato comercial não pode ser marcado como realizado enquanto estiver em rascunho; interesse, proposta, contrato e entrada recebida não são equivalentes.
- As 10 aulas adicionais `metodo-v2-*` foram publicadas na biblioteca privada (total: 69 aulas). Não há necessidade de ler o Blue Book antes de executar.
- O estado é armazenado em `public.fieldwork_sprints` e `public.fieldwork_strategies`, protegidas por RLS. Scripts reexecutáveis: `supabase/sql/fieldwork_v2_schema.sql` e `supabase/sql/fieldwork_v2_bluebook.sql`.

**Importante:** os scripts SQL já foram aplicados ao banco de produção. A existência do arquivo no Git não faz o deploy da base de dados. As versões anteriores de `plan_days` e `learning_progress` continuam preservadas para auditoria e compatibilidade.

Para validar o código depois de instalar as dependências: `npm test` e `npm run build`. A experiência do primeiro acesso autenticado ainda exige uma validação humana em navegador real.
