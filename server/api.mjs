import initialCategories from '../content/catalog.json' with { type: 'json' };
import initialProducts from '../content/products.json' with { type: 'json' };
const encoder=new TextEncoder();
const initial={categories:initialCategories,products:initialProducts,offers:[{id:'oferta-milka-exemplo',productId:'produto-milka-bubbly',title:'Oferta do dia',priceCents:990,originalPriceCents:null,start:'2026-10-10T09:00:00-03:00',end:'2026-10-11T00:00:00-03:00',enabled:false,note:'Preço de exemplo. Confira o valor e o período antes de ativar.'}]};
const cookieName='__Host-3irmaos-admin';
const localCookie='3irmaos-admin-local';
const error=(message,status=400)=>Object.assign(new Error(message),{status});
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const hex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const digest=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:100000,salt:encoder.encode(salt)},key,256));}
const equal=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
function cookies(request){return Object.fromEntries((request.headers.get('cookie')||'').split(';').map(x=>x.trim().split('=')));}
function cookie(request,value,age){const secure=new URL(request.url).protocol==='https:';return `${secure?cookieName:localCookie}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;}
async function body(request){if(Number(request.headers.get('content-length')||0)>800000)throw error('Conteúdo muito grande.',413);const text=await request.text();if(text.length>800000)throw error('Conteúdo muito grande.',413);try{return JSON.parse(text);}catch{throw error('Dados inválidos.');}}
function sameOrigin(request){if(request.headers.get('origin')!==new URL(request.url).origin)throw error('Origem inválida.',403);}
async function session(request,env,write=false){const c=cookies(request);const value=c[cookieName]||c[localCookie];if(!value||!/^[a-f0-9]{64}$/.test(value))throw error('Entre no painel para continuar.',401);const s=await env.DB.prepare('SELECT * FROM admin_session WHERE token_hash = ? AND expires_at > ?').bind(await digest(value),Date.now()).first();if(!s)throw error('Sua sessão terminou. Entre novamente.',401);if(write){sameOrigin(request);if(!equal(request.headers.get('x-csrf-token'),s.csrf))throw error('Atualize o painel e tente novamente.',403);}return s;}
export async function readState(env){if(!env.DB)return {state:structuredClone(initial),revision:0};const row=await env.DB.prepare('SELECT payload, revision FROM store_state WHERE id = ?').bind('catalog').first();return row?{state:JSON.parse(row.payload),revision:row.revision}:{state:structuredClone(initial),revision:0};}
export function publicCatalog(state){return state.categories.filter(c=>!c.hidden).map(c=>({...c,products:state.products.filter(p=>!p.hidden&&p.category===c.id)}));}
export function activeOffers(state,now=Date.now()){const visible=new Set(publicCatalog(state).flatMap(c=>c.products.map(p=>p.id)));return state.offers.filter(o=>o.enabled&&visible.has(o.productId)&&Date.parse(o.start)<=now&&now<Date.parse(o.end)).sort((a,b)=>Date.parse(a.end)-Date.parse(b.end)).map(o=>({...o,product:state.products.find(p=>p.id===o.productId)}));}
function cleanText(value,max=200,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw error('Confira os campos obrigatórios e os limites de texto.');return value.trim();}
function cleanImage(value){value=cleanText(value,1000);if(!value)return '/assets/favicon.png';if(/^\/(?:assets\/|api\/images\/)[\w./%-]+$/.test(value)&&!value.includes('..'))return value;throw error('Escolha uma imagem da galeria ou envie uma foto.');}
function unique(items,type){const ids=new Set();for(const i of items){if(!/^[a-z0-9][a-z0-9-]{1,90}$/.test(i.id)||ids.has(i.id))throw error('Identificador de '+type+' inválido ou repetido.');ids.add(i.id);}return ids;}
export function validateState(input){
 if(!input||!Array.isArray(input.categories)||!Array.isArray(input.products)||!Array.isArray(input.offers)||input.categories.length>50||input.products.length>1000||input.offers.length>100||!input.categories.length)throw error('Catálogo inválido.');
 const categories=input.categories.map(c=>({id:cleanText(c.id,90,true),name:cleanText(c.name,100,true),short:cleanText(c.short||'',180),description:cleanText(c.description||'',600),tag:cleanText(c.tag||c.name,100),color:/^#[a-f0-9]{6}$/i.test(c.color)?c.color:'#c6d7ff',image:cleanImage(c.image||''),hidden:!!c.hidden,items:Array.isArray(c.items)&&c.items.length<=100?c.items.map(x=>cleanText(x,160,true)):[],keywords:c.keywords||{}}));
 const categoryIds=unique(categories,'categoria');
 const products=input.products.map(p=>{if(!categoryIds.has(p.category))throw error('Há um produto sem categoria.');return{id:cleanText(p.id,90,true),category:p.category,name:cleanText(p.name,160,true),brand:cleanText(p.brand||'',100),detail:cleanText(p.detail||'',160),description:cleanText(p.description||'',900),keywords:cleanText(p.keywords||'',400),image:cleanImage(p.image),hidden:!!p.hidden,reference:cleanImage(p.reference||p.image),source:typeof p.source==='string'&&/^https:\/\/www\.instagram\.com\/[\w/.-]+\/?$/.test(p.source)?p.source:''};});
 const productIds=unique(products,'produto');
 const offers=input.offers.map(o=>{if(!productIds.has(o.productId))throw error('Há uma oferta sem produto.');if(!Number.isInteger(o.priceCents)||o.priceCents<1||o.priceCents>99999999)throw error('Informe um preço maior que zero.');if(o.originalPriceCents!=null&&(!Number.isInteger(o.originalPriceCents)||o.originalPriceCents<=o.priceCents||o.originalPriceCents>99999999))throw error('O preço anterior deve ser maior que o preço da oferta.');const start=Date.parse(o.start),end=Date.parse(o.end);if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw error('O término precisa ser depois do início.');return{id:cleanText(o.id,90,true),productId:o.productId,title:cleanText(o.title||'Oferta do dia',100,true),priceCents:o.priceCents,originalPriceCents:o.originalPriceCents??null,start:new Date(start).toISOString(),end:new Date(end).toISOString(),enabled:!!o.enabled,note:cleanText(o.note||'',600)};});
 unique(offers,'oferta');return{categories,products,offers};
}
export async function api(request,env){try{
 const path=new URL(request.url).pathname.replace(/\/$/,'');
 if(path.startsWith('/api/images/')&&request.method==='GET'){const key=path.slice(12);if(!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key))throw error('Foto não encontrada.',404);const image=await env.BUCKET?.get('products/'+key);if(!image)throw error('Foto não encontrada.',404);return new Response(image.body,{headers:{'Content-Type':image.httpMetadata.contentType,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});}
 if(path==='/api/catalog.js'&&request.method==='GET'){const {state}=await readState(env);const text='window.CATALOG = '+JSON.stringify(publicCatalog(state)).replace(/</g,'\\u003c')+';\nwindow.ACTIVE_OFFERS = '+JSON.stringify(activeOffers(state)).replace(/</g,'\\u003c')+';\nwindow.SERVER_TIME = '+Date.now()+';';return new Response(text,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
 if(path==='/api/offers'&&request.method==='GET')return json({offers:activeOffers((await readState(env)).state),now:Date.now()});
 if(!env.DB)throw error('O painel precisa de um banco de dados configurado na hospedagem.',503);
 if(path==='/api/auth/login'&&request.method==='POST'){
  sameOrigin(request);const input=await body(request);const ip=request.headers.get('cf-connecting-ip')||'local';const key=await digest(ip);const now=Date.now();
  const throttle=await env.DB.prepare('SELECT * FROM login_throttle WHERE key = ?').bind(key).first();if(throttle&&throttle.reset_at>now&&throttle.attempts>=8)throw error('Muitas tentativas. Aguarde 15 minutos.',429);
  await env.DB.prepare('INSERT INTO login_throttle (key,attempts,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN reset_at <= ? THEN 1 ELSE attempts+1 END, reset_at = CASE WHEN reset_at <= ? THEN ? ELSE reset_at END').bind(key,now+900000,now,now,now+900000).run();
  const account=await env.DB.prepare('SELECT * FROM admin_account WHERE id = ?').bind('admin').first();
  const salt=account?.salt||env.ADMIN_SALT;const expected=account?.password_hash||env.ADMIN_PASSWORD_HASH;
  if(!salt||!expected)throw error('O acesso administrativo precisa ser configurado.',503);
  const password=typeof input.password==='string'&&input.password.length<=200?input.password:'';
  const hash=await passwordHash(password,salt);
  if(input.username!==env.ADMIN_USERNAME||!equal(hash,expected))throw error('Login ou senha incorretos.',401);
  if(!account)await env.DB.prepare('INSERT OR IGNORE INTO admin_account (id,password_hash,salt,must_change) VALUES (?,?,?,1)').bind('admin',expected,salt).run();
  await env.DB.prepare('DELETE FROM login_throttle WHERE key = ?').bind(key).run();
  await env.DB.prepare('DELETE FROM admin_session WHERE expires_at <= ?').bind(now).run();
  const token=random(),csrf=random();await env.DB.prepare('INSERT INTO admin_session (token_hash,csrf,expires_at) VALUES (?,?,?)').bind(await digest(token),csrf,now+28800000).run();
  return json({csrf,mustChange:account?!!account.must_change:true,username:env.ADMIN_USERNAME},200,{'Set-Cookie':cookie(request,token,28800)});
 }
 const s=await session(request,env,request.method!=='GET');
 const account=await env.DB.prepare('SELECT must_change FROM admin_account WHERE id = ?').bind('admin').first();
 if(path==='/api/auth/session'&&request.method==='GET')return json({csrf:s.csrf,mustChange:!!account?.must_change,username:env.ADMIN_USERNAME});
 if(path==='/api/auth/logout'&&request.method==='POST'){await env.DB.prepare('DELETE FROM admin_session WHERE token_hash = ?').bind(s.token_hash).run();return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});}
 if(path==='/api/auth/password'&&request.method==='POST'){
  const input=await body(request);if(typeof input.password!=='string'||input.password.length<12||input.password.length>128)throw error('Use uma senha com 12 a 128 caracteres.');
  const current=await env.DB.prepare('SELECT * FROM admin_account WHERE id = ?').bind('admin').first();if(typeof input.current!=='string'||!equal(await passwordHash(input.current,current.salt),current.password_hash))throw error('A senha atual está incorreta.',401);
  const salt=random();const hash=await passwordHash(input.password,salt);await env.DB.batch([env.DB.prepare('UPDATE admin_account SET password_hash = ?, salt = ?, must_change = 0 WHERE id = ?').bind(hash,salt,'admin'),env.DB.prepare('DELETE FROM admin_session WHERE token_hash <> ?').bind(s.token_hash)]);return json({ok:true});
 }
 if(path==='/api/admin/state'&&request.method==='GET')return json(await readState(env));
 if(account?.must_change)throw error('Troque a senha inicial antes de salvar alterações.',403);
 if(path==='/api/admin/state'&&request.method==='PUT'){
  const input=await body(request);const state=validateState(input.state);if(!Number.isInteger(input.revision)||input.revision<0)throw error('Versão inválida.');
  await env.DB.prepare('INSERT OR IGNORE INTO store_state (id,payload,revision,updated_at) VALUES (?,?,0,?)').bind('catalog',JSON.stringify(initial),Date.now()).run();
  const result=await env.DB.prepare('UPDATE store_state SET payload = ?, revision = revision+1, updated_at = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(state),Date.now(),'catalog',input.revision).run();
  if(!result.meta.changes)throw error('O catálogo mudou em outra sessão. Recarregue antes de editar.',409);
  return json({state,revision:input.revision+1});
 }
 if(path==='/api/admin/image'&&request.method==='POST'){
  if(Number(request.headers.get('content-length')||0)>6000000)throw error('Envie uma foto com até 5 MB.',413);
  const form=await request.formData();const file=form.get('image');if(!file||typeof file==='string'||file.size>5000000)throw error('Envie uma foto JPG, PNG ou WebP com até 5 MB.');
  const bytes=new Uint8Array(await file.arrayBuffer());const signatures={'image/jpeg':bytes[0]===255&&bytes[1]===216&&bytes[2]===255,'image/png':bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10','image/webp':String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'};
  if(!signatures[file.type])throw error('O arquivo precisa ser uma imagem JPG, PNG ou WebP válida.');
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type],key=crypto.randomUUID()+'.'+ext;
  await env.BUCKET.put('products/'+key,bytes,{httpMetadata:{contentType:file.type}});return json({url:'/api/images/'+key});
 }
 throw error('Ação não encontrada.',404);
 }catch(e){if(!e.status)console.error('Store API failure',e.message);return json({error:e.status?e.message:'Não foi possível concluir. Tente novamente.'},e.status||500);}}
