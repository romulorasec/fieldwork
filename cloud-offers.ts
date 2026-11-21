import {client,state,root,$,esc,notice,canSell} from './cloud-core';

type Proposal={id:string,prospect_id:string,title:string,scope:string,price:number|null,currency:string,status:string,created_at:string};

export async function renderOffers(){
  const target=$('#cloud-content')!;
  if(!canSell()){target.innerHTML='<section class="cloud-card"><h2>Área não disponível</h2><p>Este perfil não possui permissão comercial.</p></section>';return;}
  target.innerHTML='<div class="cloud-pagehead"><h2>Propostas e ofertas</h2><p>Carregando suas propostas...</p></div>';
  const {data,error}=await client.from('proposals').select('id,prospect_id,title,scope,price,currency,status,created_at').order('created_at',{ascending:false}).limit(100);
  if(state.view!=='offers')return;
  const proposals=(data||[]) as Proposal[];
  const prospects=state.prospects.filter(p=>p.owner_id===state.user.id);
  const hasProspect=prospects.length>0;
  target.innerHTML=`<div class="cloud-pagehead"><h2>Uma proposta que resolve o problema certo.</h2><p>Conecte o achado a uma entrega específica, com preço, limites e próximo passo. Sem prometer uma taxa de conversão que ainda não foi medida.</p></div><div class="cloud-grid"><section class="cloud-card"><h3>Nova proposta</h3>${hasProspect?`<form class="cloud-form" id="offer-form"><label>Prospect<select name="prospect_id" required>${prospects.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label><label>Nome da solução<input name="title" required maxlength="140" placeholder="Ex.: Correção da jornada de orçamento"></label><label>Entrega e limites<textarea name="scope" rows="5" maxlength="5000" required placeholder="O que será feito, o que não está incluído, testes, prazo e dependências."></textarea></label><div class="cloud-grid"><label>Preço negociado (USD)<input name="price" type="number" min="0" step="0.01" placeholder="Definir após escopo"></label><label>Moeda<select name="currency"><option>USD</option><option>BRL</option></select></label></div><button class="cloud-button" type="submit">Salvar proposta</button></form>`:'<p>Cadastre primeiro um prospect no CRM. Toda proposta deve estar ligada a uma oportunidade real.</p><button class="cloud-button" id="go-crm">Abrir CRM</button>'}<p id="cloud-feedback" aria-live="polite"></p></section><section class="cloud-card"><h3>Estrutura que facilita o sim</h3><div class="cloud-why"><strong>1. Evidência</strong><p>Mostre o comportamento que conseguiu observar e reproduzir.</p></div><div class="cloud-why"><strong>2. Correção proporcional</strong><p>Explique a intervenção e como o cliente poderá verificar a entrega.</p></div><div class="cloud-why"><strong>3. Decisão simples</strong><p>Informe prazo, investimento, dependências e o único próximo passo.</p></div><p class="cloud-small">O diagnóstico não prova perda financeira por si só. Separe hipótese de resultado medido.</p></section></div><section class="cloud-card" style="margin-top:16px"><h3>Propostas registradas (${proposals.length})</h3>${error?'<p>Não foi possível carregar as propostas.</p>':proposals.length?`<div class="cloud-table-wrap"><table class="cloud-table"><thead><tr><th>Oferta</th><th>Prospect</th><th>Valor</th><th>Próximo passo</th></tr></thead><tbody>${proposals.map(p=>`<tr><td><strong>${esc(p.title)}</strong><p class="cloud-small">${esc(p.status)} · ${new Date(p.created_at).toLocaleDateString('pt-BR')}</p></td><td>${esc(state.prospects.find(x=>x.id===p.prospect_id)?.name||'Oportunidade')}</td><td>${p.price===null?'A definir':`${esc(p.currency)} ${Number(p.price).toLocaleString('en-US',{minimumFractionDigits:2})}`}</td><td><button data-copy-offer="${esc(p.id)}">Copiar resumo</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="cloud-empty">Você ainda não tem propostas. Comece por uma oportunidade documentada.</div>'}</section>`;
  $('#go-crm')?.addEventListener('click',()=>{(root.querySelector('[data-view="prospects"]') as HTMLButtonElement|null)?.click();});
  $('#offer-form')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget as HTMLFormElement,values=new FormData(form);
    const prospectId=String(values.get('prospect_id')||'');
    if(!prospects.some(p=>p.id===prospectId)){notice('Selecione um prospect que você gerencia.',true);return;}
    const priceText=String(values.get('price')||'');const price=priceText===''?null:Number(priceText);
    if(price!==null&&(!Number.isFinite(price)||price<0)){notice('Confira o valor informado.',true);return;}
    const {error}=await client.from('proposals').insert({prospect_id:prospectId,owner_id:state.user.id,title:String(values.get('title')||'').trim(),scope:String(values.get('scope')||'').trim(),price,currency:String(values.get('currency')||'USD'),status:'draft'});
    if(error){notice('Não foi possível salvar: '+error.message,true);return;}await renderOffers();
  });
  root.querySelectorAll<HTMLButtonElement>('[data-copy-offer]').forEach(b=>b.addEventListener('click',async()=>{
    const p=proposals.find(x=>x.id===b.dataset.copyOffer);if(!p)return;
    const name=state.prospects.find(x=>x.id===p.prospect_id)?.name||'Cliente';
    const text=`PROPOSTA | ${name}\n${p.title}\n\nESCOPO E LIMITES\n${p.scope}\n\nINVESTIMENTO\n${p.price===null?'A definir após confirmação do escopo':`${p.currency} ${Number(p.price).toFixed(2)}`}\n\nPRÓXIMO PASSO\nConfirme o escopo e alinhamos o início. Resultados de conversão dependem de testes e dados reais.`;
    try{await navigator.clipboard.writeText(text);notice('Resumo copiado. Revise antes de enviar.');}catch{notice('Não foi possível copiar. Tente novamente.',true);}
  }));
}
