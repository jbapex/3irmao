(function(root){
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  function indexCatalog(catalog){
    return Object.fromEntries(catalog.flatMap(category => [
      ...category.items.map((name,i) => [category.id+'-'+i,{id:category.id+'-'+i,name,category:category.id,categoryName:category.name,kind:'group',keywords:category.keywords?.[i]||''}]),
      ...(category.products||[]).map(product => [product.id,{...product,id:product.id,name:product.name,category:category.id,categoryName:category.name,kind:'product',keywords:[product.brand,product.detail,product.description,product.keywords].filter(Boolean).join(' ')}])
    ]));
  }
  function restoreList(raw,index){
    try {
      const input = JSON.parse(raw);
      if(!Array.isArray(input)) return [];
      const seen = new Set();
      return input.filter(item => item && typeof item.id==='string' && Object.prototype.hasOwnProperty.call(index,item.id) && !seen.has(item.id) && seen.add(item.id)).slice(0,Object.keys(index).length).map(item => ({id:item.id,quantity:typeof item.quantity==='string'?item.quantity.slice(0,80):''}));
    } catch { return []; }
  }
  function matching(item,category,query){return (category==='todos'||item.category===category) && normalize(item.name+' '+item.categoryName+' '+(item.keywords||'')).includes(normalize(query));}
  function listText(list,index){return list.filter(item=>index[item.id]).map(item=>'- '+index[item.id].name+(item.quantity.trim()?' — '+item.quantity.trim():'')).join('\n');}
  function whatsappUrl(store,message){
    if(!store || !/^55\d{10,11}$/.test(store.whatsapp)) throw new Error('Loja inválida');
    return 'https://wa.me/'+store.whatsapp+'?text='+encodeURIComponent(message);
  }
  const api={normalize,indexCatalog,restoreList,matching,listText,whatsappUrl};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.ShopCore=api;
})(typeof window!=='undefined'?window:globalThis);
