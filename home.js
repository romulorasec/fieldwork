/* Public presentation only. An access request does not register a user. */
(() => {
  'use strict';
  const dialog=document.getElementById('request-dialog');
  const form=document.getElementById('request-form');
  const feedback=document.getElementById('request-feedback');
  const open=()=>{feedback.textContent='';feedback.className='form-feedback';dialog.showModal();};
  document.querySelectorAll('[data-open-request]').forEach(b=>b.addEventListener('click',open));
  document.getElementById('close-request')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const payload=new FormData(form);
    if(String(payload.get('company_site')||'').trim()){form.reset();feedback.textContent='Solicitação registrada para análise.';return;}
    const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Enviando...';
    feedback.className='form-feedback';feedback.textContent='';
    const key='sb_publishable_d63dzOYYlVz_roIKWNDdtA_unX1asFf';
    try{
      const response=await fetch('https://xmvbzntawfmgnsuqhztw.supabase.co/rest/v1/access_requests',{
        method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify({full_name:String(payload.get('full_name')||'').trim(),email:String(payload.get('email')||'').trim().toLowerCase(),intent:String(payload.get('intent')||'web-designer')})
      });
      if(response.ok){form.reset();feedback.textContent='Solicitação enviada. O administrador avaliará o pedido antes de liberar qualquer conta.';}
      else if(response.status===409){feedback.textContent='Já pode haver um pedido pendente para este e-mail. Aguarde a análise do administrador.';}
      else{feedback.className='form-feedback error';feedback.textContent='Não foi possível enviar agora. Tente novamente mais tarde.';}
    }catch{feedback.className='form-feedback error';feedback.textContent='Sem conexão no momento. Tente novamente mais tarde.';}
    finally{button.disabled=false;button.textContent='Enviar solicitação';}
  });
})();
