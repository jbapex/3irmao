import assert from 'node:assert/strict';
import { allActions,actionById,memoryPage } from '../site/historia-missions.js';
import { createGame,level,physics,nearbyAction,interactGame,actionLock } from '../site/historia-game.js';

// These regressions protect the identities clarified by the family: Gabriel's
// childhood, Camila's marriage, and the separate child speaking at the video end.
const delivery=actionById('entrega');
assert.equal(memoryPage(delivery,0).narrator,'dedei');
assert.equal(memoryPage(delivery,2).narrator,'gabriel');
assert.equal(memoryPage(delivery,3).narrator,'gabriel');
assert.match(memoryPage(delivery,3).text,/12 anos/);
assert.match(memoryPage(delivery,3).sourceLabel,/2024/);

const expansion=memoryPage(actionById('pedido'),1);
assert.equal(expansion.narrator,'gabriel','Gabriel, rather than Dedei, invited his own wife to help with Itaperuçu.');
assert.match(expansion.text,/Camila, minha esposa/);

const camila=actionById('itaperucu');
assert.equal(memoryPage(camila,0).narrator,'camila');
assert.match(memoryPage(camila,0).sourceLabel,/2024/);
assert.match(memoryPage(camila,1).sourceLabel,/hoje.*Itaperuçu/i,'Her present-day responsibilities must be distinguished from the 2024 video.');
assert.match(memoryPage(camila,1).text,/novidades.*Itaperuçu/);
assert.doesNotMatch(memoryPage(camila,1).sourceLabel,/2024/);

const kitchen=actionById('cozinha'),lastPage=kitchen.pages.length-1;
assert.equal(memoryPage(kitchen,lastPage-1).narrator,'gabriel');
assert.equal(memoryPage(kitchen,lastPage).narrator,'davi','The final third-brother invitation belongs to Davi, not Camila.');
assert.match(memoryPage(kitchen,lastPage).text,/terceiro irmão/);
assert.match(memoryPage(kitchen,lastPage).sourceLabel,/2024/);
assert.match(memoryPage(kitchen,0).sourceLabel,/2027/);

// Every encounter needs a reachable, ground-level interaction position; an NPC
// or its label may sit behind a prop, but the player must not stand inside it.
function interactionPosition(action){
 for(let offset=-1.7;offset<=1.7;offset+=.025){
  const x=action.x+offset;
  if(x<0||x>level.end||level.gaps.some(([left,right])=>x>left&&x<right))continue;
  if(level.blocks.some(block=>x+physics.radius>block.x-block.width/2&&x-physics.radius<block.x+block.width/2))continue;
  const game=createGame();game.chapter=action.stage;game.x=x;
  if(nearbyAction(game)?.id===action.id)return x;
 }
 assert.fail(`${action.id} has no safe ground-level interaction position.`);
}
for(const action of allActions)interactionPosition(action);

// A player who skips a newly added relative must receive the correct reminder,
// then be able to return, finish that conversation, and complete the mission.
for(const [relative,targetId] of [['fernanda','prateleiras'],['murilo','rio-branco']]){
 const encounter=actionById(relative),target=actionById(targetId),game=createGame();
 game.chapter=target.stage;
 game.collected=new Set(level.candies.filter(item=>item.stage===target.stage).map(item=>item.id));
 game.x=interactionPosition(target);
 assert.match(actionLock(game,target),new RegExp(relative,'i'));
 const blocked=interactGame(game);
 assert.equal(blocked[0]?.type,'hint');assert.equal(game.memory,null);
 game.x=interactionPosition(encounter);
 assert.equal(interactGame(game)[0]?.type,'memory');
 while(game.memory)interactGame(game);
 assert.ok(game.done.has(relative));assert.equal(game.chapter,target.stage,'Meeting the relative alone does not complete the mission.');
 assert.equal(actionLock(game,target),'');
 game.x=interactionPosition(target);
 assert.equal(interactGame(game)[0]?.type,'memory');
 while(game.memory)interactGame(game);
 assert.equal(game.chapter,target.stage+1);assert.ok(game.done.has(targetId));
}

console.log(`Family story passed: corrected speakers, historical/current date labels, Davi's closing invitation, ${allActions.length} reachable encounters, Fernanda and Murilo prerequisite recovery.`);
