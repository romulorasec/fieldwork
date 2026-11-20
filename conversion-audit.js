/* Fieldwork: auditoria progressiva, contextual por nicho e orientada por evidências. */
(() => {
  'use strict';
  const root = document.getElementById('audit-workbench');
  if (!root) return;

  const KEY = 'fieldwork-audits-v2'; // Mantém compatibilidade com registros anteriores e CRM.
  const HANDOFF = 'fieldwork-selected-audit';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const httpUrl = value => { try { const url = new URL(value); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  const newId = () => crypto.randomUUID?.() || 'audit-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const read = () => { try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const store = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; } };
  let audits = read().map((item, i) => ({...item, id: item.id || 'legacy-' + i + '-' + String(item.created || '').slice(0,10)}));
  if (audits.some(a => a.id.startsWith('legacy-'))) store(audits);

  const basics = [
    {id:'clarity',title:'Proposta de valor',question:'Em poucos segundos dá para entender o serviço, público, região e principal benefício?',why:'Sem clareza, o visitante pode não reconhecer que encontrou a empresa certa.',fix:'Reescrever a abertura com serviço, comprador, diferencial comprovável e próxima ação.',test:'Pedir a uma pessoa do público-alvo que explique o negócio após olhar a primeira tela.',weight:3},
    {id:'design',title:'Qualidade visual',question:'Fotos, tipografia, alinhamento e consistência transmitem a qualidade real do negócio?',why:'A apresentação influencia a percepção inicial de credibilidade, mas gosto pessoal não prova perda de vendas.',fix:'Melhorar legibilidade, consistência e imagens relevantes, sem mudar o visual por preferência pessoal.',test:'Comparar a compreensão e confiança de usuários reais nas alternativas.',weight:2},
    {id:'hierarchy',title:'Hierarquia visual',question:'A atenção vai naturalmente para informações importantes e para a próxima ação?',why:'Muitos elementos concorrentes podem dificultar localizar o que importa.',fix:'Dar prioridade visual ao serviço, à prova relevante e à ação principal.',test:'Observar se usuários encontram a ação sem orientação.',weight:2},
    {id:'copy',title:'Copywriting',question:'Os textos explicam benefícios concretos, dúvidas frequentes e objeções do cliente?',why:'Textos genéricos exigem que o visitante descubra sozinho se o serviço é adequado.',fix:'Trocar generalidades por benefícios, especificidades e respostas a objeções verificadas.',test:'Perguntar ao público o que entendeu e quais dúvidas permaneceram.',weight:2},
    {id:'cta',title:'Botões e CTAs',question:'O próximo passo é evidente, específico, clicável e coerente com a intenção do visitante?',why:'Uma ação escondida, vaga ou quebrada acrescenta fricção ao contato.',fix:'Dar destaque ao CTA certo, com destino funcional e texto específico.',test:'Executar o caminho até a ação em celular e desktop.',weight:3},
    {id:'structure',title:'Estrutura das seções',question:'A ordem das seções ajuda a escolher o serviço antes de pedir uma decisão?',why:'Uma sequência desorganizada pode apresentar o convite antes de responder dúvidas necessárias.',fix:'Reordenar serviço, benefícios, provas, processo e próxima ação conforme a jornada.',test:'Pedir a um visitante que encontre o serviço e explique o próximo passo.',weight:2},
    {id:'offer',title:'Oferta comercial',question:'Está claro por que escolher essa empresa e o que está incluído na próxima etapa?',why:'Sem diferenciação e expectativa clara, o visitante pode adiar a decisão.',fix:'Explicitar diferenciais reais, condições e entregáveis relevantes.',test:'Perguntar que diferença o visitante percebe em relação a alternativas.',weight:3},
    {id:'trust',title:'Confiança e provas',question:'Há avaliações verificáveis, trabalhos reais ou credenciais relevantes para esta escolha?',why:'Afirmações sem evidências podem não reduzir o risco percebido.',fix:'Exibir provas com contexto e fonte; nunca inventar números, avaliações ou credenciais.',test:'Verificar se o visitante identifica evidências suficientes para considerar o contato.',weight:3},
    {id:'forms',title:'Formulários e jornada',question:'É fácil iniciar e concluir contato, orçamento, reserva ou compra, sem etapas desnecessárias?',why:'Campos excessivos, erros e perda de contexto interrompem a jornada.',fix:'Reduzir etapas, preservar contexto e confirmar o recebimento da solicitação.',test:'Testar o envio autorizado de ponta a ponta, inclusive confirmação e destino.',weight:3},
    {id:'mobile',title:'Uso no celular',question:'Conteúdo, botões e navegação permanecem legíveis e utilizáveis em telas pequenas?',why:'Problemas de toque, corte e rolagem dificultam ações comuns no celular.',fix:'Ajustar layout, áreas de toque, fontes e espaçamento.',test:'Repetir tarefas essenciais em larguras móveis diferentes.',weight:3},
    {id:'speed',title:'Desempenho e acessibilidade',question:'A página carrega, responde e permanece estável, sem impedir navegação por teclado?',why:'Lentidão e mudanças de layout podem atrapalhar a experiência.',fix:'Investigar Core Web Vitals, imagens, scripts, contraste e foco.',test:'Verificar PageSpeed, dados de campo quando disponíveis e tarefas com teclado.',weight:2},
    {id:'measurement',title:'Mensuração e continuidade',question:'A empresa consegue acompanhar contatos qualificados e o que acontece depois deles?',why:'Sem dados confiáveis, fica difícil saber se a intervenção gerou impacto.',fix:'Definir eventos, origem dos leads e acompanhamento comercial com autorização.',test:'Validar eventos e, com o cliente, confrontar contatos com resultados do CRM.',weight:2}
  ];

  const item = (id, title, question, why, fix, test, weight = 3) => ({id:'n-' + id,title,question,why,fix,test,weight});
  const cloneAnswers = answers => Object.fromEntries(Object.entries(answers || {}).map(([key,value]) => [key,{status:value.status || 'unknown',note:String(value.note || '')}]));
  const profiles = [
    {name:'Roofing',goal:'Pedir inspeção ou orçamento',path:'Serviço → tipo de telhado → prova → orçamento',checks:[
      item('roof-service','Serviço e área atendida','A página distingue repair, replacement e inspection e informa onde atende?','O cliente precisa confirmar que o serviço e a localização combinam.','Separar os serviços e informar a área real de atuação.','Localizar tipo de serviço e cidade na navegação.'),
      item('roof-proof','Portfólio com contexto','Projetos mostram tipo de telhado, trabalho executado e imagens autênticas?','Fotos sem contexto deixam dúvidas sobre experiência específica.','Organizar trabalhos por tipo e explicar escopo real.','Solicitar que alguém encontre um projeto parecido com o seu.')
    ]},
    {name:'Remodeling',goal:'Solicitar consulta de projeto',path:'Especialidade → portfólio → processo → consulta',checks:[
      item('remodel-projects','Projetos comparáveis','O portfólio permite entender o tipo e a dimensão das reformas?','O comprador procura provas de adequação ao projeto que deseja.','Criar estudos curtos com escopo e fotos autorizadas.','Pedir que um visitante encontre um projeto relevante.'),
      item('remodel-fit','Qualificação sem excesso','O pedido de orçamento coleta apenas informações necessárias para avaliar o projeto?','Perguntas vagas ou demais campos podem gerar contato sem contexto.','Explicar etapas e solicitar informações essenciais.','Testar o formulário e a confirmação de envio.')
    ]},
    {name:'HVAC',goal:'Ligar para emergência ou agendar manutenção',path:'Urgência → disponibilidade → contato; manutenção → serviço → agenda',checks:[
      item('hvac-urgent','Urgência versus rotina','Reparo urgente e manutenção preventiva apresentam caminhos diferentes?', 'A intenção muda completamente a ação desejada.','Separar ligação urgente de agendamento não emergencial.','Simular busca urgente e busca de manutenção.'),
      item('hvac-hours','Horários e cobertura','Horários, disponibilidade verdadeira e cidades atendidas são fáceis de encontrar?', 'O usuário precisa saber se pode receber atendimento.','Mostrar cobertura e disponibilidade confirmadas, sem alegar atendimento 24h sem prova.','Encontrar horário e cidade em poucos passos.')
    ]},
    {name:'Plumbing',goal:'Ligar ou solicitar reparo',path:'Problema → disponibilidade → telefone',checks:[
      item('plumb-call','Telefone imediato','Um visitante com vazamento consegue ligar pelo celular sem copiar o número?', 'Em urgências, a etapa extra pode atrasar o contato.','Tornar o número visível e clicável nas páginas relevantes.','Testar link tel: em celular real.'),
      item('plumb-scope','Serviço e região','É claro quais reparos são feitos e onde há atendimento?', 'Sem isso, o visitante pode não saber se a empresa resolve seu problema.','Especificar tipos de serviço e cobertura real.','Encontrar reparo e área atendida sem procurar no rodapé.')
    ]},
    {name:'Electrical',goal:'Solicitar visita técnica',path:'Tipo de instalação → qualificação → orçamento',checks:[
      item('elec-type','Tipos de trabalho','Residencial, comercial e trabalhos especializados são distinguíveis?', 'Serviços misturados podem gerar confusão ou contatos inadequados.','Organizar páginas por necessidade real.','Encontrar o serviço indicado para um cenário concreto.'),
      item('elec-license','Credenciais relevantes','Licenças e informações de qualificação aplicáveis são apresentadas corretamente?', 'O comprador precisa avaliar competência e segurança.','Apresentar dados reais e verificáveis da empresa.','Checar a fonte e a identificação das credenciais.')
    ]},
    {name:'Odontologia',goal:'Marcar avaliação',path:'Tratamento → confiança → avaliação',checks:[
      item('dental-treat','Tratamentos claros','As páginas explicam tratamentos e expectativas sem promessas clínicas indevidas?', 'Pacientes precisam entender para que serve cada procedimento.','Explicar opções e dúvidas frequentes com revisão profissional.','Pedir ao paciente que identifique o tratamento relevante.'),
      item('dental-book','Agendamento com contexto','O agendamento preserva clínica, unidade e tratamento de interesse?', 'Perder contexto aumenta esforço e incerteza.','Ligar o CTA ao atendimento correto com informações claras.','Testar a reserva sem criar marcação real não autorizada.')
    ]},
    {name:'Med spas',goal:'Agendar consulta de tratamento',path:'Tratamento → profissional → expectativas → consulta',checks:[
      item('spa-cred','Segurança e expectativas','Há profissionais, condições e informações realistas sobre tratamentos?', 'O risco percebido é maior em procedimentos estéticos.','Mostrar credenciais verificáveis e explicar limites e consulta.','Verificar se a informação é específica e responsável.'),
      item('spa-book','Reserva específica','Cada tratamento conduz a uma próxima etapa coerente?', 'Uma agenda genérica pode confundir sobre o serviço reservado.','Manter tratamento e unidade identificados.','Simular o fluxo até antes da confirmação.')
    ]},
    {name:'Advocacia',goal:'Solicitar consulta inicial',path:'Área jurídica → experiência → consulta',checks:[
      item('law-area','Área de atuação','É claro quais casos o escritório realmente atende e em quais locais?', 'O visitante precisa saber se o profissional pode avaliar seu caso.','Distinguir especialidades e jurisdições aplicáveis.','Encontrar a área jurídica em um cenário específico.'),
      item('law-trust','Credibilidade sem garantia','Credenciais e processo de consulta aparecem sem garantia de resultado?', 'A decisão exige confiança e informação responsável.','Explicar qualificação, processo e limites da avaliação.','Conferir informações e regras profissionais aplicáveis.')
    ]},
    {name:'House cleaning',goal:'Solicitar orçamento de limpeza',path:'Tipo de limpeza → inclusões → confiança → orçamento',checks:[
      item('clean-scope','Escopo e frequência','O site distingue deep, standard e move-out cleaning e o que inclui?', 'Serviços genéricos não ajudam o cliente a comparar opções.','Descrever inclusões reais e frequências.','Encontrar uma modalidade e compreender o serviço.'),
      item('clean-trust','Confiança para entrar no imóvel','Há fotos reais, avaliações verificáveis e informações de segurança corretas?', 'O cliente precisa confiar na equipe que entrará na casa.','Apresentar provas autênticas e condições comprovadas.','Identificar quais evidências justificam a confiança.')
    ]},
    {name:'Restaurantes',goal:'Fazer pedido, reservar ou planejar visita',path:'Cardápio → escolha → pedido, reserva ou rota',checks:[
      item('food-menu','Cardápio utilizável','O cliente consegue ler pratos e preços no celular sem PDF ilegível?', 'O cardápio é parte central da decisão.','Apresentar menu acessível e atualizado.','Encontrar prato, preço e informações relevantes no celular.'),
      item('food-order','Pedido e visita sem confusão','Pedido, reserva, localização e horários levam aos destinos corretos?', 'Links quebrados ou ações misturadas interrompem tarefas diferentes.','Separar pedidos, reservas e direções, com horários corretos.','Percorrer uma jornada de pedido e outra de visita.')
    ]}
  ];

  const quick = ['clarity','cta','trust','mobile'];
  const englishGoals = {
    Roofing:'request an inspection or quote',Remodeling:'request a project consultation',HVAC:'call for urgent help or schedule maintenance',
    Plumbing:'call about a repair',Electrical:'request a technician visit',Odontologia:'book an evaluation',
    'Med spas':'book a treatment consultation',Advocacia:'request an initial consultation',
    'House cleaning':'request a cleaning quote',Restaurantes:'place an order, reserve a table or plan a visit'
  };
  const profile = name => profiles.find(p => p.name === name) || profiles[0];
  const criteria = () => {
    const common = draft.mode === 'full' ? basics : basics.filter(c => quick.includes(c.id));
    return [...common, ...profile(draft.niche).checks];
  };
  const fresh = () => ({id:null,company:'',url:'',proofUrl:'',niche:'Roofing',device:'mobile',mode:'quick',answers:{}});
  let draft = fresh();
  let report = null;

  function render() {
    const checks = criteria();
    root.innerHTML = `
      <div class="ca-mode" role="group" aria-label="Profundidade da auditoria">
        <button type="button" data-mode="quick" aria-pressed="${draft.mode === 'quick'}">Diagnóstico rápido <small>Comece aqui</small></button>
        <button type="button" data-mode="full" aria-pressed="${draft.mode === 'full'}">Auditoria completa <small>Quando precisar aprofundar</small></button>
      </div>
      <form id="ca-form" class="ca-form">
        <div class="ca-form-head"><div><h3>1. Qual empresa vamos analisar?</h3><p>Use um negócio real. Você não precisa contactar ninguém nesta etapa.</p></div><span class="ca-count" id="ca-count" aria-live="polite"></span></div>
        <div class="ca-fields">
          <label>Empresa <input name="company" required maxlength="120" placeholder="Ex.: ABC Plumbing" value="${esc(draft.company)}" autocomplete="off"></label>
          <label>Nicho <select name="niche">${profiles.map(p => `<option value="${esc(p.name)}" ${p.name === draft.niche ? 'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>
          <label class="ca-wide">Site ou perfil público <input name="url" type="url" required placeholder="https://..." value="${esc(draft.url)}" inputmode="url"></label>
          <label>Onde você verificou? <select name="device"><option value="mobile" ${draft.device === 'mobile' ? 'selected':''}>Celular</option><option value="desktop" ${draft.device === 'desktop' ? 'selected':''}>Desktop</option></select></label>
          <div class="ca-goal"><span>Conversão que importa</span><strong>${esc(profile(draft.niche).goal)}</strong></div>
        </div>
        <details class="ca-proof"><summary>Tenho captura de tela ou vídeo (opcional)</summary><label for="ca-proof-url">Link da evidência visual</label><input id="ca-proof-url" name="proofUrl" type="url" placeholder="https://..." value="${esc(draft.proofUrl)}"><small>Não é obrigatório. A descrição do fato já permite começar.</small></details>
        <div class="ca-form-head ca-check-head"><div><h3>2. O que você conseguiu observar?</h3><p>Marque só o que verificou. Se encontrou um problema, descreva o fato. Não precisa preencher todos.</p></div></div>
        <div class="ca-checks">${checks.map(check => renderCriterion(check)).join('')}</div>
        <div class="ca-actions"><button class="bb-action" type="submit">Gerar diagnóstico e próximo passo</button><p>Sem notas artificiais ou promessas de vendas. Você poderá aprofundar ou editar depois.</p></div>
        <p id="ca-feedback" class="ca-feedback" role="status" aria-live="polite"></p>
      </form>
      <div id="ca-result" class="ca-result" aria-live="polite"></div>
      <div id="ca-history" class="ca-history"></div>`;
    root.querySelector('[name="niche"]').value = draft.niche;
    updateProgress();
    renderHistory();
    if (report) renderReport();
  }

  function renderCriterion(c) {
    const a = draft.answers[c.id] || {status:'unknown',note:''};
    const status = a.status || 'unknown';
    return `<fieldset class="ca-criterion" data-check="${esc(c.id)}"><legend>${esc(c.title)}</legend>
      <p>${esc(c.question)}</p>
      <div class="ca-options" aria-label="Resultado: ${esc(c.title)}">
        ${[['problem','Vi um problema'],['good','Está adequado'],['unknown','Ainda não verifiquei']].map(([value,label]) => `<label class="ca-option"><input type="radio" name="status-${esc(c.id)}" value="${value}" ${status === value ? 'checked':''}><span>${label}</span></label>`).join('')}
      </div>
      <div class="ca-evidence" ${status === 'problem' ? '' : 'hidden'}><label for="note-${esc(c.id)}">O que exatamente aconteceu? <span>Uma frase objetiva já basta.</span></label><textarea id="note-${esc(c.id)}" data-note="${esc(c.id)}" rows="2" placeholder="Ex.: o botão 'Call Now' não abre a ligação no meu celular.">${esc(a.note || '')}</textarea><p class="ca-hint">Evite afirmar perda de vendas sem dados. <a href="${c.id.startsWith('n-') ? '#diagnostico-e-auditoria-2' : '#diagnostico-e-auditoria-1'}">Como verificar</a></p></div>
    </fieldset>`;
  }

  function updateProgress() {
    const list = criteria();
    const checked = list.filter(c => ['good','problem'].includes(draft.answers[c.id]?.status)).length;
    const progress = document.getElementById('ca-count');
    if (progress) progress.textContent = `${checked} de ${list.length} verificados`;
  }

  const observed = c => (draft.answers[c.id]?.note || '').trim();
  const findings = () => criteria().filter(c => draft.answers[c.id]?.status === 'problem').map(c => ({...c,note:observed(c),supported:observed(c).length >= 12})).sort((a,b) => (b.supported - a.supported) || b.weight - a.weight);
  const suggestion = validated => {
    if (!validated.length) return {label:'Não recomendar intervenção ainda',type:'',next:'Verifique a jornada e converse com o proprietário antes de apresentar uma oferta.'};
    const structural = validated.filter(f => ['clarity','structure','offer','forms'].includes(f.id)).length;
    if (structural >= 2 && validated.length >= 3) return {label:'Explorar otimização de página ou redesign parcial',type:'Redesign',next:'Confirmar a prioridade com o dono e delimitar a página ou jornada antes de orçar.'};
    return {label:'Explorar correção de conversão com escopo enxuto',type:'Auditoria/correção',next:'Validar a importância do problema e oferecer a menor correção que possa ser testada.'};
  };

  function buildReport() {
    const list = criteria();
    const flagged = findings();
    const validated = flagged.filter(f => f.supported);
    const gaps = flagged.filter(f => !f.supported);
    const good = list.filter(c => draft.answers[c.id]?.status === 'good').length;
    const unknown = list.length - flagged.length - good;
    const offer = suggestion(validated);
    const top = validated.slice(0,3);
    const headline = top.length ? `${top.length} achado(s) com descrição verificável` : 'Nenhuma oportunidade documentada ainda';
    const text = [
      `DIAGNÓSTICO DE CONVERSÃO | ${draft.company}`,
      `Site: ${draft.url} | Nicho: ${draft.niche} | Dispositivo: ${draft.device === 'mobile' ? 'celular' : 'desktop'}`,
      `Data da análise: ${new Date().toLocaleDateString('pt-BR')}`,
      ...(httpUrl(draft.proofUrl) ? [`Captura ou vídeo: ${httpUrl(draft.proofUrl)}`] : []),
      `Objetivo: ${profile(draft.niche).goal}`,
      `Avaliação ${draft.mode === 'quick' ? 'rápida' : 'completa'}: ${good} adequados, ${flagged.length} marcados como problema, ${unknown} não verificados.`,
      '',
      ...top.flatMap((f,i) => [
        `${i+1}. ${f.title}: ${f.note}`,
        `Risco a validar: ${f.why}`,
        `Melhoria possível: ${f.fix}`,
        `Como testar: ${f.test}`,'']),
      ...(!top.length ? ['Sem evidência suficiente para recomendar uma intervenção. Faça mais uma verificação ou converse com o negócio.',''] : []),
      ...(gaps.length ? [`Pendências: ${gaps.map(f => f.title).join(', ')} (faltam descrições reproduzíveis).`,''] : []),
      `Próxima hipótese comercial: ${offer.label}.`,
      offer.next,
      'Nota: uma fricção observada não comprova perda de clientes nem aumento futuro de conversões.'
    ].join('\n');
    const first = top[0];
    const message = first
      ? `Hi [First Name],\n\nI checked ${draft.company}'s website on ${draft.device === 'mobile' ? 'mobile' : 'desktop'} and noticed this specific issue:\n\n“${first.note.trim().replace(/\s+/g,' ').slice(0,240)}${first.note.trim().length > 240 ? '…' : ''}”\n\nThis may create friction for someone trying to ${englishGoals[draft.niche]}. I have a focused improvement in mind that we could test without assuming you need a complete rebuild.\n\nWould it help if I sent you a 60-second walkthrough showing the issue and the possible fix?\n\n[Your Name]`
      : '';
    return {headline,flagged,validated,gaps,good,unknown,offer,text,message};
  }

  function renderReport() {
    const result = document.getElementById('ca-result');
    if (!result || !report) return;
    const {validated,gaps,good,unknown,offer} = report;
    result.innerHTML = `<section class="ca-report" aria-labelledby="ca-report-title">
      <div class="ca-report-head"><span class="ca-eyebrow">DIAGNÓSTICO DOCUMENTADO</span><h3 id="ca-report-title">${esc(draft.company)}</h3><p>${esc(profile(draft.niche).goal)}</p></div>
      <div class="ca-totals"><span><strong>${validated.length}</strong> achado(s) descritos</span><span><strong>${good}</strong> adequados</span><span><strong>${unknown}</strong> não verificados</span></div>
      ${httpUrl(draft.proofUrl) ? `<p class="ca-proof-link"><a href="${esc(httpUrl(draft.proofUrl))}" target="_blank" rel="noopener noreferrer">Abrir captura ou vídeo registrado</a></p>` : ''}
      ${validated.length ? `<div class="ca-findings">${validated.slice(0,3).map(f => `<article class="ca-finding"><span class="ca-eyebrow">${f.weight === 3 ? 'PRIORIDADE A INVESTIGAR' : 'OPORTUNIDADE A AVALIAR'}</span><h4>${esc(f.title)}</h4><p><strong>O que foi visto:</strong> ${esc(f.note)}</p><p><strong>Por que importa:</strong> ${esc(f.why)}</p><p><strong>Melhoria possível:</strong> ${esc(f.fix)}</p><p><strong>Como validar:</strong> ${esc(f.test)}</p></article>`).join('')}</div>` : `<div class="ca-neutral"><strong>Sem diagnóstico negativo forçado.</strong><p>Não há observação suficientemente descrita para sustentar uma oferta. Isso também é um resultado válido.</p></div>`}
      ${gaps.length ? `<p class="ca-pending">${gaps.length} problema(s) marcado(s) ainda sem descrição concreta. Abra o diagnóstico e complete a evidência antes de citar isso ao prospect.</p>` : ''}
      <div class="ca-recommend"><span class="ca-eyebrow">PRÓXIMA DECISÃO</span><h4>${esc(offer.label)}</h4>${validated.length ? `<p><strong>Primeira melhoria a considerar:</strong> ${esc(validated[0].fix)}</p>` : ''}<p>${esc(offer.next)}</p><small>Recomendação preliminar, não prova de impacto nem orçamento fechado.</small></div>
      ${report.message ? `<details class="ca-outreach"><summary>Ver abordagem personalizada para o prospect (inglês)</summary><p>O texto incorpora sua observação literalmente. Revise e traduza a frase citada se ela foi escrita em português, antes de enviar.</p><pre>${esc(report.message)}</pre></details>` : ''}
      <div class="ca-report-actions"><button class="bb-action" type="button" data-copy="report">Copiar relatório</button><button class="bb-action secondary" type="button" data-copy="message" ${!report.message ? 'disabled' : ''}>Copiar abordagem em inglês</button><button class="bb-action secondary" type="button" data-crm>Levar ao CRM</button><button class="ca-link" type="button" data-deepen>Aprofundar a análise</button></div>
      <p class="ca-feedback" id="ca-copy-feedback" aria-live="polite"></p>
    </section>`;
  }

  function renderHistory() {
    const element = document.getElementById('ca-history');
    if (!element) return;
    element.innerHTML = `<div class="ca-history-head"><h3>Diagnósticos salvos</h3><button type="button" class="ca-link" data-new>Novo diagnóstico</button></div>` +
      (audits.length ? `<ul>${audits.slice(0,6).map(a => `<li><div><strong>${esc(a.company || 'Sem nome')}</strong><small>${esc(a.niche || '')} · ${esc(a.observation || 'Sem observação registrada')}</small></div><div class="ca-history-actions"><button type="button" data-open="${esc(a.id)}">${a.version === 3 ? 'Reabrir' : 'Ver registro'}</button><button type="button" data-send="${esc(a.id)}">CRM</button></div></li>`).join('')}</ul>` : '<p>Seu primeiro diagnóstico aparecerá aqui. Você pode começar com apenas uma observação real.</p>');
  }

  function saveReport() {
    const result = buildReport();
    const first = result.validated[0];
    const record = {
      id: draft.id || newId(), version:3,
      company:draft.company.trim(),url:draft.url.trim(),niche:draft.niche,
      device:draft.device,mode:draft.mode,proofUrl:httpUrl(draft.proofUrl),answers:cloneAnswers(draft.answers),
      state:result.validated.length ? 'friction' : 'good',
      observation:first?.note || 'Nenhuma fricção confirmada nesta análise',
      recommendation:result.offer.type,action:result.offer.next,
      created:audits.find(a => a.id === draft.id)?.created || new Date().toISOString(),
      updated:new Date().toISOString()
    };
    const next = [record,...audits.filter(a => a.id !== record.id)];
    if (!store(next)) {
      document.getElementById('ca-feedback').textContent = 'Não foi possível salvar neste navegador. Você ainda pode copiar o relatório.';
    } else {
      audits = next;
      document.getElementById('ca-feedback').textContent = 'Diagnóstico salvo. O próximo passo já está no relatório abaixo.';
    }
    draft.id = record.id;
    report = result;
    renderReport();
    renderHistory();
    document.getElementById('ca-result')?.scrollIntoView({block:'start',behavior:'smooth'});
  }

  async function copy(value) {
    try { await navigator.clipboard.writeText(value); return true; }
    catch {
      const area = document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();
      let ok=false;try { ok=document.execCommand('copy'); } catch { /* Seleção manual permanece possível. */ }
      area.remove();return ok;
    }
  }

  function sendToCRM(id) {
    try { sessionStorage.setItem(HANDOFF,id); }
    catch { /* O CRM mantém registro manual se storage estiver bloqueado. */ }
    location.href = 'index.html#crm';
  }

  root.addEventListener('input', event => {
    const el = event.target;
    if (el.name && ['company','url','proofUrl'].includes(el.name)) draft[el.name] = el.value;
    if (el.dataset.note) {
      const answer = draft.answers[el.dataset.note] || {status:'problem'};
      answer.note = el.value;draft.answers[el.dataset.note] = answer;
    }
    if (report) {report = null;document.getElementById('ca-result').innerHTML = '';}
  });

  root.addEventListener('change', event => {
    const el = event.target;
    if (el.name === 'niche') {draft.niche = el.value;report = null;render();return;}
    if (el.name === 'device') {draft.device = el.value;return;}
    if (el.type === 'radio' && el.name.startsWith('status-')) {
      const id = el.name.slice(7);
      const answer = draft.answers[id] || {note:''};answer.status = el.value;draft.answers[id] = answer;
      const evidence = el.closest('.ca-criterion')?.querySelector('.ca-evidence');
      if (evidence) evidence.hidden = el.value !== 'problem';
      updateProgress();
    }
  });

  root.addEventListener('submit', event => {
    if (event.target.id !== 'ca-form') return;
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    saveReport();
  });

  root.addEventListener('click', async event => {
    const button = event.target.closest('button');if (!button) return;
    if (button.dataset.mode) {draft.mode = button.dataset.mode === 'full' ? 'full' : 'quick';report = null;render();return;}
    if (button.dataset.new !== undefined) {draft = fresh();report = null;render();document.getElementById('primeira-missao')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
    if (button.dataset.open) {
      const saved = audits.find(a => a.id === button.dataset.open);
      if (!saved) return;
      if (saved.version !== 3) {document.getElementById('ca-feedback').textContent=`Registro anterior: ${saved.observation || 'sem observação detalhada'}. Para refazer a análise, inicie um novo diagnóstico.`;return;}
      draft = {...fresh(),...saved,answers:cloneAnswers(saved.answers || {})};report = buildReport();render();document.getElementById('primeira-missao')?.scrollIntoView({block:'start',behavior:'smooth'});return;
    }
    if (button.dataset.send) {sendToCRM(button.dataset.send);return;}
    if (button.dataset.crm !== undefined) {sendToCRM(draft.id);return;}
    if (button.dataset.deepen !== undefined) {draft.mode='full';report = null;render();document.getElementById('ca-form')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
    if (button.dataset.copy) {
      const value = button.dataset.copy === 'report' ? report?.text : report?.message;
      if (!value) return;
      const ok = await copy(value);
      document.getElementById('ca-copy-feedback').textContent = ok ? 'Copiado. Revise o conteúdo antes de enviar.' : 'Não foi possível copiar automaticamente.';
    }
  });

  function renderNiches() {
    const panel = document.getElementById('olho-de-aguia');if (!panel) return;
    panel.innerHTML = `<header><span class="eyebrow">DIAGNÓSTICO POR CONTEXTO</span><h2>Olho de Águia: dez nichos, jornadas diferentes.</h2><p>Não julgue apenas pela aparência. Cada setor tem uma tarefa comercial principal e perguntas específicas que merecem verificação.</p></header>
      <div class="bb-sector-grid ca-niche-grid">${profiles.map(p => `<article><span class="ca-eyebrow">${esc(p.goal)}</span><h3>${esc(p.name)}</h3><p><strong>Jornada:</strong> ${esc(p.path)}</p><ul>${p.checks.map(c => `<li>${esc(c.title)}: ${esc(c.question)}</li>`).join('')}</ul><button type="button" data-select-niche="${esc(p.name)}" class="bb-action secondary">Auditar este nicho</button></article>`).join('')}</div>
      <p class="bb-principle">Uma ausência ou fricção observada não prova que a empresa precisa de um site novo. Primeiro investigue o caminho de contato que ela realmente usa.</p>`;
    panel.addEventListener('click', event => {
      const chosen = event.target.closest('[data-select-niche]');if (!chosen) return;
      draft.niche=chosen.dataset.selectNiche;report=null;render();document.getElementById('primeira-missao')?.scrollIntoView({block:'start',behavior:'smooth'});
    });
  }

  function renderGuide() {
    const anchor=document.getElementById('olho-de-aguia');if(!anchor)return;
    const section=document.createElement('section');section.className='bb-library ca-guide';section.id='guia-de-conversao';
    section.innerHTML=`<header><span class="eyebrow">BLUE BOOK / CRO APLICADO</span><h2>Como reconhecer uma oportunidade de conversão.</h2><p>Analise a tarefa do cliente antes de analisar elementos visuais. O objetivo é produzir uma recomendação defendida por evidências, não pressionar alguém a comprar.</p></header>
      <div class="ca-steps"><article><b>01</b><h3>Defina a tarefa</h3><p>Exemplo: alguém com um vazamento precisa ligar. Alguém planejando uma reforma quer avaliar trabalhos e solicitar uma consulta. O mesmo CTA não serve às duas situações.</p></article><article><b>02</b><h3>Observe sem presumir</h3><p>Abra o site no dispositivo relevante. Tente cumprir a tarefa. Registre exatamente a tela, o elemento, o que aconteceu e em que URL ocorreu.</p></article><article><b>03</b><h3>Explique o risco</h3><p>Conecte o problema à ação que ele dificulta. Diga “pode atrasar a ligação”, não “você perde 40% dos clientes”. A segunda frase depende de dados que você não tem.</p></article><article><b>04</b><h3>Proponha e valide</h3><p>Sugira a menor intervenção testável. Depois, com autorização, meça ligações, solicitações qualificadas ou compras. Se a causa for atendimento ou tráfego, talvez o redesign não seja a solução.</p></article></div>
      <h3>Doze critérios. Abra somente o que precisar.</h3>
      <div class="ca-lessons">${basics.map(c => `<details><summary>${esc(c.title)} <span>Como avaliar</span></summary><div><p><strong>Pergunte:</strong> ${esc(c.question)}</p><p><strong>Por quê:</strong> ${esc(c.why)}</p><p><strong>Como melhorar:</strong> ${esc(c.fix)}</p><p><strong>Como testar:</strong> ${esc(c.test)}</p></div></details>`).join('')}</div>
      <div class="ca-case"><span class="ca-eyebrow">ESTUDO GUIADO: PLUMBING</span><h3>De um sinal visual a uma proposta comercial</h3><ol><li><strong>Contexto:</strong> visitante usa o celular procurando reparo de vazamento.</li><li><strong>Achado hipotético:</strong> o número aparece em texto, sem link de chamada.</li><li><strong>Evidência necessária:</strong> captura, URL, modelo de teste e tentativa de tocar no número.</li><li><strong>Hipótese:</strong> a etapa extra pode atrasar o contato em uma urgência.</li><li><strong>Intervenção:</strong> link de ligação funcional e CTA visível no fluxo de emergência.</li><li><strong>Validação:</strong> confirmar o clique e, quando possível, analisar chamadas qualificadas com dados autorizados.</li></ol><p><strong>Oferta possível:</strong> correção focada da jornada mobile, não rebuild automático do site inteiro.</p></div>
      <p class="ca-resources">Fundamentação: <a href="https://www.nngroup.com/articles/homepage-design-principles/" target="_blank" rel="noopener">Nielsen Norman Group</a>, <a href="https://support.google.com/google-ads/answer/6238826" target="_blank" rel="noopener">Google Ads</a>, <a href="https://web.dev/articles/vitals" target="_blank" rel="noopener">Core Web Vitals</a> e <a href="https://baymard.com/research/checkout-usability" target="_blank" rel="noopener">Baymard Institute</a>. A importância de cada critério varia com nicho e intenção.</p>`;
    anchor.after(section);
    document.getElementById('bluebook-nav')?.insertAdjacentHTML('afterbegin','<a href="#guia-de-conversao">Guia de conversão</a>');
  }

  render();renderNiches();renderGuide();
  if (location.hash === '#primeira-missao') requestAnimationFrame(() => document.getElementById('primeira-missao')?.scrollIntoView({block:'start'}));
})();
