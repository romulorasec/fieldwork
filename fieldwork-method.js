/* Fieldwork 2.0: missões de execução, não calendário de aulas.
   Todo método inclui motivo, procedimento, exemplo, saída e aprofundamento. */
const f=(id,label,placeholder,required=true,kind="textarea")=>({id,label,placeholder,required,kind});
const M=(id,title,why,steps,fields,example,stuck,technical,lesson,tools=[])=>({id,title,why,steps,fields,example,stuck,technical,lesson,tools});
export const MISSIONS=[
M("business","Entenda como a empresa ganha dinheiro",
"Um site só produz valor quando ajuda o negócio a conquistar um resultado. Primeiro identifique o que é vendido, quem compra e como um contato vira cliente.",[
"Abra o Google Maps e o site da empresa. Leia as páginas de serviços, a descrição e a área atendida; copie informações concretas.",
"Leia três avaliações públicas para entender situações que levam alguém a procurar o serviço. Avaliações são pistas, não pesquisa representativa.",
"Simule o caminho comercial: como o interessado pede orçamento, liga ou agenda? Anote o que é visível e o que precisará perguntar ao dono.",
"Registre serviços, comprador provável e processo de compra. Se ticket ou margem não estiverem publicados, marque 'a confirmar'; não invente valores."
],[f("services","Serviços que geram receita","Ex.: kitchen remodeling, bathroom remodeling; página de serviços consultada."),f("buyer","Quem provavelmente compra e por qual motivo?","Ex.: proprietários que pretendem reformar a cozinha; hipótese baseada nos serviços."),f("revenue","Como o interesse pode se transformar em contrato?","Ex.: pesquisa → visita ao site → pedido de orçamento → visita técnica → proposta; etapas finais a confirmar."),f("area","Região e especialidade","Ex.: atende Sunnyvale e Mountain View; verificar áreas publicadas.",false),f("ticket","Ticket médio ou valor do serviço","A confirmar com o dono, salvo se houver preço público verificável.",false),f("margin","Margem e capacidade de atendimento","A confirmar. Não inferir a margem pelo valor dos projetos.",false)],
"Exemplo fictício: uma empresa realiza reformas residenciais. O comprador provavelmente compara portfólio e confiança antes de pedir uma avaliação. A venda pode depender de visita técnica; ainda é preciso confirmar isso com o proprietário.",
"Não conhece o ticket? Escreva 'a confirmar com o proprietário'. Não sabe quem compra? Consulte três páginas de serviço e duas avaliações antes de formular a hipótese.",
"Separe fato publicado, inferência e informação confirmada na conversa. O número de estrelas não revela margem, taxa de fechamento ou faturamento.","inteligencia-de-mercado-1",[["Google Maps","https://www.google.com/maps"],["Pesquisa Google","https://www.google.com/"]]),
M("demand","Descubra como os compradores chegam até a empresa",
"Antes de recomendar um website, investigue se ele participa da aquisição, da confiança ou da qualificação dos contatos.",[
"Pesquise no Google o serviço e a cidade como faria um comprador, sem assumir que o primeiro resultado representa todos os clientes.",
"Visite perfil do Google, website e redes sociais vinculadas. Anote apenas canais observáveis.",
"Confira se há anúncios públicos na biblioteca de anúncios; um anúncio ativo não prova que a empresa está lucrando.",
"Desenhe em uma frase o caminho provável desde descobrir a empresa até solicitar atendimento. Marque as partes desconhecidas para validar na conversa."
],[f("channels","Onde aparecem sinais de aquisição?","Ex.: Google Maps e Instagram observados; indicações a confirmar."),f("journey","Qual é a provável jornada de compra?","Ex.: busca por reforma → compara projetos → procura credenciais → pede orçamento."),f("siteRole","Qual papel o website poderia desempenhar?","Ex.: qualificar pedidos de orçamento para projetos grandes."),f("sources","Fontes e limites do que foi observado","Ex.: URL do perfil e página de serviço; não tenho acesso ao Analytics.",false)],
"Exemplo fictício: a empresa publica antes/depois no Instagram e oferece agendamento no site. Isso sugere uma jornada de comparação e confiança, não comprova quantos leads chegam por cada canal.",
"Se não encontrar anúncios, não conclua que a empresa não anuncia. Continue com o Google, site e fontes públicas. O dono confirmará os canais reais.",
"Uma visita não equivale a um lead. Dados de tráfego, custo e aquisição reais normalmente exigem permissão do proprietário.","inteligencia-de-mercado-2",[["Google Trends","https://trends.google.com/trends/"],["Google Ads Transparency","https://adstransparency.google.com/"],["Meta Ad Library","https://www.facebook.com/ads/library/"]]),
M("goal","Defina o resultado comercial que o website deveria apoiar",
"A estratégia começa pelo resultado desejado, não por um layout. O website deve facilitar uma decisão comercial específica.",[
"Use os serviços e o comprador encontrados antes para escolher UMA ação comercial prioritária: orçamento, chamada, agendamento, reserva ou venda.",
"Descreva o que caracteriza um contato qualificado e por que ele teria valor para a empresa.",
"Trace o caminho ideal do visitante do primeiro contato até essa ação, com os menores obstáculos razoáveis.",
"Escolha uma medida possível para validar o resultado mais tarde e marque como hipótese tudo que não foi confirmado com o dono."
],[f("outcome","Resultado comercial prioritário (hipótese)","Ex.: mais pedidos de orçamento qualificados para reformas de cozinha."),f("qualified","O que seria um contato de qualidade?","Ex.: proprietário da região, projeto compatível e intenção real de solicitar avaliação."),f("path","Jornada desejada do visitante","Ex.: serviço e cidade → projetos relevantes → prova → entendimento do processo → solicitar orçamento."),f("measure","O que mediríamos, com autorização?","Ex.: eventos de formulário enviado, cliques em ligar, reuniões qualificadas.",false)],
"Uma clínica pode priorizar agendamentos; um serviço emergencial, chamadas; uma empresa de reformas, pedidos qualificados. Não existe um CTA universal para todo negócio.",
"Se houver muitos objetivos, escolha o mais próximo da receita que o website consegue influenciar e registre os secundários para depois.",
"O resultado é uma hipótese operacional, a confirmar com o decisor. Medir cliques não prova vendas; atribuição, qualidade dos leads e fechamento também importam.","ofertas-1",[["Guia de eventos GA4","https://support.google.com/analytics/answer/9267735"]]),
M("blueprint","Desenhe a referência de um site intencional",
"Sem uma referência ligada ao objetivo comercial, qualquer opinião estética parece um defeito. Agora projete o que deveria facilitar a jornada.",[
"Escreva o serviço, a região e a promessa que precisam ficar claros na primeira tela.",
"Ordene as seções conforme as dúvidas do comprador: serviço, provas, processo, objeções, contato. Justifique essa ordem.",
"Defina o papel de fotos, cores, tipografia, identidade e logotipo: confiança, legibilidade, diferenciação e coerência, não gosto pessoal.",
"Descreva CTAs, prova verificável, mobile, formulário e eventos a medir. Faça um esboço no papel, Figma ou no próprio registro."
],[f("positioning","Mensagem e proposta de valor desejadas","Ex.: reformas de cozinha na região, com avaliação de projeto e exemplos reais."),f("sections","Sequência sugerida de seções e motivo","Ex.: serviço/região → projetos reais → processo → FAQ → orçamento; a ordem responde dúvidas frequentes."),f("persuasion","Copy, provas e objeções a tratar","Ex.: projetos por tipo de reforma, credenciais e etapas de atendimento, sem depoimentos fictícios."),f("visual","Identidade visual, logo, tipografia e coerência","Ex.: manter marca reconhecível; assegurar contraste, consistência e clareza no mobile."),f("cta","Ação principal e fluxo até ela","Ex.: Request Estimate nas páginas relevantes, com campos que qualifiquem sem criar fricção."),f("measurement","Como testar e medir depois","Ex.: comparar conclusão de formulários e qualidade de contatos antes/depois, com acesso autorizado.",false)],
"Referência hipotética para remodeling: hero que comunica serviço e cidade, portfólio de projetos reais, processo, prova e formulário de orçamento qualificado. A ordem deve ser testada; não é uma receita imutável.",
"Não sabe desenhar? Faça uma lista das seções no papel. Descreva em uma frase por que cada uma ajuda o comprador. Não é necessário abrir o Figma.",
"Uma marca antiga não é automaticamente ruim. Cada elemento visual deve ser avaliado pelo papel que cumpre no público, no contexto e na jornada, não pela preferência do designer.","diagnostico-e-auditoria-2",[["Figma Starter","https://www.figma.com/"],["Canva Free","https://www.canva.com/"]]),
M("diagnose","Compare o site atual com a estratégia ideal",
"O objetivo não é colecionar defeitos; é descobrir diferenças entre o que o negócio precisa e o que a experiência atual pode estar oferecendo.",[
"Abra a home e uma página de serviço no celular. Faça o percurso real até a ação principal, sem enviar formulários de terceiros.",
"Compare objetivo, clareza da mensagem, identidade, ordem das seções, provas, CTA, velocidade e uso mobile com a referência anterior.",
"Registre um comportamento observável com URL, dispositivo e contexto; documente o que já funciona bem.",
"Use PageSpeed Insights se houver uma questão técnica. Separe problema reproduzido, oportunidade hipotética e impacto medido."
],[f("current","O que o website atual está fazendo?","Ex.: exibe portfólio, mas o pedido de orçamento está disponível apenas na página Contact."),f("gap","Diferença relevante em relação ao objetivo comercial","Ex.: página de cozinha não orienta o próximo passo depois da galeria de projetos."),f("evidence","Evidência verificável ou limite da análise","Ex.: URL específica, captura no celular a 390 px. Sem acesso às taxas reais."),f("whatWorks","O que já funciona bem?","Ex.: fotos autênticas dos trabalhos e telefone clicável.",false),f("confidence","Classificação do achado","Hipótese / Observado / Reproduzido / Medido com dados autorizados",true,"select")],
"Observação: botão de orçamento pouco visível numa página de serviço. Hipótese: visitantes motivados podem ter dificuldade para iniciar contato. Não afirmar perda financeira sem dados.",
"Se o website estiver bom, registre isso. Investigue oferta, tráfego ou atendimento, ou descarte a oportunidade de website em vez de inventar defeitos.",
"Uma auditoria visual não prova queda de conversão. Para desempenho use métricas adequadas; para negócios reais confirme dados com o proprietário.","diagnostico-e-auditoria-1",[["PageSpeed Insights","https://pagespeed.web.dev/"],["Web.dev","https://web.dev/"]]),
M("opportunity","Transforme o diagnóstico em uma hipótese de crescimento",
"O valor não é um botão novo: é a possibilidade de facilitar mais contatos qualificados, reservas ou vendas, se o problema existir e tiver prioridade para o empresário.",[
"Escolha uma diferença que seja importante para a intenção de compra, com evidência ou hipótese identificada.",
"Descreva a experiência ou website estratégico que proporia para atender ao objetivo, em vez de uma lista de consertos soltos.",
"Explique o ganho potencial sem inventar receita ou porcentagens. Se quiser simular cenários, identifique-os como hipotéticos.",
"Registre o que precisa ser confirmado com o proprietário para saber se há demanda e orçamento."
],[f("commercial","Qual oportunidade comercial pode existir?","Ex.: receber solicitações de reforma mais bem qualificadas por um site orientado ao processo de orçamento."),f("solution","Que experiência ou website estratégico construiríamos?","Ex.: serviço/região, prova de projetos, processo, copy e formulário contextual integrado ao atendimento."),f("hypothesis","Por que isso poderia ajudar e qual é a incerteza?","Ex.: caminho mais claro pode facilitar contatos, mas desconheço taxa atual e volume de visitantes."),f("questions","O que confirmar com o empresário?","Ex.: quantas solicitações chegam, qual qualidade e como são atendidas.",false)],
"Não vendemos uma troca de cor. Investigamos se uma experiência estratégica pode transformar mais interesse em oportunidades qualificadas.",
"Se não houver sinal plausível, registre 'sem oportunidade demonstrável agora' e siga para outro prospect. Isso é um resultado válido.",
"Separe oferta de site novo, redesign estratégico e otimização de jornada. A recomendação depende do problema comercial real e da capacidade de implementar e mensurar.","ofertas-3",[["Estimador de demanda (Trends)","https://trends.google.com/trends/"]]),
M("outreach","Converse sobre resultado, não sobre conserto",
"O primeiro contato precisa descobrir se o empresário valoriza a oportunidade. Não pressupomos que ele queira um novo website.",[
"Confirme nome da empresa, canal profissional público e o detalhe observado que justifica o contato.",
"Escreva uma mensagem curta em inglês: contexto, oportunidade plausível, pergunta sobre prioridade e convite pequeno.",
"Envie pelo canal apropriado, respeitando regras de comunicação comercial e pedidos de não contato.",
"Registre se foi enviado, quando retomar e o resultado; salvar rascunho não significa contato realizado."
],[f("channel","Canal e contato profissional","Ex.: e-mail comercial publicado no site. Não use contatos privados."),f("message","Mensagem de abordagem preparada","Ex.: Hi, I was reviewing how homeowners request remodeling estimates. Would it be useful if I shared a quick idea to make that path clearer on your site?"),f("outcome","Estado real do contato","Rascunho / Enviado / Respondeu / Sem interesse",true,"select"),f("followup","Próxima ação e data combinada","Ex.: verificar resposta em três dias úteis; respeitar opt-out.",false)],
"Hi Mark, I was looking at how homeowners request kitchen remodeling estimates. I noticed a possible opportunity to make that path more intentional on your website. Is improving qualified inquiries a priority this quarter?",
"Não tem nome do proprietário? Use o contato comercial público e não finja familiaridade. Sem envio, salve como rascunho e não registre a etapa como contato feito.",
"Vendas B2B exigem diagnóstico, não promessas de mais faturamento sem dados. Para e-mail nos EUA, considere os requisitos aplicáveis do CAN-SPAM.","prospeccao-e-aquisicao-2",[["Gmail","https://mail.google.com/"],["CAN-SPAM (FTC)","https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business"]]),
M("discovery","Confirme a prioridade com o proprietário",
"Oportunidade técnica não é necessidade comercial confirmada. Precisamos ouvir como o negócio funciona e o que o empresário quer melhorar.",[
"Proponha uma conversa de 15 minutos e explique que quer entender aquisição, atendimento e objetivos antes de recomendar um site.",
"Pergunte de onde vêm os melhores contatos, o que já funciona, quais contatos não viram negócio e por quê.",
"Confirme qual resultado seria valioso, a prioridade, o prazo, o decisor e a faixa de investimento, sem forçar respostas.",
"Resuma o que realmente foi dito e combine uma próxima decisão. Se ainda não conversaram, registre 'a confirmar' e não marque como validado."
],[f("validated","O que o proprietário confirmou?","Ex.: muitos pedidos genéricos, prioridade em projetos maiores. Se não houve conversa, mantenha como rascunho."),f("priority","Prioridade, urgência e razão","Ex.: quer melhorar pedidos antes da próxima campanha; informado pelo dono."),f("decision","Decisor, investimento e prazo","Ex.: proprietário decide; orçamento ainda não definido."),f("next","Próxima decisão combinada","Ex.: enviar proposta com duas opções até sexta-feira.")],
"“You mentioned that most website inquiries are too broad. Which project details would make an inquiry useful for your team?” Essa pergunta descobre a necessidade, sem empurrar uma solução pré-fabricada.",
"Se a pessoa não respondeu, não invente a conversa. Agende o acompanhamento no CRM e continue outro prospect.",
"Descoberta comercial: situação, dor declarada, impacto relatado, prioridade, objeção, decisor e critério de compra. Pergunte e ouça antes de argumentar.","comunicacao-e-vendas-1",[]),
M("offer","Crie uma proposta de website estratégico",
"A proposta conecta o objetivo declarado pelo empresário a uma experiência digital planejada, um escopo claro e critérios verificáveis.",[
"Comece pelo problema comercial confirmado e pela intenção de compra que o site deve apoiar.",
"Descreva a solução completa: posicionamento, copy, hierarquia, provas reais, navegação, CTA, mobile e mensuração conforme o escopo.",
"Defina entregáveis, exclusões, revisões, responsabilidade do cliente, prazo, investimento e condições de pagamento.",
"Revise com o cliente; não prometa leads ou faturamento garantidos. Salve a proposta no módulo comercial quando estiver validada."
],[f("value","Resultado comercial que a proposta pretende apoiar","Ex.: melhorar a proporção de solicitações compatíveis com reformas completas."),f("scope","Website e entregas estratégicas","Ex.: pesquisa, arquitetura, copy, design responsivo, 5 páginas de serviço, formulário qualificado, analytics; 2 revisões."),f("investment","Investimento e prazo (não invente)","Ex.: US$ 2.500 após estimar esforço; 3 semanas mediante entrega de conteúdo."),f("success","Como validar entrega e acompanhar resultado","Ex.: QA mobile, formulário funcional, eventos configurados e revisão com dados autorizados.")],
"“Conversion-focused website for qualified remodeling estimate inquiries”: escopo transparente, estratégia de provas e processo, rastreamento de formulários, preço e dependências.",
"Se não consegue precificar, liste horas e custos, estime revisões e defina o menor escopo sustentável. Consulte o Blue Book antes de prometer prazo.",
"Venda de resultado desejado não equivale à garantia de resultado. Diferencie resultado contratado (site funcional) de indicadores a monitorar após publicação.","ofertas-4",[["Figma","https://www.figma.com/"]]),
M("close","Conduza a decisão e registre o resultado real",
"Uma proposta só vira contrato quando há aceite verdadeiro. Acompanhar com respeito e medir a operação fecha o ciclo de aprendizagem.",[
"Revise se o decisor recebeu e compreendeu escopo, preço, prazo e resultado pretendido.",
"Registre a objeção nas palavras do cliente; esclareça riscos, sem desconto automático ou urgência fictícia.",
"Combine próximo passo com data. Só marque 'Contrato' no CRM depois de aceite real; confirme entrada recebida separadamente.",
"Atualize o que aprendeu, examine conversas em aberto e escolha o próximo prospect. Missões não dependem da virada do dia."
],[f("response","O que o prospect decidiu ou respondeu?","Ex.: proposta em avaliação; pediu esclarecimento sobre integração com agendamento."),f("nextAction","Próximo compromisso e prazo","Ex.: enviar revisão de escopo hoje e retornar na terça."),f("learning","O que este caso ensinou para a próxima venda?","Ex.: compradores priorizam qualificação mais que quantidade bruta de leads.")],
"Negociação real: o cliente aceita o escopo, assina e paga a entrada. Registre contrato e pagamento como eventos diferentes, sem transformar uma conversa positiva em venda.",
"Se a proposta foi recusada, registre o motivo conhecido e escolha outro prospect. Se não houver resposta, programe follow-up útil, não pressão.",
"O funil mede empresas únicas, contatos, respostas, reuniões, propostas, contratos e entradas. Calcule taxas apenas com dados registrados.","comunicacao-e-vendas-4",[])
];
export const MISSION_IDS=MISSIONS.map(m=>m.id);

// As novas aulas aprofundam cada missão; o livro antigo permanece acessível.
MISSIONS.forEach(m=>{m.lesson='metodo-v2-'+m.id;});
