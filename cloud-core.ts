import {createClient} from '@supabase/supabase-js';

// This is a PUBLIC publishable key, never a secret or service-role key.
export const client=createClient('https://xmvbzntawfmgnsuqhztw.supabase.co','sb_publishable_d63dzOYYlVz_roIKWNDdtA_unX1asFf',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export const root=document.getElementById('cloud-root')!;
export const $=(selector:string)=>root.querySelector<HTMLElement>(selector);
export const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const roles:Record<string,string>={admin:'Administrador',sales:'Comercial',contributor:'Contribuidor',reviewer:'Revisor',partner:'Parceiro',learner:'Aluno'};
export const stages=['Prospect','Respondeu','Reunião','Proposta','Contrato','Perdido'];
export const state:{user:any,member:any,view:string,prospects:any[],audits:any[],tasks:any[]}={user:null,member:null,view:'today',prospects:[],audits:[],tasks:[]};
export const safeUrl=(s:string)=>{try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};
export const notice=(message:string,error=false)=>{const node=$('#cloud-feedback');if(node){node.textContent=message;node.className='cloud-feedback'+(error?' error':'');}};
export const shortDate=(s:string)=>s?new Date(s).toLocaleDateString('pt-BR'):'';
export const canSell=()=>['sales','admin'].includes(state.member?.role);
export const canAudit=()=>['sales','learner','admin'].includes(state.member?.role);
export const isAdmin=()=>state.member?.role==='admin';
export async function loadRecords(){
  const role=state.member?.role;
  const reads:Promise<unknown>[]=[];
  if(['sales','partner','admin'].includes(role))reads.push(client.from('prospects').select('*').order('updated_at',{ascending:false}).limit(300).then(({data})=>{state.prospects=data||[];}));else state.prospects=[];
  if(canAudit())reads.push(client.from('audits').select('*').order('updated_at',{ascending:false}).limit(200).then(({data})=>{state.audits=data||[];}));else state.audits=[];
  if(canAudit())reads.push(client.from('tasks').select('*').order('created_at',{ascending:false}).limit(200).then(({data})=>{state.tasks=data||[];}));else state.tasks=[];
  await Promise.all(reads);
}
