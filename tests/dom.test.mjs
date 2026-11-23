import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {Window} from 'happy-dom';
import {build,transformSync} from 'esbuild';

const directory=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(resolve(directory,name),'utf8');

test('a home contém somente apresentação, convite e login',()=>{
  const w=new Window({url:'https://romulorasec.github.io/fieldwork/index.html'});
  w.document.write(read('index.html'));
  assert.match(w.document.querySelector('h1')?.textContent||'',/Encontre a oportunidade/);
  assert.ok(w.document.querySelector('a[href="cloud.html"]'));
  assert.ok(w.document.querySelector('#request-form'));
  assert.equal(w.document.querySelectorAll('form[action="signup"],#audit-form,#ca-form,#cloud-root,#library-root').length,0);
  assert.equal(w.document.querySelectorAll('script[src*="conversion-audit"],script[src*="bluebook-upgrades"]').length,0);
  assert.match(w.document.querySelector('#request-form')?.textContent||'',/Isso não cria uma conta automaticamente/);
  w.happyDOM.abort();
});

test('a biblioteca não inclui lições no HTML ou JavaScript público',()=>{
  const html=read('bluebook.html');
  assert.match(html,/<div id="library-root"/);
  assert.match(html,/bluebook\.bundle\.js/);
  assert.doesNotMatch(html,/<details class="lesson"|O OLHO DE ÁGUIA|taskSet\(/);
  const source=read('bluebook-private.ts');
  assert.match(source,/client\.auth\.getUser\(\)/);
  assert.match(source,/\.from\('member_lessons'\)/);
  assert.match(source,/\.from\('memberships'\)/);
  assert.match(source,/requireLogin\(\)/);
  for(const obsolete of ['bluebook-upgrades.js','conversion-audit.js','index-enhance.js'])assert.equal(existsSync(resolve(directory,obsolete)),false);
});

test('o fluxo do workspace inclui plano, proposta, biblioteca e papéis separados',()=>{
  const source=read('cloud.ts');
  assert.doesNotMatch(source,/showMFA|\.auth\.mfa\./);
  assert.match(source,/__fwV2/);
  assert.match(source,/renderOffers\(\)/);
  assert.match(source,/\['admin','Administração'\]/);
  assert.match(source,/Biblioteca completa/);
  assert.match(read('cloud-admin.ts'),/data-request-use/);
  const backend=read('supabase/functions/admin-users/index.ts');
  assert.doesNotMatch(backend,/claims\?\.aal !== 'aal2'/);
  assert.match(backend,/body\.action === 'create'/);
  assert.match(backend,/request_id/);
  assert.match(read('supabase/migrations/202611210001_private_library_and_access_requests.sql'),/lesson_member_read/);
  assert.match(read('supabase/migrations/202611210006_optional_mfa_for_admin.sql'),/private\.is_admin\(\)/);
  assert.doesNotMatch(read('bluebook-private.ts'),/getAuthenticatorAssuranceLevel/);
});

test('home, biblioteca e workspace têm regras para telas pequenas',()=>{
  for(const file of ['home.css','bluebook-private.css','cloud.css']){
    assert.match(read(file),/@media\s*\(/,`${file} precisa de media query`);
  }
  assert.ok(existsSync(resolve(directory,'bluebook.bundle.js')));
  assert.ok(existsSync(resolve(directory,'cloud.bundle.js')));
});

test('o novo usuário recebe guia contextual e pode retomar com evidência salva',()=>{
  const workspace=read('cloud.ts'),plan=read('cloud-plan.ts');
  assert.match(workspace,/if\(state\.view==='today'\)void renderPlan\(renderShell\)/);
  assert.match(plan,/guideForTask\(action\)/);
  assert.match(plan,/Por que fazer isso\?/);
  assert.match(plan,/Como fazer, passo a passo/);
  assert.match(plan,/Estou travado\. O que faço\?/);
  assert.match(plan,/Já sei fazer\. Ir ao registro/);
  assert.match(plan,/bluebook\.html#/);
  assert.match(plan,/evidence,updated_at/);
  assert.match(read('cloud-prospects.ts'),/Confirmar entrada recebida/);
  assert.doesNotMatch(read('cloud-audits.ts'),/await loadRecords\(\);redraw\(\);/);
  assert.match(read('cloud-audits.ts'),/delete keep\['n-0'\]/);
});

test('as 40 instruções diferentes do plano têm procedimento específico',async()=>{
  const js=transformSync(read('plan-guides.ts'),{loader:'ts',format:'esm',minify:false}).code;
  const {guideForTask}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
  const tasks=[
    'Definir nicho inicial: remodelers e contractors','Descrever 3 problemas de conversão observáveis',
    'Montar planilha/CRM com 20 empresas candidatas','Escrever proposta de valor de uma frase',
    'Fixar limites e preços das 2 ofertas','Criar checklist de briefing + contrato simples',
    'Criar template reutilizável de uma página','Escrever resposta padrão para objeção sobre reviews',
    'Organizar 2 exemplos reais de trabalho ou conceitos claramente identificados',
    'Gravar 1 auditoria de demonstração de até 90 segundos','Revisar perfil Upwork e criar 1 gig Fiverr',
    'Cadastrar os primeiros 20 prospects no CRM','Contatar 20 empresas com hipótese específica',
    'Enviar 2 propostas Upwork qualificadas','Abordar 2 possíveis parceiros',
    'Agendar follow-up dos novos contatos','Contatar 20 empresas novas',
    'Enviar 2 propostas Upwork focadas','Registrar objeções literais e ajustar uma frase',
    'Contatar 10 empresas novas','Abordar 2 parceiros de marketing/SEO',
    'Preparar 2 auditorias em vídeo para leads promissores',
    'Verificar total de novos contatos e respostas','Listar as 3 objeções mais comuns',
    'Encaminhar propostas em aberto','Ajustar uma variável: nicho OU mensagem OU oferta',
    'Pesquisar e contatar 15 novos negócios com personalização',
    'Enviar 2 propostas Upwork bem escolhidas','Contatar 2 parceiros de indicação',
    'Fazer 5 follow-ups de conversas anteriores',
    'Agendar calls e enviar propostas com prazo de resposta definido',
    'Contatar 1 parceiros de indicação',
    'Pesquisar e contatar 10 novos negócios com personalização',
    'Contar respostas, calls, propostas e contratos no CRM',
    'Revisar custo/tempo por oportunidade e fonte',
    'Enviar follow-up útil nos contatos pendentes',
    'Redefinir metas da próxima semana usando taxas observadas',
    'Pesquisar e contatar 16 novos negócios com personalização',
    'Enviar 1 propostas Upwork bem escolhidas',
    'Pesquisar e contatar 5 novos negócios com personalização'
  ];
  assert.equal(tasks.length,40);
  for(const action of tasks){
    const g=guideForTask(action);
    assert.equal(g.steps.length,4,action);
    assert.ok(g.why.length>55,action);
    assert.ok(g.deliverable.length>40,action);
    assert.ok(g.example.length>40,action);
    assert.ok(g.stuck.length>40,action);
    assert.notEqual(g.lesson,'analise-e-crescimento-4','Guia genérico encontrado: '+action);
  }
});

test('primeiro login abre dia 1, salva evidência e avança para ação 2',async()=>{
  const w=new Window({url:'https://romulorasec.github.io/fieldwork/cloud.html'});
  w.document.body.innerHTML='<div id="cloud-root"><button data-view="prospects">CRM</button><div id="cloud-content"></div></div>';
  const previousDocument=globalThis.document;
  globalThis.document=w.document;
  const progress=[];
  const days=[
    {day:1,title:'Defina um nicho',phase:'Preparação',tasks:['Definir nicho inicial: remodelers e contractors','Descrever 3 problemas de conversão observáveis'],result:'Um nicho e observações.'},
    {day:2,title:'Ofertas',phase:'Preparação',tasks:['Fixar limites e preços das 2 ofertas'],result:'Oferta definida.'}
  ];
  const state={view:'today',user:{id:'user-test'},prospects:[]};
  const client={from(table){
    if(table==='plan_days')return {select(){return this;},eq(){return this;},order(){return this;},limit(){return Promise.resolve({data:days,error:null});}};
    if(table==='learning_progress')return {
      select(){return this;},eq(){return this;},like(){return this;},
      limit(){return Promise.resolve({data:progress,error:null});},
      upsert(payload){progress.push(payload);return Promise.resolve({error:null});}
    };
    throw Error('Tabela inesperada '+table);
  }};
  globalThis.__FWTEST={client,state,root:w.document.getElementById('cloud-root'),esc:v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;'),$:s=>w.document.getElementById('cloud-root').querySelector(s)};
  try{
    const built=await build({
      entryPoints:[resolve(directory,'cloud-plan.ts')],bundle:true,write:false,platform:'browser',format:'esm',target:'es2022',
      plugins:[{name:'mock-core',setup(b){
        b.onResolve({filter:/^\.\/cloud-core$/},()=>({path:'mock-core',namespace:'test'}));
        b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const {client,state,root,esc,$}=globalThis.__FWTEST;',loader:'js'}));
      }}]
    });
    const url='data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64');
    const {renderPlan}=await import(url);
    await renderPlan(()=>{});
    assert.match(w.document.querySelector('.guide-card h3')?.textContent||'',/Definir nicho inicial/);
    assert.match(w.document.querySelector('.guide-execution')?.textContent||'',/Google Maps/);
    assert.match(w.document.querySelector('.guide-resource-actions a')?.getAttribute('href')||'',/inteligencia-de-mercado-1/);
    const input=w.document.querySelector('#guide-evidence');
    input.value='Comparei cinco empresas e escolhi remodelers.';
    w.document.querySelector('#guide-finish').click();
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(progress[0]?.lesson_key,'day-1-0');
    assert.equal(progress[0]?.completed,true);
    assert.match(w.document.querySelector('.guide-card h3')?.textContent||'',/Descrever 3 problemas/);
  }finally{
    globalThis.document=previousDocument;
    delete globalThis.__FWTEST;
    w.happyDOM.abort();
  }
});
