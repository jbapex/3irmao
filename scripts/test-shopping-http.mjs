import assert from 'node:assert/strict';
const origin='http://localhost:4317';
const login=await fetch(origin+'/api/auth/login/',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:'local-preview-only'})});
assert.equal(login.status,200);const auth=await login.json(),cookie=login.headers.get('set-cookie').split(';')[0];
const headers={Origin:origin,Cookie:cookie,'X-CSRF-Token':auth.csrf,'Content-Type':'application/json'};
const snapshot=await (await fetch(origin+'/api/admin/state/',{headers})).json();let revision=snapshot.revision;
try {
 const state=structuredClone(snapshot.state);state.products[0].name='Teste $& </script> & produto';state.products[1].hidden=true;
 state.offers=[{id:'oferta-teste-mobile',productId:state.products[0].id,title:'Oferta de teste',priceCents:990,originalPriceCents:null,start:new Date(Date.now()-60000).toISOString(),end:new Date(Date.now()+60000).toISOString(),enabled:true,note:'Teste local'}];
 const save=await fetch(origin+'/api/admin/state/',{method:'PUT',headers,body:JSON.stringify({state,revision})});assert.equal(save.status,200);revision=(await save.json()).revision;
 const html=await (await fetch(origin+'/produtos/')).text();const script=html.match(/<script>window.CATALOG=(.*?);window.ACTIVE_OFFERS=(.*?);window.SERVER_TIME=(\d+);<\/script>/s);assert.ok(script,'Catalog snapshot must be included in the HTML');
 const catalog=JSON.parse(script[1]),offers=JSON.parse(script[2]);assert.equal(catalog.flatMap(c=>c.products).find(p=>p.id===state.products[0].id).name,state.products[0].name);assert.ok(!catalog.flatMap(c=>c.products).some(p=>p.id===state.products[1].id));assert.ok(!script[1].includes('</script>'));assert.equal(offers.length,1);assert.equal(offers[0].priceCents,990);assert.ok(html.includes('Teste $&amp; &lt;/script&gt; &amp; produto'));assert.ok(html.includes('data-view-product="'+state.products[0].id+'"'));assert.ok(html.includes('data-product-price="'+state.products[0].id+'"'));
 console.log('Passed: current D1 catalog embedded safely, hidden product omitted, active offer included, product photo/detail controls rendered.');
} finally {
 const restore=await fetch(origin+'/api/admin/state/',{method:'PUT',headers,body:JSON.stringify({state:snapshot.state,revision})});assert.equal(restore.status,200,'Restore local test state');await fetch(origin+'/api/auth/logout/',{method:'POST',headers});
}
