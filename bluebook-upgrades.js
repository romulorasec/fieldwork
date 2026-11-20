/* Fieldwork Blue Book: instrução contextual, critérios de verificação e prática registrada. */
(() => {
  'use strict';
  const KEY='fieldwork-pratica-v2';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  $('.side .back')?.insertAdjacentHTML('beforebegin','<a class="back" href="cloud.html" style="color:#8cf0d2">Entrar no workspace privado</a>');
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const records=read(KEY,{});
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
  const recipes={
    'inteligencia-de-mercado-1':{
      steps:['Escolha três nichos próximos de uma região que você possa atender; registre uma hipótese, não uma conclusão.','Abra cinco empresas por nicho primeiro. Para cada site, identifique serviço principal, CTA, área atendida, prova de confiança e dificuldade de contato no celular.','Anote como a empresa parece captar solicitações: Google Business Profile, telefone, anúncio, formulário ou agendamento.','Compare evidência de problema, acesso ao decisor e possível importância do site. Expanda a amostra para vinte por nicho se o teste inicial justificar.'],
      example:'Exemplo simulado: 5 roofers pesquisados; 3 mostram botão de orçamento somente após várias seções, 1 apresenta contato evidente, 1 não tem site. O resultado é uma hipótese de pesquisa, não “roofing é o melhor nicho”.',
      verify:'Registre nicho, cidade, cinco URLs ou perfis, ação desejada pelo visitante e uma observação por empresa.',
      trap:'Ticket alto do serviço não prova orçamento, urgência ou intenção de contratar web design.'},
    'inteligencia-de-mercado-2':{
      steps:['Pesquise serviço + cidade no Google e Maps; repita para duas cidades comparáveis.','Separe fontes: pedido explícito de site, declaração do dono, anúncio de contratação, sinal público de fricção e especulação.','Observe perfis, sites, avaliações e anúncios para entender como o comprador encontra a empresa.','Anote data, link, evidência e confiança; não conte a mesma empresa duas vezes.'],
      example:'Exemplo simulado: um consultório publica que abriu uma segunda unidade. Isso sugere mudança de contexto, mas não comprova que deseja um site.',
      verify:'Cada conclusão comercial tem fonte identificada e selo: fato, fala do comprador ou hipótese.',
      trap:'Avaliação ruim de atendimento não é evidência de que o problema está no website.'},
    'inteligencia-de-mercado-3':{
      steps:['Escolha cinco concorrentes que disputam o mesmo serviço e a mesma região.','Compare primeira tela mobile, oferta, prova, ação principal e como o visitante conclui o contato.','Registre também os pontos fortes: o objetivo é descobrir padrões úteis, não depreciar concorrentes.','Resuma duas lacunas que podem ser corrigidas e demonstradas.'],
      example:'Exemplo simulado: três empresas de HVAC mostram “Emergency AC Repair” e telefone visível; outra esconde o contato em “About”. A diferença é verificável; o impacto comercial ainda não.',
      verify:'Tabela preenchida com cinco empresas, URLs, padrões de conversão e uma hipótese testável.',
      trap:'“Site mais bonito” e “empresa vende mais” não são equivalentes.'},
    'inteligencia-de-mercado-4':{
      steps:['Confirme empresa ativa, localização e canal profissional de contato.','Classifique a situação: sem site, fricção visível, site aparentemente bom ou informação insuficiente.','Avalie problema observável, adequação de oferta e facilidade de alcançar o decisor, cada um como ausente, parcial ou comprovado.','Priorize quem combina evidência e acesso; reserve casos incertos para pesquisa adicional.'],
      example:'Exemplo simulado: site com formulário quebrado + contato do proprietário publicado = prioridade para investigar. Empresa sem site, sem dor conhecida e sem decisor = prioridade baixa.',
      verify:'Cada lead possui situação, evidência, confiança e próxima ação explícitas.',
      trap:'Não invente faturamento, disponibilidade financeira nem urgência para preencher campos.'},
    'inteligencia-de-mercado-5':{
      steps:['Peça uma conversa breve, deixando claro que está entendendo o processo de aquisição, sem fingir ser cliente.','Pergunte de onde chegam novos pedidos, o que ocorre após o contato e qual problema mais atrapalha.','Peça exemplos recentes: “Quando isso aconteceu pela última vez?” e “O que fizeram para resolver?”.','Anote palavras do interlocutor, frequência, prioridade e quem decide sobre investimentos.'],
      example:'Exemplo simulado: dono relata receber formulários, mas demorar dois dias para responder. A prioridade pode ser operação comercial, não reconstrução do site.',
      verify:'Cinco conversas registradas ou tentativas qualificadas, com padrões e contradições separados.',
      trap:'Não transforme perguntas de pesquisa em apresentação de vendas prematura.'},
    'prospeccao-e-aquisicao-1':{
      steps:['No Maps pesquise “roofing contractor + cidade”; abra perfis reais e confira se atendem à região.','Registre nome, categoria, website quando existir e contato profissional publicado.','Em cada site, simule apenas a navegação mobile: procure serviço, prova e caminho até orçamento. Não envie formulários de teste sem autorização.','Classifique o prospect pela situação do website e escreva uma observação específica, baseada em captura e URL.'],
      example:'Exemplo simulado: o site de um roofer em Sunnyvale apresenta o botão “Request Estimate” apenas após quatro telas. Mensagem possível: “Encontrei um ponto que pode dificultar pedidos de orçamento no celular”.',
      verify:'Três prospects registrados com URL, situação e evidência; expanda para vinte após calibrar o método.',
      trap:'Empresa sem website não significa automaticamente perda de clientes: o Google Profile pode gerar ligações.'},
    'prospeccao-e-aquisicao-2':{
      steps:['Escolha uma observação verificável e confirme que a solução combina com o serviço da empresa.','Escreva assunto curto, primeira frase contextual, hipótese simples e pergunta de baixo compromisso.','Personalize o contato individualmente e confira identidade, endereço postal e possibilidade de opt-out conforme as regras aplicáveis.','Registre envio, resposta e próxima data no CRM; compare respostas úteis, não apenas aberturas.'],
      example:'Subject: Quote requests on mobile\nHi Sam, I noticed the estimate button is hard to find on your mobile roofing page. I have two suggestions to make that path clearer. Would a 60-second walkthrough be useful?',
      verify:'Mensagem sem alegação de receita perdida, com dado específico e próxima ação única.',
      trap:'A lei CAN-SPAM também se aplica a e-mail comercial B2B individual. Consulte a FTC antes de enviar.'},
    'prospeccao-e-aquisicao-3':{
      steps:['Confirme o horário adequado e o número profissional publicado.','Pergunte pelo responsável por website ou aquisição de clientes e peça permissão para explicar em 20 segundos.','Descreva uma observação, sem diagnosticar negócios pelo telefone.','Se houver abertura, combine envio de vídeo ou reunião; se houver recusa, encerre e registre.'],
      example:'Exemplo EN: “Hi, is this a bad time? I noticed one obstacle in the mobile estimate path and wanted to ask who manages your website.”',
      verify:'Registre quem atendeu, objeção literal, permissão ou recusa e próximo passo.',
      trap:'Evite campanhas de ligações automáticas e verifique regras aplicáveis ao contato comercial.'},
    'prospeccao-e-aquisicao-4':{
      steps:['Escolha uma empresa e no máximo dois achados verificáveis.','Grave 10 s de contexto, 20 s por problema, 20 s de correção proposta e 10 s de convite.','Mostre a página e a interação, não apenas diga “UX ruim”.','Revise a gravação no celular, removendo dados privados e alegações não demonstradas.'],
      example:'Exemplo simulado: mostrar caminho até “Book Appointment” que exige três páginas; propor CTA contextual visível na página do tratamento.',
      verify:'Vídeo de 60 a 90 s com URL, duas evidências, solução plausível e convite.',
      trap:'Auditoria gratuita é demonstração de competência, não entrega de um projeto inteiro sem contrato.'},
    'prospeccao-e-aquisicao-5':{
      steps:['Filtre vagas recentes por escopo, objetivo de negócio, orçamento e aderência à sua competência.','Marque dependências: textos, fotos, integrações, acessos e prazo realista.','Avalie custo dos Connects e se há informações suficientes para proposta específica.','Abra com o problema do cliente, descreva processo, inclua prova verdadeira e uma pergunta relevante.'],
      example:'Exemplo: “You mentioned low mobile quote completion. I would map the current form, rebuild the flow and test submissions. Is the form connected to your CRM?”',
      verify:'Uma proposta responde ao briefing, delimita escopo e permite uma decisão.',
      trap:'Evite cópias em massa; respeite regras atuais de contato e pagamento da plataforma.'},
    'prospeccao-e-aquisicao-6':{
      steps:['Fiverr: anuncie um entregável estreito, exemplos próprios identificados, revisões e dependências.','Thumbtack: confira categoria, área, custo e teto de gastos antes de receber leads pagos.','Para cada canal registre gasto, horas, tipo de demanda, leads qualificados e contratos.','Compare contribuição e previsibilidade por contrato, não apenas visualizações ou pedidos de orçamento.'],
      example:'Exemplo simulado: gig “Mobile quote page for local roofers” com escopo de uma página; Thumbtack começa com teto de custo que você aceita perder no teste.',
      verify:'Uma oferta de gig completa e uma ficha de decisão de custo para leads pagos.',
      trap:'Fiverr e Thumbtack exigem fluxos distintos; comprar visibilidade não compra reputação.'},
    'prospeccao-e-aquisicao-7':{
      steps:['Liste profissionais complementares que já atendem o nicho: mídia paga, fotografia, SEO, branding e agências.','Pesquise público atendido, qualidade dos trabalhos e possível complementaridade.','Proponha acordo simples de indicação ou produção com responsabilidades, propriedade do cliente e pagamento claros.','Faça piloto pequeno e revise qualidade e tempo de entrega.'],
      example:'Exemplo EN: “You run ads for remodelers; I build the landing pages and test the quote flow. Could we discuss a small referral pilot?”',
      verify:'Lista de dez parceiros adequados, dois convites específicos e modelo de colaboração.',
      trap:'Comissão nem sempre é adequada; verifique restrições de profissão e acordos do cliente.'},
    'prospeccao-e-aquisicao-8':{
      steps:['Registre o contato original, sua relevância e data.','Se não houver resposta, ofereça uma nova informação útil após intervalo razoável; nunca apenas “seguindo”.','Se responder, adapte o próximo passo à objeção ou interesse, não continue sequência automatizada.','Diante de recusa ou pedido de parada, encerre o contato.'],
      example:'“One more idea: a dedicated service-area page could clarify which roof repairs you handle in Palo Alto. If this is not a priority, no problem.”',
      verify:'Cada prospect possui próxima data ou encerramento registrado, sem contatos sem contexto.',
      trap:'Mais mensagens não resolvem uma oferta irrelevante.'},
    'comunicacao-e-vendas-1':{
      steps:['Comece pela origem dos contatos e pelo objetivo comercial, não pelo design.','Peça um episódio concreto do problema e investigue o processo após a chegada do lead.','Pergunte quem aprova o investimento, quais dependências existem e o que faria o projeto valer a pena.','Repita o que ouviu e peça correção antes de recomendar solução.'],
      example:'Dono: “Não recebo pedidos pelo site”. Pergunta útil: “Vocês recebem visitas no site ou os clientes ligam diretamente pelo Google?”',
      verify:'Resumo escrito com objetivo, problema declarado, evidência, decisor e próxima decisão.',
      trap:'Não presuma que falta de leads é necessariamente problema de conversão da página.'},
    'comunicacao-e-vendas-2':{
      steps:['Mostre duas evidências relevantes e explique por que podem atrapalhar uma tarefa real.','Conecte cada problema a uma intervenção limitada que você consegue executar.','Escreva proposta com escopo, exclusões, prazo, revisões, dependências, preço e aceite.','Mostre a primeira entrega verificável, como teste de envio do formulário.'],
      example:'Problema: solicitação de orçamento exige campos irrelevantes. Entrega: formulário curto com validação, mensagem de confirmação e destino de lead testado.',
      verify:'Proposta de uma ou duas páginas com critério de aceite e sem promessa de vendas.',
      trap:'Não venda redesign completo quando a correção é localizada.'},
    'comunicacao-e-vendas-3':{
      steps:['Ouça até o fim; confirme se a objeção é custo, prioridade, prova, risco ou prazo.','Pergunte contra o que o cliente compara a proposta e qual parte lhe parece incerta.','Responda com evidência, processo ou escopo menor, conforme a objeção.','Se não houver encaixe, não discuta indefinidamente.'],
      example:'“Já tenho site”. Resposta: “Ótimo. Você está satisfeito com a qualidade e a quantidade dos pedidos que chegam por ele? Se estiver, talvez não precise de mudança.”',
      verify:'Objeção registrada literalmente e resposta adaptada ao motivo real.',
      trap:'Desconto sem alteração de escopo pode comprometer margem e confiança.'},
    'comunicacao-e-vendas-4':{
      steps:['Apresente uma opção essencial e outra completa com diferenças explícitas.','Confirme quem decide, como será o pagamento e qual material precisa ser entregue.','Formalize escopo e marcos antes de iniciar.','Faça uma pergunta clara de decisão e registre o resultado.'],
      example:'Opção A: corrigir agendamento e CTA. Opção B: redesenhar a página de serviço, copy, prova e fluxo de reserva. Cada uma tem prazo e preço próprios.',
      verify:'Aceite documentado, depósito ou marco acordado e próximos responsáveis.',
      trap:'“Gostei da proposta” não é contrato fechado.'},
    'comunicacao-e-vendas-5':{
      steps:['Minutos 0–3: objetivo da empresa e contexto.','3–8: origem dos leads, fricção percebida e processo de atendimento.','8–11: resuma e peça confirmação da prioridade.','11–15: proponha caminho mínimo, dependências e próxima decisão com prazo.'],
      example:'Encerramento: “Pelo que você descreveu, o principal obstáculo está na reserva mobile. Posso enviar hoje um escopo fixo para corrigir e testar esse fluxo?”',
      verify:'Reunião termina com resumo, responsável e data de próximo contato.',
      trap:'Não consuma 15 minutos falando de framework, animação ou stack.'},
    'diagnostico-e-auditoria-1':{
      steps:['Abra a homepage e uma página de serviço no celular.','Em cinco segundos identifique serviço, região, diferencial e ação principal.','Percorra CTA, menu, telefone e campos sem enviar contato real sem autorização.','Registre captura, URL, dispositivo, momento e obstáculo.'],
      example:'Exemplo simulado: botão “Call Now” visível, mas sem link tel:. É um problema técnico verificável para quem quer ligar pelo celular.',
      verify:'Uma captura com anotação e descrição de qual tarefa o problema afeta.',
      trap:'Botão no topo nem sempre é melhor: a decisão depende da intenção do usuário.'},
    'diagnostico-e-auditoria-2':{
      steps:['Defina entrada do visitante: Google Maps, busca orgânica, anúncio ou indicação.','Defina uma tarefa: ligar, reservar, fazer pedido ou solicitar orçamento.','Percorra entrada → página → ação → confirmação; identifique onde faltam informação, confiança ou continuidade.','Distinga fricção demonstrada de taxa de conversão desconhecida.'],
      example:'Página de med spa lista tratamentos, mas agendamento cai em um sistema sem indicar o tratamento escolhido. A quebra de contexto é observável.',
      verify:'Mapa curto com etapa, evidência, correção proposta e forma de testar.',
      trap:'Sem dados de visitas e leads, não estime perda percentual.'},
    'diagnostico-e-auditoria-3':{
      steps:['Execute PageSpeed Insights no endereço exato e anote mobile/desktop.','Leia dados de campo quando houver; diferencie de pontuação de laboratório.','Confira indexação visível, titles, páginas de serviços, localização e links.','Priorize ajustes com relação plausível à experiência, sem prometer ranking.'],
      example:'LCP alto na landing page de anúncios é sinal a investigar. O teste de conversão exige medir o comportamento real após otimização.',
      verify:'Relatório com data, URL, CWV disponíveis, problema e prioridade.',
      trap:'100 pontos de Lighthouse não são prova de vendas.'},
    'diagnostico-e-auditoria-4':{
      steps:['Escolha dois ou três achados relevantes e verificáveis.','Para cada um mostre a tela, explique a tarefa prejudicada e sugira correção.','Produza uma versão de 90 segundos e, se necessário, relatório de uma página.','Conclua com uma pergunta de negócio e um convite simples.'],
      example:'“O visitante que busca emergência precisa encontrar a ligação imediatamente. Aqui o número aparece só no rodapé. Podemos testar o acesso direto na primeira tela.”',
      verify:'Vídeo ou página que separa fato, hipótese e intervenção.',
      trap:'Não apresente diagnóstico superficial como auditoria completa.'},
    'diagnostico-e-auditoria-5':{
      steps:['Liste no máximo cinco achados e a tarefa impactada.','Atribua impacto potencial, confiança e esforço em baixo, médio ou alto com justificativa.','Priorize problemas demonstrados, ligados à ação mais importante e com correção mensurável.','Faça uma melhoria por vez quando quiser inferir efeito.'],
      example:'Telefone não clicável em site de encanador: evidência alta, esforço baixo, impacto plausível alto. Refazer paleta de cores: evidência de problema baixa.',
      verify:'Três prioridades ordenadas com justificativa, custo aproximado e teste.',
      trap:'Pontuação heurística não equivale a ROI calculado.'},
    'producao-e-entrega-1':{
      steps:['Confirme serviço principal, comprador, região e ação desejada no site.','Colete fotos autorizadas, credenciais, diferenciais comprováveis, dúvidas frequentes e materiais existentes.','Desenhe caminhos por intenção, por exemplo emergência → ligar ou projeto complexo → orçamento.','Aprove conteúdo e responsabilidades antes do design.'],
      example:'Roofing: homepage orienta para emergências e inspeções; páginas específicas explicam roof repair e replacement com CTAs adequados.',
      verify:'Briefing aprovado, mapa de páginas, CTA por página e dependências registradas.',
      trap:'Não comece pela seção “Nossa história” quando o visitante procura um serviço específico.'},
    'producao-e-entrega-2':{
      steps:['Colete frases reais usadas pelo cliente e seus compradores.','Escreva primeiro o problema atendido, serviço, região e próximo passo.','Acrescente provas verificáveis, processo, objeções comuns e perguntas frequentes.','Teste se alguém entende a oferta em cinco segundos sem explicação externa.'],
      example:'Em vez de “Welcome to ABC Services”, use “Roof repair in Sunnyvale. Request an inspection from our local team”, se a empresa realmente oferece ambos.',
      verify:'Headline específica, prova verdadeira, CTA coerente e revisão aprovada.',
      trap:'Promessa de prazo, garantia ou classificação deve ser confirmada com o cliente.'},
    'producao-e-entrega-3':{
      steps:['Desenhe o fluxo no celular antes de usar componentes.','Priorize hierarquia, leitura, contraste, alvos de toque, navegação e retorno visual.','Implemente componentes de forma consistente e acessível, com estados de erro e sucesso.','Teste a principal tarefa em celular e desktop com pessoas que não participaram do projeto.'],
      example:'Formulário de orçamento com rótulos claros, poucos campos, erros junto dos campos e confirmação visível após envio.',
      verify:'Tarefa principal concluída nos testes, sem erros conhecidos de interação.',
      trap:'Animação não deve ocultar conteúdo nem bloquear a ação principal.'},
    'producao-e-entrega-4':{
      steps:['Configure páginas por serviço e localidade somente quando houver conteúdo útil próprio.','Verifique titles, descriptions, indexação, links internos e sitemap.','Configure eventos de ligação, formulário ou agendamento autorizados e documente sua definição.','Teste em modo de diagnóstico e confirme o recebimento real dos contatos com o cliente.'],
      example:'Evento “lead_form_submit” só dispara após confirmação bem-sucedida, não quando o usuário toca no botão.',
      verify:'Tabela evento → gatilho → destino → teste realizado.',
      trap:'Clique no telefone não é sinônimo de ligação atendida nem de venda.'},
    'producao-e-entrega-5':{
      steps:['Teste site em pelo menos dois tamanhos de viewport e com teclado.','Percorra menus, links, telefone, formulário, mensagens de erro e confirmação.','Revise HTTPS, redirecionamentos, títulos, favicon e indicadores de performance.','Publique após aprovação; preserve versão de recuperação e valide em produção.'],
      example:'Teste de aceite: lead de teste autorizado entra na caixa de e-mail correta, confirma ao visitante e aparece no sistema do cliente.',
      verify:'Checklist de QA com data, URL, dispositivo e aceite.',
      trap:'Deploy bem-sucedido não é garantia de funcionamento dos formulários.'},
    'producao-e-entrega-6':{
      steps:['Entregue credenciais por canal seguro e defina propriedade de domínio, hospedagem e contas.','Grave vídeo curto mostrando edição, acompanhamento de contatos e solicitações de suporte.','Registre prazo de suporte, defeitos cobertos e mudanças fora de escopo.','Peça avaliação de entrega e proponha revisão de resultados após período combinado.'],
      example:'Pacote: URL publicada, mapa de acessos, checklist de testes, breve tutorial e contatos de suporte.',
      verify:'Cliente confirma recebimento, funcionamento e responsabilidades.',
      trap:'Não confunda garantia técnica com garantia de novos clientes.'},
    'gestao-comercial-e-financeira-1':{
      steps:['Cadastre prospect assim que existir empresa, fonte e hipótese concreta.','Registre contato, pessoa, etapa, último evento e próxima ação datada.','Diferencie resposta, reunião marcada/realizada, proposta, contrato e pagamento.','Reveja pendências diariamente; encerre oportunidades sem continuidade.'],
      example:'ABC Remodeling → abordagem enviada 20/11 → respondeu 21/11 → reunião 24/11 → proposta depois da conversa.',
      verify:'Nenhum lead ativo sem próxima ação ou motivo de espera.',
      trap:'Mover estágio não pode apagar o histórico das reuniões realizadas.'},
    'gestao-comercial-e-financeira-2':{
      steps:['Estime tempo de pesquisa, venda, produção, revisões e suporte.','Some custos diretos, taxas de plataforma e ferramentas do projeto.','Determine preço mínimo sustentável e compare com valor percebido e alternativas do mercado.','Defina condições que obrigam renegociar escopo.'],
      example:'Hipótese: US$ 1.695 – US$ 150 em custos diretos – 20 horas × US$ 35 = US$ 845 antes de demais despesas e impostos.',
      verify:'Planilha com horas, despesas, preço e margem de contribuição estimada.',
      trap:'Não trate o próprio tempo como grátis.'},
    'gestao-comercial-e-financeira-3':{
      steps:['Defina páginas, integrações, materiais, aprovações e exclusões.','Especifique revisões, cronograma, atrasos de material, alterações e aceite.','Formalize pagamento e transferência de direitos conforme acordo adequado.','Confirme entendimento antes do início.'],
      example:'Redesign de três páginas inclui CTA e formulário; não inclui produção de fotos, criação de anúncios ou sistema de reservas customizado.',
      verify:'Escopo e aceite documentados, com responsáveis e marcos.',
      trap:'O contrato deve adequar-se às regras e às necessidades jurídicas locais.'},
    'gestao-comercial-e-financeira-4':{
      steps:['Conte horas livres reais na semana, descontando atendimento e prospecção.','Estime horas por tipo de entrega usando histórico e margem para revisão.','Reserve capacidade de suporte e atrasos antes de prometer início.','Venda datas de início e entrega coerentes com a fila de trabalho.'],
      example:'Disponibilidade de 20 h/semana e projeto de 25 h: no máximo cerca de 0,8 projeto/semana antes das folgas operacionais.',
      verify:'Calendário com slots de produção, atendimento e venda; sem sobreposição impossível.',
      trap:'Dez contratos em 30 dias não significam dez sites entregues em 30 dias.'},
    'gestao-comercial-e-financeira-5':{
      steps:['Separe valor vendido, faturas emitidas, depósitos recebidos e saldo a receber.','Associe cada cobrança ao contrato e ao marco correspondente.','Revise caixa semanal e reserve margem para custos e impostos aplicáveis.','Envie lembretes de pagamento com referência ao documento acordado.'],
      example:'Contrato US$ 1.695; sinal US$ 675 recebido; saldo US$ 1.020 com vencimento vinculado à aprovação final.',
      verify:'Cada contrato apresenta valor, recebido, saldo e data.',
      trap:'Receita contratada não significa dinheiro disponível.'},
    'analise-e-crescimento-1':{
      steps:['Defina eventos únicos por canal: contatos, respostas úteis, reuniões feitas, propostas e contratos.','Registre datas para manter histórico, sem recalcular passado com o estágio atual.','Calcule resposta por contato e fechamento por proposta em períodos comparáveis.','Investigue o estágio com maior queda antes de aumentar volume.'],
      example:'Hipótese didática: 100 contatos → 12 respostas → 5 reuniões → 3 propostas → 1 contrato. Só use taxas próprias quando houver amostra.',
      verify:'Funil com contagens históricas, período, canal e definição de cada etapa.',
      trap:'Não apresente taxas hipotéticas como benchmark nacional.'},
    'analise-e-crescimento-2':{
      steps:['Registre gastos em anúncios, leads, Connects, ferramentas e horas de aquisição.','Calcule custo por resposta, reunião e contrato apenas quando houver denominador.','Compare margem, esforço, tempo e previsibilidade dos canais.','Dê preferência a canais que geram compradores adequados à sua capacidade.'],
      example:'Canal A gera 10 respostas sem reuniões; B gera duas reuniões com decisores. Volume de resposta sozinho não decide o vencedor.',
      verify:'Tabela por canal, gasto, tempo, contatos, reuniões, contratos e margem.',
      trap:'Em amostra pequena, custo por cliente oscila muito.'},
    'analise-e-crescimento-3':{
      steps:['Escolha uma hipótese que possa ser refutada.','Mantenha nicho e canal constantes enquanto testa uma variável, quando possível.','Defina duração, amostra e resultado mínimo antes de executar.','Registre conclusão provisória e próximos testes, inclusive quando os dados forem inconclusivos.'],
      example:'Hipótese: mencionar uma fricção real gera mais respostas úteis que abrir com “faço sites”. Teste com abordagem comparável e registre respostas.',
      verify:'Experimento com variável, critério, amostra, resultado e decisão.',
      trap:'Cinco envios não provam causalidade.'},
    'analise-e-crescimento-4':{
      steps:['Semanalmente conte entradas, respostas, reuniões, propostas e contratos.','Liste objeções em linguagem literal e qualidade dos prospects por canal.','Escolha somente uma mudança operacional principal para a semana seguinte.','Defina próxima data de revisão e marcos viáveis de capacidade.'],
      example:'D7: quinze abordagens sem resposta e quatro contatos sem decisor. Próximo teste: melhorar seleção do responsável, sem trocar nicho, oferta e canal ao mesmo tempo.',
      verify:'Registro “manter / ajustar / pausar”, com motivo e próxima hipótese.',
      trap:'Não confunda cumprir tarefas com resultado comercial.'},
    'analise-e-crescimento-5':{
      steps:['Após entregar, peça autorização para documentar o processo e coletar feedback.','Separe mérito do site de mudanças de tráfego, atendimento e campanhas.','Crie estudo de caso com situação inicial, intervenção, medida e limitações.','Peça indicação quando houver satisfação genuína; padronize entregas antes de ampliar volume.'],
      example:'Case legítimo: antes, o link de agendamento falhava no celular; depois, teste funcional aprovado. Novos clientes só podem ser atribuídos com dados adequados.',
      verify:'Um case documentado, autorização registrada e um pedido de indicação apropriado.',
      trap:'Nunca transforme projeto demonstrativo em cliente real ou invente review.'}
  };
  const offerRecipes=[
    {id:'ofertas-1',title:'Entender o resultado que o comprador deseja',steps:['Entreviste cinco donos sobre como surgem pedidos e qual resultado considerariam valioso.','Diferencie dor declarada, sinal visível e hipótese de quem vende o site.','Descubra o que já tentaram, por que mudar agora e o que os mantém na solução atual.'],example:'Dono de remodeling: “Recebo pedidos genéricos que não viram projeto”. A oferta pode envolver qualificação dos pedidos, não simplesmente uma homepage mais bonita.',verify:'Uma frase com público, problema declarado, prioridade e fonte.',trap:'Não fabrique dor com base em preferência estética.'},
    {id:'ofertas-2',title:'Mapear objeções, desejos e risco percebido',steps:['Liste o que o cliente quer conseguir, o que teme e qual trabalho terá para implantar a solução.','Investigue provas necessárias: exemplo, processo, prazo, capacidade e comunicação.','Reduza incerteza com escopo, testes e marcos, sem inventar escassez ou garantias de receita.'],example:'“Nunca ouvi falar de você” é risco de confiança. Um walkthrough real, protótipo declarado e processo de QA são respostas honestas.',verify:'Quadro com três desejos, três objeções e uma prova possível para cada uma.',trap:'Gatilho psicológico sem evidência costuma virar pressão e reduzir confiança.'},
    {id:'ofertas-3',title:'Escolher site novo, redesign ou correção',steps:['Classifique o estado: sem site, fricção localizada, arquitetura inadequada ou site bom.','Relacione o problema à intervenção mínima que você consegue medir.','Recuse a recomendação de redesign quando falta evidência de necessidade.'],example:'Site de dentista com agenda funcionando e boa informação: não oferecer rebuild. Se anúncios apontam para página genérica, investigar landing page específica.',verify:'Oferta adequada à evidência, com justificativa de por que não escolheu outra intervenção.',trap:'Vender site completo para qualquer situação prejudica credibilidade.'},
    {id:'ofertas-4',title:'Empacotar escopo e preço sem margem fictícia',steps:['Descreva entregável, exclusões, prazo a partir do recebimento dos materiais e revisões.','Calcule horas de venda, produção, QA e suporte; acrescente custos.','Escolha opção essencial e opção completa com diferenças reais.','Teste preço por conversas, sem chamar preço anunciado de média de vendas realizadas.'],example:'Página de orçamento: copy de uma página, CTA, formulário, QA mobile, duas revisões. Hospedagem, fotos e campanhas fora do escopo, salvo contrato.',verify:'Documento com duas opções, condições e margem estimada.',trap:'Não garanta determinada quantidade de leads.'},
    {id:'ofertas-5',title:'Provar competência antes de ter avaliações',steps:['Monte uma demonstração própria com o selo “conceito demonstrativo”.','Mostre diagnóstico, decisão de copy, estrutura e teste de conversão.','Publique apenas resultados que mediu ou trabalhos para os quais possui permissão.','Inclua processo e entregáveis na proposta para reduzir risco percebido.'],example:'Conceito demonstrativo: página mobile de HVAC antes/depois com botão de ligação e explicação do fluxo. Não apresentar como trabalho pago.',verify:'Dois exemplos próprios claramente identificados e um walkthrough de 90 segundos.',trap:'Reviews compradas, falsas ou atribuídas a clientes inexistentes.'},
    {id:'ofertas-6',title:'Testar a oferta no mercado e refiná-la',steps:['Escolha um nicho, uma dor documentada e uma oferta inicial.','Defina qual sinal contará como resposta útil, reunião e proposta.','Converse com compradores; registre palavras, dúvidas e objeções.','Ajuste uma variável por ciclo e mantenha o histórico.'],example:'Depois de dez abordagens, objeção recorrente é “não tenho fotos”. Teste incluir orientação de coleta de materiais, não inventar garantia de resultados.',verify:'Hipótese, amostra, retorno observado, decisão e próximo experimento.',trap:'Não chame oferta validada após uma única resposta positiva.'}
  ];
  const sectors=[
    ['Roofing','Solicitação de inspeção ou orçamento','Serviço e cidade na primeira tela; tipos de roof repair/replacement; foto real; “Request Estimate” acessível.','CTA escondido, portfólio sem contexto, área atendida incerta.'],
    ['Remodeling','Consulta para projeto ou estimativa','Tipos de reforma separados; portfólio por serviço; critérios de projeto; formulário de qualificação.','Pedido genérico sem informação de serviço, escopo ou local.'],
    ['HVAC','Ligação urgente ou agendamento','Telefone clicável; emergência vs manutenção; horário; bairro atendido; confiança.','Número difícil de encontrar em emergência ou serviço não identificado.'],
    ['Plumbing','Ligação para serviço ou orçamento','Tipo de encanamento, disponibilidade, localização e chamada imediata.','Contato não clicável ou informação de emergência confusa.'],
    ['Electrical','Visita técnica ou orçamento','Serviços residencial/comercial, escopo, licenças informadas quando aplicável e contato claro.','Serviços misturados e solicitação sem contexto.'],
    ['Odontologia','Marcar avaliação','Serviço e localização, processo, informações da equipe, agendamento acessível.','CTA que leva a agenda genérica sem serviço selecionado.'],
    ['Med spas','Consulta para tratamento','Tratamentos específicos, expectativas responsáveis, credenciais e reserva clara.','Promessas não comprovadas ou agendamento com perda de contexto.'],
    ['Advocacia','Consulta inicial','Área de atuação, localização, qualificações apresentadas e processo de contato.','Mensagem genérica, sem explicar para quem o escritório atua.'],
    ['House cleaning','Orçamento recorrente ou reserva','Tipo de limpeza, área atendida, inclusões, confiança e escolha de frequência.','Formulário sem localização, frequência ou tipo de serviço.'],
    ['Restaurantes','Pedido, reserva ou visita','Menu legível no celular, horários atuais, localização, reserva/pedido direto.','PDF ilegível ou links de pedido quebrados.']
  ];
  const branches={
    none:{label:'Sem website',insight:'Confirme o caminho atual pelo Google Business Profile, telefone e indicação. A ausência de site, sozinha, não comprova perda de vendas.',text:'Hi [Name], I saw your Google Business Profile and could not find a dedicated site explaining [service] and the estimate process. Are calls and referrals currently covering your needs, or would an additional quote path be useful?',offer:'Página que explica serviços e permite solicitar orçamento, se houver demanda confirmada.'},
    friction:{label:'Site com fricção',insight:'Mostre uma dificuldade observada no celular e pergunte se ela é prioridade. Não atribua perdas sem dados.',text:'Hi [Name], I tested the mobile [service] page and noticed [observable obstacle] before someone can [call/book/request a quote]. I have two specific ideas. Would a 60-second walkthrough help?',offer:'Correção localizada, página de conversão ou redesign quando necessário.'},
    good:{label:'Site aparentemente bom',insight:'Não force redesenho. Descubra se há gargalo real de tráfego, qualidade do contato, páginas de campanha ou mensuração.',text:'Hi [Name], your main website path looks clear on mobile. Are you happy with the quality of inquiries it currently generates, or is there a specific service you are trying to grow?',offer:'Diagnóstico específico ou nenhuma oferta se não houver problema.'},
    expansion:{label:'Empresa em expansão',insight:'Novo serviço ou região é pista de contexto, não prova de orçamento. Investigue o que precisam lançar e quando.',text:'Hi [Name], I noticed [Business] is now offering [new service/area]. Do you already have a dedicated page to explain it and capture inquiries from that market?',offer:'Nova página de serviço, região ou campanha, após validação.'}
  };
  const offerSection=$('#offers-master');
  if(offerSection){
    const old=offerSection.querySelector('article.lesson');
    if(old)old.remove();
    const wrap=document.createElement('div');wrap.className='lessons';
    wrap.innerHTML=offerRecipes.map((o,i)=>`<article class="lesson" id="${o.id}"><div class="lessonhead"><span class="number">8.${i+1}</span><h3>${safe(o.title)}</h3></div></article>`).join('');
    offerSection.append(wrap);
    offerRecipes.forEach(o=>{recipes[o.id]=o});
    const detail=offerSection.querySelector('header p');if(detail)detail.textContent='Oferta de conversão, desejo de compra, risco, preço e validação. O laboratório interativo continua disponível no painel.';
  }
  const bodyAnchor=$('.note');
  if(bodyAnchor){
    bodyAnchor.innerHTML='<strong>Como usar este guia:</strong> comece pelo diagnóstico abaixo; depois abra apenas a prática que resolve sua próxima dúvida. Registre uma evidência real para acompanhar o progresso. Ler uma lição não equivale a executar a tarefa.';
    const start=document.createElement('section');start.id='primeira-missao';start.className='bb-start';
    start.innerHTML='<div class="bb-start-head"><div><span class="eyebrow">COMECE PELO CAMPO</span><h2>Observe, entenda, proponha.</h2><p>Uma análise rápida para começar a agir. Aprofunde somente quando encontrar uma oportunidade que mereça investigação.</p></div><a href="index.html#plan&day=1" class="bb-action secondary">Abrir missão do dia 1</a></div><div id="audit-workbench"></div>';
    bodyAnchor.parentNode.insertBefore(start,bodyAnchor.nextSibling);
  }
  const niches=document.createElement('section');niches.id='olho-de-aguia';niches.className='bb-library';
  niches.innerHTML=`<header><span class="eyebrow">DIAGNÓSTICO DE CONVERSÃO</span><h2>Olho de Águia: dez nichos.</h2><p>O objetivo não é achar o site mais feio. Descubra a intenção do visitante, a ação principal e o obstáculo verificável. Estes nichos são candidatos a teste, não ranking de lucro.</p></header><div class="bb-sector-grid">${sectors.map(s=>`<article><h3>${safe(s[0])}</h3><p><b>Conversão</b> · ${safe(s[1])}</p><p><b>O que observar</b> · ${safe(s[2])}</p><p class="bb-risk"><b>Possível sinal</b> · ${safe(s[3])}</p></article>`).join('')}</div><div class="bb-principle"><strong>Cinco perguntas antes de avaliar qualquer site:</strong> intenção do visitante, clareza da oferta, provas de confiança, facilidade da ação e continuidade após o contato.</div></section>`;
  const startNode=$('#primeira-missao');if(startNode)startNode.after(niches);
  const situ=document.createElement('section');situ.id='situacoes';situ.className='bb-library';
  situ.innerHTML=`<header><span class="eyebrow">PROSPECÇÃO ORIENTADA POR CONTEXTO</span><h2>Escolha a abordagem pela situação.</h2><p>Um negócio sem site, outro com CTA confuso e outro bem resolvido não deveriam receber a mesma mensagem.</p></header><div class="bb-branch-tabs">${Object.entries(branches).map(([k,v])=>`<button data-branch="${k}" type="button" ${k==='friction'?'aria-pressed="true"':''}>${safe(v.label)}</button>`).join('')}</div><div id="bb-branch-content" class="bb-branch-panel"></div>`;
  niches.after(situ);
  function showBranch(k){const b=branches[k];if(!b)return;$$('[data-branch]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.branch===k)));$('#bb-branch-content').innerHTML=`<h3>${safe(b.label)}</h3><p><strong>Antes de ofertar:</strong> ${safe(b.insight)}</p><div class="bb-script"><span>ABORDAGEM EM INGLÊS, ADAPTAR COM FATOS REAIS</span><p>${safe(b.text)}</p><button type="button" data-copy-branch>Copiar mensagem</button></div><p><strong>Oferta condicional:</strong> ${safe(b.offer)}</p>`;$('#bb-branch-content [data-copy-branch]').onclick=()=>navigator.clipboard.writeText(b.text).catch(()=>{});}
  $$('[data-branch]').forEach(b=>b.onclick=()=>showBranch(b.dataset.branch));showBranch('friction');
  const cases=document.createElement('section');cases.id='casos-reais';cases.className='bb-library';
  cases.innerHTML=`<header><span class="eyebrow">EVIDÊNCIA, NÃO PROMESSA</span><h2>Casos públicos documentados.</h2><p>Exemplos reais apresentados por seus autores. Os resultados não são benchmarks de pequenos negócios nem garantias para outro projeto.</p></header><div class="bb-sector-grid bb-cases"><article><h3>School of Rock</h3><p><b>Problema:</b> campanhas com landing pages lentas, formulários longos e conteúdo desalinhado dos anúncios.</p><p><b>Teste:</b> a agência RevUnit reformulou uma página piloto antes de escalar.</p><p><b>Resultado divulgado:</b> piloto com 75% mais conversões semanais e custo por conversão 50% menor.</p><a href="https://unbounce.com/customer-case-study/school-of-rock/" target="_blank" rel="noopener">Ler o estudo original</a></article><article><h3>QuintoAndar</h3><p><b>Problema:</b> desempenho de páginas em jornada digital imobiliária.</p><p><b>Intervenção:</b> melhoria de Core Web Vitals e migração de parte do conteúdo para Next.js.</p><p><b>Resultado divulgado:</b> 5% de melhora na conversão na fase de validação.</p><a href="https://web.dev/case-studies/quintoandar" target="_blank" rel="noopener">Ler o estudo original</a></article></div><div class="bb-principle">Ao estudar um caso: identifique baseline, intervenção, medida, atribuição e limites. Nunca replique os percentuais como promessa de venda.</div></section>`;
  situ.after(cases);
  // Ordem por dependência: mercado, oferta, auditoria rápida, prospecção, vendas, produção, gestão e crescimento.
  const content=$('.content'), order=['m1','offers-master','m4','m2','m3','m5','m6','m7'];
  const footer=content?.querySelector('footer');
  if(content&&footer){order.map(id=>document.getElementById(id)).filter(Boolean).forEach((sec,i)=>{
    content.insertBefore(sec,footer);
    const eyebrow=sec.querySelector('header .eyebrow');if(eyebrow)eyebrow.textContent='MÓDULO '+String(i+1).padStart(2,'0')+' / 08';
    sec.querySelectorAll('.lesson .number').forEach((label,j)=>{label.textContent=(i+1)+'.'+(j+1);});
  });}
  const links=$$('.side nav a');
  const nav=$('.side nav');
  if(nav){const byId=Object.fromEntries(links.map(el=>[el.getAttribute('href').slice(1),el]));order.forEach((id,i)=>{const a=byId[id];if(a){a.querySelector('span').textContent=String(i+1).padStart(2,'0');nav.append(a);}});nav.insertAdjacentHTML('afterbegin','<a href="#primeira-missao" class="bb-first-nav">Começar agora</a><a href="#olho-de-aguia">Olho de Águia</a><a href="#situacoes">Abordagens por cenário</a><a href="#casos-reais">Casos documentados</a>');}
  if(nav){
    const toggle=document.createElement('button');toggle.className='bb-nav-toggle';toggle.type='button';
    toggle.textContent='Explorar capítulos e ferramentas';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','bluebook-nav');
    nav.id='bluebook-nav';nav.before(toggle);
    toggle.onclick=()=>{const next=!nav.classList.contains('bb-nav-open');nav.classList.toggle('bb-nav-open',next);toggle.setAttribute('aria-expanded',String(next));};
    nav.addEventListener('click',e=>{if(e.target.closest('a')&&matchMedia('(max-width:760px)').matches){nav.classList.remove('bb-nav-open');toggle.setAttribute('aria-expanded','false');}});
  }
  const from=new URLSearchParams(location.search), returnDay=Number(from.get('day'))||1;
  $$('.side .back').forEach(a=>{if(a.getAttribute('href')==='index.html#view-offers')a.setAttribute('href','index.html#offers');});
  // Todas as lições possuem tarefa aplicada e registro de evidência, em vez de um check de leitura.
  $$('.lesson').forEach((article,i)=>{
    const r=recipes[article.id];if(!r)return;
    const header=article.querySelector('.lessonhead');
    header?.querySelector('label')?.remove();
    header?.insertAdjacentHTML('beforeend','<button type="button" class="bb-expand" aria-expanded="false">Ver procedimento</button>');
    const old=article.querySelector('.lessonbody');if(old)old.hidden=true;
    const oldAction=article.querySelector('.action');if(oldAction)oldAction.hidden=true;
    const saved=records[article.id]||'';
    const work=document.createElement('div');work.className='bb-work';work.hidden=true;
    work.innerHTML=`<div class="bb-steps"><div class="bb-learn"><h4>FAÇA AGORA</h4><ol>${r.steps.map(s=>`<li>${safe(s)}</li>`).join('')}</ol></div><div class="bb-resolved"><h4>EXEMPLO RESOLVIDO</h4><p>${safe(r.example)}</p><h4>COMO SABER SE FEZ CERTO</h4><p>${safe(r.verify)}</p></div></div><div class="bb-pitfall"><strong>Não confunda:</strong> ${safe(r.trap)}</div><div class="bb-save"><label for="evidence-${safe(article.id)}">Sua evidência ou conclusão (não precisa conter dados privados)</label><textarea id="evidence-${safe(article.id)}" rows="2" placeholder="Registre o que observou, decidiu ou produziu...">${safe(saved)}</textarea><div><button class="bb-action" type="button" data-evidence="${safe(article.id)}">Salvar prática</button><a href="index.html#plan&day=${returnDay}" class="bb-action secondary">Retomar trilha</a><span class="bb-save-status" aria-live="polite">${saved?'Prática registrada':''}</span></div></div><details class="bb-reference"><summary>Ver notas complementares da versão anterior</summary></details>`;
    if(old){old.hidden=false;work.querySelector('.bb-reference').append(old);}
    article.append(work);
    const button=header?.querySelector('.bb-expand');
    button.onclick=()=>{const show=work.hidden;work.hidden=!show;button.textContent=show?'Ocultar procedimento':'Ver procedimento';button.setAttribute('aria-expanded',String(show));};
    work.querySelector('[data-evidence]').onclick=()=>{const val=work.querySelector('textarea').value.trim();const feedback=work.querySelector('.bb-save-status');if(val.length<12){feedback.textContent='Descreva a evidência em pelo menos 12 caracteres.';return;}records[article.id]=val;save(KEY,records);feedback.textContent='Prática registrada neste navegador.';article.classList.add('applied');drawProgress();};
    if(saved)article.classList.add('applied');
  });
  function drawProgress(){const n=Object.keys(records).filter(k=>recipes[k]&&records[k]?.trim().length>=12).length,total=Object.keys(recipes).length;const p=$('#progress'),bar=$('#progressbar');if(p)p.textContent=n+' / '+total+' práticas registradas';if(bar)bar.style.width=Math.round(n/total*100)+'%';}drawProgress();
  const reset=$('#reset');if(reset){reset.textContent='Reiniciar leituras';reset.title='Não apaga práticas registradas.';}
  const search=$('#search');if(search){search.placeholder='Buscar tarefa, técnica, cenário ou nicho…';}
  // Links para passos específicos abrem a lição mesmo quando as tarefas são renderizadas em outra página.
  function openHash(){
    const id=decodeURIComponent(location.hash.slice(1));if(!id)return;
    const item=document.getElementById(id);if(!item)return;
    const work=item.querySelector('.bb-work');const expand=item.querySelector('.bb-expand');
    if(work&&expand&&work.hidden)expand.click();
    requestAnimationFrame(()=>item.scrollIntoView({block:'start',behavior:'instant'}));
  }
  window.addEventListener('hashchange',openHash);openHash();
  // Pesquisa de lições também deve funcionar para textos inseridos dinamicamente.
  const noresult=document.createElement('p');noresult.className='bb-noresults';noresult.hidden=true;noresult.textContent='Nenhuma lição encontrada. Experimente procurar por nicho, prospecção, oferta ou auditoria.';
  $('.toolbar')?.after(noresult);
  search?.addEventListener('input',()=>{const visible=$$('.lesson:not(.hidden)').length;noresult.hidden=Boolean(visible)||!search.value.trim();});
})();
// Carrega o laboratório progressivo após o conteúdo e as lições do Blue Book.
(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='conversion-audit.css?v=20261120-final';document.head.append(style);
  const script=document.createElement('script');script.src='conversion-audit.js?v=20261120-final';document.body.append(script);
})();
