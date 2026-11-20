/* Fieldwork: onboarding, navegação contextual e CRM com comprovação. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=(name)=>{
    const p={
      home:'<path d="M3 10l9-7 9 7v11H3z"/><path d="M9 21v-7h6v7"/>',
      list:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 13h8M8 18h5"/>',
      search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
      chart:'<path d="M4 20V10M10 20V4M16 20v-9M22 20v-5"/>',
      menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
    };return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p[name]+'</svg>';
  };
  const routes=['overview','market','strategy','offers','plan','simulator','crm','scripts','sources'];
  function go(v,day){
    if(!routes.includes(v))return;
    if(day&&Number.isFinite(day)&&day>=1&&day<=30){
      const grid=$('#day-grid [data-day="'+day+'"]');
      if(grid)grid.click();
    }
    $('.navlink[data-view="'+v+'"]')?.click();
  }
  function route(){
    const hash=decodeURIComponent(location.hash.slice(1));
    if(!hash)return;
    let [view,...parts]=hash.split('&');
    if(view.startsWith('view-'))view=view.slice(5);
    if(!routes.includes(view))return;
    const dayarg=parts.find(s=>s.startsWith('day=')),day=dayarg?Number(dayarg.slice(4)):null;
    go(view,day);
  }
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>history.replaceState(null,'','#'+el.dataset.view)));
  $$('[data-go]').forEach(el=>el.addEventListener('click',()=>history.replaceState(null,'','#'+el.dataset.go)));
  window.addEventListener('hashchange',route);
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-jump]');
    if(button){go(button.dataset.jump);history.replaceState(null,'','#'+button.dataset.jump);}
  });
  // Não crie três caminhos concorrentes. A primeira ação é o ponto de partida.
  const hero=$('.fw-home-intro');
  if(hero){
    hero.outerHTML=`<section class="fw-new-home" aria-labelledby="fieldwork-home-title">
      <div>
        <span class="eyebrow">FIELDWORK / APRENDER A VENDER WEBSITES QUE CONVERTEM</span>
        <h1 id="fieldwork-home-title">Seu próximo cliente começa com uma boa observação.</h1>
        <p>Pesquise uma empresa real, encontre um obstáculo verificável no caminho até o contato e descubra se há um problema que vale resolver. O Blue Book ensina. A trilha organiza. O CRM acompanha.</p>
        <div class="fw-new-actions"><a class="primary" href="bluebook.html#primeira-missao">Começar meu primeiro diagnóstico</a><button class="secondary" type="button" data-jump="plan">Continuar trilha de 30 dias</button></div>
        <p class="fw-status-note" style="color:#b1d3d5">Meta de 10 contratos em 30 dias: desafio comercial, não previsão. Uma boa análise também pode concluir que não existe oportunidade.</p>
      </div>
      <aside class="fw-start-steps" aria-label="Primeiros passos"><strong>Primeira sessão · cerca de 30 minutos</strong><ol><li>Entenda o que é conversão para um negócio local.</li><li>Escolha um nicho e pesquise três empresas.</li><li>Documente um problema ou a ausência de evidência.</li><li>Salve o diagnóstico e defina a próxima ação.</li></ol></aside>
    </section>`;
  }
  $('.fw-section-heading')?.insertAdjacentHTML('beforebegin',`<div class="fw-home-connections"><a href="bluebook.html#olho-de-aguia">Olho de Águia: 10 nichos</a><a href="bluebook.html#situacoes">Abordagem por situação</a><a href="bluebook.html#casos-reais">Estudos de caso</a><button type="button" data-jump="crm">Abrir CRM</button><p>Escolha conteúdo apenas se ele ajudar a resolver sua próxima tarefa. Cada missão tem um link direto para o procedimento.</p></div>`);
  $('.fw-section-heading')?.remove();
  $('.fw-entry-grid')?.remove();$('.fw-bridge')?.remove();
  // Organização da barra lateral por trabalho realizado; ferramentas secundárias ficam recolhidas.
  const side=$('.sidebar');
  if(side){
    const titles={overview:'Hoje',market:'Pesquisa de mercado',strategy:'Posicionamento',offers:'Ofertas',plan:'Missões · 30 dias',simulator:'Simulador de cenários',crm:'Prospects e CRM',scripts:'Mensagens comerciais',sources:'Fontes e método'};
    $$('[data-view]').filter(x=>x.classList.contains('navlink')).forEach(b=>{const t=titles[b.dataset.view];if(!t)return;const node=[...b.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());if(node)node.textContent=t;});
    const library=side.querySelector('a[href="bluebook.html"]');if(library){library.lastChild.textContent='Blue Book · Biblioteca';}
    const advanced=document.createElement('details');advanced.className='fw-advanced';advanced.innerHTML='<summary>Pesquisa e ferramentas</summary>';
    ['market','strategy','simulator','sources'].forEach(v=>{const el=side.querySelector('.navlink[data-view="'+v+'"]');if(el)advanced.append(el);});
    const foot=side.querySelector('.side-note');if(foot)side.insertBefore(advanced,foot);
  }
  // Menu realmente navegável em telefones, sem dez links ocultos num scroll horizontal.
  const mobile=document.createElement('nav');mobile.className='fw-mobile-nav';mobile.setAttribute('aria-label','Navegação móvel');
  mobile.innerHTML=[['overview','Hoje','home'],['plan','Missões','list'],['crm','Prospects','search'],['scripts','Vendas','chart']].map(([v,n,ic])=>`<button type="button" data-mobile-go="${v}">${icon(ic)}<span>${n}</span></button>`).join('')+`<button type="button" id="mobile-menu" aria-expanded="false" aria-controls="mobile-drawer">${icon('menu')}<span>Mais</span></button>`;
  const backdrop=document.createElement('div');backdrop.className='fw-mobile-backdrop';backdrop.id='mobile-backdrop';backdrop.hidden=true;
  const drawer=document.createElement('aside');drawer.className='fw-mobile-drawer';drawer.id='mobile-drawer';drawer.hidden=true;
  drawer.innerHTML='<strong>Explorar Fieldwork</strong><a href="bluebook.html#primeira-missao">Primeiro diagnóstico</a><a href="bluebook.html#olho-de-aguia">Olho de Águia</a><a href="bluebook.html#situacoes">Abordagens por cenário</a><a href="bluebook.html">Blue Book completo</a><button data-mobile-go="offers" type="button">Ofertas e laboratório</button><button data-mobile-go="market" type="button">Pesquisa de mercado</button><button data-mobile-go="strategy" type="button">Posicionamento</button><button data-mobile-go="simulator" type="button">Simulador</button><button data-mobile-go="sources" type="button">Fontes e método</button>';
  document.body.append(backdrop,drawer,mobile);
  function closeDrawer(){drawer.hidden=true;backdrop.hidden=true;$('#mobile-menu').setAttribute('aria-expanded','false');}
  $('#mobile-menu').addEventListener('click',()=>{const next=drawer.hidden;drawer.hidden=!next;backdrop.hidden=!next;$('#mobile-menu').setAttribute('aria-expanded',String(next));});
  backdrop.addEventListener('click',closeDrawer);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
  $$('[data-mobile-go]').forEach(b=>b.addEventListener('click',()=>{closeDrawer();go(b.dataset.mobileGo);history.replaceState(null,'','#'+b.dataset.mobileGo);}));
  function markMobile(){const view=$('.view.active')?.id.replace('view-','');$$('[data-mobile-go]').forEach(b=>view===b.dataset.mobileGo?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));}
  const navObserver=new MutationObserver(markMobile);navObserver.observe($('.content'),{subtree:true,attributes:true,attributeFilter:['class']});markMobile();
  // Estrutura do diagnóstico faz parte da venda: dados do problema, não apenas nome e ticket.
  const leadForm=$('#lead-form');
  if(leadForm){
    const extra=document.createElement('div');extra.className='form-row';extra.innerHTML=`<div><label class="label" for="lead-url">Website ou perfil público</label><input class="input" id="lead-url" type="url" placeholder="https://..."></div><div><label class="label" for="lead-state">Situação</label><select id="lead-state"><option value="friction">Site com possível fricção</option><option value="none">Sem website encontrado</option><option value="good">Site aparentemente bom</option><option value="expansion">Expansão ou novo serviço</option></select></div><div><label class="label" for="lead-contact">Contato profissional</label><input class="input" id="lead-contact" placeholder="E-mail ou telefone profissional"></div><div><label class="label" for="lead-action">Próxima ação</label><input class="input" id="lead-action" placeholder="Enviar vídeo de auditoria"></div></div>`;
    leadForm.insertBefore(extra,leadForm.querySelector('button[type=submit]'));
    // Continuidade da primeira missão: reaproveitar evidência sem gerar lead automaticamente.
    try{
      const audits=JSON.parse(localStorage.getItem('fieldwork-audits-v2')||'[]');
      const current=JSON.parse(localStorage.getItem('fieldwork-10x30-v1')||'{}');
      const next=audits.find(a=>a.company&&!current.leads?.some(l=>l.name.toLowerCase()===a.company.toLowerCase()));
      if(next){
        $('#lead-name').value=next.company;$('#lead-niche').value=next.niche||'';
        $('#lead-url').value=next.url||'';$('#lead-state').value=next.state||'friction';
        $('#lead-note').value=(next.observation||'').slice(0,250);
        leadForm.insertAdjacentHTML('afterbegin','<p class="fw-prefill-note">Diagnóstico recuperado do Blue Book. Confira os dados, escolha uma próxima ação e registre o prospect.</p>');
      }
    }catch{/* Sem diagnóstico salvo neste navegador. */}
  }
  // A trilha mostra ajuda contextual para cada missão, inclusive quando muda de dia.
  function lessonFor(day,index,label){
    if(day===1)return ['inteligencia-de-mercado-1','diagnostico-e-auditoria-1','inteligencia-de-mercado-4','ofertas-1'][index];
    if(day===2)return ['ofertas-4','gestao-comercial-e-financeira-3','producao-e-entrega-1','ofertas-5'][index];
    if(day===3)return ['ofertas-5','prospeccao-e-aquisicao-4','prospeccao-e-aquisicao-5','gestao-comercial-e-financeira-1'][index];
    if(day===7||day===14||day===21||day===30)return 'analise-e-crescimento-4';
    const s=label.toLowerCase();
    if(/upwork|proposta upwork/.test(s))return 'prospeccao-e-aquisicao-5';
    if(/parceir/.test(s))return 'prospeccao-e-aquisicao-7';
    if(/follow.up|pendente|retomar contato/.test(s))return 'prospeccao-e-aquisicao-8';
    if(/diagnóst|auditoria|vídeo/.test(s))return 'diagnostico-e-auditoria-4';
    if(/reunião|calls|conversa/.test(s))return 'comunicacao-e-vendas-1';
    if(/objeç/.test(s))return 'comunicacao-e-vendas-3';
    if(/fechamento|contrato/.test(s))return 'comunicacao-e-vendas-4';
    if(/proposta/.test(s))return 'comunicacao-e-vendas-2';
    if(/contat|prospect|negócio/.test(s))return 'prospeccao-e-aquisicao-1';
    if(/registr|crm/.test(s))return 'gestao-comercial-e-financeira-1';
    return 'analise-e-crescimento-4';
  }
  function injectHelp(){
    ['#selected-mission','#today-checks'].forEach(sel=>{
      const container=$(sel);if(!container)return;
      container.querySelectorAll('label.inline-check').forEach(label=>{
        if(label.nextElementSibling?.classList.contains('fw-task-help'))return;
        const input=label.querySelector('input[data-d][data-i]');if(!input)return;
        const day=Number(input.dataset.d),i=Number(input.dataset.i),lesson=lessonFor(day,i,label.textContent);
        const links=document.createElement('div');links.className='fw-task-help';
        links.innerHTML=`<a href="bluebook.html?day=${day}#${lesson}">Como fazer + exemplo</a><a href="bluebook.html#olho-de-aguia">Critérios por nicho</a>`;
        if(/crm|cadastr|registr/i.test(label.textContent))links.innerHTML+='<button type="button" data-jump="crm">Abrir CRM</button>';
        label.insertAdjacentElement('afterend',links);
      });
    });
  }
  const tasksObserver=new MutationObserver(injectHelp);
  ['#selected-mission','#today-checks'].forEach(s=>{const el=$(s);if(el)tasksObserver.observe(el,{childList:true,subtree:false});});
  injectHelp();
  const plan=$('#view-plan .page-head');
  plan?.insertAdjacentHTML('afterend','<div class="fw-plan-intro"><strong>Não sabe executar uma tarefa?</strong> Use “Como fazer + exemplo” logo abaixo dela. Execute, registre a evidência e volte para marcar a missão. O objetivo é a ação real, não completar 140 checkboxes.</div>');
  // Reforçar registros de conversão e qualificação dentro do CRM.
  const crm=$('#view-crm .page-head');
  crm?.insertAdjacentHTML('afterend','<div class="fw-plan-intro">Cadastre apenas prospects reais e diferencie <strong>hipótese de fricção</strong>, <strong>interesse confirmado</strong> e <strong>contrato com sinal confirmado</strong>. O total de contratos não aumenta apenas por mudar um seletor de estágio.</div>');
  const leadTable=$('#lead-table');
  function enrichCRM(){
    const table=leadTable?.querySelector('table');if(!table||table.dataset.enriched)return;
    table.dataset.enriched='true';
    const data=(()=>{try{return JSON.parse(localStorage.getItem('fieldwork-10x30-v1')||'{}')}catch{return {}}})();
    table.querySelector('thead tr')?.insertAdjacentHTML('beforeend','<th>Confirmação</th>');
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const id=tr.querySelector('[data-stage-id]')?.dataset.stageId,lead=data.leads?.find(l=>l.id===id);
      if(!lead)return;
      const first=tr.querySelector('td');
      if(first){const meta=document.createElement('div');meta.className='fw-precise-indicator';meta.textContent=[lead.contact,lead.state].filter(Boolean).join(' · ');first.append(meta);
        if(lead.url){const a=document.createElement('a');a.textContent='Ver perfil/site';a.href=lead.url;a.target='_blank';a.rel='noopener noreferrer';a.className='fw-precise-indicator';first.append(a);}
        if(lead.action){const ac=document.createElement('div');ac.textContent='Próxima ação: '+lead.action;ac.className='fw-precise-indicator';first.append(ac);}
      }
      const td=document.createElement('td');
      td.innerHTML=`<label style="display:flex;align-items:center;gap:6px;font-size:13px"><input type="checkbox" data-deposit="${safe(id)}" ${lead.depositConfirmed?'checked':''} aria-label="Sinal confirmado para ${safe(lead.name)}">Sinal confirmado</label>`;
      tr.append(td);
    });
  }
  if(leadTable){
    const crmObserver=new MutationObserver(enrichCRM);crmObserver.observe(leadTable,{childList:true,subtree:false});
    enrichCRM();
    leadTable.addEventListener('change',e=>{const el=e.target.closest('input[data-deposit]');if(!el)return;window.dispatchEvent(new CustomEvent('fieldwork:deposit',{detail:{id:el.dataset.deposit,checked:el.checked}}));});
  }
  // O usuário consegue continuar de onde parou, mesmo após abrir o Blue Book.
  if(location.hash)route();
})();
