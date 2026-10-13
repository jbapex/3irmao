import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { allActions,actionById,memoryPage } from '../site/historia-missions.js';
import { createGame,level,physics,nearbyAction,interactGame,actionLock } from '../site/historia-game.js';

// These regressions protect the identities clarified by the family: Gabriel's
// childhood, Camila's marriage, and Davi's closing invitation.
const delivery=actionById('entrega');
assert.equal(memoryPage(delivery,0).narrator,'dedei');
assert.equal(memoryPage(delivery,2).narrator,'gabriel');
assert.equal(memoryPage(delivery,3).narrator,'gabriel');
assert.match(memoryPage(delivery,3).text,/12 anos/);
assert.equal(memoryPage(delivery,3).sourceLabel,'Família 3 Irmãos');

const expansion=memoryPage(actionById('pedido'),1);
assert.equal(expansion.narrator,'gabriel','Gabriel, rather than Dedei, invited his own wife to help with Itaperuçu.');
assert.match(expansion.text,/Camila, minha esposa/);

const camila=actionById('itaperucu');
assert.equal(camila.pages.length,2,'Camila participates in the family story without an extra profile chapter.');
assert.equal(memoryPage(camila,0).narrator,'camila');
assert.equal(memoryPage(camila,0).person.photo,undefined,'Camila stays a game character without a photographic portrait in the dialogue.');
assert.equal(memoryPage(camila,0).sourceLabel,'Itaperuçu');
assert.equal(memoryPage(camila,1).sourceLabel,'Itaperuçu');
assert.match(memoryPage(camila,1).text,/Itaperuçu.*novidades/);

const kitchen=actionById('cozinha'),lastPage=kitchen.pages.length-1;
assert.equal(memoryPage(kitchen,lastPage-1).narrator,'gabriel');
assert.equal(memoryPage(kitchen,lastPage).narrator,'davi','The final third-brother invitation belongs to Davi, not Camila.');
assert.match(memoryPage(kitchen,lastPage).text,/terceiro irmão/);
assert.equal(memoryPage(kitchen,lastPage).sourceLabel,'O convite de Davi');
assert.match(memoryPage(kitchen,0).sourceLabel,/2027/);

// The source recording is documentation, not part of the visitor's experience.
const sourceReferences=/\b(?:v[ií]deo|depoimento|palestrante|transcri[çc][aã]o|2024)\b/i;
for(const action of allActions){
 assert.doesNotMatch([action.label,action.title,action.context,action.cue,action.result].filter(Boolean).join(' '),sourceReferences,`${action.id} must tell the story without source commentary.`);
 for(let page=0;page<action.pages.length;page++){
  const memory=memoryPage(action,page);
  assert.doesNotMatch([memory.text,memory.sourceLabel,memory.person.role].join(' '),sourceReferences,`${action.id} page ${page+1} must read as the family's story.`);
 }
}
const storyHtml=readFileSync(new URL('../content/historia.html',import.meta.url),'utf8');
assert.doesNotMatch(storyHtml,sourceReferences,'The public history page must omit references to the recording.');
assert.doesNotMatch(storyHtml,/class=["'][^"']*\bstory-family\b/,'The separate family-profile section must stay removed.');
assert.doesNotMatch(storyHtml,/<(?:img|picture)\b[^>]*\bcamila[^>]*>/i,'Camila must not have a highlighted photograph on the history page.');
assert.doesNotMatch(storyHtml,/<article\b[^>]*(?:id|class)=["'][^"']*camila/i,'Camila participates within Itaperuçu, not a dedicated profile article.');

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

console.log(`Family story passed: correct family identities, direct narrative without recording commentary, no highlighted Camila profile, Davi's closing invitation, ${allActions.length} reachable encounters, Fernanda and Murilo prerequisite recovery.`);
