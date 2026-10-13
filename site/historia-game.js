import { chapters } from './historia-model.js';
import { missions, allActions, actionById } from './historia-missions.js';
import { level, platformAt } from './historia-level.js';
export { level, platformAt };
export const physics = { radius: .33, height: 2.45, speed: 5.8, acceleration: 36, gravity: 24, jump: 10.7 };
export function createGame() {
  return { x: 0, y: 0, vx: 0, vy: 0, grounded: true, chapter: 0, collected: new Set(), done: new Set(), memory: null, completed: false, coyote: .1, jumpBuffer: 0, jumpHeld: false, falls: 0, time: 0, standing: null, activated: new Set(), activatedAt: {}, bonuses: new Set(), visited: new Set(), checkpoint: {x:0,y:0} };
}
export function stageCount(game, stage = Math.min(game.chapter, missions.length - 1)) {
  return level.candies.filter(candy => candy.stage === stage && game.collected.has(candy.id)).length;
}
function groundAt(x) {
  return !level.gaps.some(([left, right]) => x > left && x < right);
}
export function respawn(game) {
  game.x = game.checkpoint.x; game.y = game.checkpoint.y; game.standing = null; game.vx = 0; game.vy = 0;
  game.grounded = true; game.coyote = .1; game.jumpBuffer = 0; game.jumpHeld = false; game.falls++;
}
export function stepGame(game, input, delta) {
  const events = [];
  if (game.memory) return events;
  const dt = Math.min(Math.max(Number.isFinite(delta) ? delta : 0, 0), 1 / 30);
  if (!dt) return events;
  const standing = game.standing;
  const previousPlatforms = new Map(level.platforms.map(platform => [platform.id, platformAt(platform, game)]));
  game.time += dt;
  // Carry the feet with their support before applying the player's own motion.
  // This works on both halves of a lift cycle, including a descending platform.
  if (game.grounded && standing) {
    const support = level.platforms.find(platform => platform.id === standing);
    const before = previousPlatforms.get(standing), after = support && platformAt(support, game);
    if (after?.active && Math.abs(game.x - before.x) < support.width / 2 + physics.radius) {
      game.x += after.x - before.x;
      game.y += after.y - before.y;
    } else { game.grounded = false; game.standing = null; }
  }
  const direction = Math.max(-1, Math.min(1, Number(input.axis) || 0));
  const jumpPressed = !!input.jump && !game.jumpHeld;
  game.jumpHeld = !!input.jump;
  game.jumpBuffer = jumpPressed ? .12 : Math.max(0, game.jumpBuffer - dt);
  game.coyote = game.grounded ? .1 : Math.max(0, game.coyote - dt);
  if (game.jumpBuffer > 0 && game.coyote > 0) {
    game.vy = physics.jump; game.grounded = false; game.standing = null; game.coyote = 0; game.jumpBuffer = 0;
    events.push({ type: 'jump' });
  }
  const desired = direction * physics.speed;
  const acceleration = game.grounded ? physics.acceleration : physics.acceleration * .65;
  game.vx += Math.sign(desired - game.vx) * Math.min(Math.abs(desired - game.vx), acceleration * dt);
  let nextX = game.x + game.vx * dt;
  // Boxes are solid: walking into one requires a jump, and its top can be stood on.
  for (const block of level.blocks) {
    const left = block.x - block.width / 2, right = block.x + block.width / 2;
    if (game.y >= block.height - .025 || game.y + physics.height <= 0) continue;
    if (nextX + physics.radius > left && nextX - physics.radius < right) {
      if (game.x <= left) { nextX = left - physics.radius; game.vx = 0; }
      else if (game.x >= right) { nextX = right + physics.radius; game.vx = 0; }
    }
  }
  const limit = game.completed ? level.end : missions[game.chapter].end + .9;
  game.x = Math.max(0, Math.min(limit, nextX));
  if (game.x !== nextX) game.vx = 0;
  const beforeY = game.y;
  game.vy -= physics.gravity * dt;
  let nextY = game.y + game.vy * dt;
  game.grounded = false;
  let landing = -Infinity;
  let landingSupport = null;
  if (groundAt(game.x) && beforeY >= -.04 && nextY <= 0) landing = 0;
  for (const block of level.blocks) {
    const overlap = game.x + physics.radius > block.x - block.width / 2 + .03 && game.x - physics.radius < block.x + block.width / 2 - .03;
    if (overlap && game.vy <= 0 && beforeY >= block.height - .025 && nextY <= block.height) landing = Math.max(landing, block.height);
  }
  for (const platform of level.platforms) {
    const point = platformAt(platform, game), before = previousPlatforms.get(platform.id);
    if (!point.active) continue;
    const overlap = game.x + physics.radius > point.x - platform.width / 2 + .03 && game.x - physics.radius < point.x + platform.width / 2 - .03;
    const previousTop = standing === platform.id ? point.y : before.y;
    // One-way surfaces: feet must cross the top while falling. Rising jumps
    // pass underneath without getting pulled onto the platform.
    if (overlap && game.vy <= 0 && beforeY >= previousTop - .025 && nextY <= point.y && point.y > landing) {
      landing = point.y; landingSupport = platform.id;
    }
  }
  if (landing !== -Infinity) { nextY = landing; game.vy = 0; game.grounded = true; }
  game.standing = landingSupport;
  game.y = nextY;
  // A ledge cannot be crossed from its underside after falling into a gap.
  if (game.y < -.12 && groundAt(game.x)) {
    const edge = level.gaps.find(([l, r]) => game.x > l - .6 && game.x < r + .6);
    if (edge) { game.x = Math.min(edge[1] - .03, Math.max(edge[0] + .03, game.x)); game.vx = 0; }
  }
  for (const candy of level.candies) {
    if (candy.stage > game.chapter || game.collected.has(candy.id)) continue;
    if (Math.abs(game.x - candy.x) < .65 && candy.y > game.y - .2 && candy.y < game.y + physics.height + .28) {
      game.collected.add(candy.id); events.push({ type: 'collect', id: candy.id });
    }
  }
  for (const bonus of level.bonuses) {
    if (bonus.stage > game.chapter || game.bonuses.has(bonus.id)) continue;
    if (Math.abs(game.x - bonus.x) < .6 && bonus.y > game.y - .2 && bonus.y < game.y + physics.height + .2) {
      game.bonuses.add(bonus.id); events.push({type:'bonus',id:bonus.id});
    }
  }
  for (const waypoint of level.checkpoints) {
    if (waypoint.stage !== game.chapter || game.visited.has(waypoint.id) || !game.grounded || game.y > .2) continue;
    if (Math.abs(game.x - waypoint.x) < .7) {
      game.visited.add(waypoint.id); game.checkpoint = {x:waypoint.x,y:waypoint.y};
      events.push({type:'waypoint',id:waypoint.id,text:'Caminho salvo. Você volta daqui se cair.'});
    }
  }
  if (game.y < -3.8) { respawn(game); events.push({ type: 'respawn' }); }
  return events;
}
export function nearbyAction(game) {
  if (!game.grounded || game.y > .2) return null;
  return allActions.filter(a=>(a.stage===game.chapter||game.completed)&&Math.abs(a.x-game.x)<1.8)
    .sort((a,b)=>Math.abs(a.x-game.x)-Math.abs(b.x-game.x))[0]||null;
}
export function actionLock(game,action) {
  if (!action || game.done.has(action.id)) return '';
  const prerequisite=action.after?.find(id=>!game.done.has(id));
  if(prerequisite){
    const reminders={vizinho:'Volte ao depósito e atenda o vizinho na porta.',pedido:'Volte à esquerda e converse no balcão de pedidos.',fernanda:'Volte um pouco e converse com Fernanda.',murilo:'Volte um pouco e encontre Murilo.'};
    return reminders[prerequisite]||'Conclua a conversa anterior para continuar.';
  }
  const missing=action.requires-stageCount(game,action.stage);
  return missing>0?'Busque mais '+missing+' '+missions[action.stage].item+' pelo caminho.':'';
}
export function interactGame(game) {
  if (game.memory) return advanceMemory(game);
  const action=nearbyAction(game);
  if (!action) return [];
  const locked=actionLock(game,action);
  if (locked) return [{type:'hint',text:locked}];
  game.memory={id:action.id,page:0}; game.vx=0; game.vy=0;
  return [{type:'memory',id:action.id}];
}
export function closeMemory(game) { game.memory=null; game.vx=0; }
export function advanceMemory(game) {
  const memory=game.memory;
  if (!memory) return [];
  const action=actionById(memory.id);
  if (memory.page<action.pages.length-1) { memory.page++; return [{type:'memory',id:action.id}]; }
  closeMemory(game);
  const first=!game.done.has(action.id); game.done.add(action.id);
  const events=first?[{type:'action',id:action.id}]:[];
  const mission=missions[game.chapter];
  if (!game.completed&&mission.actions.every(a=>game.done.has(a.id))&&stageCount(game)>=mission.required) {
    game.chapter++; game.completed=game.chapter===missions.length;
    game.checkpoint = {x:chapters[game.chapter].x,y:0};
    events.push({type:game.completed?'complete':'checkpoint',chapter:game.chapter});
  }
  return events;
}

export function nearbyMechanism(game) {
  if (game.memory || !game.grounded || game.y > .2) return null;
  return level.mechanisms.filter(mechanism => mechanism.stage === game.chapter && !game.activated.has(mechanism.id) && Math.abs(mechanism.x - game.x) <= 1.8)
    .sort((a,b) => Math.abs(a.x-game.x)-Math.abs(b.x-game.x))[0] || null;
}
export function interactMechanism(game) {
  const mechanism = nearbyMechanism(game);
  if (!mechanism) return [];
  game.activated.add(mechanism.id); game.activatedAt[mechanism.id] = game.time;
  return [{type:'mechanism',id:mechanism.id,text:mechanism.kind === 'bridge' ? 'Ponte aberta. O caminho para Itaperuçu está livre!' : 'Elevador ligado. Suba na plataforma e explore os andaimes.'}];
}
