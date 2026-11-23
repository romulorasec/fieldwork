import {MISSIONS,MISSION_IDS} from "./fieldwork-method.js";

/* Interface de execução assistida. O bundle legado permanece responsável pelo
   login e CRM; este módulo assume só as rotas Hoje/Missões autenticadas. */
let activeProspect="";
let missionOverride="";
let sprint=null;
let strategy=null;
let requestId=0;
let saving=false;
const current=()=>window.__fwApp;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const box=()=>document.getElementById("cloud-content");
const canEdit=()=>["admin","sales"].includes(current()?.state?.member?.role);
const validUrl=value=>{try{if(!value)return "";const u=new URL(value);return ["https:","http:"].includes(u.protocol)?u.href:"";}catch{return "";}}
const doneIds=()=>Array.isArray(strategy?.completed_missions)?strategy.completed_missions:[];
const firstPending=()=>MISSIONS.find(m=>!doneIds().includes(m.id))?.id||MISSIONS[0].id;
const feedback=(message,isError=false)=>{const node=document.getElementById("fw-status");if(node){node.textContent=message;node.className=isError?"fw-status fw-error":"fw-status";}};
const setNavLabel=()=>{const btn=document.querySelector('[data-view="plan"]');if(btn)btn.textContent="Missões e método";};
const navigate=page=>{const button=document.querySelector('[data-view="'+page+'"]');if(button)button.click();};
function company(){return current()?.state?.prospects?.find(p=>p.id===activeProspect&&p.owner_id===current().state.user.id);}
function dateLabel(value){return new Date(value).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"});}
function metrics(){
  const prospects=current()?.state?.prospects||[];
  return {prospects:prospects.length,contracts:prospects.filter(p=>p.stage==="Contrato").length,paid:prospects.filter(p=>p.stage==="Contrato"&&p.deposit_confirmed).length,responses:prospects.filter(p=>["Respondeu","Reunião","Proposta","Contrato"].includes(p.stage)).length};
}
function remaining(){
  if(!sprint?.deadline_at)return 30;
  return Math.max(0,Math.ceil((new Date(sprint.deadline_at).getTime()-Date.now())/86400000));
}
function statsHTML(){
  const m=metrics();return '<div class="fw-stats">'+
  '<div><small>Meta</small><strong>'+m.contracts+' / '+(sprint?.target_contracts||10)+'</strong><span>contratos registrados</span></div>'+
  '<div><small>Prazo restante</small><strong>'+remaining()+'</strong><span>dias corridos</span></div>'+
  '<div><small>Oportunidades</small><strong>'+m.prospects+'</strong><span>empresas no CRM</span></div>'+
  '</div><p class="fw-metrics-note">Entradas confirmadas: '+m.paid+'. Uma proposta ou resposta não é um contrato. O prazo não limita quantas missões você pode fazer hoje.</p>';
}
function headerHTML(){
  return '<header class="fw-hero"><span class="fw-overline">FIELDWORK / OPERAÇÃO 10 CONTRATOS</span>'+
    '<h2>Aprenda a vender resultados, não apenas websites.</h2>'+
    '<p>Investigue negócios reais, defina o papel comercial de um site intencional e transforme oportunidades em conversas, propostas e contratos. Faça quantas etapas conseguir, quando conseguir.</p></header>'+statsHTML();
}
function introHTML(){
return '<section class="fw-panel fw-main" aria-label="Primeira missão">'+
  '<span class="fw-pill">PRIMEIRA MISSÃO · PROSPECÇÃO</span><h3>Encontre sua primeira empresa.</h3>'+
  '<p>Antes de olhar se o site é bonito, precisamos conhecer um negócio e descobrir como ele ganha dinheiro. Vamos começar com uma pesquisa simples.</p>'+
  '<div class="fw-how"><strong>Como fazer, agora</strong><ol>'+
  '<li>Abra o <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a> e pesquise <code>kitchen remodeling Sunnyvale CA</code> ou um serviço da sua região.</li>'+
  '<li>Escolha uma empresa verdadeira, confirme a cidade e abra o site ou perfil comercial.</li>'+
  '<li>Identifique o serviço principal e copie o nome e o link da empresa.</li>'+
  '<li>Preencha os campos abaixo. Você vai estudar a empresa na próxima missão, não precisa saber tudo já.</li>'+
  '</ol></div>'+
  '<div class="fw-example"><strong>Exemplo fictício</strong><p>Empresa: Valley Kitchen Remodel · Nicho: Remodeling · Região: Sunnyvale · Fonte: Google Maps.</p></div>'+
  (canEdit()?'<form id="fw-new-company" class="fw-form">'+
  '<label>Nome da empresa <input name="name" maxlength="120" required placeholder="Ex.: ABC Remodeling"></label>'+
  '<label>Tipo de negócio / nicho <input name="niche" maxlength="80" required placeholder="Ex.: Remodeling, HVAC, clínica"></label>'+
  '<label>Website ou perfil público (opcional) <input type="url" name="website" placeholder="https://..."></label>'+
  '<label>Cidade e observação inicial <textarea name="note" maxlength="450" rows="2" placeholder="Ex.: atende Sunnyvale; faz reformas de cozinhas."></textarea></label>'+
  '<button type="submit" class="cloud-button">Salvar empresa e começar a investigação</button></form>'
  :'<div class="fw-example"><strong>Seu perfil é de consulta.</strong><p>Peça ao administrador acesso comercial para registrar prospects. Você pode estudar o método no Blue Book.</p></div>')+
  '<p id="fw-status" role="status" aria-live="polite"></p>'+
  '<details class="fw-extra"><summary>Estou travado. Como escolher uma empresa?</summary><p>Comece por apenas uma. Pesquise serviço + cidade, abra o perfil e anote o que ele oferece. Não precisa encontrar um site ruim nem prever quanto a empresa fatura.</p></details>'+
  '<details class="fw-extra"><summary>Por que fazemos isso antes de analisar o site?</summary><p>Porque uma página só pode ser avaliada em relação a seu comprador, à jornada e ao objetivo comercial. <a href="bluebook.html#inteligencia-de-mercado-1">Entenda a escolha de nicho no Blue Book</a>.</p></details>'+
  '</section>';
}
function missionListHTML(open){
  const progress=doneIds();
  return '<details class="fw-map" '+(open?'open':'')+'><summary>Visão geral: '+progress.length+' de '+MISSIONS.length+' missões concluídas nesta empresa</summary><div class="fw-map-grid">'+
  MISSIONS.map((m,i)=>'<button type="button" class="fw-map-item '+(progress.includes(m.id)?"complete":"")+'" data-mission="'+esc(m.id)+'"><span>'+(i+1)+'.</span>'+esc(m.title)+(progress.includes(m.id)?" ✓":"")+'</button>').join("")+
  '</div><p class="fw-tip">Você pode consultar ou retomar qualquer missão. A ordem é recomendada, não vinculada ao calendário.</p></details>';
}
function inputFor(field,value){
  const attr='name="'+esc(field.id)+'" id="fw-'+esc(field.id)+'" maxlength="1800"';
  const label=esc(field.label)+(field.required?' <span class="fw-required">para concluir</span>':' <span class="fw-optional">opcional</span>');
  if(field.kind==="select"){
    const opts=(field.id==="confidence"?["Hipótese","Observado","Reproduzido","Medido com dados autorizados"]:["Rascunho","Enviado","Respondeu","Sem interesse"]);
    return '<label class="fw-field">'+label+'<select '+attr+'>'+opts.map(opt=>'<option '+(value===opt?'selected':'')+'>'+esc(opt)+'</option>').join("")+'</select></label>';
  }
  return '<label class="fw-field">'+label+'<textarea '+attr+' rows="2" placeholder="'+esc(field.placeholder)+'">'+esc(value||"")+'</textarea></label>';
}
function missionHTML(m,index,prospect,values){
  const prev=MISSIONS[index-1],next=MISSIONS[index+1];
  const completed=doneIds().includes(m.id);
  const tools=m.tools.map(([name,url])=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'</a>').join("");
  return '<section class="fw-panel fw-main" aria-label="Missão guiada"><div class="fw-step-top">'+
  '<span class="fw-pill">MISSÃO '+(index+1)+' DE '+MISSIONS.length+' · '+(completed?'REGISTRADA':'EM EXECUÇÃO')+'</span>'+
  '<small>Empresa: '+esc(prospect.name)+'</small></div>'+
  '<h3>'+esc(m.title)+'</h3>'+
  '<div class="fw-why"><strong>Por que isso importa?</strong><p>'+esc(m.why)+'</p></div>'+
  '<div class="fw-how"><strong>Como fazer, passo a passo</strong><ol>'+m.steps.map(step=>'<li>'+esc(step)+'</li>').join("")+'</ol></div>'+
  '<div class="fw-example"><strong>Exemplo aplicado</strong><p>'+esc(m.example)+'</p></div>'+
  '<form id="fw-mission-form" class="fw-form">'+m.fields.map(field=>inputFor(field,values[field.id])).join("")+
  '<p class="fw-tip">Registre o que conseguiu verificar. Use “a confirmar” nos campos ainda desconhecidos. Não invente números, perdas ou conversas.</p>'+
  '<div class="fw-actions"><button type="button" id="fw-draft" class="cloud-button secondary">Salvar rascunho</button>'+
  '<button type="button" id="fw-complete" class="cloud-button">'+(completed?'Atualizar e avançar':'Concluí. Próxima missão')+'</button></div>'+
  '<p id="fw-status" class="fw-status" role="status" aria-live="polite"></p></form>'+
  '<details class="fw-extra"><summary>Estou travado. O que faço?</summary><p>'+esc(m.stuck)+'</p></details>'+
  '<details class="fw-extra"><summary>Entender melhor: fundamentos e alternativas</summary><p>'+esc(m.technical)+'</p><p><a href="bluebook.html#'+esc(m.lesson)+'">Abrir aula correspondente do Blue Book</a></p></details>'+
  '<div class="fw-resources"><strong>Ferramentas e aprofundamento</strong><div>'+tools+
  '<a href="bluebook.html#'+esc(m.lesson)+'">Blue Book: aula completa</a></div></div>'+
  '<div class="fw-mission-nav">'+(prev?'<button type="button" data-mission="'+esc(prev.id)+'">Missão anterior</button>':'<span></span>')+
  (next?'<button type="button" data-mission="'+esc(next.id)+'">Ver próxima missão →</button>':'<button type="button" id="fw-crm-btn">Ver CRM →</button>')+'</div></section>';
}
function leadSelectHTML(){
  const list=(current()?.state?.prospects||[]).filter(p=>p.owner_id===current().state.user.id);
  if(!list.length)return "";
  return '<div class="fw-toolbar"><label>Empresa que estamos investigando <select id="fw-prospect-select">'+
  list.map(p=>'<option value="'+esc(p.id)+'" '+(p.id===activeProspect?'selected':'')+'>'+esc(p.name)+'</option>').join("")+
  '</select></label><button type="button" class="cloud-button secondary" id="fw-another">Pesquisar outra empresa</button></div>';
}
async function ensureSprint(){
  const app=current();
  const q=app.client.from("fieldwork_sprints");
  let {data,error}=await q.select("user_id,workspace_id,started_at,deadline_at,target_contracts").eq("user_id",app.state.user.id).maybeSingle();
  if(error)throw Error("Não foi possível consultar o prazo: "+error.message);
  if(!data){
    const created=await app.client.from("fieldwork_sprints").insert({user_id:app.state.user.id,workspace_id:app.state.member.workspace_id}).select("user_id,workspace_id,started_at,deadline_at,target_contracts").single();
    if(created.error){
      const retry=await app.client.from("fieldwork_sprints").select("user_id,workspace_id,started_at,deadline_at,target_contracts").eq("user_id",app.state.user.id).maybeSingle();
      if(retry.error||!retry.data)throw Error("Não foi possível iniciar a operação: "+created.error.message);
      data=retry.data;
    }else data=created.data;
  }
  return data;
}
async function loadStrategy(id){
  if(!id)return null;
  const app=current();const {data,error}=await app.client.from("fieldwork_strategies")
     .select("prospect_id,data,completed_missions,updated_at").eq("prospect_id",id).maybeSingle();
  if(error)throw Error("Não foi possível recuperar as missões: "+error.message);
  return data||{prospect_id:id,data:{},completed_missions:[]};
}
function present(){
  const app=current(),el=box();if(!el||!app?.state?.member)return;
  setNavLabel();
  const prospect=company();
  const isMap=app.state.view==="plan";
  if(!prospect){
    el.innerHTML=headerHTML()+introHTML()+((app.state.prospects||[]).length?'<p class="fw-tip">Você pode começar por uma empresa de sua propriedade ou atribuída a você no CRM.</p>':'');
    bindNewCompany();
    return;
  }
  const chosen=MISSIONS.find(m=>m.id===missionOverride)||MISSIONS.find(m=>m.id===firstPending())||MISSIONS[0];
  const index=MISSIONS.findIndex(m=>m.id===chosen.id);
  const values=strategy?.data?.[chosen.id]||{};
  const pct=Math.round(doneIds().length/MISSIONS.length*100);
  el.innerHTML=headerHTML()+leadSelectHTML()+
  '<div class="fw-progress"><div><strong>Jornada comercial de '+esc(prospect.name)+'</strong><span>'+doneIds().length+'/'+MISSIONS.length+' missões registradas</span></div><div class="fw-bar"><span style="width:'+pct+'%"></span></div></div>'+
  missionListHTML(isMap)+missionHTML(chosen,index,prospect,values)+
  '<div class="fw-footer-note"><strong>Próxima oportunidade:</strong> quando este caso estiver encaminhado, você pode começar outro imediatamente, sem esperar o próximo dia. O CRM mantém cada conversa independente.</div>';
  document.getElementById("fw-prospect-select")?.addEventListener("change",async e=>{activeProspect=e.target.value;missionOverride="";await reload();});
  document.getElementById("fw-another")?.addEventListener("click",()=>{activeProspect="";missionOverride="";strategy=null;present();});
  el.querySelectorAll("[data-mission]").forEach(b=>b.addEventListener("click",()=>{missionOverride=b.dataset.mission;present();}));
  document.getElementById("fw-crm-btn")?.addEventListener("click",()=>navigate("prospects"));
  document.getElementById("fw-draft")?.addEventListener("click",()=>save(false,chosen));
  document.getElementById("fw-complete")?.addEventListener("click",()=>save(true,chosen));
  if(chosen.id==="offer"&&doneIds().includes("offer")){
    const d=document.createElement("div");d.className="fw-offer-extra";d.innerHTML='<button type="button" class="cloud-button secondary" id="fw-offer-tool">Abrir módulo de propostas</button><p class="fw-tip">A proposta estratégica está salva nesta missão; revise o preço e o escopo antes de registrar o documento comercial.</p>';
    document.querySelector(".fw-resources")?.append(d);
    document.getElementById("fw-offer-tool")?.addEventListener("click",()=>navigate("offers"));
  }
}
async function reload(){
  const id=++requestId;const app=current();if(!app?.state?.member)return;
  if(box())box().innerHTML='<section class="fw-panel"><h3>Carregando sua operação...</h3><p>Recuperando prazo e progresso.</p></section>';
  try{
    const result=await Promise.all([ensureSprint(),loadStrategy(activeProspect)]);
    if(id!==requestId||!["today","plan"].includes(app.state.view))return;
    sprint=result[0];strategy=result[1];present();
  }catch(e){if(id===requestId&&box())box().innerHTML='<section class="fw-panel"><h3>Não foi possível abrir a operação</h3><p>'+esc(e.message||"Falha inesperada.")+'</p><button class="cloud-button" id="fw-retry">Tentar novamente</button></section>';document.getElementById("fw-retry")?.addEventListener("click",reload);}
}
function bindNewCompany(){
  document.getElementById("fw-new-company")?.addEventListener("submit",async e=>{
    e.preventDefault();if(saving)return;
    const app=current();const form=e.currentTarget;const data=new FormData(form);
    const name=String(data.get("name")||"").trim(),niche=String(data.get("niche")||"").trim(),website=String(data.get("website")||"").trim();
    if(name.length<2||!niche){feedback("Informe o nome e o tipo de negócio.",true);return;}
    if(website&&!validUrl(website)){feedback("Use um link HTTP/HTTPS válido ou deixe o campo vazio.",true);return;}
    const similar=(app.state.prospects||[]).find(p=>p.name.toLowerCase()===name.toLowerCase()&&(p.website||"")===validUrl(website));
    if(similar){activeProspect=similar.id;strategy=null;await reload();return;}
    saving=true;form.querySelector('button[type="submit"]').disabled=true;
    const response=await app.client.from("prospects").insert({
      workspace_id:app.state.member.workspace_id,owner_id:app.state.user.id,name,niche,website:validUrl(website),
      source:"Google Maps",note:String(data.get("note")||"").trim(),next_action:"Investigar modelo de negócio e função do website"
    }).select("id").single();
    saving=false;
    if(response.error){form.querySelector('button[type="submit"]').disabled=false;feedback("Não foi possível cadastrar a empresa: "+response.error.message,true);return;}
    activeProspect=response.data.id;missionOverride="";await app.loadRecords();await reload();
  });
}
async function save(complete,mission){
  if(saving)return;
  const app=current(),prospect=company(),form=document.getElementById("fw-mission-form");
  if(!prospect||!form)return;
  const data=new FormData(form),values={};
  for(const field of mission.fields)values[field.id]=String(data.get(field.id)||"").trim().slice(0,1800);
  if(complete){
    const missing=mission.fields.filter(field=>field.required&&values[field.id].length<8);
    if(missing.length){feedback("Para concluir, preencha: "+missing.map(f=>f.label).join("; ")+". Você pode salvar rascunho enquanto pesquisa.",true);return;}
    if(mission.id==="outreach"&&values.outcome==="Rascunho"){feedback("Prepare e salve a mensagem como rascunho. Só conclua esta missão após realmente contatar a empresa ou registrar uma resposta.",true);return;}
    if(mission.id==="discovery"&&/^(a confirmar|não sei|sem contato|pendente)$/i.test(values.validated)){feedback("A descoberta comercial ainda não foi confirmada. Salve o rascunho e aguarde uma conversa real.",true);return;}
  }
  const valuesAll={...(strategy?.data||{}),[mission.id]:{...values,saved_at:new Date().toISOString()}};
  const completed=complete?Array.from(new Set([...doneIds(),mission.id])):doneIds();
  saving=true;const buttons=form.querySelectorAll("button");buttons.forEach(b=>b.disabled=true);feedback("Salvando seu trabalho...");
  const {error}=await app.client.from("fieldwork_strategies").upsert({
    prospect_id:prospect.id,owner_id:app.state.user.id,workspace_id:app.state.member.workspace_id,
    data:valuesAll,completed_missions:completed,updated_at:new Date().toISOString()
  },{onConflict:"prospect_id"});
  saving=false;buttons.forEach(b=>b.disabled=false);
  if(error){feedback("Não foi possível salvar. Seu texto continua nesta tela: "+error.message,true);return;}
  strategy={prospect_id:prospect.id,data:valuesAll,completed_missions:completed};
  if(complete&&mission.id==="outreach"){
    const next=values.followup||"Verificar resposta da abordagem comercial";
    const r=await app.client.from("prospects").update({next_action:next,updated_at:new Date().toISOString()}).eq("id",prospect.id);
    if(r.error){feedback("Missão salva, mas o próximo contato não foi atualizado no CRM.",true);return;}
    await app.loadRecords();
  }
  if(complete){const i=MISSIONS.findIndex(m=>m.id===mission.id);missionOverride=MISSIONS[Math.min(i+1,MISSIONS.length-1)].id;}
  present();
  if(!complete)feedback("Rascunho salvo. Você pode voltar e continuar quando quiser.");
}
export async function render(){
  const app=current();if(!app?.state?.user||!app?.state?.member||!["today","plan"].includes(app.state.view))return;
  const own=(app.state.prospects||[]).filter(p=>p.owner_id===app.state.user.id);
  if(activeProspect&&!own.some(p=>p.id===activeProspect)){activeProspect="";strategy=null;}
  if(!activeProspect&&own.length)activeProspect=own[0].id;
  await reload();
}
window.__fwV2={render,missions:MISSIONS,method:"Conversão Reversa"};
if(current()?.state?.member&&["today","plan"].includes(current().state.view))void render();
