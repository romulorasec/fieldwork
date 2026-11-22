/** Instruções de execução: cada missão do plano aponta para um procedimento contextual. */
export type Guide={why:string;steps:string[];example:string;deliverable:string;stuck:string;technical:string;lesson:string;workspace?:'prospects'|'audits'|'offers'};

const guide=(why:string,steps:string[],example:string,deliverable:string,stuck:string,technical:string,lesson:string,workspace?:Guide['workspace']):Guide=>({why,steps,example,deliverable,stuck,technical,lesson,workspace});
const numberIn=(text:string,fallback:number)=>Number(text.match(/\b\d+\b/)?.[0]||fallback);

export function guideForTask(task:string):Guide{
  const n=numberIn(task,5);
  if(task.startsWith('Definir nicho inicial'))return guide('Falar com todo tipo de empresa torna a mensagem genérica. Um nicho inicial permite observar problemas parecidos e testar uma oferta específica.',[
    'Abra o Google Maps e procure “remodeling contractor Sunnyvale” e “general contractor Sunnyvale”.',
    'Escolha cinco empresas de cada grupo e anote serviço, cidade, site e forma de pedir orçamento.',
    'No celular, veja se uma pessoa entende o serviço e consegue pedir orçamento facilmente.',
    'Escolha UM nicho para testar por sete dias. Registre por que o escolheu; é uma hipótese, não uma certeza.'
  ],'Exemplo simulado: 3 dos 5 sites de remodelers avaliados escondem o pedido de orçamento, enquanto 1 parece claro. Isso justifica investigar, não concluir que o nicho é vencedor.','Um nicho escolhido, cinco URLs analisadas e uma frase explicando o critério.','Comece com apenas três empresas e compare qual delas deixa mais claro o caminho até o orçamento. Amplie a amostra depois.','Compare acesso ao decisor, sinais de demanda, possibilidade de demonstrar uma melhoria e capacidade de atendimento. Ticket alto não garante orçamento de marketing.','inteligencia-de-mercado-1');
  if(task.startsWith('Descrever 3 problemas'))return guide('A oferta precisa nascer de uma observação, não da opinião de que um site é feio.',[
    'Abra uma homepage e uma página de serviço em tela de celular.',
    'Tente identificar serviço, área atendida, prova de confiança e como pedir orçamento.',
    'Repita a interação e anote exatamente onde houve dificuldade.',
    'Registre três observações com URL, dispositivo e proposta de teste. Se algo funcionar, registre também.'
  ],'“Em 390 px, o botão Request Estimate aparece somente depois de quatro rolagens.” Isso é observável; “perde 30% dos leads” não é.','Três observações reproduzíveis, cada uma ligada a uma tarefa do visitante.','Se não houver três problemas, não invente. Documente um ponto positivo e busque outro site.','Separe fato observado, hipótese de impacto e sugestão de correção. Contraste, copy, navegação e hierarquia também podem afetar a decisão.','diagnostico-e-auditoria-1','audits');
  if(task.startsWith('Montar planilha/CRM')||task.startsWith('Cadastrar os primeiros'))return guide('Sem registrar contatos, você perde contexto, repete abordagens e esquece o próximo passo.',[
    'Pesquise empresas do nicho na região escolhida; confira se atendem clientes reais.',
    `Monte uma lista de ${n} empresas sem duplicatas, com nome, site/perfil e contato profissional público.`,
    'Registre uma observação individual sobre cada empresa; não atribua problemas que não testou.',
    'Adicione os registros ao CRM e defina o próximo passo e uma data para revisitar cada oportunidade.'
  ],'ABC Roofing | Sunnyvale | Site | Contato comercial público | CTA de orçamento não testado | Próximo: verificar no celular.','Uma lista de empresas identificadas, sem duplicatas, com próxima ação registrada.','Comece com cinco empresas e confira se seus campos estão úteis. Continue até atingir a meta.','Diferencie empresa candidata de lead qualificado: cliente ideal, acesso ao decisor, necessidade observada e momento de compra são critérios distintos.','gestao-comercial-e-financeira-1','prospects');
  if(task.startsWith('Escrever proposta de valor de uma frase'))return guide('O prospect precisa entender rapidamente para quem você trabalha, o que entrega e qual decisão facilita.',[
    'Escolha o nicho e o obstáculo observado com mais frequência.',
    'Defina uma correção específica que realmente consegue entregar.',
    'Escreva uma frase sem prometer receita ou conversões não medidas.',
    'Leia em voz alta e confirme: um empresário entenderia em cinco segundos?'
  ],'“Ajudo remodelers da Bay Area a tornar o pedido de orçamento mais claro e fácil no celular, com uma página de serviços que o cliente consegue usar.”','Uma frase clara com público, problema, solução e ação esperada.','Use esta estrutura: “Ajudo [nicho] a [melhorar processo observável] por meio de [solução concreta]”.','Proposta de valor não é slogan. Valide-a nas conversas e modifique após observar respostas, não apenas por gosto pessoal.','ofertas-1');
  if(task.startsWith('Fixar limites e preços'))return guide('A venda fica difícil quando preço, entrega e exclusões mudam durante a conversa.',[
    'Defina uma oferta menor de correção e uma oferta de site/página completa.',
    'Liste entregas, exclusões, número de revisões, dependências e prazo de cada uma.',
    'Estime suas horas, custos e capacidade. Só então escolha um preço sustentável.',
    'Escreva qual problema justifica cada oferta e em que situação ela NÃO é indicada.'
  ],'Oferta A: corrigir o fluxo de orçamento; Oferta B: página de serviço completa. O preço depende de escopo e custo, nunca de uma promessa de leads garantidos.','Duas ofertas com escopo, exclusões, prazo, critério de aceite e preço defensável.','Comece com uma oferta menor, calcule o esforço e depois defina a segunda como expansão.','Considere margem bruta, tempo de suporte, revisões, ativos fornecidos pelo cliente e mudanças de escopo antes do fechamento.','ofertas-4','offers');
  if(task.startsWith('Criar checklist de briefing'))return guide('Um contrato só é seguro quando ambos sabem o que será feito, fornecido e aprovado.',[
    'Escreva perguntas sobre objetivo, público, serviços, cidade, contatos e conteúdo disponível.',
    'Defina entregáveis, prazos, revisões, responsabilidade do cliente e condição de início.',
    'Prepare um contrato simples com escopo, pagamento, direitos e política para mudanças.',
    'Revise o documento conforme sua jurisdição; não apresente modelo genérico como aconselhamento jurídico.'
  ],'Briefing: “Qual ação o visitante deve realizar?” Contrato: “1 página, 2 rodadas de revisão, prazo condicionado ao material do cliente”.','Checklist de reunião e rascunho contratual utilizáveis, com lacunas identificadas.','Comece pelas cinco perguntas decisivas: objetivo, público, conteúdo, prazo e aprovação.','Separe aceite da proposta, assinatura, pagamento inicial e autorização para publicar. Verifique termos conforme legislação aplicável.','gestao-comercial-e-financeira-3');
  if(task.startsWith('Criar template reutilizável'))return guide('Uma estrutura-base economiza produção sem vender a mesma solução cegamente para todos.',[
    'Desenhe a ordem: serviço e cidade, ação principal, prova, detalhes, processo e contato.',
    'Crie componentes responsivos para hero, benefícios, prova, FAQ e formulário.',
    'Teste toque, telefone, contraste e largura no celular.',
    'Marque no template quais textos e evidências precisam ser personalizados para cada cliente.'
  ],'Página de roofer: serviço + área, botão “Request Estimate”, exemplos reais de trabalhos, processo e contato.','Uma página-base funcional, adaptável e revisada em dispositivo móvel.','Faça primeiro um wireframe com seis blocos; só depois refine o visual.','Template é ponto de partida; CTA, prova, estrutura e copy dependem da intenção do comprador e das evidências do negócio.','producao-e-entrega-3');
  if(task.startsWith('Escrever resposta padrão para objeção')||task.startsWith('Registrar objeções')||task.startsWith('Listar as 3 objeções'))return guide('Objeções revelam dúvida sobre risco, prioridade ou investimento; respostas prontas não substituem ouvir.',[
    'Registre as palavras usadas pelo prospect, sem reescrever o sentido.',
    'Classifique a dúvida: resultado, preço, prazo, confiança ou urgência.',
    'Responda com uma pergunta de diagnóstico e uma evidência verificável.',
    'Ajuste apenas uma frase depois de comparar várias conversas.'
  ],'“Você não tem reviews.” Resposta: “Faz sentido querer segurança. Posso mostrar um exemplo real do processo, os entregáveis e como vamos aprovar cada etapa?”','Uma resposta curta, honesta e adaptável à objeção identificada.','Use: “Qual parte deixa você mais inseguro: o resultado, o prazo ou o investimento?”','Não invente clientes nem depoimentos; reduza risco com escopo, portfólio verdadeiro, etapas de aceite e prova do processo.','comunicacao-e-vendas-3');
  if(task.startsWith('Organizar 2 exemplos reais'))return guide('Sem prova de competência, a proposta parece arriscada. Exemplo honesto pode demonstrar processo, mesmo sem cliente anterior.',[
    'Escolha dois projetos próprios reais ou dois estudos conceituais.',
    'Mostre o contexto, o problema, o raciocínio e a solução visual.',
    'Identifique claramente se é projeto de cliente, demonstração ou conceito.',
    'Publique links ou imagens legíveis no celular, sem inventar resultados de vendas.'
  ],'“Estudo demonstrativo: remodeler, antes/depois do fluxo de orçamento; não é projeto contratado.”','Dois exemplos acessíveis, com contexto e identificação correta.','Se não tiver dois exemplos, crie um estudo demonstrativo pequeno e identifique-o como tal.','Prova de processo demonstra capacidade; desempenho comercial exige medições reais, consentimento e contexto.','ofertas-5');
  if(task.startsWith('Gravar 1 auditoria')||task.startsWith('Preparar 2 auditorias'))return guide('Um vídeo curto demonstra observação concreta sem exigir que o empresário leia um relatório extenso.',[
    'Escolha um site e no máximo dois achados que conseguiu reproduzir.',
    'Grave 10 s de contexto, 20 s por problema, 20 s de correção e 10 s de convite.',
    'Mostre o site e a interação, não apenas sua opinião.',
    'Confira legibilidade, link correto, privacidade e convite antes de compartilhar.'
  ],'“No celular o telefone aparece, mas não aceita toque. Podemos testar um link tel: e validar a ação.”','Vídeo demonstrativo de 60 a 90 segundos, com achado, limite e próximo passo.','Grave só um achado em 40 segundos primeiro; incremente quando estiver claro.','Loom ou gravação nativa funcionam. Não alegue perda de receita sem dados; não faça testes que enviem solicitações reais sem autorização.','prospeccao-e-aquisicao-4','audits');
  if(task.startsWith('Revisar perfil Upwork'))return guide('Uma presença clara ajuda o comprador a entender o serviço, mas plataformas são canais, não garantia de pedidos.',[
    'Defina uma frase de posicionamento por nicho/resultado e mostre dois exemplos honestos.',
    'Descreva entregas, exclusões, processo de trabalho e prazo viável.',
    'Crie uma oferta Fiverr com amostras, perguntas frequentes e limites de escopo.',
    'Revise como comprador: fica claro exatamente o que será entregue?'
  ],'Título: “Service-page redesign for local contractors”, com entregáveis e exemplos identificados.','Perfis revisados, oferta publicada e links salvos.','Comece por apenas uma plataforma se não conseguir estruturar as duas com qualidade.','Cada marketplace tem regras e custos próprios; confira antes de publicar e não use avaliações falsas.','prospeccao-e-aquisicao-6');
  if(task.startsWith('Contatar')&&task.includes('empresas')||task.startsWith('Pesquisar e contatar'))return guide('Contratos vêm de conversas qualificadas. A personalização mostra que você entendeu um problema específico.',[
    `Separe ${n} empresas do nicho com contato profissional público; elimine duplicatas.`,
    'Verifique uma interação no site e guarde apenas fatos observados.',
    'Envie mensagem curta: observação específica, pergunta de prioridade e um convite simples.',
    'Registre canal, resposta, data e próximo contato no CRM. Respeite preferências de não contato.'
  ],'“Hi Ana, I noticed the quote button on your mobile service page takes a few steps to find. Is improving estimate requests something you are focusing on this quarter?”','Contatos reais registrados individualmente com observação, canal, resultado e próximo passo.','Faça três abordagens bem pesquisadas primeiro; depois complete o volume previsto sem enviar spam genérico.','Acompanhe abordagens → respostas → reuniões → propostas → contratos, separando taxa observada de suposição. Aplique as regras do canal escolhido.','prospeccao-e-aquisicao-2','prospects');
  if(task.startsWith('Enviar')&&task.includes('Upwork'))return guide('Responder a projetos com encaixe real é mais eficiente do que enviar propostas genéricas.',[
    `Escolha ${n} vaga(s) com cliente, escopo e prazo compatíveis com seu trabalho.`,
    'Leia o pedido inteiro e escreva a primeira frase sobre a necessidade específica.',
    'Mostre uma solução plausível e um exemplo verdadeiro relacionado.',
    'Faça uma pergunta útil e envie pela plataforma; registre a oportunidade.'
  ],'“I saw you need a service page for a local HVAC company. I would prioritize a clear estimate request path and mobile call button. Which service generates your most valuable inquiries?”','Propostas personalizadas enviadas, com links de vagas e próximas ações registradas.','Escolha uma vaga bem alinhada e faça uma proposta curta antes de trabalhar o volume.','Verifique regras do marketplace, faixa de orçamento, histórico do contratante, escopo e concorrência sem presumir fechamento.','prospeccao-e-aquisicao-5');
  if(task.startsWith('Abordar')&&task.includes('parceir')||task.startsWith('Contatar')&&task.includes('parceir'))return guide('Profissionais complementares podem indicar empresas que já confiam neles.',[
    `Liste ${n} profissionais de SEO, tráfego, fotografia ou branding que atendam negócios locais.`,
    'Confira o público e se a parceria realmente acrescenta valor.',
    'Envie convite objetivo propondo colaboração em casos de necessidade comprovada.',
    'Registre resposta e data de retorno; nunca prometa comissão não acordada.'
  ],'“I build conversion-focused sites for local contractors. Do your clients ever need help improving their website before running campaigns?”','Parcerias abordadas e próximas conversas documentadas.','Comece por um profissional com quem já tenha um ponto de contato ou interesse em comum.','Defina critérios de indicação, responsabilidade, permissão de contato e remuneração por escrito quando houver acordo.','prospeccao-e-aquisicao-7');
  if(task.startsWith('Agendar follow-up')||task.startsWith('Fazer 5 follow-ups')||task.startsWith('Enviar follow-up útil'))return guide('Muitas conversas não recebem resposta imediata. Acompanhamento respeitoso mantém o contexto e esclarece a decisão.',[
    'Abra no CRM apenas conversas sem resposta final ou com próximo passo combinado.',
    'Revise a última mensagem, a necessidade e o prazo já mencionado.',
    'Envie uma informação útil ou pergunta simples, sem pressionar.',
    'Defina a data do próximo contato ou encerre com respeito quando não houver interesse.'
  ],'“Hi Mark, following up on the mobile quote flow I mentioned. Would a 60-second walkthrough be useful, or should I close this out for now?”','Follow-ups feitos ou agendados com data, canal e resultado.','Comece por um contato que já demonstrou interesse. Se não houver, agende os próximos contatos das abordagens de hoje.','Cadência depende do canal e consentimento. Não invente urgência nem envie insistências após uma recusa.','prospeccao-e-aquisicao-8','prospects');
  if(task.startsWith('Agendar calls'))return guide('Reunião e proposta precisam produzir uma decisão, não apenas um calendário cheio.',[
    'Qualifique o problema, o decisor, o orçamento aproximado e o momento de execução.',
    'Ofereça dois horários curtos ou envie um link de agendamento.',
    'Na conversa, confirme resultado desejado, escopo, prazo, responsabilidades e próximo passo.',
    'Envie proposta apenas quando houver encaixe e combine uma data de retorno.'
  ],'“If improving mobile estimate requests is a priority, we can review the two findings in a 15-minute call. Does Tuesday or Thursday work better?”','Reunião marcada ou realizada, proposta documentada e próximo passo com data.','Se o contato não estiver pronto para reunião, faça uma pergunta de qualificação e não force uma call.','Uma reunião útil cobre situação atual, impacto relatado pelo cliente, alternativas, decisor e critério de compra.','comunicacao-e-vendas-5','offers');
  if(task.startsWith('Verificar total')||task.startsWith('Contar respostas'))return guide('Sem números do próprio funil, você pode confundir muito esforço com avanço comercial.',[
    'Conte empresas únicas contatadas, respostas, reuniões e propostas enviadas.',
    'Conte contratos somente com aceite real; acompanhe depósito separadamente.',
    'Calcule taxas usando denominadores corretos e registre período e fonte.',
    'Escolha uma mudança para testar na próxima semana.'
  ],'Exemplo hipotético: 80 abordagens → 12 respostas → 4 calls → 2 propostas → 0 contratos. Isso mostra onde investigar; não é uma taxa de mercado.','Um resumo com contagens reais, taxas calculadas e próxima hipótese de melhoria.','Se ainda não tiver dados suficientes, registre apenas volume e resultado; não projete porcentagens com amostra minúscula.','Não some o mesmo prospect em vários canais como se fossem empresas únicas. Separe contrato assinado de pagamento recebido.','analise-e-crescimento-1','prospects');
  if(task.startsWith('Encaminhar propostas'))return guide('Proposta sem decisão ou próximo compromisso tende a se perder no pipeline.',[
    'Abra propostas ainda em avaliação e revise o prazo combinado.',
    'Confirme se o decisor entendeu resultado, entregáveis, exclusões e investimento.',
    'Pergunte qual informação falta para uma decisão.',
    'Registre resposta, eventual revisão e data do próximo passo.'
  ],'“Is there anything in the scope or timeline you would like me to clarify before you decide?”','Cada proposta aberta tem status real e próxima ação documentada.','Comece pela proposta com maior contexto e contato recente.','Não confunda proposta enviada com negociação concluída. Evite desconto automático sem redução correspondente de escopo.','comunicacao-e-vendas-4','offers');
  if(task.startsWith('Ajustar uma variável')||task.startsWith('Redefinir metas'))return guide('Mudar várias coisas de uma vez impede descobrir o que realmente melhorou.',[
    'Revise resultados registrados e identifique a maior dificuldade observada.',
    'Escolha somente nicho, mensagem, oferta ou canal para alterar.',
    'Formule uma hipótese específica e um período curto de teste.',
    'Defina qual métrica observará e mantenha as demais condições estáveis quando possível.'
  ],'“Poucos empresários responderam à mensagem inicial. Vou testar uma abertura mais específica nos próximos 20 contatos do mesmo nicho.”','Uma variável escolhida, hipótese, amostra prevista e data de revisão.','Se houver pouquíssimas respostas, mude primeiro a clareza da abordagem e continue coletando dados.','Compare taxas por fonte, mas considere amostras pequenas e sazonalidade. Teste uma alteração de cada vez.','analise-e-crescimento-3');
  if(task.startsWith('Revisar custo/tempo'))return guide('Uma venda só ajuda o negócio se o tempo e os custos não consumirem a margem.',[
    'Some horas dedicadas por canal e despesas realmente pagas.',
    'Conte oportunidades qualificadas e contratos da mesma origem.',
    'Calcule custo direto e tempo médio por oportunidade, sem estimativas fictícias.',
    'Decida onde reduzir desperdício ou investir mais atenção.'
  ],'“Canal A: 6 horas, US$ 30 gastos, 3 reuniões e nenhuma venda até hoje.” Registre o período; não conclua ROI antes de haver receita.','Quadro por canal com horas, gastos, oportunidades e decisão.','Comece registrando horas e custos da semana, mesmo sem contratos.','Compare custos, ticket, capacidade de entrega e ciclo de fechamento; leads não equivalem a receita recebida.','analise-e-crescimento-2');
  return guide('Toda ação deve produzir uma evidência verificável antes de ser marcada como feita.',[
    `Leia o objetivo: ${task}.`,
    'Identifique a empresa, canal ou documento em que vai agir.',
    'Execute a menor parte testável e registre o resultado real.',
    'Se precisar de técnica, abra o procedimento completo do Blue Book.'
  ],'Registre o que foi feito e o que observou, sem criar números ou resultados que não ocorreram.','Uma anotação concreta do resultado e do próximo passo.','Reduza a ação para uma tentativa de cinco minutos e retome a partir dela.','Se a tarefa continuar ambígua, documente a dúvida antes de marcar conclusão.','analise-e-crescimento-4');
}
