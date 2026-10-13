import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const dataDir=await mkdtemp(join(tmpdir(),'3irmaos-standalone-test-'));
const origin='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['.next/standalone/server.js'],{env:{...process.env,PORT:String(port),HOSTNAME:'127.0.0.1',NODE_ENV:'production',DATA_DIR:dataDir,DB_NAME:'',DATABASE_URL:'',ADMIN_USERNAME:'admin',ADMIN_PASSWORD:'local-preview-only',ADMIN_PASSWORD_HASH:'',ADMIN_SALT:''},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
let cookie='',csrf='';
async function call(path,method='GET',body,extra={}){const headers={host:'internal:3000','x-forwarded-host':'shop.test','x-forwarded-proto':'https',...extra};if(cookie)headers.cookie=cookie;if(method!=='GET'){headers.origin=extra.origin||'https://shop.test';headers['x-csrf-token']=csrf;}if(body&&!(body instanceof FormData))headers['content-type']='application/json';const response=await fetch(origin+'/api/'+path,{method,headers,body:body instanceof FormData?body:body?JSON.stringify(body):undefined,redirect:'manual'});return {response,data:await response.json()};}
try{
 let ready=false;for(let i=0;i<40;i++){try{const r=await fetch(origin+'/');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}assert.ok(ready,logs);
 for(const path of ['/','/produtos/','/lojas/','/para-seu-negocio/','/novidades/','/a-3-irmaos/','/admin/']){const r=await fetch(origin+path,{redirect:'manual'});assert.equal(r.status,200,path);assert.match(await r.text(),/<html lang="pt-BR"/);}
 for(const path of ['/app.js?v=31','/model.js?v=30','/shopping.css?v=31','/assets/catalogo/milka-v1.jpg','/assets/logo.png','/historia-game.js'])assert.equal((await fetch(origin+path)).status,200,path);
 const login=await call('auth/login','POST',{username:'admin',password:'local-preview-only'});assert.equal(login.response.status,200);assert.match(login.response.headers.get('set-cookie'),/Secure/);cookie=login.response.headers.get('set-cookie').split(';')[0];csrf=login.data.csrf;
 assert.equal((await call('auth/password','POST',{current:'local-preview-only',password:'standalone-test-new-password'})).response.status,200);
 const snapshot=(await call('admin/state')).data;snapshot.state.products[0].name='Produto atualizado no standalone';snapshot.state.offers[0]={...snapshot.state.offers[0],enabled:true,start:new Date(Date.now()-10000).toISOString(),end:new Date(Date.now()+60000).toISOString()};
 assert.equal((await call('admin/state','PUT',snapshot)).response.status,200);assert.equal((await call('admin/state','PUT',snapshot)).response.status,409);assert.equal((await call('admin/state','PUT',{...snapshot,revision:1},{origin:'https://other.test'})).response.status,403);
 const html=await (await fetch(origin+'/produtos/')).text();assert.match(html,/Produto atualizado no standalone/);assert.equal((await (await fetch(origin+'/api/offers')).json()).offers.length,1);
 const photo=await readFile('site/assets/catalogo/milka-v1.jpg');const form=new FormData();form.append('image',new Blob([photo],{type:'image/jpeg'}),'photo.jpg');const upload=await call('admin/image','POST',form);assert.equal(upload.response.status,200);const image=await fetch(origin+upload.data.url);assert.equal(image.status,200);assert.deepEqual(Buffer.from(await image.arrayBuffer()),photo);
 console.log('Passed: real Node.js standalone serves all pages and assets; HTTPS proxy login, catalog updates, CSRF, conflicts, offers and image uploads work over HTTP.');
}finally{child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));await rm(dataDir,{recursive:true,force:true});}
