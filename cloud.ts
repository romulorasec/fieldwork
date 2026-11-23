import {client,root,$,state,esc,roles,loadRecords,canSell,canAudit,isAdmin,notice} from './cloud-core';
import {showLogin,signOut} from './cloud-auth';
import {renderProspects} from './cloud-prospects';
import {renderAudits} from './cloud-audits';
import {renderAdmin} from './cloud-admin';
import {renderTasks} from './cloud-tasks';
import {renderPlan} from './cloud-plan';
import {renderOffers} from './cloud-offers';

async function boot(){
  // Verify the one-time recovery token before entering the ordinary login flow.
  // The token never needs to be sent through a redirect service.
  if(location.hash.startsWith('#setup?')){
    const token=new URLSearchParams(location.hash.slice(7)).get('token_hash');
    if(!token){showSetupError();return;}
    const {error}=await client.auth.verifyOtp({token_hash:token,type:'recovery'});
    history.replaceState(null,'','cloud.html#setup');
    if(error){showSetupError();return;}
    showLogin(boot,true);return;
  }
  const {data:{user}}=await client.auth.getUser();state.user=user;
  if(!user){showLogin(boot);return;}
  if(location.hash==='#setup'){showLogin(boot,true);return;}
  const {data,error}=await client.from('memberships').select('workspace_id,role,status,workspaces(name)').eq('user_id',user.id).eq('status','active').limit(1);
  const member=data?.[0];
  if(error||!member){root.innerHTML='<main class="cloud-loading"><h2>Conta sem acesso liberado</h2><p>O administrador precisa vincular esta conta a um espaço de trabalho ativo.</p><button class="cloud-button" id="exit">Sair</button></main>';$('#exit')?.addEventListener('click',signOut);return;}
  state.member=member;
  const wanted=new URLSearchParams(location.search).get('return');
  if(wanted&&/^bluebook\.html(#[a-z0-9-]{1,90})?$/.test(wanted)){location.replace(wanted);return;}
  const incoming=location.hash.slice(1);
  if(['today','tasks','plan','prospects','audits','offers','learning','admin'].includes(incoming))state.view=incoming;
  await loadRecords();renderShell();
}
function showSetupError(){root.innerHTML='<main class="cloud-loading"><h2>Link inválido ou expirado</h2><p>Peça um novo link ao administrador. Nunca compartilhe o link com outras pessoas.</p><a href="cloud.html">Voltar ao login</a></main>';}

function renderShell(){
  const role=state.member.role;
  const access={prospects:['admin','sales','partner'].includes(role),audits:canAudit(),admin:isAdmin()};
  if(state.view==='prospects'&&!access.prospects || ['audits','tasks'].includes(state.view)&&!access.audits || state.view==='offers'&&!canSell() || state.view==='admin'&&!access.admin)state.view='today';
  const navigation=[['today','Começar / Continuar'],['plan','Missões e método'],...(access.audits?[['tasks','Próximas ações']]:[]),...(access.prospects?[['prospects','Prospects e CRM']]:[]),...(access.audits?[['audits','Auditorias']]:[]),...(canSell()?[['offers','Propostas e ofertas']]:[]),['learning','Práticas rápidas'],...(access.admin?[['admin','Administração']]:[])];
  root.innerHTML=`<div class="cloud-shell"><aside class="cloud-side"><h1>Fieldwork</h1><small>WORKSPACE / CONVERSÃO</small><div class="role">${esc(state.user.email)}<br><strong>${esc(roles[role]||role)}</strong></div><nav aria-label="Área de trabalho">${navigation.map(([key,name])=>`<button data-view="${key}" ${state.view===key?'aria-current="page"':''}>${esc(name)}</button>`).join('')}<a href="bluebook.html">Biblioteca completa</a></nav><button class="logout" id="logout">Sair</button></aside><main class="cloud-main"><header class="cloud-top"><strong>${esc((state.member.workspaces as {name?:string}|null)?.name||'Fieldwork')}</strong><span>Uma ação com propósito, depois a próxima.</span></header><div id="cloud-content"></div><p class="cloud-foot">A análise identifica hipóteses e fatos observados; somente dados medidos demonstram impacto comercial.</p></main></div>`;
  root.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view||'today';history.replaceState(null,'','cloud.html#'+state.view);renderShell();}));
  $('#logout')?.addEventListener('click',signOut);
  if(state.view==='today')void ((window as any).__fwV2?.render?(window as any).__fwV2.render():renderPlan(renderShell));
  if(state.view==='tasks')renderTasks(renderShell);
  if(state.view==='plan')void ((window as any).__fwV2?.render?(window as any).__fwV2.render():renderPlan(renderShell));
  if(state.view==='prospects')renderProspects(renderShell);
  if(state.view==='audits')renderAudits(renderShell);
  if(state.view==='offers')void renderOffers();
  if(state.view==='learning')renderLearning();
  if(state.view==='admin')void renderAdmin();
}

function renderToday(){
  const lead=state.prospects.find(p=>p.next_action&&p.stage!=='Contrato'&&p.stage!=='Perdido');
  const pending=state.tasks.find(t=>t.status!=='done'&&t.status!=='discarded');
  const title=pending?.title||(lead?`Continue com ${lead.name}`:(canAudit()?'Documente uma oportunidade real':'Aprenda uma técnica útil'));
  const action=pending?.why||lead?.next_action||(canAudit()?'Abra uma empresa e tente realizar a principal ação que o visitante procura.':'Escolha uma lição ligada ao seu próximo trabalho.');
  const why=lead?'Uma conversa comercial só avança quando a próxima decisão fica clara.':canAudit()?'Uma observação reproduzível permite propor uma correção específica.':'Aprender com aplicação e feedback é mais útil que apenas acumular leituras.';
  $('#cloud-content')!.innerHTML=`<div class="cloud-pagehead"><h2>Seu próximo cliente começa com uma boa observação.</h2><p>O objetivo é reduzir trabalho desnecessário e tornar a próxima decisão mais clara.</p></div><div class="cloud-kpis"><div class="cloud-card cloud-kpi"><span>Prospects</span><strong>${state.prospects.length}</strong></div><div class="cloud-card cloud-kpi"><span>Auditorias</span><strong>${state.audits.length}</strong></div><div class="cloud-card cloud-kpi"><span>Contratos registrados</span><strong>${state.prospects.filter(x=>x.stage==='Contrato'&&x.deposit_confirmed).length}</strong></div></div><div class="cloud-grid"><section class="cloud-card"><span class="cloud-status">PRÓXIMA AÇÃO</span><h3 style="margin-top:12px">${esc(title)}</h3><p>${esc(action)}</p><div class="cloud-why"><strong>Por que esta ação?</strong><p>${esc(why)}</p></div><div class="cloud-actions" style="margin-top:16px"><button class="cloud-button" id="do-next">${lead?'Abrir CRM':canAudit()?'Começar diagnóstico':'Abrir lições'}</button></div></section><section class="cloud-card"><h3>Se travar, faça menos, mas avance.</h3><p><strong>Não sabe como?</strong> Abra o procedimento no Blue Book, com um exemplo.</p><p><strong>Não encontrou um problema?</strong> Registre que a etapa funcionou. Isso também é evidência.</p><p><strong>Uma tentativa falhou?</strong> Anote o comportamento e escolha uma mudança para testar.</p><a class="cloud-link" href="bluebook.html#diagnostico-e-auditoria-1">Ver guia de conversão</a></section></div><details class="cloud-card" style="margin-top:16px"><summary><strong>Você usava a versão antiga?</strong> Importar dados locais</summary><p>O projeto anterior armazenava registros no navegador. Você pode copiar uma versão deles para sua conta sem apagar o original.</p><button class="cloud-button secondary" id="import-legacy">Importar meus registros locais</button><p id="cloud-feedback" aria-live="polite"></p></details>`;
  if(pending){const button=$('#do-next');if(button)button.textContent='Abrir esta ação';}
  $('#do-next')?.addEventListener('click',()=>{state.view=pending?'tasks':lead?'prospects':canAudit()?'audits':'learning';renderShell();});
  $('#import-legacy')?.addEventListener('click',importLegacy);
}

async function importLegacy(){
  if(!confirm('Importar os dados deste navegador para sua conta? Nenhum registro local será apagado.'))return;
  let count=0;for(const key of ['fieldwork-10x30-v1','fieldwork-audits-v2','fieldwork-pratica-v2']){
    const original=localStorage.getItem(key);if(!original)continue;
    try{const payload=JSON.parse(original);const {error}=await client.from('user_snapshots').upsert({user_id:state.user.id,snapshot_key:key,payload,updated_at:new Date().toISOString()});if(!error)count++;}catch{/* Dados inválidos são mantidos no navegador. */}
  }
  notice(count?`${count} conjunto(s) importados como cópia de segurança. O original permanece no navegador.`:'Não foi encontrado um conjunto de dados válido ou não foi possível salvar.');
}

async function renderLearning(){
  const resources=[
    ['Escolher um nicho','Definir um problema específico e encontrar compradores plausíveis.','inteligencia-de-mercado-1'],
    ['Testar a conversão','Documentar um comportamento real, sem estimar perdas.','diagnostico-e-auditoria-1'],
    ['Montar a oferta','Traduzir o achado em um escopo proporcional.','ofertas-1'],
    ['Abordar prospects','Mostrar o valor de um achado antes de pedir uma reunião.','prospeccao-e-aquisicao-2'],
    ['Responder objeções','Investigar a dúvida real sem pressionar.','comunicacao-e-vendas-3'],
    ['Avaliar resultados','Separar atividade, resposta e contrato.','analise-e-crescimento-4']
  ];
  const {data:progress}=await client.from('learning_progress').select('lesson_key,completed').eq('user_id',state.user.id);
  const completed=new Set((progress||[]).filter(p=>p.completed&&resources.some(r=>r[2]===p.lesson_key)).map(p=>p.lesson_key));
  if(state.view!=='learning')return;
  $('#cloud-content')!.innerHTML=`<div class="cloud-pagehead"><h2>Aprender na hora de executar</h2><p>Escolha o conceito necessário para sua próxima ação. Abra a aula, aplique em um exemplo real e registre sua prática.</p><p class="cloud-small">${completed.size} de ${resources.length} práticas marcadas como aplicadas. Nenhuma contagem substitui um resultado comercial.</p></div><div class="cloud-grid three">${resources.map(([name,reason,id])=>`<article class="cloud-card"><h3>${esc(name)}</h3><p>${esc(reason)}</p><a href="bluebook.html#${id}">Ver procedimento</a><div class="cloud-actions" style="margin-top:12px"><button class="cloud-button ${completed.has(id)?'secondary':''}" data-lesson="${id}" data-done="${completed.has(id)?'1':'0'}">${completed.has(id)?'Aplicado. Desmarcar':'Marcar como aplicado'}</button></div></article>`).join('')}</div><p id="cloud-feedback" aria-live="polite"></p><section class="cloud-why" style="margin-top:16px"><strong>Falha não é identidade.</strong><p>Quando uma tentativa não produzir o resultado desejado, registre o que ocorreu e faça a próxima experiência menor. Progresso comercial depende de conversas e decisões reais, não de uma sequência perfeita.</p></section>`;
  root.querySelectorAll<HTMLButtonElement>('[data-lesson]').forEach(b=>b.addEventListener('click',async()=>{
    const {error}=await client.from('learning_progress').upsert({user_id:state.user.id,lesson_key:b.dataset.lesson,completed:b.dataset.done!=='1',updated_at:new Date().toISOString()});
    if(error)notice('Não foi possível atualizar seu progresso.',true);else await renderLearning();
  }));
}

client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){history.replaceState(null,'','cloud.html#setup');showLogin(boot,true);}});
(window as any).__fwApp={client,state,root,loadRecords,renderShell};
void boot();
