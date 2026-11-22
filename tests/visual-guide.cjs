/* Smoke test visual e funcional do guia sem autenticar ou modificar dados reais. */
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {build}=require('esbuild');
const {chromium}=require('playwright');

const project=resolve(__dirname,'..');
const days=[
  {day:1,title:'Defina um nicho e uma promessa clara',phase:'Preparação',tasks:[
    'Definir nicho inicial: remodelers e contractors',
    'Descrever 3 problemas de conversão observáveis',
    'Montar planilha/CRM com 20 empresas candidatas',
    'Escrever proposta de valor de uma frase'
  ],result:'Nicho definido com empresas qualificadas.'},
  {day:2,title:'Empacote a entrega',phase:'Preparação',tasks:['Fixar limites e preços das 2 ofertas'],result:'Duas ofertas prontas.'}
];

(async()=>{
  const bundle=await build({
    entryPoints:[resolve(project,'cloud-plan.ts')],bundle:true,write:false,format:'iife',
    globalName:'FieldworkGuide',target:'es2022',platform:'browser',
    plugins:[{name:'mock-core',setup(builder){
      builder.onResolve({filter:/^\.\/cloud-core$/},()=>({path:'mock-core',namespace:'test'}));
      builder.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const {client,state,root,esc,$}=window.__FWTEST;',loader:'js'}));
    }}]
  });
  const browser=await chromium.launch({headless:true,executablePath:process.env.FIELDWORK_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.setContent('<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="cloud-root"><div class="cloud-shell"><aside class="cloud-side"><h1>Fieldwork</h1><nav><button data-view="today">Começar / Continuar</button><button data-view="prospects">CRM</button></nav></aside><main class="cloud-main"><div id="cloud-content"></div></main></div></div></body></html>');
    await page.addStyleTag({content:readFileSync(resolve(project,'cloud.css'),'utf8')});
    await page.evaluate(data=>{
      const root=document.getElementById('cloud-root');
      const progress=[];
      const client={from(table){
        if(table==='plan_days')return {select(){return this;},eq(){return this;},order(){return this;},limit(){return Promise.resolve({data,error:null});}};
        if(table==='learning_progress')return {select(){return this;},eq(){return this;},like(){return this;},limit(){return Promise.resolve({data:progress,error:null});},upsert(record){progress.push(record);return Promise.resolve({error:null});}};
        throw Error('Tabela inesperada: '+table);
      }};
      window.__FWTEST={client,state:{view:'today',user:{id:'test-user'},prospects:[]},root,$:selector=>root.querySelector(selector),esc:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
    },days);
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    await page.evaluate(()=>window.FieldworkGuide.renderPlan(()=>{}));
    await page.locator('.guide-card h3').waitFor();
    for(const width of [360,390,768,1280]){
      await page.setViewportSize({width,height:900});
      const results=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,bodyFont:getComputedStyle(document.querySelector('.guide-section p')).fontSize,primaryAction:document.querySelector('#guide-finish')?.textContent}));
      assert.ok(results.scrollWidth<=width+1,`Guia transbordando ${width}px: ${results.scrollWidth}`);
      assert.equal(results.bodyFont,'16px');
      assert.match(results.primaryAction||'',/Próximo passo/);
      if(width===390)await page.screenshot({path:'/tmp/fieldwork-guided-mobile.png',fullPage:true});
      if(width===1280)await page.screenshot({path:'/tmp/fieldwork-guided-desktop.png',fullPage:true});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: guia renderizado em 360/390/768/1280, sem transbordamento ou erro JavaScript.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
