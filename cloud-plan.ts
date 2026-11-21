import {client,state,$,root,esc,notice} from './cloud-core';

type Day={day:number,title:string,phase:string,tasks:string[],result:string};
type Progress={lesson_key:string,completed:boolean};
let selected=1;
let days:Day[]=[],done=new Set<string>();

export async function renderPlan(redraw:()=>void){
  $('#cloud-content')!.innerHTML='<div class="cloud-pagehead"><h2>Plano de 30 dias</h2><p>Carregando sua trilha de execução...</p></div>';
  const [{data,error},{data:progress}]=await Promise.all([
    client.from('plan_days').select('day,title,phase,tasks,result').eq('published',true).order('day').limit(30),
    client.from('learning_progress').select('lesson_key,completed').eq('user_id',state.user.id).like('lesson_key','day-%').limit(200)
  ]);
  if(state.view!=='plan')return;
  if(error||!data?.length){$('#cloud-content')!.innerHTML='<section class="cloud-card"><h3>Trilha indisponível</h3><p>Não foi possível carregar as missões. Tente novamente.</p></section>';return;}
  days=data as Day[];done=new Set(((progress||[]) as Progress[]).filter(x=>x.completed).map(x=>x.lesson_key));
  renderDays(redraw);
}
function renderDays(redraw:()=>void){
  const total=days.reduce((n,d)=>n+d.tasks.length,0),completed=[...done].filter(k=>/^day-\d+-\d+$/.test(k)).length;
  const current=days.find(x=>x.day===selected)||days[0];
  $('#cloud-content')!.innerHTML=`<div class="cloud-pagehead"><h2>30 dias. Uma ação por vez.</h2><p>Um plano de execução, não uma promessa de contratos. Marque somente ações que realmente concluiu.</p></div><div class="cloud-card"><div class="cloud-progress-head"><strong>Seu progresso</strong><span>${completed} de ${total} ações registradas</span></div><div class="cloud-progress-track"><span style="width:${total?Math.round(completed/total*100):0}%"></span></div><div class="cloud-days" aria-label="Selecionar dia">${days.map(d=>{const n=d.tasks.filter((_,i)=>done.has(`day-${d.day}-${i}`)).length;return `<button data-day="${d.day}" ${selected===d.day?'aria-current="step"':''} aria-label="Dia ${d.day}: ${n} de ${d.tasks.length} ações concluídas"><strong>${String(d.day).padStart(2,'0')}</strong><small>${n}/${d.tasks.length}</small></button>`;}).join('')}</div></div><div class="cloud-grid" style="margin-top:16px"><section class="cloud-card"><span class="cloud-status">${esc(current.phase)}</span><h3 style="margin-top:13px">Dia ${current.day}: ${esc(current.title)}</h3><p>Estas atividades são um roteiro. Ajuste as quantidades à sua capacidade e use evidências reais.</p><div class="cloud-plan-tasks">${current.tasks.map((t,i)=>`<label class="cloud-plan-task"><input data-plan-task="${i}" type="checkbox" ${done.has(`day-${current.day}-${i}`)?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div><div class="cloud-actions" style="margin-top:20px"><button type="button" class="cloud-button ghost" id="prev-plan" ${current.day===1?'disabled':''}>Dia anterior</button><button type="button" class="cloud-button secondary" id="next-plan" ${current.day===30?'disabled':''}>Próximo dia</button></div><p id="cloud-feedback" aria-live="polite"></p></section><section class="cloud-card"><h3>Como saber que terminou?</h3><div class="cloud-why"><strong>Saída verificável</strong><p>${esc(current.result)}</p></div><h3 style="margin-top:24px">Se não souber como fazer</h3><p>Abra a técnica no Blue Book. Volte para esta ação quando tiver um exemplo, um contato ou uma hipótese documentada.</p><a class="cloud-link" href="bluebook.html">Abrir Blue Book privado</a><h3 style="margin-top:24px">Se algo falhar</h3><p>Registre o obstáculo e ajuste a próxima tentativa. Uma resposta negativa não apaga o aprendizado.</p></section></div>`;
  root.querySelectorAll<HTMLButtonElement>('[data-day]').forEach(b=>b.addEventListener('click',()=>{selected=Number(b.dataset.day)||1;renderDays(redraw);}));
  $('#prev-plan')?.addEventListener('click',()=>{selected=Math.max(1,selected-1);renderDays(redraw);});
  $('#next-plan')?.addEventListener('click',()=>{selected=Math.min(30,selected+1);renderDays(redraw);});
  root.querySelectorAll<HTMLInputElement>('[data-plan-task]').forEach(input=>input.addEventListener('change',async()=>{
    const key=`day-${current.day}-${Number(input.dataset.planTask)}`,next=input.checked;
    input.disabled=true;const {error}=await client.from('learning_progress').upsert({user_id:state.user.id,lesson_key:key,completed:next,updated_at:new Date().toISOString()});
    if(error){input.checked=!next;input.disabled=false;notice('Não foi possível salvar essa conclusão.',true);return;}
    if(next)done.add(key);else done.delete(key);renderDays(redraw);
  }));
}
