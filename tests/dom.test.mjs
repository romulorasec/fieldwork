import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {Window} from 'happy-dom';

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
  assert.match(source,/renderPlan\(renderShell\)/);
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
