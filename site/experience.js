'use strict';
(() => {
  const root=document.querySelector('[data-experience]');
  const scenes=window.EXPERIENCE;
  if(!root||!Array.isArray(scenes)||!scenes.length)return;
  const $=selector=>root.querySelector(selector);
  const tabs=[...root.querySelectorAll('[data-universe-tab]')];
  const products=[...root.querySelectorAll('[data-stage-product]')];
  const panels=[...root.querySelectorAll('.universe-panel')];
  const stage=$('[data-product-stage]');
  const inspect=$('[data-inspect-product]');
  const gameLink=$('[data-play-story]');
  const introAction=$('[data-intro-action]');
  const productIntro={eyebrow:'Atacado e varejo',title:'Frios, doces,<br>embalagens<br><em>e festa.</em>',copy:'Ingredientes para o bolo, frios para o lanche, doces para revender. Tem 3 Irmãos em Rio Branco do Sul e Itaperuçu.',button:'Ver produtos',href:'/produtos/'};
  const viewer=document.querySelector('#product-viewer');
  const viewerImage=viewer.querySelector('[data-viewer-image]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(min-width:1200px) and (min-height:800px)');
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
  let active=0,visible=true,scrollMode=false,scrollFrame=0,motionFrame=0;
  let pinStart=0,travel=1,manualUntil=0,opener=null;
  let pointerX=0,pointerY=0,currentX=0,currentY=0,lastFrame=0;
  const canMove=()=>!reduce.matches&&!document.documentElement.classList.contains('motion-paused');
  function setScene(index){
    const next=clamp(index,0,scenes.length-1);
    const scene=scenes[next];
    if(active!==next){
      // Keep focus on a visible control when native scrolling changes the chapter.
      if(panels[active].contains(document.activeElement)||document.activeElement===gameLink||document.activeElement===inspect)tabs[next].focus({preventScroll:true});
      active=next;
    }
    root.dataset.universe=scene.id;
    tabs.forEach((tab,i)=>{const selected=i===active;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    panels.forEach((panel,i)=>{panel.hidden=i!==active;});
    products.forEach((product,i)=>{product.classList.toggle('is-current',i===active);product.setAttribute('aria-hidden',String(i!==active));});
    $('[data-stage-name]').textContent=scene.product;
    $('[data-stage-count]').textContent=String(active+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');
    inspect.setAttribute('aria-label','Ver '+scene.product.toLocaleLowerCase('pt-BR')+' de perto');
    const isGame=scene.kind==='game';
    inspect.hidden=isGame;gameLink.hidden=!isGame;
    if(isGame)gameLink.href=scene.href;
    const intro=scene.intro||productIntro;
    $('[data-intro-eyebrow]').textContent=intro.eyebrow;
    $('[data-intro-eyebrow]').hidden=!intro.eyebrow;
    $('[data-intro-title]').innerHTML=intro.title;
    $('[data-intro-copy]').textContent=intro.copy;
    introAction.href=intro.href;introAction.querySelector('span').textContent=intro.button;
    root.style.setProperty('--scene-progress',(active+1)/scenes.length);
  }
  function selectScene(index,focus=false){
    const next=(index+scenes.length)%scenes.length;
    setScene(next);
    if(focus)tabs[next].focus({preventScroll:true});
    if(scrollMode){
      manualUntil=performance.now()+1200;
      window.scrollTo({top:Math.max(0,pinStart+travel*(next+.5)/scenes.length),behavior:canMove()?'smooth':'instant'});
    }
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>selectScene(i));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=i+1;
      if(event.key==='ArrowLeft')next=i-1;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=scenes.length-1;
      if(next!==undefined){event.preventDefault();selectScene(next,true);}
    });
  });
  function readScroll(){
    scrollFrame=0;
    if(!scrollMode||viewer.open||performance.now()<manualUntil)return;
    const progress=clamp((window.scrollY-pinStart)/travel);
    const next=Math.min(scenes.length-1,Math.floor(progress*scenes.length));
    if(next!==active)setScene(next);
  }
  function requestScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(readScroll);}
  function measure(){
    scrollMode=desktop.matches&&canMove();
    root.classList.toggle('has-scroll',scrollMode);
    const header=document.querySelector('.site-header').getBoundingClientRect().height;
    root.style.setProperty('--header',header+'px');
    pinStart=root.getBoundingClientRect().top+window.scrollY-header;
    travel=Math.max(1,root.offsetHeight-$('.experience-sticky').offsetHeight);
    if(scrollMode)requestScroll();
    syncMotion();
  }
  window.addEventListener('scroll',requestScroll,{passive:true});
  let resizeFrame=0;
  window.addEventListener('resize',()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;measure();});},{passive:true});
  function animate(time){
    motionFrame=0;
    if(!canMove()||!visible||document.hidden||viewer.open)return;
    const elapsed=Math.min(50,time-(lastFrame||time));lastFrame=time;
    const ease=1-Math.pow(.9,elapsed/16.67);
    currentX+=(pointerX-currentX)*ease;currentY+=(pointerY-currentY)*ease;
    root.style.setProperty('--tilt-x',(-currentY*5).toFixed(2)+'deg');
    root.style.setProperty('--tilt-y',(currentX*7).toFixed(2)+'deg');
    root.style.setProperty('--light-x',(currentX*25).toFixed(1)+'px');
    root.style.setProperty('--light-y',(currentY*18).toFixed(1)+'px');
    root.style.setProperty('--float-y',(Math.sin(time/1250)*5).toFixed(2)+'px');
    root.style.setProperty('--ground-scale',(1+Math.sin(time/1250)*.035).toFixed(3));
    motionFrame=requestAnimationFrame(animate);
  }
  function syncMotion(){
    if(motionFrame)cancelAnimationFrame(motionFrame);
    motionFrame=0;lastFrame=0;
    if(canMove()&&visible&&!document.hidden&&!viewer.open)motionFrame=requestAnimationFrame(animate);
    else{pointerX=pointerY=currentX=currentY=0;['--tilt-x','--tilt-y','--light-x','--light-y','--float-y','--ground-scale'].forEach(key=>root.style.removeProperty(key));}
  }
  stage.addEventListener('pointermove',event=>{
    if(!finePointer.matches||event.pointerType==='touch'||!canMove())return;
    const rect=stage.getBoundingClientRect();
    pointerX=clamp((event.clientX-rect.left)/rect.width*2-1,-1,1);
    pointerY=clamp((event.clientY-rect.top)/rect.height*2-1,-1,1);
  });
  stage.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  // Horizontal touch gestures select a scene while vertical scrolling stays native.
  let touchStart=null,suppressClickUntil=0;
  stage.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touchStart={x:event.clientX,y:event.clientY};});
  stage.addEventListener('pointerup',event=>{
    if(!touchStart||event.pointerType!=='touch')return;
    const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;touchStart=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){suppressClickUntil=performance.now()+450;selectScene(active+(dx<0?1:-1));}
  });
  stage.addEventListener('pointercancel',()=>{touchStart=null;});
  gameLink.addEventListener('click',event=>{if(performance.now()<suppressClickUntil)event.preventDefault();});
  inspect.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil){event.preventDefault();return;}
    const scene=scenes[active];opener=document.activeElement;
    viewer.querySelector('#product-viewer-title').textContent=scene.product;
    viewerImage.src=scene.image;viewerImage.alt=scene.alt;
    viewerImage.parentElement.dataset.framing=scene.framing;
    viewer.querySelector('[data-viewer-link]').href=scene.href;
    viewer.showModal();document.body.classList.add('dialog-open');syncMotion();
  });
  viewer.querySelector('[data-close-viewer]').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',event=>{
    if(event.target!==viewer)return;
    const rect=viewer.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)viewer.close();
  });
  viewer.addEventListener('close',()=>{
    if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');
    if(opener?.isConnected)opener.focus({preventScroll:true});
    syncMotion();
  });
  document.addEventListener('visibilitychange',syncMotion);
  reduce.addEventListener('change',measure);
  new MutationObserver(measure).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion();},{threshold:0}).observe($('.experience-sticky'));
  setScene(0);measure();
})();
