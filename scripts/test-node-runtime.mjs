import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRuntime,publicRequest} from '../server/node-runtime.mjs';
import {api,readState} from '../server/api.mjs';
const dataDir=await mkdtemp(join(tmpdir(),'3irmaos-runtime-test-'));
const proxyRequest=publicRequest(new Request('http://internal:3000/api/offers',{headers:{'x-forwarded-host':'shop.test','x-forwarded-proto':'https','x-forwarded-for':'198.51.100.8, 192.0.2.4','cf-connecting-ip':'198.51.100.9'}}));
assert.equal(proxyRequest.url,'https://shop.test/api/offers');assert.equal(proxyRequest.headers.get('cf-connecting-ip'),'192.0.2.4');
const settings={NODE_ENV:'production',DATA_DIR:dataDir,ADMIN_USERNAME:'admin',ADMIN_PASSWORD:'local-runtime-test-only'};
let env=await createRuntime(settings),cookie='',csrf='';
function request(path,method='GET',body,override={}){const headers={host:'internal:3000','x-forwarded-host':'shop.test','x-forwarded-proto':'https','x-forwarded-for':'192.0.2.4'};if(cookie)headers.cookie=cookie;if(method!=='GET'){headers.origin='https://shop.test';headers['x-csrf-token']=csrf;}Object.assign(headers,override);const value=body instanceof FormData?body:body?JSON.stringify(body):undefined;return publicRequest(new Request('http://internal:3000/api/'+path,{method,headers,body:value}));}
async function call(path,method='GET',body,override={}){const response=await api(request(path,method,body,override),env);return {response,data:await response.json()};}
try{
 assert.equal((await call('admin/state')).response.status,401);
 const login=await call('auth/login','POST',{username:'admin',password:settings.ADMIN_PASSWORD});assert.equal(login.response.status,200);assert.match(login.response.headers.get('set-cookie'),/Secure/);cookie=login.response.headers.get('set-cookie').split(';')[0];csrf=login.data.csrf;
 assert.equal((await call('auth/password','POST',{current:settings.ADMIN_PASSWORD,password:'local-runtime-new-password'})).response.status,200);
 const snapshot=(await call('admin/state')).data;snapshot.state.products[0].name='Produto salvo no Node.js';assert.equal((await call('admin/state','PUT',snapshot)).response.status,200);assert.equal((await call('admin/state','PUT',snapshot)).response.status,409);assert.equal((await call('admin/state','PUT',{...snapshot,revision:1},{origin:'https://other.test'})).response.status,403);
 const form=new FormData();const photo=await readFile(new URL('../site/assets/catalogo/milka-v1.jpg',import.meta.url));form.append('image',new Blob([photo],{type:'image/jpeg'}),'photo.jpg');const upload=await call('admin/image','POST',form);assert.equal(upload.response.status,200);const key=upload.data.url.slice('/api/images/'.length);
 await env.close();env=await createRuntime(settings);assert.equal((await readState(env)).state.products[0].name,'Produto salvo no Node.js');const loaded=await api(request('images/'+key),env);assert.equal(loaded.status,200);assert.deepEqual(Buffer.from(await loaded.arrayBuffer()),photo);
 cookie='';const relogin=await call('auth/login','POST',{username:'admin',password:'local-runtime-new-password'});assert.equal(relogin.response.status,200);assert.equal(relogin.data.mustChange,false);
 const unconfigured=await createRuntime({NODE_ENV:'production'});assert.equal(unconfigured.DB,undefined);assert.equal((await readState(unconfigured)).state.products.length,21);const closedAdmin=await api(request('auth/login','POST',{username:'admin',password:'anything'}),unconfigured);assert.equal(closedAdmin.status,503);
 console.log('Passed: standalone storage persists catalog, passwords and uploaded images; HTTPS/CSRF and stale-edit protection; production admin stays closed without database configuration.');
}finally{await env.close();await rm(dataDir,{recursive:true,force:true});}
