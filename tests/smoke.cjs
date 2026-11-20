/* Execute com: node tests/smoke.cjs (com o projeto servido em localhost:8877). */
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({headless:true,executablePath:process.env.FIELDWORK_CHROMIUM_PATH || undefined,args:['--no-sandbox']});
  const issues = [];
  const page = await browser.newPage({viewport:{width:1366,height:900},deviceScaleFactor:1});
  page.on('pageerror',e => issues.push('pageerror: ' + e.message));
  page.on('console',m => {if(m.type()==='error') issues.push('console: ' + m.text());});
  try {
    await page.goto('http://127.0.0.1:8877/bluebook.html',{waitUntil:'networkidle'});
    await page.locator('#ca-form').waitFor();
    assert.equal(await page.locator('#ca-form .ca-criterion').count(),6,'Quick audit should show 4 universal + 2 niche checks');
    assert.equal(await page.locator('.ca-niche-grid article').count(),10);
    assert.equal(await page.locator('.ca-lessons details').count(),12);
    assert.equal(await page.locator('.ca-goal strong').textContent(),'Pedir inspeção ou orçamento');
    await page.locator('[name="company"]').fill('Acme Roof Works');
    await page.locator('[name="url"]').fill('https://example.com/roofing');
    await page.locator('[data-check="cta"] input[value="problem"]').check();
    await page.locator('[data-note="cta"]').fill('No celular, o botão de orçamento abre uma página indisponível.');
    await page.locator('[data-check="trust"] input[value="good"]').check();
    await page.locator('#ca-form button[type="submit"]').click();
    await page.locator('.ca-report').waitFor();
    assert.match(await page.locator('.ca-report').innerText(),/No celular, o botão de orçamento/);
    assert.match(await page.locator('.ca-report').innerText(),/correção de conversão/);
    assert.equal(await page.locator('.ca-history li').count(),1);
    await page.screenshot({path:path.join(os.tmpdir(),'fieldwork-audit-desktop.png'),fullPage:false});

    await page.reload({waitUntil:'networkidle'});
    await page.locator('[data-open]').first().click();
    assert.equal(await page.locator('[name="company"]').inputValue(),'Acme Roof Works');
    assert.equal(await page.locator('[data-note="cta"]').inputValue(),'No celular, o botão de orçamento abre uma página indisponível.');
    await page.locator('[data-mode="full"]').click();
    assert.equal(await page.locator('#ca-form .ca-criterion').count(),14,'Full audit should show 12 universal + 2 niche checks');
    await page.locator('[data-mode="quick"]').click();
    await page.locator('[data-new]').click();
    await page.locator('[name="company"]').fill('Another Roofing Company');
    await page.locator('[name="url"]').fill('https://example.com/another');
    await page.locator('[data-check="clarity"] input[value="good"]').check();
    await page.locator('#ca-form button[type="submit"]').click();
    assert.match(await page.locator('.ca-report').innerText(),/Não recomendar intervenção ainda/);
    await page.locator('[data-open]').last().click();
    await page.locator('[data-crm]').click();
    await page.waitForURL('**/index.html#crm');
    assert.equal(await page.locator('#lead-name').inputValue(),'Acme Roof Works');
    assert.equal(await page.locator('#lead-url').inputValue(),'https://example.com/roofing');
    assert.equal(await page.locator('#lead-type').inputValue(),'Auditoria/correção');
    assert.match(await page.locator('#lead-note').inputValue(),/botão de orçamento/);

    // UX responsiva nos principais formatos. Zero scroll horizontal.
    for (const width of [360,390,768,1280]) {
      await page.setViewportSize({width,height:844});
      for (const url of ['/index.html','/bluebook.html']) {
        await page.goto('http://127.0.0.1:8877'+url,{waitUntil:'networkidle'});
        const size=await page.evaluate(() => ({scroll:document.documentElement.scrollWidth,window:innerWidth}));
        assert.ok(size.scroll <= size.window + 1,`${url} overflows ${width}px: ${JSON.stringify(size)}`);
        assert.ok(await page.locator('h1').count()>=1);
      }
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto('http://127.0.0.1:8877/bluebook.html',{waitUntil:'networkidle'});
    await page.locator('[data-select-niche="Restaurantes"]').click();
    assert.equal(await page.locator('[name="niche"]').inputValue(),'Restaurantes');
    assert.equal(await page.locator('.ca-goal strong').textContent(),'Fazer pedido, reservar ou planejar visita');
    await page.screenshot({path:path.join(os.tmpdir(),'fieldwork-audit-mobile.png'),fullPage:false});

    assert.deepEqual(issues,[],'Browser runtime errors should be absent');
    console.log('PASS: quick/full, reports, no forced pitch, persistence, CRM, ten niches, and responsive 360/390/768/1280.');
    console.log('Screenshots: '+path.join(os.tmpdir(),'fieldwork-audit-desktop.png')+' and '+path.join(os.tmpdir(),'fieldwork-audit-mobile.png'));
  } finally {
    await browser.close();
  }
})().catch(err => {console.error(err);process.exitCode=1;});
