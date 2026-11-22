import {client,state,$,root,esc} from './cloud-core';
import {guideForTask} from './plan-guides';

type Day={day:number,title:string,phase:string,tasks:string[],result:string};
type Progress={lesson_key:string,completed:boolean,evidence:string};
let selected=0,days:Day[]=[],records=new Map<string,Progress>(),busy=false;
let feedback='';
const key=(day:number,i:number)=>`day-${day}-${i}`;
const isDone=(day:number,i:number)=>!!records.get(key(day,i))?.completed;
const countDone=()=>days.reduce((n,d)=>n+d.tasks.filter((_,i)=>isDone(d.day,i)).length,0);
const countTotal=()=>days.reduce((n,d)=>n+d.tasks.length,0);
const firstPending=()=>days.find(d=>d.tasks.some((_,i)=>!isDone(d.day,i)))?.day||days[0]?.day||1;

export async function renderPlan(_redraw:()=>void){
  const origin=state.view;
  $('#cloud-content')!.innerHTML='<div class="cloud-pagehead"><h2>Preparando seu próximo passo</h2><p>Carregando a trilha e seu progresso...</p></div>';
  const [{data,error},{data:progress,error:progressError}]=await Promise.all([
    client.from('plan_days').select('day,title,phase,tasks,result').eq('published',true).order('day').limit(30),
    client.from('learning_progress').select('lesson_key,completed,evidence').eq('user_id',state.user.id).like('lesson_key','day-%').limit(200)
  ]);
  if(state.view!==origin||!['today','plan'].includes(state.view))return;
  if(error||!data?.length){$('#cloud-content')!.innerHTML='<section class="cloud-card"><h3>Trilha indisponível</h3><p>Tente abrir o plano novamente.</p></section>';return;}
  if(progressError){$('#cloud-content')!.innerHTML='<section class="cloud-card"><h3>Progresso indisponível</h3><p>Não é seguro marcar etapas sem carregar seus registros. Tente novamente.</p></section>';return;}
  days=data as Day[];
  records=new Map(((progress||[]) as Progress[]).map(p=>[p.lesson_key,p]));
  if(origin==='today'||!selected)selected=firstPending();
  draw();
}

function draw(){
  const today=state.view==='today';
  const day=days.find(d=>d.day===selected)||days[0];
  const pending=day.tasks.findIndex((_,i)=>!isDone(day.day,i));
  const dayFinished=pending===-1,index=dayFinished?Math.max(0,day.tasks.length-1):pending;
  const action=day.tasks[index],guide=guideForTask(action);
  const toolAvailable=guide.workspace&&!!root.querySelector(`[data-view="${guide.workspace}"]`);
  const completed=countDone(),total=countTotal();
  const contracts=state.prospects.filter(p=>p.stage==='Contrato').length;
  const deposits=state.prospects.filter(p=>p.stage==='Contrato'&&p.deposit_confirmed).length;
  const selector=days.map(d=>{const n=d.tasks.filter((_,i)=>isDone(d.day,i)).length;return `<button type="button" data-day="${d.day}" ${d.day===day.day?'aria-current="step"':''} aria-label="Dia ${d.day}: ${n} de ${d.tasks.length} concluídas"><strong>${String(d.day).padStart(2,'0')}</strong><small>${n}/${d.tasks.length}</small></button>`;}).join('');
  const how=`<section class="guide-section"><h4>Por que fazer isso?</h4><p>${esc(guide.why)}</p></section>
  <details class="guide-execution" id="guide-execution" open><summary>Como fazer, passo a passo</summary><ol>${guide.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>
  <div class="guide-example"><strong>Exemplo aplicado</strong><p>${esc(guide.example)}</p></div>
  <section class="guide-section"><h4>O que preciso entregar para avançar?</h4><p>${esc(guide.deliverable)}</p></section>
  <div class="guide-resource-actions">${toolAvailable?`<button class="cloud-button secondary" type="button" data-open-tool="${esc(guide.workspace)}">Abrir ${guide.workspace==='prospects'?'CRM':guide.workspace==='audits'?'auditoria':'propostas'}</button>`:''}<a class="cloud-link" href="bluebook.html#${esc(guide.lesson)}">Abrir aula correspondente no Blue Book</a></div>
  <details class="guide-help"><summary>Estou travado. O que faço?</summary><p>${esc(guide.stuck)}</p><p>Não invente um resultado e não marque como concluído o que ainda não fez.</p></details>
  <details class="guide-advanced"><summary>Quero entender a técnica e o motivo em profundidade</summary><p>${esc(guide.technical)}</p><a href="bluebook.html#${esc(guide.lesson)}">Estudar esse assunto no Blue Book</a></details>`;
  const progressMarkup=`<section class="cloud-card guide-progress"><div class="cloud-progress-head"><strong>${completed} de ${total} ações registradas</strong><span>${contracts} contrato(s) no CRM · ${deposits} com entrada confirmada</span></div><div class="cloud-progress-track" role="progressbar" aria-label="Ações realizadas" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${total?Math.round(completed/total*100):0}%"></span></div><p>O progresso mostra execução. Contratos e pagamentos são resultados separados.</p></section>`;
  $('#cloud-content')!.innerHTML=`<div class="guide-heading"><span class="cloud-status">${today?'SEU PRÓXIMO PASSO':'TRILHA GUIADA'} · META: 10 CONTRATOS</span><h2>${today?'Vamos começar pelo que importa.':'30 dias. Uma ação guiada por vez.'}</h2><p>Você não precisa saber tudo antes de começar. Execute, registre e avance. Dez contratos é a meta, não uma garantia.</p></div>
  ${progressMarkup}
  ${!today?`<details class="guide-navigator" open><summary>Consultar os 30 dias</summary><div class="cloud-days" aria-label="Selecionar dia">${selector}</div></details>`:''}
  <section class="cloud-card guide-card" aria-label="Sua ação atual"><div class="guide-card-head"><div><span class="guide-counter">DIA ${day.day} DE 30 · ${esc(day.phase)} · PASSO ${index+1} DE ${day.tasks.length}</span><h3>${dayFinished?'Dia concluído. Próxima etapa pronta.':esc(action)}</h3><p>${esc(day.title)}</p></div><span class="guide-step-status">${dayFinished?'Concluído':'Em execução'}</span></div>
  <div class="guide-small-steps" aria-label="Etapas deste dia">${day.tasks.map((t,i)=>`<span class="${isDone(day.day,i)?'complete':i===index?'active':''}" title="${esc(t)}">${isDone(day.day,i)?'✓':i+1}</span>`).join('')}</div>
  ${completed===total?'<div class="cloud-why"><strong>Trilha registrada por completo.</strong><p>Revise os resultados reais e os contratos no CRM. Execução não é garantia de venda.</p></div>':dayFinished?`<div class="guide-section"><h4>Como saber que terminou o dia?</h4><p>${esc(day.result)}</p></div>`:`<div class="guide-instructions">${how}</div><div class="guide-proof"><label for="guide-evidence">O que você fez ou encontrou? <span>Uma frase basta</span></label><textarea id="guide-evidence" rows="3" maxlength="600" placeholder="Ex.: comparei cinco sites e observei...">${esc(records.get(key(day.day,index))?.evidence||'')}</textarea><p id="guide-feedback" role="status" aria-live="polite">${esc(feedback)}</p><div class="cloud-actions"><button class="cloud-button" type="button" id="guide-finish">Concluí. Próximo passo</button><button class="cloud-button ghost" type="button" id="guide-know">Já sei fazer. Ir ao registro</button></div></div>`}
  ${dayFinished&&day.day<30?`<button class="cloud-button" type="button" id="guide-next-day">Continuar para o dia ${day.day+1}</button>`:''}
  ${today?`<details class="guide-navigator"><summary>Ver os outros dias da trilha</summary><div class="cloud-days" aria-label="Selecionar dia">${selector}</div></details>`:''}
  </section><p class="guide-bottom-note"><strong>Seu progresso fica salvo.</strong> Quando voltar, você retoma do próximo passo. Pode consultar qualquer dia sem perder o que já fez.</p>`;
  root.querySelectorAll<HTMLButtonElement>('[data-day]').forEach(b=>b.addEventListener('click',()=>{selected=Number(b.dataset.day)||selected;feedback='';draw();}));
  root.querySelectorAll<HTMLButtonElement>('[data-open-tool]').forEach(b=>b.addEventListener('click',()=>{(root.querySelector(`[data-view="${b.dataset.openTool}"]`) as HTMLButtonElement|null)?.click();}));
  $('#guide-know')?.addEventListener('click',()=>{const details=$('#guide-execution') as HTMLDetailsElement|null;if(details)details.open=false;$('#guide-evidence')?.focus();});
  $('#guide-next-day')?.addEventListener('click',()=>{selected=Math.min(30,day.day+1);feedback='';draw();});
  $('#guide-finish')?.addEventListener('click',async()=>{
    if(busy)return;
    const input=$('#guide-evidence') as HTMLTextAreaElement|null,evidence=input?.value.trim()||'';
    if(evidence.length<8){showError('Descreva o resultado em uma frase curta, mesmo que seja “não encontrei problemas”.');input?.focus();return;}
    busy=true;
    const button=$('#guide-finish') as HTMLButtonElement;button.disabled=true;button.textContent='Salvando...';
    const lessonKey=key(day.day,index);
    const {error}=await client.from('learning_progress').upsert({user_id:state.user.id,lesson_key:lessonKey,completed:true,evidence,updated_at:new Date().toISOString()});
    busy=false;
    if(error){button.disabled=false;button.textContent='Concluí. Próximo passo';showError('Não foi possível salvar. Sua anotação permanece aqui; tente novamente.');return;}
    records.set(lessonKey,{lesson_key:lessonKey,completed:true,evidence});
    feedback='Ação salva. Agora é só continuar.';
    if(day.tasks.every((_,i)=>isDone(day.day,i))&&day.day<30)selected=day.day+1;
    draw();
  });
}

function showError(message:string){const p=$('#guide-feedback');if(p){p.textContent=message;p.className='guide-error';}}
