import {client,state,$,root,esc,notice,loadRecords} from './cloud-core';

export function renderTasks(redraw:()=>void){
  const active=state.tasks.filter(t=>!['done','discarded'].includes(t.status));
  const complete=state.tasks.filter(t=>t.status==='done');
  $('#cloud-content')!.innerHTML=`<div class="cloud-pagehead"><h2>Próximas ações</h2><p>Não precisa organizar a vida inteira. Escolha uma ação verificável e registre por que ela importa.</p></div><div class="cloud-grid"><section class="cloud-card"><h3>Definir uma ação</h3><form class="cloud-form" id="task-form"><label>O que você vai fazer?<input name="title" required maxlength="180" placeholder="Ex.: verificar o botão de orçamento no celular"></label><label>Por que isso aproxima de uma decisão?<textarea name="why" maxlength="400" rows="2" placeholder="Ex.: preciso comprovar o problema antes de contatar a empresa"></textarea></label><label>Como começar, em até 15 minutos?<input name="how_to" maxlength="400" placeholder="Ex.: abrir site em um telefone e seguir o CTA"></label><button class="cloud-button" type="submit">Salvar próxima ação</button></form><p id="cloud-feedback" aria-live="polite"></p></section><section class="cloud-card"><h3>O que funciona</h3><p>Escolha uma tarefa pequena, com resultado observável. Se encontrar um obstáculo, registre qual foi e reduza o próximo passo.</p><div class="cloud-why"><strong>Critério de conclusão</strong><p>Marque como concluído quando a ação acontecer, mesmo que o resultado tenha sido negativo. A conclusão não depende de fechar uma venda.</p></div><p class="cloud-small">${complete.length} ação(ões) concluídas no histórico disponível.</p></section></div><section class="cloud-card" style="margin-top:16px"><h3>Em andamento (${active.length})</h3>${active.length?active.map(t=>`<article class="cloud-task"><div><strong>${esc(t.title)}</strong>${t.why?`<p>Por quê: ${esc(t.why)}</p>`:''}${t.how_to?`<p>Comece assim: ${esc(t.how_to)}</p>`:''}<span class="cloud-small">${esc(t.status==='blocked'?'Houve um bloqueio':t.status==='doing'?'Em andamento':'Pendente')}</span></div><div class="cloud-actions"><button class="cloud-button secondary" data-task="${esc(t.id)}" data-status="done">Concluí</button><button class="cloud-button ghost" data-task="${esc(t.id)}" data-status="blocked">Travei</button></div></article>`).join(''):'<div class="cloud-empty">Sem pendências. Você pode criar uma ação com clareza ou continuar estudando.</div>'}</section>`;
  $('#task-form')?.addEventListener('submit',async event=>{
    event.preventDefault();const f=event.currentTarget as HTMLFormElement;const d=new FormData(f);
    const {error}=await client.from('tasks').insert({workspace_id:state.member.workspace_id,owner_id:state.user.id,title:String(d.get('title')||'').trim(),why:String(d.get('why')||'').trim(),how_to:String(d.get('how_to')||'').trim()});
    if(error)notice('Não foi possível salvar a ação.',true);else{await loadRecords();redraw();}
  });
  root.querySelectorAll<HTMLButtonElement>('[data-task]').forEach(b=>b.addEventListener('click',async()=>{
    const status=b.dataset.status,id=b.dataset.task;
    const {error}=await client.from('tasks').update({status,updated_at:new Date().toISOString()}).eq('id',id);
    if(error)notice('Não foi possível atualizar a ação.',true);else{await loadRecords();redraw();}
  }));
}
