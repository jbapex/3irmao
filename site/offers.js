'use strict';
(()=>{
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const dialog=$('#offer-dialog');if(!dialog)return;
 let offers=window.ACTIVE_OFFERS||[],offset=(window.SERVER_TIME||Date.now())-Date.now(),opener=null,renderedSignature='',bannerSignature='',publishedSignature='';
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=cents=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
 const date=value=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
 const active=o=>Date.parse(o.start)<=Date.now()+offset&&Date.now()+offset<Date.parse(o.end);
 function contact(){const store=window.SITE_CONFIG.stores[$('#offer-store').value];$$('[data-offer-contact]').forEach(link=>{const o=offers.find(o=>o.id===link.dataset.offerContact);if(!o)return;link.href=window.ShopCore.whatsappUrl(store,'Olá! Gostaria de consultar a oferta: '+o.product.name+' por '+money(o.priceCents)+'. '+o.product.detail+'\nValidade: '+date(o.end)+' (horário de Brasília).\nLoja: '+store.name);});}
 function render(){const signature=JSON.stringify(offers);if(signature===renderedSignature)return;renderedSignature=signature;const focused=document.activeElement,focusedId=focused?.dataset.offerContact;
 dialog.classList.toggle('single-offer',offers.length===1);dialog.classList.toggle('many-offers',offers.length>=3);$('#offer-title').textContent=offers.length===1?'Oferta do dia':'Ofertas do dia';$('[data-offer-summary]').textContent=offers.length===1?'Confira o produto, o preço e a validade.':offers.length+' ofertas disponíveis. Confira a validade de cada produto.';
 $('[data-offer-grid]').innerHTML=offers.map(o=>`<article class="offer-card" data-offer-id="${e(o.id)}"><div class="offer-card-photo"><img src="${e(o.product.image)}" alt="${e(o.product.name)}" width="1024" height="1024"></div><div class="offer-card-copy"><p class="offer-card-label">${e(o.title||'Oferta do dia')}</p><h3>${e(o.product.name)}</h3><p class="offer-card-detail">${e(o.product.detail)}</p><div class="offer-pricing">${o.originalPriceCents?`<span>De ${money(o.originalPriceCents)}</span>`:''}<strong>${money(o.priceCents)}</strong></div><p class="offer-period">Até ${date(o.end)} · Brasília</p><p class="offer-note">${e(o.note||'Consulte a disponibilidade na unidade.')}</p><a class="btn btn-blue full-width" data-offer-contact="${e(o.id)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar oferta de ${e(o.product.name)}"><span>Consultar esta oferta</span></a></div></article>`).join('');contact();
 if(dialog.open&&focusedId){const replacement=$$('[data-offer-contact]').find(x=>x.dataset.offerContact===focusedId);(replacement||$('[data-close-offer]')).focus({preventScroll:true});}
 }
 function banner(){const signature=JSON.stringify(offers);if(signature===bannerSignature)return;bannerSignature=signature;if(!offers.length)return;const first=offers[0],plural=offers.length>1;
 $$('[data-offer-label]').forEach(x=>x.textContent=plural?'Ofertas do dia':'Oferta do dia');$$('[data-offer-trigger-image]').forEach(x=>{x.src=first.product.image;x.alt='';});
 $$('[data-offer-banner-photos]').forEach(x=>x.innerHTML=offers.slice(0,3).map(o=>`<img src="${e(o.product.image)}" alt="${e(o.product.name)}" width="96" height="96">`).join(''));
 $$('[data-offer-banner-name]').forEach(x=>x.textContent=plural?offers.length+' ofertas disponíveis':first.product.name);$$('[data-offer-banner-detail]').forEach(x=>x.textContent=plural?'Veja todos os produtos, preços e prazos.':first.product.detail);$$('[data-offer-banner-price]').forEach(x=>{x.hidden=plural;x.textContent=money(first.priceCents);});$$('[data-offer-banner-action]').forEach(x=>x.textContent=plural?'Ver todas as ofertas':'Ver oferta');
 }
 function update(){offers=offers.filter(active);const signature=JSON.stringify(offers);if(signature!==publishedSignature){publishedSignature=signature;window.dispatchEvent(new CustomEvent('offers:change',{detail:offers}));}$$('[data-open-offer]').forEach(b=>b.hidden=!offers.length);$$('[data-offer-banner]').forEach(b=>b.hidden=!offers.length);banner();if(offers.length){if(dialog.open)render();}else if(dialog.open){dialog.close();}}
 $$('[data-open-offer]').forEach(b=>b.addEventListener('click',()=>{update();if(!offers.length)return;const menu=$('#mobile-menu');opener=menu?.contains(b)?$('[data-menu-trigger]'):b;if(menu?.open)menu.close();render();dialog.showModal();document.body.classList.add('dialog-open');}));
 $('[data-close-offer]').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');if(opener?.isConnected&&!opener.hidden)opener.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 $('#offer-store').addEventListener('change',contact);update();setInterval(update,1000);
 async function refresh(){try{const r=await fetch('/api/offers',{cache:'no-store'});if(!r.ok)return;const data=await r.json();offers=data.offers;offset=data.now-Date.now();update();}catch{}}
 setInterval(refresh,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
