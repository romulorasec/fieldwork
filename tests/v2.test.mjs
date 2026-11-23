import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";

const dir=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(resolve(dir,path),"utf8");
const source=read("fieldwork-method.js");
const method=new Function(source.replace(/^export /gm,"")+"return {MISSIONS,MISSION_IDS};")();
const missions=method.MISSIONS;

test("Fieldwork 2.0 mantém 10 missões e nenhum bloqueio por dia",()=>{
  assert.equal(missions.length,10);
  assert.equal(new Set(missions.map(m=>m.id)).size,10);
  for(const mission of missions){
    assert.ok(mission.why.length>80,mission.id);
    assert.ok(mission.steps.length===4,mission.id);
    assert.ok(mission.steps.every(s=>s.length>55),mission.id);
    assert.ok(mission.example.length>80,mission.id);
    assert.ok(mission.stuck.length>65,mission.id);
    assert.ok(mission.technical.length>70,mission.id);
    assert.ok(mission.fields.some(f=>f.required),mission.id);
    assert.equal(mission.lesson,"metodo-v2-"+mission.id);
  }
});

test("as missões começam pelo negócio, não por defeitos de website",()=>{
  assert.deepEqual(missions.map(m=>m.id),[
    "business","demand","goal","blueprint","diagnose",
    "opportunity","outreach","discovery","offer","close"
  ]);
  assert.match(missions[0].steps[0],/Google Maps/);
  assert.match(missions[3].steps.join(" "),/identidade|logotipo/);
  assert.match(missions[4].steps.join(" "),/Compare/);
  assert.match(missions[5].why,/valor/);
});

test("integração na versão publicada preserva login e usa o novo motor",()=>{
  const html=read("cloud.html"),bundle=read("cloud.bundle.js"),source=read("cloud.ts");
  assert.match(html,/fieldwork-v2\.js/);
  assert.match(html,/fieldwork-v2\.css/);
  assert.match(bundle,/window\.__fwApp=\{client:A,state:v/);
  assert.match(bundle,/window\.__fwV2\?\.render/);
  assert.match(source,/__fwV2/);
  assert.match(read("fieldwork-v2.js"),/fieldwork_sprints/);
  assert.match(read("fieldwork-v2.js"),/fieldwork_strategies/);
  assert.match(read("fieldwork-v2.js"),/Salvar rascunho/);
  assert.match(read("fieldwork-v2.js"),/Concluí\. Próxima missão/);
  assert.match(read("fieldwork-v2.js"),/Missão/);
  assert.match(read("fieldwork-v2.js"),/bluebook\.html#/);
});

test("missões não registram automaticamente uma conversa ou venda",()=>{
  const runtime=read("fieldwork-v2.js");
  assert.match(runtime,/values\.outcome==="Rascunho"/);
  assert.match(runtime,/discovery/);
  assert.match(runtime,/completed_missions/);
  assert.doesNotMatch(runtime,/stage:"Contrato"/);
  assert.doesNotMatch(runtime,/deposit_confirmed:true/);
});

test("tabelas novas possuem políticas por usuário e por workspace",()=>{
  const sql=read("supabase/sql/fieldwork_v2_schema.sql");
  assert.match(sql,/fieldwork_sprints enable row level security/);
  assert.match(sql,/fieldwork_strategies enable row level security/);
  assert.match(sql,/owner_id = \(select auth\.uid\(\)\)/);
  assert.match(sql,/workspace_id = workspace_id/);
  assert.match(sql,/p\.owner_id = \(select auth\.uid\(\)\)/);
  assert.match(sql,/revoke all on public\.fieldwork_strategies from anon/);
});

test("prospeccao permite INSERT RETURNING do proprio usuario sem abrir leitura para outros tenants",()=>{
  const patch=read("supabase/sql/fieldwork_v2_rls_hotfix.sql");
  assert.match(patch,/drop policy if exists prospects_read/);
  assert.match(patch,/owner_id=\(select auth\.uid\(\)\) and private\.is_member\(workspace_id\)/);
  assert.match(patch,/private\.can_view_prospect\(id\)/);
  assert.doesNotMatch(patch,/with check\s*\(\s*true\s*\)/i);
  const schema=read("supabase/sql/fieldwork_v2_schema.sql");
  assert.doesNotMatch(schema,/m\.workspace_id = workspace_id/);
  assert.doesNotMatch(schema,/p\.workspace_id = workspace_id/);
  assert.match(patch,/p\.workspace_id=fieldwork_strategies\.workspace_id/);
  assert.match(patch,/private\.is_member\(fieldwork_sprints\.workspace_id\)/);
});
