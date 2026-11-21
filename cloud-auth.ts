import {client,root,$,notice,state,esc} from './cloud-core';

export function showLogin(onSuccess:()=>Promise<void>,setup=false){
  root.innerHTML=`<div class="cloud-auth"><section class="cloud-auth-intro"><span class="eyebrow">FIELDWORK / WORKSPACE PRIVADO</span><h1>Aprender. Executar. Vender.</h1><p>Seus diagnósticos, aprendizados e oportunidades, conectados em uma única área.</p><a href="index.html" style="color:#74e7d2">Conhecer o Fieldwork</a></section><main class="cloud-auth-form"><h2>${setup?'Defina sua senha':'Entrar no Fieldwork'}</h2><p>${setup?'Escolha uma senha forte para ativar o acesso.':'Seu acesso é criado pelo administrador. Não há cadastro público.'}</p><form id="cloud-auth-form">${setup?'':`<label>E-mail<input name="email" type="email" required autocomplete="username"></label>`}<label>${setup?'Nova senha':'Senha'}<input name="password" type="password" minlength="12" required autocomplete="${setup?'new-password':'current-password'}"></label><button class="cloud-button">${setup?'Salvar senha':'Entrar'}</button></form><p id="cloud-feedback" aria-live="polite"></p><a class="back" href="index.html">Voltar à apresentação</a></main></div>`;
  $('#cloud-auth-form')?.addEventListener('submit',async e=>{
    e.preventDefault();const f=e.currentTarget as HTMLFormElement;const button=f.querySelector('button')!;button.disabled=true;
    const password=(f.elements.namedItem('password') as HTMLInputElement).value;
    if(setup){const {error}=await client.auth.updateUser({password});if(error)notice('Não foi possível definir a senha. Confira o link.',true);else{history.replaceState(null,'','cloud.html');await onSuccess();}}
    else{const email=(f.elements.namedItem('email') as HTMLInputElement).value.trim();const {error}=await client.auth.signInWithPassword({email,password});if(error)notice('Credenciais inválidas ou conta ainda não habilitada.',true);else await onSuccess();}
    button.disabled=false;
  });
}

export async function showMFA(onSuccess:()=>Promise<void>,onExit:()=>Promise<void>){
  root.innerHTML=`<div class="cloud-auth"><section class="cloud-auth-intro"><span class="eyebrow">FIELDWORK / SEGURANÇA</span><h1>Uma proteção extra para quem administra.</h1><p>O segundo fator protege o cadastro de usuários e as permissões sensíveis.</p></section><main class="cloud-auth-form"><h2>Autenticação adicional</h2><p>Use seu aplicativo autenticador.</p><div id="cloud-mfa"></div><p id="cloud-feedback" aria-live="polite"></p><button class="cloud-button secondary" id="cloud-exit">Sair</button></main></div>`;
  $('#cloud-exit')?.addEventListener('click',onExit);
  const {data:list,error}=await client.auth.mfa.listFactors();if(error){notice('Não foi possível carregar seus fatores.',true);return;}
  const verified=list?.totp?.find(f=>f.status==='verified');
  const form=(factorId:string)=>{
    $('#cloud-mfa')!.innerHTML+='<form id="cloud-mfa-form" class="cloud-form"><label>Código do autenticador<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="6" required></label><button class="cloud-button">Confirmar código</button></form>';
    $('#cloud-mfa-form')!.addEventListener('submit',async e=>{e.preventDefault();const code=(e.currentTarget as HTMLFormElement).querySelector('input')!.value;const {data:challenge,error:cError}=await client.auth.mfa.challenge({factorId});if(cError||!challenge){notice('Não foi possível verificar.',true);return;}const {error:vError}=await client.auth.mfa.verify({factorId,challengeId:challenge.id,code});if(vError)notice('Código incorreto.',true);else await onSuccess();});
  };
  if(verified){form(verified.id);return;}
  $('#cloud-mfa')!.innerHTML='<button class="cloud-button" id="cloud-enroll">Configurar autenticador</button>';
  $('#cloud-enroll')?.addEventListener('click',async()=>{const {data,error:eError}=await client.auth.mfa.enroll({factorType:'totp'});if(eError||!data){notice('Não foi possível configurar.',true);return;}$('#cloud-mfa')!.innerHTML=`<p>Escaneie o QR Code no seu aplicativo autenticador e informe o código.</p><img alt="QR Code para autenticação" style="width:190px;max-width:100%" src="${esc(data.totp.qr_code)}">`;form(data.id);});
}

export async function signOut(){await client.auth.signOut();state.user=null;state.member=null;state.prospects=[];state.audits=[];state.tasks=[];history.replaceState(null,'','cloud.html');showLogin(async()=>{location.reload();});}
