import { env } from 'cloudflare:workers';
import home from '../../site/index.html?raw';
import products from '../../site/produtos/index.html?raw';
import business from '../../site/para-seu-negocio/index.html?raw';
import news from '../../site/novidades/index.html?raw';
import story from '../../site/a-3-irmaos/index.html?raw';
import stores from '../../site/lojas/index.html?raw';
import admin from '../../site/admin/index.html?raw';
import { readState, publicCatalog, activeOffers } from '../../server/api.mjs';
import { renderPage } from '../../server/render.mjs';
export const dynamic = 'force-dynamic';
const pages: Record<string,string> = {'/':home,'/produtos/':products,'/para-seu-negocio/':business,'/novidades/':news,'/a-3-irmaos/':story,'/lojas/':stores,'/admin/':admin};
export async function GET(request: Request) {
 const rawPath=new URL(request.url).pathname;
 const path=rawPath==='/'?'/':rawPath.replace(/\/$/,'')+'/';
 if(pages[path]) {
  let html=pages[path];
  if(path!=='/admin/') {
   const {state}=await readState(env),catalog=publicCatalog(state),now=Date.now();
   const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
   html=renderPage(html,catalog).replace('<script src="/api/catalog.js" defer></script>',()=>`<script>window.CATALOG=${json(catalog)};window.ACTIVE_OFFERS=${json(activeOffers(state,now))};window.SERVER_TIME=${now};</script>`);
  }
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
 }
 return new Response('Página não encontrada',{status:404});
}
