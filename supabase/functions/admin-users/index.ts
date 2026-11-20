import { createClient } from 'npm:@supabase/supabase-js@2';

// The browser never receives the secret/service-role key. Only this function may
// provision accounts; public signups must also be disabled in Auth settings.
const url = Deno.env.get('SUPABASE_URL')!;
const publicKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const adminDb = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
const allowedOrigin = 'https://romulorasec.github.io';
const cors = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: cors });
const roles = new Set(['sales','contributor','reviewer','partner','learner']);

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.headers.get('Origin') !== allowedOrigin) return reply({ error: 'Origin não autorizada.' }, 403);
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return reply({ error: 'Faça login.' }, 401);
  const token = authHeader.slice(7);
  const actorClient = createClient(url, publicKey, {auth:{persistSession:false,autoRefreshToken:false}});
  const [{data:userData,error:userError},{data:claimData,error:claimError}] = await Promise.all([
    actorClient.auth.getUser(token), actorClient.auth.getClaims(token)
  ]);
  const actor = userData.user;
  if (userError || claimError || !actor || claimData.claims?.sub !== actor.id) return reply({error:'Sessão inválida.'},401);
  if (claimData.claims?.aal !== 'aal2') return reply({error:'Administração exige autenticação em dois fatores.'},403);

  const {data:membership,error:membershipError} = await adminDb.from('memberships')
    .select('workspace_id,role,status').eq('user_id',actor.id).eq('role','admin').eq('status','active').limit(1).maybeSingle();
  if (membershipError || !membership) return reply({error:'Acesso exclusivo do administrador.'},403);
  const workspaceId=membership.workspace_id;
  const log = async (action:string,targetId:string,details:Record<string,unknown>={}) => {
    await adminDb.from('admin_audit_log').insert({workspace_id:workspaceId,actor_id:actor.id,action,target_type:'user',target_id:targetId,details});
  };
  // A one-time token is verified by the app. No email verification or redirect
  // URL allow-list is needed for initial password setup.
  const setupLink=(token:string)=>`https://romulorasec.github.io/fieldwork/cloud.html#setup?token_hash=${encodeURIComponent(token)}`;

  try {
    if (req.method === 'GET') {
      const {data:members,error} = await adminDb.from('memberships')
        .select('user_id,role,status,profiles(full_name)').eq('workspace_id',workspaceId);
      if (error) return reply({error:'Falha ao listar membros.'},500);
      const {data:users,error:authError} = await adminDb.auth.admin.listUsers({page:1,perPage:1000});
      if (authError) return reply({error:'Falha ao listar contas.'},500);
      const mail = new Map(users.users.map(u=>[u.id,u.email||'']));
      return reply({members:(members||[]).map(m=>({id:m.user_id,email:mail.get(m.user_id)||'',name:(m.profiles as {full_name?:string}|null)?.full_name||'',role:m.role,status:m.status}))});
    }

    const body = await req.json();
    if (req.method === 'POST' && body.action === 'create') {
      const email=String(body.email||'').trim().toLowerCase();
      const name=String(body.name||'').trim();
      const role=String(body.role||'learner');
      if (!/^\S+@\S+\.\S+$/.test(email) || name.length<2 || name.length>120 || !roles.has(role)) return reply({error:'Confira nome, e-mail e função.'},400);
      // No user, contributor, partner or admin UI can create another administrator.
      const {data:created,error:createError}=await adminDb.auth.admin.createUser({email,email_confirm:true,user_metadata:{full_name:name}});
      if (createError || !created.user) return reply({error:'Não foi possível criar a conta. Confira se o e-mail já existe.'},409);
      const userId=created.user.id;
      const {error:memberError}=await adminDb.from('memberships').insert({workspace_id:workspaceId,user_id:userId,role,status:'active'});
      if (memberError) { await log('provision_failed',userId,{reason:'membership'}); return reply({error:'Conta criada, mas a permissão não foi atribuída. Contate o suporte administrativo.'},500); }
      const {data:link,error:linkError}=await adminDb.auth.admin.generateLink({type:'recovery',email});
      await log('create_user',userId,{role});
      if (linkError || !link?.properties?.hashed_token) return reply({error:'Conta criada. Gere um link de configuração pelo botão de recuperação.'},500);
      return reply({ok:true,id:userId,setup_link:setupLink(link.properties.hashed_token)},201);
    }

    if (req.method === 'POST' && body.action === 'setup-link') {
      const id=String(body.id||'');
      const {data:member}=await adminDb.from('memberships').select('user_id,role,status').eq('workspace_id',workspaceId).eq('user_id',id).maybeSingle();
      if (!member || member.role==='admin' || member.status!=='active') return reply({error:'Esta conta não permite redefinição por esse painel.'},403);
      const {data:user,error:userError}=await adminDb.auth.admin.getUserById(id);
      if (userError || !user.user?.email) return reply({error:'Conta indisponível.'},404);
      const {data:link,error}=await adminDb.auth.admin.generateLink({type:'recovery',email:user.user.email});
      if (error || !link?.properties?.hashed_token) return reply({error:'Falha ao gerar link.'},500);
      await log('reset_access',id);
      return reply({ok:true,setup_link:setupLink(link.properties.hashed_token)});
    }

    if (req.method === 'PATCH' && body.action === 'membership') {
      const id=String(body.id||''),role=String(body.role||''),status=String(body.status||'');
      if (id===actor.id || !roles.has(role) || !['active','suspended'].includes(status)) return reply({error:'Alteração não permitida.'},400);
      const {data:current}=await adminDb.from('memberships').select('role').eq('workspace_id',workspaceId).eq('user_id',id).maybeSingle();
      if (!current || current.role==='admin') return reply({error:'Conta administrativa protegida.'},403);
      const {error}=await adminDb.from('memberships').update({role,status}).eq('workspace_id',workspaceId).eq('user_id',id);
      if(error)return reply({error:'Falha ao atualizar permissões.'},500);
      await log('update_membership',id,{role,status});
      return reply({ok:true});
    }
    return reply({error:'Operação não disponível.'},405);
  } catch {
    return reply({error:'Não foi possível concluir a operação.'},500);
  }
});
