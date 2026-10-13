import * as THREE from './vendor/three.module.min.js';
import { createStoryWorld } from './historia-world.js';
import { missions, actionById, memoryPage } from './historia-missions.js';
import { level, createGame, stepGame, stageCount, nearbyAction, actionLock, interactGame, closeMemory } from './historia-game.js';
import { createGameScreen } from './historia-screen.js';
import { createGameAudio } from './historia-audio.js';
import { createGamePerformance } from './historia-performance.js';

const root=document.querySelector('[data-story-experience]');
if(root){
  const $=selector=>root.querySelector(selector);
  const viewport=$('[data-story-viewport]'),dialog=$('[data-game-dialog]');
  const play=$('[data-game-play]'),startPanel=$('[data-game-start]');
  const controls=$('[data-game-controls]'),hud=$('[data-game-hud]');
  const left=$('[data-game-left]'),right=$('[data-game-right]'),jump=$('[data-game-jump]');
  const actionButton=$('[data-game-interact]'),actionDock=$('[data-game-interaction]');
  const fullscreenButton=$('[data-game-fullscreen]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),touchScreen=matchMedia('(pointer: coarse)');
  let renderer,world,game=createGame(),ready=false,mode='start';
  let frame=0,last=0,accumulator=0,elapsed=0,inView=true;
  let width=viewport.clientWidth,height=viewport.clientHeight,queuedJump=false;
  let tapAxis=0,tapUntil=0,toastTimer,lastHud='',lastAction='',stepDistance=0,stepSide=false;
  const keys=new Set(),pointers=new Map();
  const performanceBudget=createGamePerformance();
  const globalPaused=()=>!reduce.matches&&document.documentElement.classList.contains('motion-paused');
  const decorativeMotion=()=>!reduce.matches&&!globalPaused();
  const mission=()=>missions[Math.min(game.chapter,missions.length-1)];
  function updateSoundControls(state){
    root.querySelectorAll('[data-game-sound]').forEach(button=>{
      button.disabled=!state.available;button.setAttribute('aria-pressed',String(state.enabled&&state.available));
      button.setAttribute('aria-label',!state.available?'Som indisponível neste navegador':state.enabled?'Desligar o som do jogo':'Ligar o som do jogo');
      button.querySelector('[data-game-sound-label]').textContent=!state.available?'Som indisponível':state.enabled?'Som ligado':'Som desligado';
      button.querySelector('[data-sound-waves]').style.display=state.enabled?'':'none';
      button.querySelector('[data-sound-muted]').style.display=state.enabled?'none':'';
      button.querySelector('[data-sound-muted]').removeAttribute('hidden');
    });
    root.querySelectorAll('[data-game-volume]').forEach(input=>{input.value=String(Math.round(state[input.dataset.gameVolume]*100));});
    root.querySelectorAll('[data-game-volume-output]').forEach(output=>{output.textContent=Math.round(state[output.dataset.gameVolumeOutput]*100)+'%';});
  }
  const sound=createGameAudio({onChange:updateSoundControls});updateSoundControls(sound.state);
  function clearInput(){
    keys.clear();pointers.clear();queuedJump=false;tapAxis=0;
    [left,right,jump].forEach(button=>button.classList.remove('is-held'));
    game.jumpHeld=false;game.jumpBuffer=0;
  }
  function stopFrame(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;accumulator=0;stepDistance=0;performanceBudget.resetWindow();sound.setActive(false);}
  function startFrame(){
    const running=ready&&mode==='playing'&&inView&&!document.hidden&&!globalPaused()&&!document.querySelector('dialog[open]');
    sound.setActive(running);if(running&&!frame)frame=requestAnimationFrame(tick);
  }
  function resumeSiteMotion(){if(globalPaused())document.querySelector('[data-motion-toggle]')?.click();}
  function toast(text,duration=2600){const node=$('[data-game-toast]');node.textContent=text;node.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{node.hidden=true;},duration);}
  function updateHud(){
    const m=mission(),fingerprint=[game.chapter,game.collected.size,game.done.size,game.memory?.id,game.memory?.page].join('/');
    if(lastHud!==fingerprint){
      lastHud=fingerprint;
      $('[data-game-score]').textContent=game.chapter+' / '+missions.length;
      $('[data-game-stage]').textContent=game.completed?'Todas as missões concluídas':'Missão '+(game.chapter+1)+' de '+missions.length;
      $('[data-game-objective]').textContent=game.completed?'A história continua com você.':m.label;
      $('[data-game-task]').textContent=game.completed?'Explore as novas portas ou conheça as novidades.':m.objective;
      const tasks=$('[data-game-tasks]');tasks.replaceChildren();
      const item=document.createElement('li');item.textContent=stageCount(game)+'/'+m.required+' '+m.item;item.classList.toggle('is-done',stageCount(game)>=m.required);tasks.append(item);
      const nextAction=m.actions.find(action=>!game.done.has(action.id));
      if(nextAction){const li=document.createElement('li');li.textContent=nextAction.label;tasks.append(li);}
      root.querySelectorAll('[data-game-chapter]').forEach((item,i)=>{
        item.classList.toggle('is-unlocked',i<game.chapter);item.classList.toggle('is-current',i===game.chapter);
        if(i===game.chapter)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
      });
      root.classList.toggle('is-reading-memory',!!game.memory);
      sound.setReading(!!game.memory);
      if(game.memory){const a=actionById(game.memory.id),p=memoryPage(a,game.memory.page);$('[data-game-narration]').textContent=p.person.name+'. '+p.sourceLabel+'. '+a.title+' '+p.text;}
      else $('[data-game-narration]').textContent='';
    }
    const nearby=nearbyAction(game),signature=[game.memory?.id,game.memory?.page,nearby?.id,game.done.size,game.collected.size,game.completed,mode].join('/');
    if(lastAction===signature)return;lastAction=signature;
    actionDock.hidden=mode!=='playing'||(!nearby&&!game.memory&&!game.completed);
    actionButton.hidden=!nearby&&!game.memory;
    const context=$('[data-game-action-context]');
    context.hidden=!!game.memory||!nearby;context.textContent=nearby?(actionLock(game,nearby)||(!game.done.has(nearby.id)&&nearby.cue)||nearby.context):'';
    $('[data-game-memory-back]').hidden=!game.memory;
    $('[data-game-ending]').hidden=!game.completed||!!game.memory;
    if(game.memory){const a=actionById(game.memory.id);actionButton.textContent=game.memory.page<a.pages.length-1?'Continuar':game.done.has(a.id)?'Voltar ao caminho':a.finish||a.label;actionButton.dataset.locked='false';}
    else if(nearby){actionButton.textContent=game.done.has(nearby.id)?'Rever lembrança':nearby.label;actionButton.dataset.locked=String(!!actionLock(game,nearby));}
  }
  function draw(dt=0,snap=false){
    if(!ready)return;
    const motion=decorativeMotion();
    world.setMemory(game.memory,width,height);
    world.update(game.x,mode==='playing'?game.vx:0,dt,elapsed,width,height,motion,snap||reduce.matches,game.y,!game.grounded);
    world.syncGame(game,elapsed,motion&&mode==='playing');world.render(renderer);
  }
  function openPanel(){
    if(!ready)return;mode='panel';clearInput();stopFrame();updateHud();
    $('[data-game-dialog-score]').textContent=game.chapter+' de '+missions.length+' missões concluídas';
    draw(0,true);if(!dialog.open){dialog.showModal();document.body.classList.add('dialog-open');}
  }
  function reset(){game=createGame();elapsed=0;lastHud='';lastAction='';clearInput();clearTimeout(toastTimer);$('[data-game-toast]').hidden=true;updateHud();draw(0,true);}
  function begin(){
    if(!ready)return;resumeSiteMotion();mode='playing';root.classList.remove('is-at-start');startPanel.hidden=true;controls.hidden=false;hud.hidden=false;
    clearInput();updateHud();viewport.focus({preventScroll:true});startFrame();
  }
  function pauseToSite(){
    mode='start';root.classList.add('is-at-start');clearInput();stopFrame();closeMemory(game);
    if(dialog.open)dialog.close();clearTimeout(toastTimer);$('[data-game-toast]').hidden=true;actionDock.hidden=true;
    if(!ready)return;
    controls.hidden=true;hud.hidden=true;startPanel.hidden=false;
    $('[data-game-start-title]').textContent='Dedei espera por você.';
    $('[data-game-start-copy]').textContent='Suas missões continuam daqui enquanto esta página estiver aberta.';
    $('[data-game-play-label]').textContent=game.completed?'Jogar novamente':'Continuar a aventura';
    updateHud();draw(0,true);
  }
  function fallback(){
    stopFrame();ready=false;root.classList.add('is-at-start');clearInput();screen.exit();controls.hidden=true;hud.hidden=true;play.hidden=true;actionDock.hidden=true;startPanel.hidden=false;
    viewport.classList.remove('has-world');renderer?.domElement.remove();
    $('[data-game-start-copy]').textContent='O jogo não abriu neste navegador. Você pode conhecer toda a história pelo link abaixo.';
    if(dialog.open)dialog.close();
  }
  function process(events){
    for(const event of events){
      world?.onEvent(event,game,decorativeMotion());
      if(['jump','land','collect','hint','respawn','complete'].includes(event.type))sound.play(event.type);
      if(event.type==='memory')sound.play('page');
      if(event.type==='checkpoint')sound.play('mission');
      if(event.type==='action')sound.play(['balcao','itaperucu','rio-branco','cerro','cozinha'].includes(event.id)?'door':'click');
      if(event.type==='collect')toast(stageCount(game)+'/'+mission().required+' '+mission().item+' encontrados');
      if(event.type==='respawn'){clearInput();toast('De volta à última parada. Suas conquistas continuam com você!');draw(0,true);}
      if(event.type==='hint')toast(event.text);
      if(event.type==='memory')clearInput();
      if(event.type==='action'){const action=actionById(event.id);toast(action.result||'Concluído: '+action.label,3500);}
      if(event.type==='checkpoint'){clearInput();const completed=events.find(e=>e.type==='action');toast((completed&&actionById(completed.id).result)||'Missão concluída! Próxima parada: '+mission().label,3500);}
      if(event.type==='complete'){clearInput();toast('As seis missões estão completas. Obrigado por fazer parte dessa história!',4500);}
    }
    updateHud();
  }
  function activate(){if(mode!=='playing')return;clearInput();process(interactGame(game));viewport.focus({preventScroll:true});startFrame();}
  function leaveMemory(){closeMemory(game);clearInput();updateHud();viewport.focus({preventScroll:true});startFrame();}
  function input(){
    const held=[...pointers.values()];const a=keys.has('ArrowLeft')||keys.has('KeyA')||held.includes('left');const d=keys.has('ArrowRight')||keys.has('KeyD')||held.includes('right');
    return{axis:(d?1:0)-(a?1:0)||(elapsed<tapUntil?tapAxis:0),jump:queuedJump||keys.has('Space')||keys.has('ArrowUp')||keys.has('KeyW')||held.includes('jump')};
  }
  function tick(now){
    frame=0;if(!ready||mode!=='playing'||!inView||document.hidden||globalPaused()||document.querySelector('dialog[open]')){clearInput();last=0;performanceBudget.resetWindow();sound.setActive(false);return;}
    const milliseconds=last?now-last:1000/60;
    const dt=Math.min(milliseconds/1000,.06);last=now;elapsed+=dt;accumulator+=dt;
    if(performanceBudget.observe(milliseconds,!game.memory))renderer.setPixelRatio(performanceBudget.pixelRatio(width,height,devicePixelRatio,touchScreen.matches));
    while(accumulator>=1/120){
      const grounded=game.grounded,vy=game.vy,x=game.x;
      const events=stepGame(game,input(),1/120);
      if(!grounded&&game.grounded&&vy<-1&&!events.some(event=>event.type==='respawn'))events.push({type:'land'});
      if(game.grounded&&!game.memory&&Math.abs(game.vx)>1){stepDistance+=Math.abs(game.x-x);if(stepDistance>1.65){stepDistance=0;stepSide=!stepSide;sound.play('step',{rate:stepSide?.96:1.04});}}else stepDistance=0;
      if(events.length)process(events);queuedJump=false;accumulator-=1/120;
    }
    updateHud();try{draw(dt);}catch{fallback();return;}frame=requestAnimationFrame(tick);
  }
  function resize(){
    if(!ready)return;if(width!==viewport.clientWidth||height!==viewport.clientHeight)clearInput();
    width=viewport.clientWidth;height=viewport.clientHeight;if(!width||!height)return;
    performanceBudget.resetWindow();renderer.setPixelRatio(performanceBudget.pixelRatio(width,height,devicePixelRatio,touchScreen.matches));renderer.setSize(width,height,false);world.resize(width,height);draw(0,true);
  }
  const screen=createGameScreen({host:$('[data-game-screen]'),returnFocus:play,onExit:pauseToSite,onResize:()=>{resize();startFrame();},onChange:active=>{
    fullscreenButton.setAttribute('aria-pressed',String(active));fullscreenButton.setAttribute('aria-label',active?'Sair da tela cheia e voltar ao site':'Jogar em tela cheia');
    $('[data-game-screen-icon]').textContent=active?'×':'⛶';$('[data-game-screen-label]').textContent=active?'Sair':'Tela cheia';
  }});
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden','true');world=createStoryWorld(level);
    world.configureRenderer(renderer,width,touchScreen.matches||width<=600);ready=true;viewport.prepend(renderer.domElement);resize();viewport.classList.add('has-world');play.hidden=false;
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
  }catch{fallback();}
  if(touchScreen.matches){$('[data-game-play-label]').textContent='Jogar em tela cheia';$('[data-story-instructions]').textContent='Segure uma seta para andar e toque em Pular. Perto de uma pessoa ou objeto, use o botão de ação. Sair volta ao site.';}
  play.addEventListener('click',()=>{sound.unlock();if(game.completed)reset();begin();if(ready&&(touchScreen.matches||innerWidth<=800)){screen.enter();if(innerHeight>innerWidth)toast('Deite o celular se quiser ver mais do caminho.',4000);}});
  root.querySelectorAll('[data-game-sound]').forEach(button=>button.addEventListener('click',()=>{sound.setEnabled(!sound.state.enabled);if(sound.state.enabled)sound.unlock();}));
  root.querySelectorAll('[data-game-volume]').forEach(input=>input.addEventListener('input',()=>sound.setVolume(input.dataset.gameVolume,Number(input.value)/100)));
  fullscreenButton.addEventListener('click',()=>{if(screen.active)screen.exit();else screen.enter();});
  $('[data-game-pause]').addEventListener('click',openPanel);
  $('[data-game-leave]').addEventListener('click',()=>{if(screen.active)screen.exit();else{pauseToSite();play.focus({preventScroll:true});}});
  $('[data-game-continue]').addEventListener('click',()=>{sound.unlock();resumeSiteMotion();dialog.close();});
  $('[data-game-dialog-restart]').addEventListener('click',()=>{sound.unlock();reset();resumeSiteMotion();dialog.close();});
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');if(ready&&mode==='panel'){mode='playing';clearInput();updateHud();viewport.focus({preventScroll:true});startFrame();}});
  dialog.addEventListener('cancel',event=>{event.preventDefault();resumeSiteMotion();dialog.close();});
  actionButton.addEventListener('click',activate);$('[data-game-memory-back]').addEventListener('click',leaveMemory);
  [[left,'left'],[right,'right'],[jump,'jump']].forEach(([button,action])=>{
    button.addEventListener('pointerdown',event=>{if(event.button!==0||mode!=='playing')return;event.preventDefault();if(game.memory)leaveMemory();button.setPointerCapture(event.pointerId);pointers.set(event.pointerId,action);button.classList.add('is-held');startFrame();});
    const release=event=>{pointers.delete(event.pointerId);button.classList.toggle('is-held',[...pointers.values()].includes(action));};
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('contextmenu',event=>event.preventDefault());
    button.addEventListener('click',event=>{if(event.detail!==0||mode!=='playing')return;if(game.memory)leaveMemory();if(action==='jump')queuedJump=true;else{tapAxis=action==='right'?1:-1;tapUntil=elapsed+.35;}startFrame();});
  });
  viewport.addEventListener('keydown',event=>{
    if(!ready||mode!=='playing'||event.ctrlKey||event.metaKey||event.altKey)return;
    if(event.code==='Escape'){event.preventDefault();if(game.memory)leaveMemory();else openPanel();return;}
    if(event.code==='KeyE'){event.preventDefault();if(!event.repeat)activate();return;}
    if(!['ArrowLeft','ArrowRight','KeyA','KeyD','ArrowUp','KeyW','Space'].includes(event.code))return;
    if(event.code==='Space'&&event.target.closest('button'))return;
    event.preventDefault();if(game.memory)leaveMemory();keys.add(event.code);startFrame();
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{clearInput();stopFrame();});window.addEventListener('focus',startFrame);
  const rotated=()=>{if(screen.active&&mode==='playing')openPanel();};
  if(window.screen.orientation?.addEventListener)window.screen.orientation.addEventListener('change',rotated);else window.addEventListener('orientationchange',rotated);
  viewport.addEventListener('focusout',event=>{if(!viewport.contains(event.relatedTarget))clearInput();});
  viewport.addEventListener('pointerdown',event=>{if(mode==='playing'&&!event.target.closest('button,a'))viewport.focus({preventScroll:true});});
  const motionObserver=new MutationObserver(()=>{if(globalPaused()&&mode==='playing')openPanel();else startFrame();});motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  reduce.addEventListener('change',()=>{draw(0,true);startFrame();});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);
  const visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)startFrame();else{clearInput();stopFrame();}},{threshold:.05});visibilityObserver.observe(viewport);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(mode==='playing')openPanel();clearInput();stopFrame();}else startFrame();});
  window.addEventListener('pagehide',event=>{stopFrame();clearTimeout(toastTimer);if(!event.persisted){ready=false;screen.destroy();sound.dispose();world?.dispose();renderer?.dispose();motionObserver.disconnect();resizeObserver.disconnect();visibilityObserver.disconnect();window.screen.orientation?.removeEventListener?.('change',rotated);window.removeEventListener('orientationchange',rotated);}});
  window.addEventListener('pageshow',event=>{if(event.persisted)startFrame();});
  document.querySelectorAll('dialog').forEach(other=>{if(other!==dialog)other.addEventListener('close',startFrame);});
}
