import {client,esc} from './cloud-core';

type Lesson={lesson_key:string,module_key:string,module_title:string,title:string,section_order:number,content:{how?:string,alternatives?:string,output?:string,steps?:string[],example?:string,verify?:string,trap?:string}};
type Progress={lesson_key:string,completed:boolean,evidence:string};
const root=document.getElementById('library-root')!;
const order=['m1','offers','m4','m2','m3','m5','m6','m7','niches','situations'];
let lessons:Lesson[]=[],progress:Record<string,Progress>={},userId='',activeModule='all',query='';
const safeText=(v:unknown)=>esc(String(v??''));
const validReturn=/^#[a-z0-9-]{1,90}$/;

function requireLogin(){
  const hash=validReturn.test(location.hash)?location.hash:'';
  location.replace('cloud.html?return='+encodeURIComponent('bluebook.html'+hash));
}

async function boot(){
  const {data:{user}}=await client.auth.getUser();if(!user){requireLogin();return;}
  const {data:members,error:memberError}=await client.from('memberships').select('role,status').eq('user_id',user.id).eq('status','active').limit(1);
  if(memberError||!members?.length){root.innerHTML='<main class="library-loading"><h1>Acesso não liberado</h1><p>O administrador precisa habilitar sua conta.</p><a href="cloud.html">Voltar ao login</a></main>';return;}
  userId=user.id;
  const [{data,error},{data:rows,error:progressError}]=await Promise.all([
    client.from('member_lessons').select('lesson_key,module_key,module_title,title,section_order,content').eq('published',true).limit(150),
    client.from('learning_progress').select('lesson_key,completed,evidence').eq('user_id',userId).limit(150)
  ]);
  if(error){root.innerHTML='<main class="library-loading"><h1>Não foi possível abrir a biblioteca</h1><p>Tente novamente ou confirme seu acesso com o administrador.</p><a href="cloud.html">Voltar ao workspace</a></main>';return;}
  lessons=(data||[]) as Lesson[];
  if(!progressError)for(const p of (rows||[]))progress[p.lesson_key]=p as Progress;
  render();
  if(location.hash){const id=decodeURIComponent(location.hash.slice(1));const element=document.getElementById(id);if(element){(element as HTMLDetailsElement).open=true;element.scrollIntoView({block:'start'});}}
}

const modules=()=>order.map(key=>({key,title:lessons.find(l=>l.module_key===key)?.module_title||key,count:lessons.filter(l=>l.module_key===key).length})).filter(m=>m.count);
const renderDetail=(l:Lesson)=>{
  const c=l.content||{},isDone=progress[l.lesson_key]?.completed;
  const procedure=Array.isArray(c.steps)&&c.steps.length?`<div class="lesson-block"><h4>Como executar</h4><ol>${c.steps.map(step=>`<li>${safeText(step)}</li>`).join('')}</ol></div>`:c.how?`<div class="lesson-block"><h4>O que observar</h4><p>${safeText(c.how)}</p></div>`:'';
  const sections=[
    c.steps?.length&&c.how?['Contexto',c.how]:null,
    c.alternatives?['Estratégia e alternativas',c.alternatives]:null,
    c.example?['Exemplo aplicado',c.example]:null,
    c.output?['Resultado esperado',c.output]:null,
    c.verify?['Como verificar',c.verify]:null,
    c.trap?['Evite este erro',c.trap]:null
  ].filter(Boolean) as [string,string][];
  return `<details class="lesson" id="${safeText(l.lesson_key)}"><summary><span class="lesson-number">${String(l.section_order).padStart(2,'0')}</span><span class="lesson-title">${safeText(l.title)}</span><span class="lesson-state">${isDone?'Aplicado':'Ver procedimento'}</span></summary><div class="lesson-inside">${procedure}<div class="detail-grid">${sections.map(([title,body])=>`<section class="lesson-block"><h4>${safeText(title)}</h4><p>${safeText(body)}</p></section>`).join('')}</div><div class="practice"><div><strong>Registro de aprendizagem</strong><p>Marque quando tiver aplicado ou revisado o conteúdo. Um erro de execução também é aprendizado.</p></div><label for="evidence-${safeText(l.lesson_key)}">Anotação opcional<textarea id="evidence-${safeText(l.lesson_key)}" data-evidence="${safeText(l.lesson_key)}" rows="2" placeholder="O que testei ou aprendi?">${safeText(progress[l.lesson_key]?.evidence||'')}</textarea></label><button class="library-button ${isDone?'secondary':''}" data-complete="${safeText(l.lesson_key)}">${isDone?'Atualizar registro':'Marcar como aplicado'}</button><span class="save-feedback" data-feedback="${safeText(l.lesson_key)}" aria-live="polite"></span></div></div></details>`;
};

function render(){
  const count=Object.values(progress).filter(p=>p.completed).length;
  root.innerHTML=`<div class="library-shell"><aside class="library-sidebar"><a class="library-brand" href="cloud.html#learning">fieldwork<span>.</span></a><small>BLUE BOOK / ACESSO PRIVADO</small><div class="sidebar-label">ÁREAS DE ESTUDO</div><nav id="library-nav" aria-label="Áreas de estudo"><button data-module="all" class="${activeModule==='all'?'active':''}">Todas as lições</button>${modules().map(m=>`<button data-module="${safeText(m.key)}" class="${activeModule===m.key?'active':''}">${safeText(m.title)} <span>${m.count}</span></button>`).join('')}</nav><a class="back-workspace" href="cloud.html#learning">Voltar ao workspace</a></aside><main class="library-content"><header class="library-top"><a href="cloud.html#learning">← Workspace</a><span>Biblioteca exclusiva de membros</span></header><div class="library-hero"><span class="eyebrow">APRENDA ENQUANTO EXECUTA</span><h1>Um procedimento claro.<br>Uma aplicação real.</h1><p>Encontre a técnica necessária, faça a próxima ação e registre o que aconteceu. Não precisa estudar tudo antes de começar.</p><div class="library-stats"><span><strong>${lessons.length}</strong> tópicos no acervo</span><span><strong>${count}</strong> práticas aplicadas</span></div></div><section class="library-body"><div class="library-filter"><label for="library-search">Buscar no Blue Book</label><input id="library-search" type="search" value="${safeText(query)}" placeholder="Ex.: CTA, objeção, oferta, prospecção..."></div><div id="library-results"></div></section></main></div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-module]').forEach(b=>b.addEventListener('click',()=>{activeModule=b.dataset.module||'all';render();}));
  document.getElementById('library-search')?.addEventListener('input',e=>{query=(e.currentTarget as HTMLInputElement).value;renderResults();});
  renderResults();
}

function renderResults(){
  const target=document.getElementById('library-results');if(!target)return;
  const q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const visible=lessons.filter(l=>(activeModule==='all'||l.module_key===activeModule)&&(!q||`${l.title} ${l.module_title} ${JSON.stringify(l.content)}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)));
  const groups=order.map(key=>({key,title:lessons.find(l=>l.module_key===key)?.module_title||key,list:visible.filter(l=>l.module_key===key).sort((a,b)=>a.section_order-b.section_order)})).filter(g=>g.list.length);
  target.innerHTML=groups.length?groups.map(g=>`<section class="library-group"><div class="group-heading"><h2>${safeText(g.title)}</h2><span>${g.list.length} ${g.list.length===1?'lição':'lições'}</span></div><div class="lesson-list">${g.list.map(renderDetail).join('')}</div></section>`).join(''):'<div class="library-empty">Nenhuma lição encontrada. Tente outra palavra ou selecione todas as áreas.</div>';
  target.querySelectorAll<HTMLButtonElement>('[data-complete]').forEach(button=>button.addEventListener('click',async()=>{
    const key=button.dataset.complete!,input=target.querySelector<HTMLTextAreaElement>(`[data-evidence="${key}"]`)!;
    button.disabled=true;const evidence=input.value.trim();
    const {error}=await client.from('learning_progress').upsert({user_id:userId,lesson_key:key,completed:true,evidence,updated_at:new Date().toISOString()});
    if(error){button.disabled=false;const f=target.querySelector<HTMLElement>(`[data-feedback="${key}"]`);if(f)f.textContent='Falha ao salvar. Tente novamente.';return;}
    progress[key]={lesson_key:key,completed:true,evidence};button.disabled=false;button.textContent='Registro atualizado';button.classList.add('secondary');
    const f=target.querySelector<HTMLElement>(`[data-feedback="${key}"]`);if(f)f.textContent='Prática registrada na sua conta.';
  }));
}

void boot();
