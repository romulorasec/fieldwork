/* Execute com o servidor de desenvolvimento ativo em localhost:8877. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const path=require('node:path');
const os=require('node:os');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.FIELDWORK_CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto('http://127.0.0.1:8877/index.html',{waitUntil:'domcontentloaded'});
    assert.match(await page.locator('h1').innerText(),/Encontre a oportunidade/);
    assert.equal(await page.locator('#audit-form,#library-root').count(),0);
    await page.locator('[data-open-request]').first().click();
    assert.ok(await page.locator('#request-dialog').evaluate(d=>d.open));
    assert.equal(await page.locator('#request-form [name="email"]').count(),1);
    await page.locator('#close-request').click();
    for(const width of [360,390,768,1280]){
      await page.setViewportSize({width,height:844});
      await page.goto('http://127.0.0.1:8877/index.html',{waitUntil:'domcontentloaded'});
      const {scroll,viewport}=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(scroll<=viewport+1,`Home transbordou em ${width}px: ${scroll}`);
      assert.ok(await page.locator('a[href="cloud.html"]').count()>0);
    }
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(os.tmpdir(),'fieldwork-public-mobile.png')});
    await page.goto('http://127.0.0.1:8877/bluebook.html',{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('.lesson').count(),0,'A biblioteca não pode entregar conteúdo no HTML anônimo');
    await page.screenshot({path:path.join(os.tmpdir(),'fieldwork-private-locked.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: home pública, formulário de convite, privacidade da biblioteca e responsividade 360/390/768/1280.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
