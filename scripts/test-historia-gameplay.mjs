import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { missions, allActions, actionById, memoryPage } from '../site/historia-missions.js';
import { createGame, stepGame, level, physics, platformAt, nearbyAction, actionLock, interactGame, nearbyMechanism, interactMechanism } from '../site/historia-game.js';

// A complete playthrough driven only by the same movement and interaction
// commands as the UI. No position, progress, inventory or velocity is injected.
export function playWinningRoute() {
  const game = createGame(), events = [], narrators = new Set();
  let memoryPages = 0, frames = 0;
  for (; frames < 15000 && !game.completed; frames++) {
    let frameEvents;
    if (game.memory) {
      narrators.add(memoryPage(actionById(game.memory.id), game.memory.page).narrator);
      memoryPages++; frameEvents = interactGame(game);
    } else if (nearbyMechanism(game)) frameEvents = interactMechanism(game);
    else {
      const action = nearbyAction(game);
      if (action && !game.done.has(action.id) && !actionLock(game, action)) frameEvents = interactGame(game);
      else {
        const targets = [
          ...level.candies.filter(item => item.stage === game.chapter && !game.collected.has(item.id)).map(item => ({...item,item:true})),
          ...missions[game.chapter].actions.filter(item => !game.done.has(item.id))
        ].sort((a,b) => a.x-b.x);
        const target = targets[0], distance = target.x-game.x;
        frameEvents = stepGame(game, {
          axis:Math.abs(distance)>.15 ? Math.sign(distance) : 0,
          jump:game.grounded && (target.item || Math.abs(distance)>2) && !game.jumpHeld
        },1/120);
      }
    }
    events.push(...frameEvents);
  }
  return {game,events,narrators,memoryPages,frames};
}

function testGameplay() {
  assert.deepEqual(missions.map(mission => mission.x),[0,16,32,48,64,80]);
  assert.equal(missions.at(-1).end,100);
  assert.equal(allActions.length,11);
  assert.deepEqual(level.candies.map(item => item.id),[0,1,2,3,6,7,8,9,10,12,13,14,15,16]);
  assert.equal(level.environments.length,6);
  assert.equal(new Set(level.environments.map(environment => environment.name)).size,6);
  assert.equal(level.bonuses.length,6);
  assert.equal(level.checkpoints.length,6);
  assert.ok(level.platforms.some(platform => platform.kind==='awning'));
  for (let index=0;index<level.gaps.length;index++) {
    const [left,right]=level.gaps[index];
    assert.ok(right>left && (index===0 || left>level.gaps[index-1][1]));
  }

  const shelf=level.platforms.find(platform => platform.id==='prateleira-baixa');
  const through=createGame();through.chapter=1;through.x=shelf.x;
  let roseThrough=false,landed=false;
  for(let frame=0;frame<180;frame++) {
    stepGame(through,{axis:0,jump:frame===0},1/120);
    if(through.vy>0 && through.y>shelf.y) {
      roseThrough=true;assert.equal(through.grounded,false,'A rising jump must pass through a one-way platform.');
      assert.equal(through.standing,null,'Passing through the underside must not snap feet onto the top.');
    }
    if(through.standing===shelf.id) {landed=true;assert.equal(through.y,shelf.y);break;}
  }
  assert.ok(roseThrough && landed,'The same jump must pass up through the shelf and land on its top while falling.');

  const bridge=level.platforms.find(platform => platform.id==='ponte-canal');
  const mechanism=createGame();mechanism.chapter=3;mechanism.x=54;
  assert.equal(platformAt(bridge,mechanism).active,false);
  assert.equal(nearbyMechanism(mechanism)?.id,'ponte-itaperucu');
  assert.equal(interactMechanism(mechanism)[0].type,'mechanism');
  assert.equal(platformAt(bridge,mechanism).active,true);
  assert.deepEqual(interactMechanism(mechanism),[],'A switch is idempotent and cannot award repeated events.');
  const airborne=createGame();airborne.chapter=3;airborne.x=54;airborne.y=1;airborne.grounded=false;
  assert.equal(nearbyMechanism(airborne),null,'Use a switch from solid ground.');
  for(const enabled of [false,true]) {
    const crossing=createGame();crossing.chapter=3;crossing.x=55.2;
    if(enabled)crossing.activated.add('ponte-itaperucu');
    for(let frame=0;frame<160;frame++)stepGame(crossing,{axis:1,jump:false},1/120);
    if(enabled) {assert.ok(crossing.x>61);assert.equal(crossing.falls,0);}
    else assert.ok(crossing.falls>0,'Walking into the closed canal must fall, rather than land on an invisible bridge.');
  }

  const lift=level.platforms.find(platform => platform.id==='elevador');
  const rider=createGame();rider.chapter=4;rider.x=lift.x;
  rider.activated.add('elevador-rio');rider.time=1.2;rider.y=platformAt(lift,rider).y;rider.standing=lift.id;
  let low=Infinity,high=-Infinity,ascending=false,descending=false;
  for(let frame=0;frame<650;frame++) {
    const previousY=rider.y;
    stepGame(rider,{axis:0,jump:false},1/120);
    const surface=platformAt(lift,rider);
    assert.ok(Math.abs(rider.y-surface.y)<1e-9,'Feet must remain on a lift through its entire cycle.');
    assert.equal(rider.grounded,true);assert.equal(rider.standing,lift.id);
    low=Math.min(low,rider.y);high=Math.max(high,rider.y);
    ascending ||= rider.y>previousY;descending ||= rider.y<previousY;
  }
  assert.ok(ascending && descending && high-low>1.99,'Verify both ascending and descending carry, not just a single resting phase.');
  const frozen={time:rider.time,x:rider.x,y:rider.y,platform:platformAt(lift,rider)};
  rider.memory={id:'murilo',page:0};
  for(let frame=0;frame<60;frame++)assert.deepEqual(stepGame(rider,{axis:1,jump:true},1/30),[]);
  assert.deepEqual({time:rider.time,x:rider.x,y:rider.y,platform:platformAt(lift,rider)},frozen,'Reading freezes lift motion and the complete simulation clock.');

  const saved=createGame();saved.x=14;saved.collected.add(0);saved.done.add('entrega');saved.activated.add('ponte-itaperucu');saved.bonuses.add('lembranca-estrada');
  assert.ok(stepGame(saved,{axis:0,jump:false},1/120).some(event=>event.type==='waypoint'));
  assert.deepEqual(saved.checkpoint,{x:14,y:0});
  assert.ok(!stepGame(saved,{axis:0,jump:false},1/120).some(event=>event.type==='waypoint'),'A checkpoint only announces itself once.');
  saved.x=12;saved.y=-3.75;saved.vy=-5;saved.grounded=false;
  assert.ok(stepGame(saved,{axis:0,jump:false},1/30).some(event=>event.type==='respawn'));
  assert.equal(saved.x,14);assert.equal(saved.y,0);assert.equal(saved.collected.size,1);assert.equal(saved.done.size,1);assert.equal(saved.activated.size,1);assert.equal(saved.bonuses.size,1);

  const bonus=level.bonuses.find(item=>item.stage===1),collector=createGame();
  collector.chapter=1;collector.x=bonus.x;collector.y=2.55;collector.standing='prateleira-alta';
  const bonusEvents=[];
  for(let frame=0;frame<200;frame++)bonusEvents.push(...stepGame(collector,{axis:0,jump:frame===0},1/120));
  assert.equal(bonusEvents.filter(event=>event.type==='bonus'&&event.id===bonus.id).length,1);
  assert.equal(collector.bonuses.size,1);
  // Bonus completion is deliberately not part of any chapter's win condition.
  const withoutBonuses=createGame();withoutBonuses.chapter=5;withoutBonuses.x=100;withoutBonuses.done.add('cerro');withoutBonuses.collected=new Set([15,16]);
  interactGame(withoutBonuses);while(withoutBonuses.memory)interactGame(withoutBonuses);
  assert.equal(withoutBonuses.completed,true);assert.equal(withoutBonuses.bonuses.size,0);

  const held=createGame();let jumps=0;
  for(let frame=0;frame<300;frame++)jumps+=stepGame(held,{axis:0,jump:true},1/120).filter(event=>event.type==='jump').length;
  assert.equal(jumps,1,'Holding jump cannot auto-bounce.');
  const buffered=createGame();buffered.y=.12;buffered.vy=-2;buffered.grounded=false;buffered.coyote=0;
  let bufferedJump=false;
  for(let frame=0;frame<15;frame++)bufferedJump ||= stepGame(buffered,{axis:0,jump:frame===0},1/120).some(event=>event.type==='jump');
  assert.ok(bufferedJump,'A press just before landing must retain the jump buffer.');
  const coyote=createGame();coyote.x=10.68;coyote.vx=physics.speed;coyote.grounded=true;
  stepGame(coyote,{axis:1,jump:false},1/120);assert.equal(coyote.grounded,false);
  assert.ok(stepGame(coyote,{axis:1,jump:true},1/120).some(event=>event.type==='jump'),'A fresh ledge departure retains coyote time.');

  const run=playWinningRoute();
  assert.equal(run.game.completed,true,'The whole route must be winnable with actual controls.');
  assert.equal(run.game.collected.size,14);assert.equal(run.game.done.size,11);assert.equal(run.game.falls,0);
  assert.equal(run.game.activated.size,2);
  assert.equal(run.events.filter(event=>event.type==='collect').length,14);
  assert.equal(run.events.filter(event=>event.type==='complete').length,1);
  const fresh=createGame();
  assert.equal(fresh.time,0);assert.equal(fresh.activated.size,0);assert.equal(fresh.bonuses.size,0);assert.equal(fresh.visited.size,0);assert.deepEqual(fresh.checkpoint,{x:0,y:0});
  console.log(`Gameplay passed: six scenarios, ${level.platforms.length} platforms, two switches, six optional souvenirs, safe checkpoints, one-way landings, full lift cycle, reading pause, jump buffer/coyote and a ${run.frames}-frame winning route with all 14 items and no falls.`);
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)testGameplay();
