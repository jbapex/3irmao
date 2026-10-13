const escape=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const plus='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const add=(id,name)=>`<button class="add-product" data-add="${escape(id)}" aria-label="Adicionar ${escape(name)} à lista"><span>Adicionar à lista</span><i>${plus}</i></button>`;
const photo=(p)=>`<img class="studio-photo" src="${escape(p.image)}" alt="${escape(p.name)}" width="1024" height="1024" loading="lazy" decoding="async">`;
export function renderPage(html,catalog){
 if(html.includes('data-catalog-products')){
  const products=catalog.flatMap(c=>c.products.map(p=>`<article class="product-item catalog-product has-photo" data-product="${escape(p.id)}" data-category="${escape(c.id)}"><button class="product-item-photo" data-view-product="${escape(p.id)}" aria-label="Ver detalhes de ${escape(p.name)}">${photo(p)}</button><div class="catalog-product-copy"><p class="catalog-product-brand">${escape(p.brand)}</p><h3><button data-view-product="${escape(p.id)}">${escape(p.name)}</button></h3><p class="catalog-product-detail">${escape(p.detail)}</p><p class="catalog-product-description">${escape(p.description)}</p>${p.source?`<a class="catalog-product-source" href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">Ver publicação da loja</a>`:''}<p class="catalog-price" data-product-price="${escape(p.id)}">Consultar preço</p></div>${add(p.id,p.name)}</article>`)).join('');
  const groups=catalog.flatMap(c=>c.items.map((name,i)=>`<article class="product-item catalog-group" data-product="${escape(c.id)}-${i}" data-category="${escape(c.id)}"><div class="product-item-top"><span>${escape(c.name)}</span></div><h3>${escape(name)}</h3>${add(c.id+'-'+i,name)}</article>`)).join('');
  const count=catalog.reduce((n,c)=>n+c.products.length+c.items.length,0);
  const controls=`<button class="category-filter" data-filter="todos" aria-pressed="true"><span>Todos os produtos</span><small>${count}</small></button>`+catalog.map(c=>`<button class="category-filter" data-filter="${escape(c.id)}" aria-pressed="false"><span class="filter-name">${escape(c.name)}</span><small>${c.products.length+c.items.length}</small></button>`).join('');
  html=html.replace(/(<div class="category-filters">)[\s\S]*?(<\/div><\/aside>)/,(_match,before,after)=>before+controls+after);
  html=html.replace(/(<section class="catalog-product-section"[\s\S]*?<div class="product-results">)[\s\S]*?(<\/div><\/section>)/,(_match,before,after)=>before+products+after);
  html=html.replace(/(<section class="catalog-group-section"[\s\S]*?<div class="product-results">)[\s\S]*?(<\/div><\/section>)/,(_match,before,after)=>before+groups+after);
 }
 // Existing home sections keep their layout while reflecting category changes.
 html=html.replace(/<a class="department-card" href="\/produtos\/\?categoria=([\w-]+)">[\s\S]*?<\/a>/g,(markup,id)=>{const c=catalog.find(c=>c.id===id);if(!c)return '';return markup.replace(/<h4>[\s\S]*?<\/h4>/,`<h4>${escape(c.name)}</h4>`).replace(/<p>[\s\S]*?<\/p>/,`<p>${escape(c.short)}</p>`).replace(c.image&&c.image!=='/assets/favicon.png'?/src="[^"]+"/:/$^/,`src="${escape(c.image)}"`);});
 const existing=['confeitaria','frios','doces','alimentos','embalagens','festas','utensilios','cestas'];const added=catalog.filter(c=>!existing.includes(c.id));
 if(added.length)html=html.replace('<div class="wrap department-groups">',`<div class="wrap department-groups"><section class="home-department-group"><div class="department-group-heading"><h3>Mais departamentos</h3></div><div class="department-grid">${added.map(c=>`<a class="department-card" href="/produtos/?categoria=${escape(c.id)}"><div class="department-image">${photo({name:c.name,image:c.image||c.products[0]?.image||'/assets/favicon.png'})}</div><div class="department-copy"><h4>${escape(c.name)}</h4><p>${escape(c.short)}</p></div></a>`).join('')}</div></section>`);
 return html;
}
