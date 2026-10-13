import * as THREE from './vendor/three.module.min.js';
import { platformAt } from './historia-level.js';

// Scenery shares the level's positions and clock: every visible stepping surface
// has the same top as its collider, including the bridge and moving lift.
export function createScenarioScenery({ scene, level, box, ball, cylinder, group, mesh, mat, sign, parcel }) {
  const zones = [], platforms = [], mechanisms = [], bonuses = [], checkpoints = [];
  const worldX = x => x - 1.4;
  const colors = { blue:'#1747c8', yellow:'#ffd23f', wood:'#bd925d', steel:'#547794', cream:'#fff4d3' };
  const zone = (stage, center) => {
    const root = group(scene, worldX(center), 0, 0);
    root.name = 'Cenário · ' + (level.environments?.[stage]?.name || stage);
    const item = { stage, center, root }; zones.push(item); return item;
  };
  const localX = (area, x) => x - area.center;
  const timber = (area, x, y, z, width=1.1, height=.7) => {
    const root=group(area.root,localX(area,x),y,z);
    box(width,height,.8,colors.wood,root,0,height/2,0,.04);
    [-1,1].forEach(side=>box(.09,height+.04,.84,'#e7ba77',root,side*(width/2-.12),height/2,0,.012));
    box(width+.02,.08,.83,'#e7ba77',root,0,height*.48,0,.012);
    return root;
  };
  const beam = (parent,x,y,z,w,angle=0) => { const object=box(w,.11,.12,colors.wood,parent,x,y,z,.025);object.rotation.z=angle;return object; };
  const foliage = (parent,x,y,z,scale=1) => {
    ball(.48*scale,.4*scale,.42*scale,'#6cae53',parent,x,y,z);
    ball(.28*scale,.32*scale,.3*scale,'#91c560',parent,x+.26*scale,y+.17*scale,z);
  };
  const roadside=zone(0,8);
  // A country-road start: fruit crates, orchard fencing and a small loading stop.
  [-2,1,4].forEach(x=>{
    cylinder(.075,1.05,colors.wood,roadside.root,x,.52,-1.75,8);
    beam(roadside.root,x+1.4,.43,-1.75,2.85);beam(roadside.root,x+1.4,.83,-1.75,2.85);
  });
  [6.1,7.35].forEach((x,i)=>{
    const crate=timber(roadside,x,0,-.9,1.04,.57);
    for(let n=0;n<5;n++)ball(.13,.13,.12,n%2?'#f0b82d':'#e97837',crate,-.35+(n%3)*.32,.66,-.17+Math.floor(n/3)*.32);
  });
  sign('PRIMEIRAS ENTREGAS',3.3,.39,roadside.root,-2.8,2.15,-1.2,'#fff4d3',colors.blue);
  [-4.2,-1.4].forEach(x=>box(.1,2.12,.11,colors.wood,roadside.root,x,1.06,-1.25,.02));

  const warehouse=zone(1,24);
  // Open shelving behind the playable loft gives the delivery route depth.
  [-3.7,1.1].forEach(x=>box(.12,3.65,.16,colors.steel,warehouse.root,x,1.82,-1.8,.02));
  [.55,1.72,2.92].forEach((y,row)=>{
    box(5.05,.13,1.1,colors.steel,warehouse.root,-1.3,y,-1.8,.025);
    for(let n=0;n<4;n++)parcel(warehouse.root,-3.05+n*1.12,y+.35,-1.65,.9,row%2?'#94b5db':'#e9c58a');
  });
  sign('SEPARAÇÃO · ENTREGAS',4.45,.35,warehouse.root,-1.3,3.5,-1.18);
  box(4.2,.035,.24,'#f2ca43',warehouse.root,1,.04,-.17,.01);
  timber(warehouse,29.2,0,-.5,.8,.57);
  const cart=group(warehouse.root,4.1,0,-1.2);
  box(1.25,.15,.85,colors.blue,cart,0,.22,0,.025);
  [-.48,.48].forEach(x=>[-.32,.32].forEach(z=>ball(.13,.13,.11,'#33465c',cart,x,.1,z)));
  box(.1,1.1,.1,colors.steel,cart,.6,.68,-.35,.02);parcel(cart,0,.58,0,.84);

  const market=zone(2,40);
  // Striped market canopy and confectionery trays distinguish this stop.
  const stall=group(market.root,-2,0,-1.1);
  box(3.6,1.06,1.2,'#f3d28e',stall,0,.53,0,.07);
  box(3.8,.12,1.35,'#fff4d3',stall,0,1.1,0,.03);
  [-1.6,1.6].forEach(x=>box(.1,2.95,.11,colors.wood,stall,x,1.45,-.43,.02));
  for(let n=0;n<8;n++) {
    box(.49,.15,1.75,n%2?colors.cream:colors.yellow,stall,-1.72+n*.49,2.96,-.1,.025);
    box(.49,.24,.1,n%2?colors.cream:colors.yellow,stall,-1.72+n*.49,2.78,.76,.03);
  }
  [-1.04,0,1.04].forEach((x,i)=>{
    box(.82,.065,.8,'#ad794d',stall,x,1.2,.1,.02);
    for(let n=0;n<4;n++) {
      ball(.13,.1,.13,['#955531','#e4aa58','#f0dfab'][i],stall,x-.18+n%2*.36,1.31,-.08+Math.floor(n/2)*.36);
    }
  });
  sign('DOCES · FESTAS',2.95,.4,stall,0,1.98,-.35);
  [-2.2,1.8,5.8].forEach(x=>{
    const bunting=mesh(new THREE.ConeGeometry(.25,.38,3),x%2?colors.yellow:colors.blue,market.root,x,4.4,-1.3);bunting.rotation.z=Math.PI;
  });
  beam(market.root,1.8,4.65,-1.3,8.5);

  const canal=zone(3,56);
  // A real canal below the route makes the bridge action legible at a glance.
  box(7,.09,10,'#73bdcc',canal.root,2.5,-.95,.8,.03);
  [-.3,5.3].forEach(x=>{
    box(.6,1.1,9.3,'#b9ad90',canal.root,x,-.47,.4,.055);
    box(.72,.16,9.45,'#e6d9b5',canal.root,x,.1,.4,.04);
  });
  for(let n=0;n<6;n++)box(.85,.012,.075,'#b5e2e7',canal.root,.55+n*.78,-.889,-2.8+n%3*2,.008);
  [50.2,62.5].forEach(x=>{
    foliage(canal.root,localX(canal,x),.4,-1.3,1.25);
    cylinder(.055,.98,'#6f9850',canal.root,localX(canal,x)+.3,.47,-.86,8);
    cylinder(.065,.22,'#937149',canal.root,localX(canal,x)+.3,1,-.86,8);
  });
  sign('ITAPERUÇU',2.6,.45,canal.root,5.7,2.1,-1.2,'#fff4d3',colors.blue);
  box(.12,2.2,.12,colors.wood,canal.root,5.7,1.1,-1.25,.025);

  const construction=zone(4,72);
  const rear=group(construction.root,4.2,0,-1.3);
  [-2,2].forEach(x=>box(.14,4.1,.16,colors.steel,rear,x,2.05,0,.02));
  [1.4,3.05].forEach(y=>box(4.55,.14,.9,'#d9ad71',rear,0,y,0,.025));
  [-1,1].forEach(side=>{
    const brace=box(.065,3.6,.09,colors.steel,rear,side,1.9,-.15,.015);brace.rotation.z=side*.57;
  });
  sign('CONSTRUINDO JUNTOS',3.9,.37,rear,0,3.77,.11,colors.yellow,colors.blue);
  [69.4,70.6].forEach((x,i)=>{
    timber(construction,x,0,-.9,.95,.55);
    box(.88,.17,.74,'#e6e0ce',construction.root,localX(construction,x),.7,-.9,.035);
    if(i)box(.88,.17,.74,'#e6e0ce',construction.root,localX(construction,x),.9,-.9,.035);
  });
  [68,79.4].forEach(x=>{
    const cone=mesh(new THREE.ConeGeometry(.2,.66,12),'#eea23d',construction.root,localX(construction,x),.33,4.48);
    box(.44,.08,.44,'#efb045',construction.root,localX(construction,x),.04,4.48,.025);
  });

  const garden=zone(5,88);
  // A terraced garden opens the final chapter instead of repeating a loading yard.
  const pergola=group(garden.root,1.4,0,-1.4);
  [-2.5,2.5].forEach(x=>box(.15,3.35,.15,colors.wood,pergola,x,1.66,0,.03));
  beam(pergola,0,3.36,0,5.5);
  for(let n=0;n<5;n++)box(.14,.16,1.8,'#d8b67e',pergola,-2+n,3.45,0,.025);
  [-2.5,2.5].forEach(x=>{box(.7,.5,.72,'#f2c343',pergola,x,.25,0,.06);foliage(pergola,x,.8,0,1.15);});
  [-2,-.8,.4,1.6].forEach((x,i)=>{
    ball(.27,.2,.23,'#75a953',pergola,x,3.48,0);
    ball(.09,.085,.09,i%2?'#e78d68':'#ffd66c',pergola,x+.1,3.64,.05);
  });
  box(6.5,.05,1.9,'#dce5c0',garden.root,2,.045,4.9,.03);
  [84,92].forEach(x=>{
    box(.9,.48,.88,'#e6d5af',garden.root,localX(garden,x),.25,-.7,.07);
    foliage(garden.root,localX(garden,x),.75,-.7,1.2);
  });

  for(const platform of level.platforms || []) {
    const root=group(scene,worldX(platform.x),platform.y,2.4);
    root.name='Plataforma · '+platform.id;
    root.userData.platform=platform.id;
    const depth=platform.kind==='bridge'?2.3:1.75;
    const h=platform.height||.24;
    const topColor=platform.kind==='awning'?'#f9cf4a':platform.kind==='lift'?'#7397b1':platform.kind==='scaffold'?'#d8b780':'#c9985c';
    const deck=group(root);
    box(platform.width,h,depth,topColor,deck,0,-h/2,0,.035);
    // The thin pale edge marks the exact one-way landing top from any camera angle.
    box(platform.width,.045,.1,colors.cream,deck,0,-.026,depth/2+.018,.012);
    const slats=Math.min(11,Math.max(3,Math.round(platform.width/.5)));
    for(let n=1;n<slats;n++)box(.025,.017,depth-.08,'#9c794f',deck,-platform.width/2+n*platform.width/slats,.009,0,.004);
    if(platform.kind==='awning') {
      const stripeCount=Math.ceil(platform.width/.42);
      for(let n=0;n<stripeCount;n++)box(platform.width/stripeCount,.14,.09,n%2?colors.cream:colors.yellow,deck,-platform.width/2+(n+.5)*platform.width/stripeCount,-.1,depth/2+.035,.022);
    }
    if(platform.kind==='bridge') {
      // Rear rail stays behind Dedei. The front is open so feet and landings stay visible.
      [-.5,0,.5].forEach(t=>box(.09,.76,.09,colors.wood,deck,t*(platform.width-.2),.38,-depth/2+.03,.018));
      beam(deck,0,.76,-depth/2+.03,platform.width);
      box(.34,.1,depth+.1,colors.steel,root,-platform.width/2,-h/2,0,.015);
    } else if(platform.kind==='lift') {
      const travel=(platform.motion?.distance || 2)+platform.y+.8;
      const rails=group(scene,worldX(platform.x),0,1.6);
      [-1,1].forEach(side=>box(.11,travel,.12,colors.steel,rails,side*(platform.width/2-.13),travel/2,0,.02));
      box(platform.width+.4,.12,.16,colors.steel,rails,0,travel,0,.02);
      box(.13,travel,.08,'#d9b446',rails,0,travel/2,.035,.015);
      [-1,1].forEach(side=>box(.08,.45,.09,colors.blue,deck,side*(platform.width/2-.12),.2,-depth/2+.09,.016));
      platforms.push({ definition:platform, root, deck, rails });continue;
    } else {
      const height=Math.max(.2,platform.y-h);
      [-1,1].forEach(side=>box(.12,height,.13,platform.kind==='shelf'||platform.kind==='scaffold'?colors.steel:colors.wood,root,side*(platform.width/2-.16),-h-height/2,-depth/2+.12,.024));
      if(platform.kind==='scaffold') {
        const brace=box(platform.width*.9,.09,.11,colors.steel,root,0,-platform.y*.55,-depth/2+.1,.02);brace.rotation.z=.28;
      }
    }
    platforms.push({ definition:platform, root, deck });
  }

  for(const mechanism of level.mechanisms || []) {
    const root=group(scene,worldX(mechanism.x),0,1.48);
    root.name='Mecanismo · '+mechanism.id;root.userData.mechanism=mechanism.id;
    box(.65,.92,.54,colors.blue,root,0,.46,0,.06);
    box(.76,.12,.66,colors.cream,root,0,.98,0,.025);
    const lever=group(root,0,1.1,0);
    cylinder(.045,.65,'#cad6d8',lever,0,.24,0,10);
    ball(.13,.13,.13,colors.yellow,lever,0,.58,0);
    lever.rotation.z=.6;
    const light=ball(.08,.08,.025,'#f0bd36',root,0,.69,.29);
    sign(mechanism.kind==='bridge'?'PONTE':'ELEVADOR',.78,.2,root,0,.26,.31,'#fff4d3',colors.blue);
    const halo=mesh(new THREE.TorusGeometry(.43,.027,6,30),colors.yellow,root,0,1.75,0);
    mechanisms.push({definition:mechanism,root,lever,light,halo});
  }
  const starShape=new THREE.Shape();
  for(let n=0;n<10;n++) {
    const angle=Math.PI/2+n*Math.PI/5,r=n%2?.16:.34;
    if(n)starShape.lineTo(Math.cos(angle)*r,Math.sin(angle)*r);else starShape.moveTo(Math.cos(angle)*r,Math.sin(angle)*r);
  }
  starShape.closePath();
  const starGeometry=new THREE.ExtrudeGeometry(starShape,{depth:.1,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,steps:1});starGeometry.center();
  for(const bonus of level.bonuses || []) {
    const root=group(scene,worldX(bonus.x),bonus.y,2.4);
    root.name='Estrela · '+bonus.id;root.userData.bonus=bonus.id;
    mesh(starGeometry,colors.yellow,root);
    const rim=mesh(new THREE.TorusGeometry(.49,.023,6,28),'#fff1a3',root,0,0,-.04);
    bonuses.push({definition:bonus,root,rim});
  }
  for(const checkpoint of level.checkpoints || []) {
    const root=group(scene,worldX(checkpoint.x),0,3.8);
    root.name='Bandeira · '+checkpoint.id;root.userData.checkpoint=checkpoint.id;
    cylinder(.035,1.25,colors.wood,root,0,.625,0,8);
    box(.28,.11,.28,colors.cream,root,0,.055,0,.025);
    const flag=box(.42,.3,.028,'#99adba',root,.21,1.08,0,.014);
    checkpoints.push({definition:checkpoint,root,flag});
  }
  function sync(game,time,decorativeMotion=true) {
    const nearby=root=>Math.abs(root.position.x-worldX(game.x))<25;
    zones.forEach(area=>{area.root.visible=Math.abs(game.x-area.center)<31;});
    platforms.forEach(item=>{
      const current=platformAt(item.definition,game);
      item.root.position.set(worldX(current.x),current.y,2.4);
      item.root.visible=nearby(item.root);
      if(item.rails)item.rails.visible=item.root.visible;
      if(item.definition.kind==='bridge') {
        // No easing here: collision state and the bridge deck change together.
        const angle=current.active?0:Math.PI*.45;
        item.deck.rotation.z=angle;
        item.deck.position.set((Math.cos(angle)-1)*item.definition.width/2,Math.sin(angle)*item.definition.width/2,0);
      } else if(item.definition.kind==='lift') {
        item.deck.children[0].material=mat(current.active?'#7397b1':'#93a3aa');
      }
      item.root.userData.collider={x:current.x,y:current.y,active:current.active,width:item.definition.width};
    });
    mechanisms.forEach(item=>{
      const active=game.activated.has(item.definition.id);
      item.root.visible=nearby(item.root);
      item.lever.rotation.z=active?-.62:.6;
      item.light.material=mat(active?'#71b65c':'#f0bd36');
      item.halo.visible=!active&&!game.memory&&Math.abs(game.x-item.definition.x)<5;
      item.halo.scale.setScalar(decorativeMotion?1+Math.sin(time*2.7)*.045:1);
    });
    bonuses.forEach(item=>{
      item.root.visible=!game.bonuses.has(item.definition.id)&&nearby(item.root);
      item.root.position.y=item.definition.y+(decorativeMotion?Math.sin(time*2+item.definition.stage)*.06:0);
      item.root.rotation.y=decorativeMotion?Math.sin(time*.9)*.38:0;
    });
    checkpoints.forEach(item=>{
      item.root.visible=nearby(item.root);
      const reached=game.visited.has(item.definition.id);
      item.flag.material=mat(reached?colors.yellow:'#99adba');
    });
  }
  return {sync,zones,platforms,mechanisms,bonuses,checkpoints};
}
