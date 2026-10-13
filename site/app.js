'use strict';
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const config = window.SITE_CONFIG;
  const catalog = window.CATALOG;
  const core = window.ShopCore;
  const index = core.indexCatalog(catalog);
  const storageKey = '3irmaos-consulta-v2';
  const preferenceKey = '3irmaos-motion-paused';
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stored='',motionPreference=false;
  try { stored=sessionStorage.getItem(storageKey)||'[]'; motionPreference=sessionStorage.getItem(preferenceKey)==='1'; } catch {}
  let list=core.restoreList(stored,index);
  let toastTimer;
  function shouldMove(){return !reduceQuery.matches && !motionPreference;}
  function track(name,details={}) { if(typeof window.gtag==='function')window.gtag('event',name,details); }
  function persist(){try{sessionStorage.setItem(storageKey,JSON.stringify(list));}catch{}}
  function toast(text){const el=$('[data-toast]');el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},3200);}
  function updateCounts(){
    $$('[data-list-count]').forEach(el=>{el.textContent=String(list.length);el.toggleAttribute('data-empty-count',list.length===0);});
    $$('[data-add]').forEach(button=>{
      const added=list.some(item=>item.id===button.dataset.add);
      button.classList.toggle('is-added',added);
      $('span',button).textContent=added?'Na sua lista':'Adicionar à lista';
      $('i',button).innerHTML=added?'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>':'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
      button.setAttribute('aria-label',(added?'Ver na lista: ':'Adicionar à lista: ')+index[button.dataset.add].name);
    });
    const include=$('[data-include-list]'); if(include)include.hidden=list.length===0;
  }
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=cents=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
  let currentOffers=window.ACTIVE_OFFERS||[];
  const offerFor=id=>currentOffers.find(o=>o.product.id===id);
  function updatePrices(){
    $$('[data-product-price]').forEach(el=>{const offer=offerFor(el.dataset.productPrice);el.classList.toggle('is-offer',!!offer);el.textContent=offer?'Oferta · '+money(offer.priceCents):'Consultar preço';});
  }
  window.addEventListener('offers:change',event=>{currentOffers=event.detail;updatePrices();});
  function renderList(){
    const ul=$('[data-list-items]');ul.replaceChildren();
    list.forEach(item=>{
      const li=document.createElement('li');li.className='consultation-item';
      const product=index[item.id];
      const photo=document.createElement(product.image?'img':'span');photo.className='list-item-photo';
      if(product.image){photo.src=product.image;photo.alt=product.name;photo.width=76;photo.height=76;}else{photo.textContent=product.categoryName;photo.classList.add('list-group-photo');}
      const copy=document.createElement('div');copy.className='list-item-copy';
      const head=document.createElement('div');head.className='consultation-item-head';
      const title=document.createElement('h3');title.textContent=index[item.id].name;
      const remove=document.createElement('button');remove.className='remove-item';remove.dataset.remove=item.id;remove.setAttribute('aria-label','Remover '+index[item.id].name);
      remove.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
      head.append(title,remove);
      const label=document.createElement('label');label.htmlFor='quantity-'+item.id;label.textContent='Quantidade ou observação (opcional)';
      const input=document.createElement('input');input.id=label.htmlFor;input.value=item.quantity;input.placeholder='Ex.: 2 caixas ou 1 pacote';input.maxLength=80;input.dataset.quantity=item.id;
      label.append(input);
      const detail=document.createElement('p');detail.className='list-item-detail';detail.textContent=product.detail||product.categoryName;
      copy.append(head,detail,label);li.append(photo,copy);ul.append(li);
    });
    $('[data-empty-list]').hidden=list.length>0;
    $('[data-list-bottom]').hidden=list.length===0;
    $('[data-list-status]').textContent='';
    updateCounts();
  }
  const listDialog=$('#list-dialog'), menuDialog=$('#mobile-menu');
  const productDialog=$('#catalog-product-dialog');
  let listOpener=null,productOpener=null;
  function openList(opener){listOpener=opener?.closest('dialog')?$('[data-open-list]'):opener||document.activeElement;if(menuDialog.open)menuDialog.close();if(productDialog.open)productDialog.close();renderList();if(!listDialog.open){listDialog.showModal();document.body.classList.add('dialog-open');}}
  function closeList(){listDialog.close();}
  function syncBody(){if(!$$('dialog[open]').length)document.body.classList.remove('dialog-open');}
  listDialog.addEventListener('close',()=>{syncBody();if(listOpener?.isConnected&&!listOpener.hidden)listOpener.focus({preventScroll:true});});
  listDialog.addEventListener('click',event=>{if(event.target===listDialog){const r=listDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeList();}});
  menuDialog.addEventListener('close',()=>{syncBody();$('[data-menu-trigger]').setAttribute('aria-expanded','false');if(!$$('dialog[open]').length)$('[data-menu-trigger]').focus({preventScroll:true});});
  menuDialog.addEventListener('click',event=>{if(event.target===menuDialog&&event.clientX<menuDialog.getBoundingClientRect().left)menuDialog.close();});
  $('[data-menu-trigger]').addEventListener('click',()=>{menuDialog.showModal();document.body.classList.add('dialog-open');$('[data-menu-trigger]').setAttribute('aria-expanded','true');});
  $('[data-close-menu]').addEventListener('click',()=>menuDialog.close());
  $$('a',menuDialog).forEach(link=>link.addEventListener('click',()=>menuDialog.close()));
  window.matchMedia('(min-width:961px)').addEventListener('change',event=>{if(event.matches&&menuDialog.open)menuDialog.close();});
  function showProduct(id,opener){
    const product=index[id];if(!product||product.kind!=='product')return;productOpener=opener;
    $('[data-product-detail]').innerHTML=`<div class="product-detail-photo"><img src="${escape(product.image)}" alt="${escape(product.name)}" width="1024" height="1024"></div><div class="product-detail-copy"><p class="catalog-product-brand">${escape(product.brand)}</p><h2 id="catalog-product-title">${escape(product.name)}</h2><p class="product-detail-size">${escape(product.detail)}</p><p>${escape(product.description)}</p><p class="catalog-price" data-product-price="${escape(product.id)}"></p><p class="product-detail-note">A loja confirma preço, quantidade e disponibilidade.</p><button class="add-product" data-add="${escape(product.id)}"><span>Adicionar à lista</span><i></i></button>${product.source?`<a class="catalog-product-source" href="${escape(product.source)}" target="_blank" rel="noopener noreferrer">Ver publicação da loja</a>`:''}</div>`;
    updateCounts();updatePrices();productDialog.showModal();document.body.classList.add('dialog-open');
  }
  productDialog.addEventListener('close',()=>{syncBody();if(!$$('dialog[open]').length&&productOpener?.isConnected)productOpener.focus({preventScroll:true});});
  $('[data-close-product]').addEventListener('click',()=>productDialog.close());
  productDialog.addEventListener('click',event=>{if(event.target===productDialog){const r=productDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)productDialog.close();}});
  updatePrices();
  document.addEventListener('click',event=>{
    const view=event.target.closest('[data-view-product]');if(view){showProduct(view.dataset.viewProduct,view);return;}
    const opener=event.target.closest('[data-open-list]');if(opener){event.preventDefault();openList(opener);return;}
    if(event.target.closest('[data-close-list]')){closeList();return;}
    const add=event.target.closest('[data-add]');
    if(add){const id=add.dataset.add;if(!index[id])return;if(list.some(item=>item.id===id)){openList(add);return;}list.push({id,quantity:''});persist();updateCounts();toast(index[id].name+' adicionado à sua lista.');if(productDialog.open)$('[data-toast]').hidden=true;if(shouldMove())add.animate([{transform:'scale(1)'},{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:350});track('consultation_item_added',{category:index[id].category});return;}
    const remove=event.target.closest('[data-remove]');if(remove){const position=list.findIndex(item=>item.id===remove.dataset.remove);list=list.filter(item=>item.id!==remove.dataset.remove);persist();renderList();const next=$$('[data-remove]')[Math.max(0,Math.min(position,list.length-1))];(next||$('[data-close-list]')).focus({preventScroll:true});return;}
  });
  document.addEventListener('input',event=>{if(event.target.matches('[data-quantity]')){const item=list.find(item=>item.id===event.target.dataset.quantity);if(item){item.quantity=event.target.value.slice(0,80);persist();}}});
  function openWhatsApp(url,status){
    window.open(url,'_blank','noopener,noreferrer');
    status.replaceChildren(document.createTextNode('Se o WhatsApp não abriu, '));
    const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='continue por aqui';status.append(link);status.hidden=false;
  }
  $('[data-send-list]').addEventListener('click',()=>{
    if(!list.length)return;
    const storeKey=$('#list-store').value,store=config.stores[storeKey];
    const message='Olá! Vim pelo site da 3 Irmãos e gostaria de consultar estes produtos:\n\n'+core.listText(list,index)+'\n\nLoja: '+store.name+'\nPodem confirmar disponibilidade e condições?';
    openWhatsApp(core.whatsappUrl(store,message),$('[data-list-status]'));
    track('whatsapp_click',{store:storeKey,placement:'consultation_list',items:list.length});
  });
  renderList();

  // Category discovery: works from permanent page URLs and updates the URL on selection.
  const search=$('#product-search');
  if(search){
    const params=new URLSearchParams(location.search);
    let category=catalog.some(c=>c.id===params.get('categoria'))?params.get('categoria'):'todos';
    search.value=(params.get('q')||'').slice(0,120);
    const cards=$$('[data-product]');
    const categoryDialog=$('#category-dialog');
    const categoryOptions=$('[data-category-options]');
    categoryOptions.innerHTML=[{id:'todos',name:'Todos os departamentos',products:catalog.flatMap(c=>c.products||[]),items:catalog.flatMap(c=>c.items)},...catalog].map(c=>`<button class="category-option" data-filter="${escape(c.id)}" aria-pressed="false"><span>${escape(c.name)}</span><small>${(c.products||[]).length+c.items.length} itens</small></button>`).join('');
    $('[data-open-categories]').addEventListener('click',()=>{categoryDialog.showModal();document.body.classList.add('dialog-open');});
    $('[data-close-categories]').addEventListener('click',()=>categoryDialog.close());
    categoryDialog.addEventListener('close',()=>{syncBody();$('[data-open-categories]').focus({preventScroll:true});});
    categoryDialog.addEventListener('click',event=>{if(event.target===categoryDialog&&event.clientY<categoryDialog.getBoundingClientRect().top)categoryDialog.close();});
    document.documentElement.classList.add('has-category-chooser');
    function filterProducts(animate=false,writeURL=true){
      const query=search.value.slice(0,120);let count=0,productCount=0,groupCount=0;
      cards.forEach(card=>{
        const visible=core.matching(index[card.dataset.product],category,query);
        card.hidden=!visible;
        if(visible){if(animate&&shouldMove()&&count<15)card.animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,delay:count*24,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'});count++;if(index[card.dataset.product].kind==='product')productCount++;else groupCount++;}
      });
      $$('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===category)));
      const selected=catalog.find(c=>c.id===category);
      $('[data-selected-category]').textContent=selected?selected.name:'Todos os departamentos';
      $('[data-category-tag]').textContent=selected?selected.tag:'TODOS OS DEPARTAMENTOS';
      $('[data-category-title]').textContent=selected?selected.name:'Todos os produtos';
      $('[data-category-description]').textContent=selected?selected.description:'';
      $('[data-category-description]').hidden=!selected;
      const resultParts=[];
      if(productCount)resultParts.push(productCount+' '+(productCount===1?'produto':'produtos'));
      if(groupCount)resultParts.push(groupCount+' '+(groupCount===1?'grupo':'grupos'));
      $('[data-results-count]').textContent=resultParts.length?resultParts.join(' e '):'Nenhum resultado';
      $('[data-catalog-products]').hidden=productCount===0;
      $('[data-catalog-groups]').hidden=groupCount===0;
      $('[data-no-results]').hidden=count>0;
      $('[data-clear-filters]').hidden=!query;
      if(writeURL){const next=new URL(location.href);if(category==='todos')next.searchParams.delete('categoria');else next.searchParams.set('categoria',category);if(query)next.searchParams.set('q',query);else next.searchParams.delete('q');history.replaceState(null,'',next);}
    }
    $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
      category=button.dataset.filter;
      filterProducts(true);
      if(categoryDialog.open)categoryDialog.close();
      if(button.classList.contains('catalog-photo'))$('#catalogo').scrollIntoView({behavior:shouldMove()?'smooth':'auto',block:'start'});
      track('select_category',{category});
    }));
    let searchTimer;
    search.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>filterProducts(false),90);});
    $('[data-clear-filters]').addEventListener('click',()=>{search.value='';category='todos';filterProducts(true);search.focus();});
    document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!$$('dialog[open]').length){event.preventDefault();search.focus();}});
    filterProducts(false,false);
  }

  // Accessible sector tabs: keyboard, focus and content move together.
  const segmentButtons=$$('[data-segment]');
  function selectSegment(button,focus=false){
    segmentButtons.forEach(tab=>{const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;$('#segment-'+tab.dataset.segment).hidden=!selected;});
    if(focus)button.focus();
  }
  segmentButtons.forEach((button,i)=>{
    button.addEventListener('click',()=>selectSegment(button));
    button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(i+1)%segmentButtons.length;if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(i-1+segmentButtons.length)%segmentButtons.length;if(event.key==='Home')next=0;if(event.key==='End')next=segmentButtons.length-1;if(next!==undefined){event.preventDefault();selectSegment(segmentButtons[next],true);}});
  });

  // Department rail supports mouse dragging, touch scrolling and keyboard buttons.
  const rail=$('[data-rail]');
  if(rail){
    const step=()=>$('.department-card',rail).getBoundingClientRect().width+(parseFloat(getComputedStyle(rail).columnGap)||0);
    const move=direction=>rail.scrollBy({left:direction*step(),behavior:shouldMove()?'smooth':'auto'});
    $('[data-rail-prev]').addEventListener('click',()=>move(-1));
    $('[data-rail-next]').addEventListener('click',()=>move(1));
    rail.addEventListener('keydown',event=>{if(event.target===rail&&(event.key==='ArrowRight'||event.key==='ArrowLeft')){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
    let dragging=false,startX=0,startScroll=0,moved=false;
    rail.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0)return;dragging=true;moved=false;startX=event.clientX;startScroll=rail.scrollLeft;});
    rail.addEventListener('pointermove',event=>{if(!dragging)return;const delta=event.clientX-startX;if(Math.abs(delta)>7){moved=true;rail.classList.add('is-dragging');rail.scrollLeft=startScroll-delta;}});
    window.addEventListener('pointerup',()=>{dragging=false;rail.classList.remove('is-dragging');setTimeout(()=>{moved=false;},0);});
    rail.addEventListener('pointercancel',()=>{dragging=false;rail.classList.remove('is-dragging');});
    rail.addEventListener('dragstart',event=>event.preventDefault());
    rail.addEventListener('click',event=>{if(moved){event.preventDefault();event.stopPropagation();}},true);
    const updateRail=()=>{const max=rail.scrollWidth-rail.clientWidth;$('[data-rail-prev]').disabled=rail.scrollLeft<4;$('[data-rail-next]').disabled=rail.scrollLeft>=max-4;};
    rail.addEventListener('scroll',updateRail,{passive:true});window.addEventListener('resize',updateRail,{passive:true});updateRail();
  }

  // Store selection changes the map, and each outgoing action keeps its destination explicit.
  const mapFrame=$('[data-map-frame]');
  if(mapFrame){
    const units={
      'rio-branco':{name:'Rio Branco do Sul',street:'Rua Duque de Caxias, 352',city:'Rio Branco do Sul, PR',coordinates:'-25.1838276,-49.3152138'},
      'itaperucu':{name:'Itaperuçu',street:'Av. Crispim Furquim Siqueira, 503',city:'Centro Industrial — Itaperuçu, PR',coordinates:'-25.2201678,-49.3426657'}
    };
    $$('[data-map-store]').forEach(button=>button.addEventListener('click',()=>{
      if(button.getAttribute('aria-pressed')==='true')return;
      const unit=units[button.dataset.mapStore];if(!unit)return;
      const destination=unit.street+', '+unit.name+', PR',query=encodeURIComponent(destination);
      $$('[data-map-store]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      mapFrame.title='Mapa da 3 Irmãos de '+unit.name;
      mapFrame.src='https://maps.google.com/maps?q='+query+'&ll='+unit.coordinates+'&z=17&output=embed';
      $('[data-map-city]').textContent='3 Irmãos · '+unit.name;
      const address=$('[data-map-address]');address.replaceChildren(document.createTextNode(unit.street),document.createElement('br'),document.createTextNode(unit.city));
      $('[data-map-open]').href='https://www.google.com/maps/search/?api=1&query='+query;
      $('[data-map-route]').href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(unit.coordinates);
      track('select_map_store',{store:button.dataset.mapStore});
    }));
  }
  $$('[data-whatsapp]').forEach(link=>link.addEventListener('click',()=>track('whatsapp_click',{store:link.dataset.whatsapp,placement:'store_card'})));
  $$('[data-directions]').forEach(link=>link.addEventListener('click',()=>track('directions_click',{store:link.dataset.directions})));
  const form=$('#contact-form');
  if(form){
    const params=new URLSearchParams(location.search);
    if(params.get('assunto')==='baloes')$('#message').value='Gostaria de informações sobre balões e opções com gás hélio.';
    if(params.get('assunto')==='negocio')$('#purpose').value='negocio';
    $('[data-include-list]').addEventListener('click',()=>{const field=$('#message');const text=core.listText(list,index);if(text&&!field.value.includes(text)){field.value=(field.value.trim()?field.value.trim()+'\n\n':'')+text;field.focus();toast('Produtos incluídos na mensagem.');}});
    form.addEventListener('submit',event=>{
      event.preventDefault();const name=$('#name'),message=$('#message');name.value=name.value.trim();message.value=message.value.trim();if(!form.reportValidity())return;
      const key=$('#store').value,store=config.stores[key];const purpose=$('#purpose').value==='negocio'?'meu negócio ou revenda':'minha casa ou uma comemoração';
      const body='Olá! Meu nome é '+name.value+'. Vim pelo site da 3 Irmãos.\n\nLoja: '+store.name+'\nEstou comprando para '+purpose+'.\n\n'+message.value;
      openWhatsApp(core.whatsappUrl(store,body),$('#form-status'));track('whatsapp_click',{store:key,placement:'contact_form'});
    });
  }

  // A slow, controllable showcase using actual photographs supplied by the brand.
  const heroPanels=$$('[data-hero-panel]'),heroSelectors=$$('[data-hero-select]');
  let heroCurrent=0,heroPaused=false,heroHover=false;
  function showHero(next){
    if(!heroPanels.length)return;
    heroCurrent=(next+heroPanels.length)%heroPanels.length;
    heroPanels.forEach((panel,i)=>{const active=i===heroCurrent;panel.classList.toggle('is-active',active);panel.inert=!active;panel.tabIndex=active?0:-1;panel.setAttribute('aria-hidden',String(!active));});
    heroSelectors.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===heroCurrent)));
  }
  heroSelectors.forEach((button,i)=>button.addEventListener('click',()=>showHero(i)));
  const heroPause=$('[data-hero-pause]');
  if(heroPause){
    heroPause.addEventListener('click',()=>{heroPaused=!heroPaused;heroPause.textContent=heroPaused?'▶':'Ⅱ';heroPause.setAttribute('aria-pressed',String(heroPaused));heroPause.setAttribute('aria-label',heroPaused?'Retomar troca de fotos':'Pausar troca de fotos');});
    const media=$('.hero-media');
    media.addEventListener('pointerenter',()=>{heroHover=true;});media.addEventListener('pointerleave',()=>{heroHover=false;});
    setInterval(()=>{if(shouldMove()&&!heroPaused&&!heroHover&&!document.hidden&&!media.contains(document.activeElement))showHero(heroCurrent+1);},6500);
    showHero(0);
  }

  // Motion is enhancement: content remains available with JS off or reduced motion on.
  function applyMotion(){
    document.documentElement.classList.toggle('motion-paused',!shouldMove());
    $$('[data-motion-toggle]').forEach(button=>{button.textContent=shouldMove()?'Pausar animações':'Animações pausadas';button.setAttribute('aria-pressed',String(!shouldMove()));});
    if(!shouldMove()){$$('[data-reveal]').forEach(el=>el.classList.add('is-visible'));document.getAnimations?.().forEach(animation=>{try{if(animation.effect?.target?.classList.contains('product-item'))animation.finish();}catch{}});}
    syncVideos();
  }
  $$('[data-motion-toggle]').forEach(button=>button.addEventListener('click',()=>{motionPreference=shouldMove();try{sessionStorage.setItem(preferenceKey,motionPreference?'1':'0');}catch{}applyMotion();}));
  reduceQuery.addEventListener('change',applyMotion);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -25px 0px'});
    $$('[data-reveal]').forEach((el,i)=>{el.style.setProperty('--reveal-delay',(i%3)*65+'ms');observer.observe(el);});
    if(shouldMove())document.documentElement.classList.add('js-motion');
  }
  let ticking=false;
  const updateScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;$('.reading-progress').style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,window.scrollY/max)):0)+')';$('.site-header').classList.toggle('is-scrolled',window.scrollY>25);ticking=false;};
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});window.addEventListener('resize',updateScroll,{passive:true});updateScroll();
  const videos=$$('[data-ambient-video]');let userPausedVideo=false;
  function syncVideos(){videos.forEach(video=>{const button=$('[data-video-toggle]');if(shouldMove()&&!document.hidden&&!userPausedVideo){video.play().then(()=>{if(button){button.textContent='Pausar vídeo';button.setAttribute('aria-label','Pausar vídeo da loja');}}).catch(()=>{if(button)button.textContent='Reproduzir vídeo';});}else{video.pause();if(button){button.textContent='Reproduzir vídeo';button.setAttribute('aria-label','Reproduzir vídeo da loja');}}});}
  const videoButton=$('[data-video-toggle]');if(videoButton)videoButton.addEventListener('click',()=>{const video=videos[0];userPausedVideo=!video.paused;if(video.paused&&shouldMove()){userPausedVideo=false;syncVideos();}else if(video.paused){video.play().catch(()=>{});videoButton.textContent='Pausar vídeo';}else{video.pause();videoButton.textContent='Reproduzir vídeo';}});
  document.addEventListener('visibilitychange',syncVideos);
  applyMotion();
  $$('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));

  // Analytics stays inactive until the owner's actual ID is provided. No form text is tracked.
  if(/^G-[A-Z0-9]+$/.test(config.analyticsId)){
    window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',config.analyticsId);
    const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.analyticsId);document.head.appendChild(script);
  }
})();
