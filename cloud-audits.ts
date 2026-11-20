import {client,state,$,esc,safeUrl,notice,loadRecords,canSell} from './cloud-core';

const common=[
  ['clarity','Proposta de valor','É fácil identificar serviço, área atendida e principal benefício?','Reescrever a abertura com serviço, diferenciais verificáveis e próximo passo.'],
  ['design','Qualidade visual','As escolhas visuais ajudam a perceber credibilidade e qualidade?','Melhorar consistência, legibilidade e imagens autênticas.'],
  ['hierarchy','Hierarquia visual','A atenção vai para o serviço, prova e ação desejada?','Reorganizar o destaque de informações e botões.'],
  ['copy','Copywriting','Os textos explicam benefícios concretos e respondem às dúvidas?','Substituir generalidades por informações específicas e comprováveis.'],
  ['cta','Botões e CTAs','O próximo passo é claro, clicável e coerente com a intenção?','Corrigir o CTA e validar seu destino em celular e desktop.'],
  ['structure','Estrutura de seções','A ordem das seções ajuda a decidir com confiança?','Reordenar serviços, provas, processo e contato.'],
  ['offer','Oferta','Está claro o que acontece depois do contato e por que escolher a empresa?','Explicar diferencial real e expectativa de atendimento.'],
  ['trust','Confiança','Existem avaliações e provas reais com contexto?','Adicionar evidências autênticas e verificáveis.'],
  ['forms','Formulários','É fácil concluir contato sem etapas desnecessárias?','Reduzir fricção e testar envio autorizado e confirmação.'],
  ['mobile','Uso no celular','O conteúdo e os controles funcionam numa tela pequena?','Ajustar legibilidade, toque e navegação móvel.'],
  ['speed','Velocidade e acessibilidade','A página funciona sem atraso, corte ou bloqueio de teclado?','Investigar desempenho, contraste, foco e estabilidade.'],
  ['measurement','Mensuração','É possível acompanhar contatos qualificados com dados autorizados?','Definir eventos e acompanhamento comercial.']
];
const nicheChecks:Record<string,string[]>={
  Roofing:['Tipo de serviço e região','Portfólio por tipo de telhado'],Remodeling:['Projetos comparáveis','Consulta e qualificação'],
  HVAC:['Emergência versus manutenção','Disponibilidade e cidades'],Plumbing:['Telefone clicável em emergência','Tipo de reparo e região'],
  Electrical:['Instalações e especialidades','Credenciais relevantes'],Odontologia:['Tratamentos claros','Agendamento com contexto'],
  'Med spas':['Segurança e profissionais','Reserva por tratamento'],Advocacia:['Área jurídica e local de atuação','Credenciais sem garantia de resultado'],
  'House cleaning':['Modalidades e inclusões','Provas de confiança'],Restaurantes:['Cardápio utilizável','Pedido, reserva e horário']
};
type NicheDetail={title:string,question:string,fix:string};
const nicheDetails:Record<string,NicheDetail[]>={};
const nicheDetail=(niche:string,id:string)=>id.startsWith('n-')?nicheDetails[niche]?.[Number(id.slice(2))]:undefined;
const criterionTitle=(niche:string,id:string)=>common.find(c=>c[0]===id)?.[1]||nicheDetail(niche,id)?.title||nicheChecks[niche]?.[Number(id.slice(2))]||id;
const criterionFix=(niche:string,id:string)=>common.find(c=>c[0]===id)?.[3]||nicheDetail(niche,id)?.fix||'Validar e corrigir o comportamento descrito.';
const quick=new Set(['clarity','cta','trust','mobile']);
const levels=[['hypothesis','Hipótese, ainda não testada'],['observed','Observado e descrito'],['reproduced','Reproduzido no dispositivo'],['measured','Confirmado com dados autorizados']];
let reportText='';
export async function renderAudits(redraw:()=>void){
  const {data:remote}=await client.from('audit_criteria').select('niche,criterion_key,content').eq('active',true).eq('version',1).limit(100);
  if(state.view!=='audits')return;
  if(remote){for(const row of remote){const index=Number(String(row.criterion_key).replace('n-',''));if(!nicheChecks[row.niche]||!/^n-[01]$/.test(row.criterion_key))continue;const content=row.content as NicheDetail;if(content?.title&&content?.question&&content?.fix){nicheDetails[row.niche]??=[];nicheDetails[row.niche][index]=content;}}}
  $('#cloud-content')!.innerHTML=`<div class="cloud-pagehead"><h2>Auditorias orientadas por evidências</h2><p>Observe uma tarefa concreta, documente o que aconteceu e só então considere uma oferta.</p></div><div class="cloud-grid"><section class="cloud-card"><h3>Novo diagnóstico</h3><form class="cloud-form" id="audit-form"><label>Empresa<input name="company" required maxlength="120" placeholder="Ex.: ABC Plumbing"></label><label>Site<input name="website" type="url" required placeholder="https://..."></label><label>Nicho<select name="niche">${Object.keys(nicheChecks).map(n=>`<option>${esc(n)}</option>`).join('')}</select></label><label>Dispositivo<select name="device"><option value="mobile">Celular</option><option value="desktop">Desktop</option></select></label><label>Profundidade<select name="mode"><option value="quick">Rápida, 6 verificações</option><option value="full">Completa, 14 verificações</option></select></label><div id="audit-checks"></div><label>Captura ou vídeo opcional<input name="file" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,application/pdf"><small>Arquivo privado, limitado a 50 MB.</small></label><button class="cloud-button">Salvar e gerar próximo passo</button></form><p id="cloud-feedback" aria-live="polite"></p></section><section class="cloud-card"><h3>Histórico (${state.audits.length})</h3>${state.audits.length?state.audits.slice(0,30).map(a=>`<article style="padding:10px 0;border-bottom:1px solid #e6eff2"><strong>${esc(a.company)}</strong><p class="cloud-small">${esc(a.niche)} · ${new Date(a.updated_at).toLocaleDateString('pt-BR')}<br>${esc(a.observation||'Sem fricção documentada')}</p></article>`).join(''):'<div class="cloud-empty">O primeiro diagnóstico ficará salvo na sua conta.</div>'}<a href="bluebook.html#guia-de-conversao">Entender como avaliar</a></section></div><div id="cloud-report" style="margin-top:15px"></div>`;
  const f=$('#audit-form') as HTMLFormElement;const area=$('#audit-checks')!;
  const keep:Record<string,{status:string,note:string,level:string}>={};
  const draw=()=>{const d=new FormData(f),niche=String(d.get('niche')||'Roofing'),mode=String(d.get('mode')||'quick');const checks=[...common.filter(c=>mode==='full'||quick.has(c[0])),...nicheChecks[niche].map((title,i)=>['n-'+i,nicheDetails[niche]?.[i]?.title||title,nicheDetails[niche]?.[i]?.question||'Este aspecto ajuda o cliente a cumprir sua tarefa?',nicheDetails[niche]?.[i]?.fix||'Melhorar clareza e funcionamento desta etapa.'])];area.innerHTML=checks.map(([id,title,question])=>`<fieldset class="cloud-fieldset"><legend>${esc(title)}</legend><p>${esc(question)}</p><div class="choices">${[['problem','Problema'],['good','Adequado'],['unknown','Não verificado']].map(([value,label])=>`<label><input type="radio" name="status-${id}" value="${value}" ${value===(keep[id]?.status||'unknown')?'checked':''}>${label}</label>`).join('')}</div><label style="margin-top:8px">Fato observado<textarea name="note-${id}" rows="2" placeholder="Ex.: o botão não abre a página de contato">${esc(keep[id]?.note||'')}</textarea></label><label>Nível da evidência<select name="level-${id}">${levels.map(([v,label])=>`<option value="${v}" ${v===(keep[id]?.level||'hypothesis')?'selected':''}>${label}</option>`).join('')}</select></label></fieldset>`).join('');};
  const preserve=()=>{const d=new FormData(f);for(const [name,value] of d){const match=/^(status|note|level)-(.+)$/.exec(name);if(match){keep[match[2]]||={status:'unknown',note:'',level:'hypothesis'};(keep[match[2]] as any)[match[1]]=String(value);}}};
  draw();f.querySelectorAll<HTMLSelectElement>('select[name=niche],select[name=mode]').forEach(s=>s.addEventListener('change',()=>{preserve();draw();}));
  f.addEventListener('submit',async e=>{
    e.preventDefault();preserve();const d=new FormData(f);const company=String(d.get('company')||'').trim(),website=safeUrl(String(d.get('website')||'')),niche=String(d.get('niche')||''),mode=String(d.get('mode')||'quick'),device=String(d.get('device')||'mobile');
    if(!website){notice('Insira uma URL HTTP ou HTTPS válida.',true);return;}
    const flagged=Object.entries(keep).filter(([,a])=>a.status==='problem');
    const supported=flagged.filter(([,a])=>a.note.trim().length>=12).sort((a,b)=>levels.findIndex(l=>l[0]===b[1].level)-levels.findIndex(l=>l[0]===a[1].level));
    const positive=Object.entries(keep).filter(([,a])=>a.status==='good').map(([id])=>criterionTitle(niche,id));
    const first=supported[0];
    const observation=first?.[1].note.trim()||'';
    const fix=first?criterionFix(niche,first[0]):'Verificar esta etapa e testar a menor correção possível.';
    const next=observation?'Mostrar o achado, verificar prioridade com o proprietário e propor uma correção testável.':'Verificar a jornada antes de sugerir qualquer intervenção.';
    const answers=Object.fromEntries(Object.entries(keep).map(([id,a])=>[id,{status:a.status,note:a.note,level:a.level}]));
    const {data:audit,error}=await client.from('audits').insert({workspace_id:state.member.workspace_id,owner_id:state.user.id,company,website,niche,device,mode,answers,observation,recommendation:observation?'Auditoria/correção':'',next_action:next,state:observation?'friction':'unknown'}).select('id').single();
    if(error||!audit){notice('Não foi possível salvar o diagnóstico: '+(error?.message||''),true);return;}
    if(supported.length){const findings=supported.map(([id,answer])=>({audit_id:audit.id,criterion_id:id,observation:answer.note.trim(),evidence_level:answer.level,impact_hypothesis:'Pode dificultar a jornada do visitante. O impacto comercial permanece não demonstrado sem medições.',proposed_fix:criterionFix(niche,id),test_method:'Reproduzir a tarefa e comparar o resultado depois da intervenção.'}));const {error:findingsError}=await client.from('audit_findings').insert(findings);if(findingsError)notice('Diagnóstico salvo, mas parte das evidências não foi registrada.',true);}
    const file=f.querySelector<HTMLInputElement>('[name=file]')?.files?.[0];
    if(file){if(file.size>50*1024*1024)notice('Diagnóstico salvo, mas o arquivo excede 50 MB.',true);else{const path=`${state.user.id}/${audit.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const {error:uploadError}=await client.storage.from('fieldwork-evidence').upload(path,file,{upsert:false});if(uploadError)notice('Diagnóstico salvo, mas o arquivo não foi enviado.',true);else await client.from('evidence_assets').insert({audit_id:audit.id,owner_id:state.user.id,storage_path:path,content_type:file.type,original_name:file.name});}}
    const evidenceList=supported.slice(0,3).map(([id,a],i)=>`${i+1}. ${criterionTitle(niche,id)}\n   Observação: ${a.note.trim()}\n   Evidência declarada: ${levels.find(l=>l[0]===a.level)?.[1]}\n   Correção proposta: ${criterionFix(niche,id)}`).join('\n\n');
    reportText=`DIAGNÓSTICO DE CONVERSÃO | ${company}\nSite: ${website}\nNicho: ${niche}\nDispositivo: ${device}\n\n${evidenceList?`OPORTUNIDADES OBSERVADAS (${supported.length} registros)\n${evidenceList}${supported.length>3?'\n\nOutras observações constam no registro interno.':''}`:'Nenhuma oportunidade com descrição suficiente. Não forçar uma oferta.'}\n\n${positive.length?`PONTOS QUE FUNCIONAM\n${positive.slice(0,4).join(' · ')}\n\n`:''}LIMITE DA CONCLUSÃO: observações de usabilidade não comprovam perda financeira ou aumento futuro de conversão.\n\nPRÓXIMO PASSO: ${next}`;
    await loadRecords();redraw();
    $('#cloud-report')!.innerHTML=`<section class="cloud-card"><h3>Relatório gerado</h3><pre class="cloud-report">${esc(reportText)}</pre><div class="cloud-actions"><button class="cloud-button" id="copy-report">Copiar relatório</button>${canSell()&&observation?'<button class="cloud-button secondary" id="send-crm">Criar oportunidade no CRM</button>':''}</div><p id="cloud-feedback" aria-live="polite"></p></section>`;
    $('#copy-report')?.addEventListener('click',()=>navigator.clipboard.writeText(reportText));
    $('#send-crm')?.addEventListener('click',async()=>{
      const dupe=state.prospects.find(p=>p.website===website&&p.name.toLowerCase()===company.toLowerCase());
      if(dupe){notice('Esta empresa já existe no CRM. Abra o registro para definir o próximo passo.');return;}
      const {error}=await client.from('prospects').insert({workspace_id:state.member.workspace_id,owner_id:state.user.id,name:company,niche,website,next_action:next,note:observation,lead_type:'Auditoria/correção'});
      if(error)notice('Não foi possível criar a oportunidade.',true);else{await loadRecords();notice('Oportunidade adicionada ao CRM. Escolha a próxima ação antes do contato.');const button=$('#send-crm') as HTMLButtonElement;button.disabled=true;button.textContent='Adicionado ao CRM';}
    });
  });
}
