import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';

const script = readFileSync(new URL('../conversion-audit.js',import.meta.url),'utf8');
const setup = (legacy = []) => {
  const win = new Window({url:'https://romulorasec.github.io/fieldwork/bluebook.html',settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
  win.document.body.innerHTML='<section id="primeira-missao"><div id="audit-workbench"></div></section><section id="olho-de-aguia"></section><nav id="bluebook-nav"></nav>';
  const errors=[];
  win.addEventListener('error',e=>errors.push(e.message));
  win.localStorage.setItem('fieldwork-audits-v2',JSON.stringify(legacy));
  win.eval(script);
  const $ = selector => win.document.querySelector(selector);
  const $$ = selector => [...win.document.querySelectorAll(selector)];
  const change = (element,value,type='input') => {
    element.value = value;
    element.dispatchEvent(new win.Event(type,{bubbles:true}));
  };
  const flag = (id,status,note='') => {
    const radio = $(`[data-check="${id}"] input[value="${status}"]`);
    radio.checked=true;radio.dispatchEvent(new win.Event('input',{bubbles:true}));radio.dispatchEvent(new win.Event('change',{bubbles:true}));
    if(status === 'problem') change($(`[data-note="${id}"]`),note);
  };
  const submit = () => $('#ca-form').dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));
  return {win,$,$$,change,flag,submit,errors};
};

test('diagnóstico rápido e aprofundamento preservam respostas', () => {
  const {win,$,$$,change,flag,submit,errors} = setup();
  assert.equal($$('.ca-criterion').length,6);
  assert.equal($$('.ca-niche-grid article').length,10);
  assert.equal($$('.ca-lessons details').length,12);
  change($('[name="company"]'),'Acme Roofing');
  change($('[name="url"]'),'https://example.com/roofing');
  flag('cta','problem','O botão de orçamento abre uma página inexistente no celular.');
  flag('trust','good');
  submit();
  const saved=JSON.parse(win.localStorage.getItem('fieldwork-audits-v2'));
  assert.equal(saved.length,1);
  assert.equal(saved[0].version,3);
  assert.equal(saved[0].recommendation,'Auditoria/correção');
  assert.match($('#ca-result').textContent,/botão de orçamento/);
  assert.match($('#ca-result').textContent,/PRÓXIMA DECISÃO/);
  assert.match($('.ca-recommend').textContent,/Primeira melhoria a considerar/);
  assert.match($('.ca-outreach').textContent,/O botão de orçamento abre uma página inexistente/);
  $('[data-deepen]').click();
  assert.equal($$('.ca-criterion').length,14);
  assert.equal($('[data-note="cta"]').value,'O botão de orçamento abre uma página inexistente no celular.');
  assert.deepEqual(errors,[]);
  win.happyDOM.abort();
});

test('sem evidências, não recomenda venda de redesign e não inventa perda', () => {
  const {win,$,change,flag,submit,errors} = setup();
  change($('[name="company"]'),'Great House Cleaners');
  change($('[name="url"]'),'https://example.com/cleaning');
  change($('[name="niche"]'),'House cleaning','change');
  flag('cta','good');
  flag('clarity','problem','');
  submit();
  assert.match($('#ca-result').textContent,/Sem diagnóstico negativo forçado/);
  assert.match($('#ca-result').textContent,/Não recomendar intervenção ainda/);
  const saved=JSON.parse(win.localStorage.getItem('fieldwork-audits-v2'));
  assert.equal(saved[0].recommendation,'');
  assert.equal(saved[0].state,'good');
  assert.deepEqual(errors,[]);
  win.happyDOM.abort();
});

test('histórico legado permanece legível; por nicho há perguntas próprias', () => {
  const previous=[{company:'Old Business',niche:'Plumbing',url:'https://example.org',observation:'Número não clicável',created:'2026-11-19T10:00:00Z'}];
  const {win,$,$$,errors} = setup(previous);
  assert.equal($$('.ca-history li').length,1);
  assert.equal($$('.ca-niche-grid article').length,10);
  $('[data-select-niche="Restaurantes"]').click();
  assert.equal($('[name="niche"]').value,'Restaurantes');
  assert.match($('.ca-goal').textContent,/Fazer pedido/);
  assert.match($('.ca-checks').textContent,/Cardápio utilizável/);
  assert.deepEqual(errors,[]);
  win.happyDOM.abort();
});

test('a evidência visual é opcional e a passagem ao CRM usa o registro escolhido', () => {
  const {win,$,change,flag,submit,errors}=setup();
  change($('[name="company"]'),'Quick Fix Plumbing');
  change($('[name="url"]'),'https://example.com/plumbing');
  change($('[name="proofUrl"]'),'https://example.com/screenshot.png');
  change($('[name="niche"]'),'Plumbing','change');
  flag('n-plumb-call','problem','O telefone na página aparece em texto e não permite ligar por toque.');
  submit();
  const record=JSON.parse(win.localStorage.getItem('fieldwork-audits-v2'))[0];
  assert.equal(record.proofUrl,'https://example.com/screenshot.png');
  assert.match($('#ca-result').textContent,/Abrir captura ou vídeo registrado/);
  assert.equal($('.ca-proof-link a').getAttribute('href'),'https://example.com/screenshot.png');
  $('[data-crm]').click();
  assert.equal(win.sessionStorage.getItem('fieldwork-selected-audit'),record.id);
  assert.deepEqual(errors,[]);
  win.happyDOM.abort();
});
