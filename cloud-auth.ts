import {client,root,$,notice,state} from './cloud-core';

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

export async function signOut(){await client.auth.signOut();state.user=null;state.member=null;state.prospects=[];state.audits=[];state.tasks=[];history.replaceState(null,'','cloud.html');showLogin(async()=>{location.reload();});}
