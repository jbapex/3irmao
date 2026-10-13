import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getRuntime, publicRequest } from '../../server/node-runtime.mjs';
import { readState, publicCatalog, activeOffers } from '../../server/api.mjs';
import { renderPage } from '../../server/render.mjs';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const pages: Record<string,string> = {'/':'index.html','/produtos/':'produtos/index.html','/para-seu-negocio/':'para-seu-negocio/index.html','/novidades/':'novidades/index.html','/a-3-irmaos/':'a-3-irmaos/index.html','/lojas/':'lojas/index.html','/admin/':'admin/index.html'};
const templates = new Map<string,Promise<string>>();
function template(path:string) {
 if(!templates.has(path)) templates.set(path,readFile(join(process.cwd(),'site',pages[path]),'utf8'));
 return templates.get(path)!;
}
export async function GET(request: Request) {
 request=publicRequest(request);
 const rawPath=new URL(request.url).pathname;
 const path=rawPath==='/'?'/':rawPath.replace(/\/$/,'')+'/';
 if(pages[path]) {
  let html=await template(path);
  const env=await getRuntime();
  html=html.replaceAll('https://distribuidora-3-irmaos.josiasbonfim.chatgpt.site',new URL(request.url).origin);
  if(path!=='/admin/') {
   const {state}=await readState(env),catalog=publicCatalog(state),now=Date.now();
   const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
   html=renderPage(html,catalog).replace('<script src="/api/catalog.js" defer></script>',()=>`<script>window.CATALOG=${json(catalog)};window.ACTIVE_OFFERS=${json(activeOffers(state,now))};window.SERVER_TIME=${now};</script>`);
  }
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
 }
 return new Response('Página não encontrada',{status:404});
}
