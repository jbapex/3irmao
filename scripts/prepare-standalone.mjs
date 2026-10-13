import {access,cp,mkdir,readFile} from 'node:fs/promises';
await access('.next/standalone/server.js');
await cp('public','.next/standalone/public',{recursive:true});
await mkdir('.next/standalone/.next',{recursive:true});
await cp('.next/static','.next/standalone/.next/static',{recursive:true});
// Keep route-handler HTML templates with the standalone server.
for(const path of ['index.html','produtos/index.html','para-seu-negocio/index.html','novidades/index.html','a-3-irmaos/index.html','lojas/index.html','admin/index.html']){
 const target='.next/standalone/site/'+path;await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await cp('site/'+path,target);
}
console.log('Next.js standalone ready: .next/standalone/server.js (pages, photos and scripts included).');
