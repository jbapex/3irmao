import assert from 'node:assert/strict';
import { chapters,clampPosition,chapterAt,moveTowards } from '../site/historia-model.js';
import { missions,allActions,actionById,memoryNarrators,memoryPage } from '../site/historia-missions.js';
import { existsSync,readFileSync } from 'node:fs';
import { createStoryWorld } from '../site/historia-world.js';
import { Vector3 } from '../site/vendor/three.module.min.js';
import { level,physics,platformAt,createGame,stepGame,stageCount,nearbyAction,interactGame,closeMemory,actionLock,nearbyMechanism,interactMechanism } from '../site/historia-game.js';
assert.equal(missions.length,6);assert.equal(chapters.length,7);
for(const action of allActions){
 assert.ok(action.context&&memoryNarrators[action.narrator]);
 assert.equal(action.marker.length,3);assert.ok(action.marker.every(Number.isFinite));
 for(let index=0;index<action.pages.length;index++){
  const page=memoryPage(action,index);
  assert.ok(page.text&&page.person&&page.sourceLabel,`${action.id} page ${index+1} must identify its speaker and source.`);
  if(page.person.photo)assert.ok(existsSync(new URL('../site'+page.person.photo,import.meta.url)),`${page.narrator} needs its referenced portrait.`);
 }
}
for(const order of level.candies.filter(item=>item.kind==='order'))assert.ok(!level.gaps.some(([l,r])=>order.x>l&&order.x<r),'Customer orders belong on safe ground.');
assert.equal(actionById('pedido').requires,0,'Speaking to the customer must not require collecting their order first.');
const mobileCss=readFileSync(new URL('../site/historia.css',import.meta.url),'utf8');
assert.match(mobileCss,/\.game-hud\{inset:14px 14px auto\}/,'Mobile HUD must not stretch to the bottom of the game.');
assert.ok(!readFileSync(new URL('../content/historia.html',import.meta.url),'utf8').includes('class="story-art-note"'),'The story credit belongs below the game.');
assert.equal(clampPosition(-4),0);assert.equal(clampPosition(200),100);assert.equal(clampPosition(NaN),0);
assert.equal(chapterAt(16),1);assert.equal(chapterAt(80),5);assert.equal(chapterAt(100),6);
assert.equal(moveTowards(15.95,16,.05),16);assert.ok(Math.abs(moveTowards(0,100,2)-.3)<1e-10);
assert.equal(moveTowards(12,16,-1),12);

// Complete the whole course using movement, jump and nearby-object interaction.
const run=createGame(),encounteredNarrators=new Set(),mechanismEvents=new Set();let collectedEvents=0,checkpointEvents=0,completeEvents=0,memoryPages=0;
for(let frame=0;frame<15000&&!run.completed;frame++){
 let events=[];
 if(run.memory){encounteredNarrators.add(memoryPage(actionById(run.memory.id),run.memory.page).narrator);events=interactGame(run);memoryPages++;}
 else{
  const nearby=nearbyAction(run);
  if(nearbyMechanism(run))events=interactMechanism(run);
  else if(nearby&&!run.done.has(nearby.id)&&!actionLock(run,nearby))events=interactGame(run);
  else{
   // Aim for the next outstanding task and use only the same walking, jumping
   // and interaction inputs available to a player. No position/state shortcuts.
   const targets=[...level.candies.filter(item=>item.stage===run.chapter&&!run.collected.has(item.id)).map(item=>({...item,item:true})),...missions[run.chapter].actions.filter(action=>!run.done.has(action.id))].sort((a,b)=>a.x-b.x);
   const target=targets[0];assert.ok(target,'An unfinished mission must expose a reachable objective.');
   const distance=target.x-run.x;
   events=stepGame(run,{axis:Math.abs(distance)>.15?Math.sign(distance):0,jump:run.grounded&&(target.item||Math.abs(distance)>2)&&!run.jumpHeld},1/120);
  }
 }
 for(const e of events){if(e.type==='collect')collectedEvents++;if(e.type==='checkpoint')checkpointEvents++;if(e.type==='complete')completeEvents++;if(e.type==='mechanism')mechanismEvents.add(e.id);}
}
assert.equal(run.completed,true);assert.equal(run.collected.size,14);assert.equal(collectedEvents,14);
assert.equal(run.done.size,allActions.length);assert.equal(checkpointEvents,5);assert.equal(completeEvents,1);assert.equal(run.falls,0);
assert.deepEqual([...mechanismEvents].sort(),level.mechanisms.map(mechanism=>mechanism.id).sort(),'A complete route must activate the bridge and construction lift through interaction.');
assert.equal(memoryPages,allActions.reduce((n,a)=>n+a.pages.length,0));
assert.deepEqual([...encounteredNarrators].sort(),Object.keys(memoryNarrators).sort(),'A complete playthrough must encounter every family narrator, including page-specific voices.');

const noAction=createGame();noAction.x=16;noAction.collected=new Set([0,1,2]);
stepGame(noAction,{axis:0,jump:false},1/120);
assert.equal(noAction.chapter,0,'Reaching the target with items must not automatically finish the mission or open a popup.');
interactGame(noAction);assert.equal(noAction.memory.id,'entrega');
const frozenX=noAction.x,frozenTime=noAction.time;stepGame(noAction,{axis:1,jump:true},1/30);
assert.equal(noAction.x,frozenX,'Reading an in-world sign must not let the player fall.');
assert.equal(noAction.time,frozenTime,'Reading must freeze the moving-platform clock as well as the player.');
closeMemory(noAction);assert.equal(noAction.done.size,0,'Leaving a memory early must not falsely complete it.');
interactGame(noAction);while(noAction.memory)interactGame(noAction);
assert.equal(noAction.chapter,1);

const missing=createGame();missing.x=16;
assert.equal(interactGame(missing)[0].type,'hint');assert.equal(missing.memory,null);
const prerequisite=createGame();prerequisite.chapter=1;prerequisite.x=32;prerequisite.collected=new Set([3]);
assert.match(interactGame(prerequisite)[0].text,/vizinho/);assert.equal(prerequisite.chapter,1);

const reverse=createGame();reverse.chapter=5;reverse.x=100;reverse.collected=new Set([15,16]);
interactGame(reverse);while(reverse.memory)interactGame(reverse);
assert.ok(reverse.done.has('cozinha'));assert.equal(reverse.completed,false,'Both future doors must be explored, in either order.');
reverse.x=94;interactGame(reverse);while(reverse.memory)interactGame(reverse);
assert.equal(reverse.completed,true);const completeState=[reverse.chapter,reverse.done.size];
interactGame(reverse);while(reverse.memory)interactGame(reverse);
assert.deepEqual([reverse.chapter,reverse.done.size],completeState,'Revisiting a memory must not duplicate progress.');

const blocked=createGame();for(let i=0;i<400;i++)stepGame(blocked,{axis:1,jump:false},1/120);
assert.ok(blocked.x<level.blocks[0].x-level.blocks[0].width/2);assert.equal(blocked.chapter,0);
const held=createGame();let jumps=0,peak=0;
for(let i=0;i<300;i++){jumps+=stepGame(held,{axis:0,jump:true},1/120).filter(e=>e.type==='jump').length;peak=Math.max(peak,held.y);}
assert.equal(jumps,1);assert.ok(peak>2&&peak<physics.jump**2/(2*physics.gravity)+.1);assert.equal(held.y,0);
const falling=createGame();falling.chapter=1;falling.checkpoint={x:16,y:0};falling.collected=new Set([0,1,2,3]);falling.done=new Set(['entrega','vizinho']);falling.x=27.7;falling.y=-3.75;falling.vy=-5;falling.grounded=false;
assert.ok(stepGame(falling,{axis:0,jump:false},1/30).some(e=>e.type==='respawn'));
assert.equal(falling.x,16);assert.equal(falling.collected.size,4);assert.ok(falling.done.has('vizinho'));
const fresh=createGame();assert.equal(fresh.collected.size,0);assert.equal(fresh.done.size,0);assert.equal(fresh.memory,null);

const world=createStoryWorld(level);let meshes=0,vertices=0;
world.scene.traverse(o=>{if(!o.isMesh)return;meshes++;const positions=o.geometry.getAttribute('position');vertices+=positions.count;for(const v of positions.array)assert.ok(Number.isFinite(v));assert.ok(o.material);});
assert.equal(world.scenery.platforms.length,level.platforms.length,'Every playable platform needs visible geometry.');
assert.equal(world.scenery.zones.length,missions.length,'Each mission needs its own environment.');
for(const active of [false,true])for(const time of [0,1.2,2.4,3.6,4.8]){
 const renderState=createGame();renderState.time=time;
 if(active)renderState.activated=new Set(level.mechanisms.map(mechanism=>mechanism.id));
 world.syncGame(renderState,time,false);
 for(const platform of world.scenery.platforms){
  const collision=platformAt(platform.definition,renderState),rendered=platform.root.userData.collider;
  assert.deepEqual(rendered,{...collision,width:platform.definition.width},`${platform.definition.id} rendering must use the physics platform state.`);
  assert.equal(platform.root.position.x,collision.x-1.4);
  assert.equal(platform.root.position.y,collision.y,'The visible top must meet the collision top throughout the lift cycle.');
  if(platform.definition.kind==='bridge'){
   if(active)assert.equal(platform.deck.rotation.z,0,'An active bridge must be visibly horizontal immediately.');
   else assert.ok(platform.deck.rotation.z>Math.PI/3,'An inactive bridge must visibly block the crossing.');
  }
 }
}
const backtracking=createGame();backtracking.x=5;backtracking.visited.add(level.checkpoints[0].id);backtracking.checkpoint={x:level.checkpoints[0].x,y:0};
world.syncGame(backtracking,0,false);
assert.equal(world.scenery.checkpoints[0].flag.material.color.getHexString(),'ffd23f','A saved checkpoint must stay marked when the player backtracks.');
const allBonuses=createGame();allBonuses.bonuses=new Set(level.bonuses.map(bonus=>bonus.id));world.syncGame(allBonuses,0,false);
assert.ok(world.scenery.bonuses.every(bonus=>!bonus.root.visible),'Collected exploration bonuses must disappear from the world.');
const sizes=[[1200,600],[900,500],[375,450],[390,844],[360,740],[320,568],[844,390],[932,430],[667,375],[568,320]];
for(const [width,height] of sizes){
 for(const chapter of chapters){
  world.setMemory(null,width,height);world.resize(width,height);world.update(chapter.x,0,0,0,width,height,false,true);world.scene.updateMatrixWorld(true);world.camera.updateMatrixWorld(true);
  const head=new Vector3(chapter.x-1.4,2.6,2.4).project(world.camera),feet=new Vector3(chapter.x-1.4,0,2.4).project(world.camera);
  const peak=new Vector3(chapter.x-1.4,6.5,2.4).project(world.camera),ahead=new Vector3(chapter.x+2.6,1,2.4).project(world.camera);
  assert.ok(head.x>-.98&&head.x<.98);assert.ok(head.y<.96&&feet.y>-.96);assert.ok(peak.y<.9);assert.ok(ahead.x<.96);
 }
 for(const platform of level.platforms)for(const airborne of [false,true]){
  const elevation=platform.y+(platform.motion?.distance||0)+(airborne?physics.jump**2/(2*physics.gravity):0);
  world.setMemory(null,width,height);world.resize(width,height);world.update(platform.x,0,0,0,width,height,false,true,elevation,airborne);world.scene.updateMatrixWorld(true);world.camera.updateMatrixWorld(true);
  const head=new Vector3(platform.x-1.4,elevation+2.6,2.4).project(world.camera),feet=new Vector3(platform.x-1.4,elevation,2.4).project(world.camera);
  assert.ok(head.x>-.98&&head.x<.98&&head.y<.96&&feet.y>-.96,`${platform.id} ${airborne?'jump peak':'standing'} must keep Dedei in frame at ${width}×${height}.`);
  assert.equal(world.guide.position.y,elevation,'The rendered player must follow the collision surface and jump height.');
 }
 for(const action of allActions)for(let page=0;page<action.pages.length;page++){
  world.setMemory({id:action.id,page},width,height);world.update(action.x,0,0,0,width,height,false,true);world.scene.updateMatrixWorld(true);world.camera.updateMatrixWorld(true);
  const {width:w,height:h}=world.memoryBoard.userData.dimensions,center=world.memoryBoard.position;
  for(const x of [-w/2,w/2])for(const y of [-h/2,h/2]){
   const corner=new Vector3(center.x+x,center.y+y,center.z+.1).project(world.camera);
   assert.ok(Math.abs(corner.x)<.94&&Math.abs(corner.y)<.95,`In-world memory must fit at ${width}×${height}`);
   if(width>height&&height<=500){const py=(1-corner.y)*height/2;assert.ok(py>=58&&py<=height-90,'Memory must clear toolbar and lower controls.');}
  }
 }
}
// The photographed regression was depth occlusion, not a framing failure.
// Assert the actual render sequence uses a separate, last reading pass with cleared depth.
const calls=[];const renderer={autoClear:true,render(scene,camera){calls.push({scene,camera,clear:this.autoClear});},clearDepth(){calls.push('depth');}};
world.setMemory({id:'entrega',page:0},1996,1248);world.render(renderer);
assert.equal(world.memoryBoard.parent,world.memoryScene);
assert.deepEqual(calls.map(c=>c==='depth'?'depth':c.scene===world.scene?'world':'memory'),['world','depth','memory']);
assert.equal(calls[0].clear,true);assert.equal(calls[2].clear,false);assert.equal(renderer.autoClear,true);
world.update(16,0,0,0,1996,1248,false,true);world.syncGame({...fresh,memory:{id:'entrega',page:0}},0,false);
assert.equal(world.guide.visible,false,'Dedei must not fill the reading foreground.');
world.memoryScene.traverse(o=>{if(o.isMesh){assert.equal(o.castShadow,false);assert.equal(o.receiveShadow,false);}});
calls.length=0;world.setMemory(null,390,844);world.render(renderer);assert.equal(calls.length,1);
assert.equal(world.gabriel.userData.character.name,'Gabriel');assert.equal(world.gabriel.userData.character.uniform,'3 Irmãos');
world.update(48,0,0,0,390,844,false,true);assert.equal(world.guide.visible,true);assert.equal(world.gabriel.visible,true);
assert.deepEqual(Object.keys(world.family).sort(),['camila','davi','fernanda','leandro','murilo']);
for(const [id,person] of Object.entries(world.family)){
 assert.equal(person.userData.character.reference,id==='camila'?'client-photo':'illustrative','Only Camila has a newly supplied likeness reference.');
 assert.equal(person.userData.character.uniform,'3 Irmãos');
 const playerX=person.position.x+1.4;
 world.setMemory(null,390,844);world.update(playerX,0,0,0,390,844,false,true);
 assert.equal(person.visible,true,`${id} must be present when the player reaches the encounter.`);
 world.setMemory({id:'entrega',page:0},390,844);world.update(playerX,0,0,0,390,844,false,true);
 assert.equal(person.visible,false,`${id} must not obstruct a memory.`);
 world.setMemory(null,390,844);world.update(playerX,0,0,0,390,844,false,true);
 assert.equal(person.visible,true,`${id} must return after the memory closes.`);
 world.update(playerX+30,0,0,0,390,844,false,true);
 assert.equal(person.visible,false,`${id} must be hidden when distant to preserve the mobile render budget.`);
}
world.onEvent({type:'complete'},run,true);world.setMemory(null,390,844);world.update(100,0,1/60,2,390,844,true,false);
world.syncGame(run,2,true);world.update(100,0,0,2,390,844,false,true);world.dispose();
console.log(`Mission game passed: ${missions.length} missions, ${level.candies.length} objects, ${allActions.length} interactions, ${memoryPages} memory pages, full winning run without falls, bridge and lift controls, all family narrators, prerequisites, reverse-order doors, replay, collisions, respawn and reset. ${meshes} meshes/${vertices} vertices; every platform follows its collider, standing/jumping character and memory-board framing at 10 sizes, unobstructed reading render pass, five family characters and reading-state restoration.`);
