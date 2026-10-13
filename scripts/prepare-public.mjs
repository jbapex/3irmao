import { cp, mkdir, readdir, rm } from 'node:fs/promises';
await mkdir('public',{recursive:true});
await cp('site','public',{recursive:true});
async function removeTemplates(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())await removeTemplates(path);else if(item.name==='index.html'||item.name==='catalog-data.js')await rm(path);}}
await removeTemplates('public');
console.log('Static assets prepared; HTML and catalog are served from the database.');
