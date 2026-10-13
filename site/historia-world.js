import * as THREE from './vendor/three.module.min.js';
import { createSurfaceLibrary } from './historia-surfaces.js';
import { createGameRendering } from './historia-rendering.js';
import { createGabriel } from './historia-gabriel.js';
import { createFamily } from './historia-family.js';
import { createCharacterShapes } from './historia-character-shapes.js';
import { createVillageKit } from './historia-village.js';
import { createScenarioScenery } from './historia-scenery.js';
import { missions, actionById, memoryNarrators, memoryPage } from './historia-missions.js';

// An original real-time miniature. Dedei is stylized from the supplied photo; buildings are illustrative.
export function createStoryWorld(gameLevel = null) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#4faeeb');
  scene.fog = new THREE.Fog('#92bed0', 48, 112);
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 120);
  const skyGeometry=new THREE.PlaneGeometry(400,100);
  const skyColors=new Float32Array(12);
  ['#218ed8','#218ed8','#a5daf3','#a5daf3'].forEach((hex,i)=>new THREE.Color(hex).toArray(skyColors,i*3));
  skyGeometry.setAttribute('color',new THREE.BufferAttribute(skyColors,3));
  const sky=new THREE.Mesh(skyGeometry,new THREE.MeshBasicMaterial({vertexColors:true,depthWrite:false,fog:false,toneMapped:false}));
  sky.position.set(48,18,-88);sky.renderOrder=-1000;sky.frustumCulled=false;scene.add(sky);
  const livingTrees=[],clouds=[],floatingBalloons=[],neighbors=[];
  const surfaces=createSurfaceLibrary();
  let rendering=null;
  const materials = new Map(), geometries = new Map();
  const palette = { blue: '#1747c8', yellow: '#ffd23f', white: '#fffdf6', green: '#71b65c', dark: '#233d65', skin: '#ce977b' };
  const mat = (color, roughness = .72) => {
    if(['#97cfdf','#b6e4f5','#c5edee','#98ccd5'].includes(color))roughness=.24;
    if(color==='#151d2a')roughness=.96;
    const key = color + roughness;
    if(!materials.has(key)){
      const paint=['#1747c8','#ffd23f','#1e52d4','#f5c634'].includes(color);
      const glass=['#97cfdf','#b6e4f5','#c5edee','#98ccd5','#73aebc','#254f85'].includes(color);
      const metal=['#e6edf1','#e8eef2','#eff4f2','#e6b65b','#ffe084'].includes(color);
      const material=glass?new THREE.MeshPhysicalMaterial({color,roughness:.15,metalness:0,clearcoat:1,clearcoatRoughness:.12}):paint?new THREE.MeshPhysicalMaterial({color,roughness:.4,metalness:.02,clearcoat:.24,clearcoatRoughness:.38}):new THREE.MeshStandardMaterial({color,roughness:metal?.28:roughness,metalness:metal?.72:0});
      materials.set(key,surfaces.decorate(material,color));
    }
    return materials.get(key);
  };
  const mesh = (geometry, color, parent, x = 0, y = 0, z = 0) => {
    const object = new THREE.Mesh(geometry, typeof color === 'string' ? mat(color) : color);
    object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true;
    parent.add(object); return object;
  };
  function roundedGeometry(w, h, d, r) {
    const key = [w, h, d, r].join(',');
    if (!geometries.has(key)) {
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2 + r, -h / 2 + r);
      shape.lineTo(w / 2 - r, -h / 2 + r); shape.lineTo(w / 2 - r, h / 2 - r);
      shape.lineTo(-w / 2 + r, h / 2 - r); shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * r, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 2 });
      geometry.center(); geometries.set(key, geometry);
    }
    return geometries.get(key);
  }
  const box = (w, h, d, color, parent, x = 0, y = 0, z = 0, r = .05) => mesh(roundedGeometry(w, h, d, Math.min(r, w / 3, h / 3, d / 3)), color, parent, x, y, z);
  const sphereGeometry = new THREE.SphereGeometry(1, 20, 14);
  const ball = (sx, sy, sz, color, parent, x = 0, y = 0, z = 0) => {
    const object = mesh(sphereGeometry, color, parent, x, y, z); object.scale.set(sx, sy, sz); return object;
  };
  const cylinder = (radius, height, color, parent, x, y, z, radial = 20) => {
    const key='cylinder/'+radius+'/'+height+'/'+radial;
    if(!geometries.has(key))geometries.set(key,new THREE.CylinderGeometry(radius,radius,height,radial));
    return mesh(geometries.get(key),color,parent,x,y,z);
  };
  function group(parent, x = 0, y = 0, z = 0) { const object = new THREE.Group(); object.position.set(x, y, z); parent.add(object); return object; }
  const characterShapes=createCharacterShapes({mesh,group,mat});

  function label(text, width, height, background = '#1747c8', color = '#ffffff') {
    // Canvas is only used to typeset labels on actual 3D objects.
    if (typeof document === 'undefined') return mat(background);
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 ' + (text.length > 18 ? 45 : text.length > 12 ? 56 : 71) + 'px Arial, sans-serif';
    ctx.fillText(text, 384, 101, 695);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return new THREE.MeshStandardMaterial({ map: texture, roughness: .85, side: THREE.FrontSide });
  }
  function sign(text, w, h, parent, x, y, z, bg = '#1747c8', color = '#fffdf6') {
    box(w + .08, h + .08, .12, bg, parent, x, y, z - .03);
    return mesh(new THREE.PlaneGeometry(w, h), label(text, w, h, bg, color), parent, x, y, z + .04);
  }

  scene.add(new THREE.HemisphereLight('#cbe7f8', '#978467', .92));
  const sun = new THREE.DirectionalLight('#ffe4b6', 2.85); sun.position.set(-8, 17, 11);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -9, near: 1, far: 48 });
  sun.shadow.normalBias = .04; sun.shadow.bias = -.00015; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#b7d9fa', .28); fill.position.set(5, 5, -10); scene.add(fill);

  const village=createVillageKit({box,ball,cylinder,group,mesh,mat});

  if (gameLevel) {
    box(150, .7, 22, '#639342', scene, 48, -.6, -11.7, .14);
    box(150, .7, 10, '#639342', scene, 48, -.6, 9.8, .14);
    surfaces.ground(scene,150,22,48,-11.7);surfaces.ground(scene,150,10,48,9.8);
    let left = -18;
    [...gameLevel.gaps, [gameLevel.end + 18, gameLevel.end + 19]].forEach(([gapLeft, gapRight]) => {
      const boundaries=[left,...[0,16,32,48,64,80,102].filter(value=>value>left&&value<gapLeft),gapLeft];
      for(let index=0;index<boundaries.length-1;index++) {
        const start=boundaries[index],end=boundaries[index+1],w=end-start,x=(start+end)/2-1.4;
        const stage=Math.min(5,Math.max(0,Math.floor((start+end)/2/16)));
        const paving=['#f5e5c7','#d5dfe2','#f1dbc0','#e6dcc4','#d4d2c7','#e2e6c3'][stage];
        box(w,.55,5.3,'#dbc397',scene,x,-.29,2.1,.045);
        box(w,.1,5.1,paving,scene,x,-.04,2.1,.025);
        village.pavement(scene,w,5.1,x,.013,2.1);
        box(w,.17,.18,'#fff3d9',scene,x,-.02,-.45,.025);
        box(w,.17,.18,'#fff3d9',scene,x,-.02,4.65,.025);
      }
      if (gapLeft < gameLevel.end) {
        const constructionGap=gapLeft>64&&gapLeft<80,roadDitch=gapLeft<16;
        box(gapRight-gapLeft,.1,5.2,constructionGap?'#c3aa83':roadDitch?'#9e9b72':'#86d1df',scene,(gapLeft+gapRight)/2-1.4,constructionGap?-1.7:-3,2.1);
        [gapLeft - .12, gapRight + .12].forEach(edge => box(.18, .04, 5.0, '#edb92e', scene, edge - 1.4, .04, 2.1, .01));
      }
      left = gapRight;
    });
  } else {
    box(100, .7, 37, '#639342', scene, 23, -.6, -5, .14);
    box(91, .2, 5.1, '#f5e5c7', scene, 22, -.13, 2.1, .06);
    box(91, .22, .22, '#fff3d9', scene, 22, -.04, -.45);
    box(91, .22, .22, '#fff3d9', scene, 22, -.04, 4.65);
  }
  for (let x = -15; x <= (gameLevel?.end || 65) + 10; x += 2.7) {
    if (gameLevel?.gaps.some(([l, r]) => x + 1.4 > l && x + 1.4 < r)) continue;
    box(.025, .012, 4.8, '#d5c9ae', scene, x, -.021, 2.1, .003);
  }
  if (!gameLevel) for (let x = 2; x <= 47; x += 2) cylinder(.105, .025, '#f1c637', scene, x, .018, 2.35, 12);

  function tree(x, z, scale = 1, tint = '#69ad55') {
    const g = group(scene, x, 0, z); g.scale.setScalar(scale);
    const trunk=mesh(new THREE.CylinderGeometry(.11,.22,1.9,10),'#947044',g,0,.93,0);
    [-1,1].forEach(side=>{const branch=cylinder(.085,.9,'#947044',g,side*.22,1.5,0,8);branch.rotation.z=-side*.52;});
    const crown=group(g,0,1.3,0);
    village.foliage(crown,x,1.08);
    livingTrees.push({crown,phase:x*.7});
    [-1,1].forEach(side=>{const root=cylinder(.075,.53,'#765331',g,side*.16,.015,side*.07,8);root.rotation.z=side*.95;});
  }
  [-9,7,10,23,27,40,44,56,61,72,88,103,110].forEach((x, i) => tree(x, -4 - i % 2 * 3, .95 + i % 3 * .18));
  [-6,11,24,40,56,72,88,105].forEach((x, i) => tree(x, 7.2, .43 + i % 2 * .08, '#73ad55'));
  surfaces.hills(scene);surfaces.grassEdges(scene);
  for (let i = 0; i < 13; i++) {
    const g = group(scene, -15 + i * 12, 7.4 + i % 2 * 1.1, -17 - i % 3 * 2);
    ball(1.5, .6, .65, '#ffffff', g, 0, 0, 0);
    ball(.95, .9, .75, '#ffffff', g, .2, .25, 0);
    ball(.9, .55, .6, '#ffffff', g, -1, -.05, 0);
    g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    clouds.push({group:g,x:g.position.x,phase:i});
  }
  function planter(parent, x, z) {
    box(.85, .55, .85, '#f2c343', parent, x, .25, z, .08);
    ball(.48, .43, .45, '#569f52', parent, x, .66, z);
    ball(.24, .27, .25, '#80bc59', parent, x + .25, .83, z);
  }
  function parcel(parent, x, y, z, s = 1, color = '#ecc582') {
    const g = group(parent, x, y, z); g.scale.setScalar(s);
    box(.6, .58, .6, color, g, 0, 0, 0, .025);
    box(.13, .592, .61, '#fff4d3', g, 0, 0, 0, .005); return g;
  }
  function balloons(parent, x, y, z) {
    ['#ffd23f', '#1747c8', '#fdfaff'].forEach((color, i) => {
      const bx = x + (i - 1) * .48, by = y + (i % 2) * .37;
      const bunch=group(parent,bx,by,z);
      ball(.39,.48,.35,color,bunch,0,0,0);
      cylinder(.012,1.25,'#8c9bac',bunch,0,-1.08,0,6);
      floatingBalloons.push({group:bunch,y:by,phase:bx+i});
    });
  }

  const truck = group(scene, 1.3, 0, -2.6);
  box(5.1, .45, 2.1, '#254475', truck, 0, .65, 0, .12);
  box(3.2, 2.55, 2, palette.yellow, truck, -.85, 2.13, 0, .17);
  box(1.85, 1.95, 2, palette.blue, truck, 1.66, 1.84, 0, .18);
  box(1.42, .74, .075, '#b6e4f5', truck, 1.71, 2.32, 1.02, .04);
  box(.07, .82, 1.55, '#b6e4f5', truck, 2.59, 2.31, 0, .025);
  box(1.85, .46, 2.02, palette.blue, truck, 1.75, 1.15, 0, .12);
  box(.22, .27, 2.18, palette.yellow, truck, 2.67, .88, 0, .05);
  box(.27, .08, .08, '#e6edf1', truck, 1.21, 1.71, 1.065, .02);
  [-1.65, 1.72].forEach(x => [-1.08, 1.08].forEach(z => {
    const tire = cylinder(.5, .3, '#26354a', truck, x, .5, z, 24); tire.rotation.x = Math.PI / 2;
    const hub = cylinder(.27, .32, '#eff4f2', truck, x, .5, z, 24); hub.rotation.x = Math.PI / 2;
    const center = cylinder(.12, .335, palette.yellow, truck, x, .5, z, 20); center.rotation.x = Math.PI / 2;
  }));
  sign('3 IRMÃOS', 2.68, .83, truck, -.9, 2.24, 1.04);
  sign('UM COMEÇO DOCE', 2.68, .3, truck, -.9, 1.56, 1.04, '#ffd23f', '#1747c8');
  parcel(scene, -2, .32, -.5, .95); parcel(scene, -2.56, .3, -.8, .85, '#94b5f4');
  parcel(scene, -2.23, .84, -.6, .74, '#f2d440');

  function store(x, large = false) {
    const g=group(scene,x,0,-3.25),w=large?8:5.7,h=large?6.25:4.35;
    box(w+.6,.26,4.4,'#ead6ad',g,0,.02,.1,.08);
    box(w,h,3.7,large?'#f2c552':'#ffe5a0',g,0,h/2,-.1,.06);
    box(w,.34,3.8,'#d6bd91',g,0,.28,-.08,.025);
    // Deep blue recess, visible timber shelves and small packages behind the awning.
    box(w-.65,2.28,.09,'#344c55',g,0,1.46,1.79,.02);
    for(const side of [-1,1])box(.18,2.5,.26,'#f9e9c4',g,side*(w/2-.27),1.5,1.91,.035);
    for(let row=0;row<3;row++){
      box(w-1,.10,.32,'#c08b4d',g,0,.7+row*.65,1.95,.016);
      for(let i=0;i<8;i++){
        const px=-w/2+.7+i*(w-1.4)/7;
        box(.28,.26+(i%3)*.045,.18,['#f4c04d','#eadbba','#ad6841','#dfebd2'][i%4],g,px,.91+row*.65,1.91,.035);
      }
    }
    box(.97,2.27,.18,palette.blue,g,-w/2+.88,1.42,2.08,.04);
    box(.68,1.5,.05,'#73aebc',g,-w/2+.88,1.68,2.19,.035);
    cylinder(.045,.28,'#e6b65b',g,-w/2+1.16,1.27,2.24,10);
    for(let i=0;i<10;i++){
      const width=(w+.34)/10,stripe=box(width,.14,1.5,i%2?palette.yellow:palette.blue,g,-(w+.34)/2+(i+.5)*width,2.93,2.42,.025);
      stripe.rotation.x=.24;
      box(width,.25,.12,i%2?palette.yellow:palette.blue,g,-(w+.34)/2+(i+.5)*width,2.62,3.16,.045);
    }
    g.userData.fascia=sign('3 IRMÃOS',w-1,.56,g,0,3.6,1.83);
    box(w+.16,.12,3.85,'#fff0cf',g,0,3.98,-.1,.025);
    if(large){
      [-2,0,2].forEach(px=>village.archWindow(g,px,4.37,1.79,.95,1.55));
      box(w-.65,.17,.58,'#e7c99a',g,0,4.2,2.04,.035);
      box(w-.7,.055,.075,palette.blue,g,0,4.94,2.29,.015);
      for(let i=0;i<17;i++)box(.038,.72,.04,palette.blue,g,-(w-.85)/2+i*(w-.85)/16,4.56,2.29,.009);
    }
    village.roof(g,w,3.75,h);
    village.lantern(g,-w/2+.2,2.55,2.04);village.lantern(g,w/2-.2,2.55,2.04);
    planter(g,-w/2-.3,2);planter(g,w/2+.3,2);
    if(large){g.userData.celebration=group(g);balloons(g.userData.celebration,w/2+.25,3.4,2.1);sign('RIO BRANCO DO SUL',3.2,.38,g,0,.44,2.07,'#fffaf0','#1747c8');}
    return g;
  }
  const firstStore = store(32), familyStore = store(48);
  const itaperucuStore = store(64, true), rioStore = store(80, true);
  sign('DOCE MURIEL',4.7,.64,firstStore,0,3.6,1.95);
  const warehouse=group(scene,17.7,0,-3.6);
  box(3.7,2.9,2.9,'#fff3d7',warehouse,0,1.45,0,.06);
  village.roof(warehouse,3.7,3,2.95);
  box(1.8,2.15,.1,'#6490c4',warehouse,0,1.1,1.5,.025);
  sign('DEPÓSITO',2.8,.46,warehouse,0,2.58,1.55);
  sign('ITAPERUÇU', 3.2, .38, itaperucuStore, 0, .44, 2.2, '#fffaf0', '#1747c8');
  const shutters = new Map();
  [['balcao',firstStore],['itaperucu',itaperucuStore],['rio-branco',rioStore]].forEach(([id,building])=>{
    const shutter=box(id==='balcao'?4.8:7.1,2.35,.15,'#7191b5',building,0,1.4,2.96,.04);
    shutters.set(id,shutter);
  });
  const stocked = group(familyStore,0,0,0);
  for(let i=0;i<6;i++) parcel(stocked,-2+i*.8,.55,3.05,.9,i%2?'#ffcd36':'#e1b988');
  stocked.visible=false;
  const delivery = group(scene,14.6,0,-.5);
  box(2.8,1.05,1.3,'#ffd23f',delivery,0,.53,0,.09);
  sign('ENTREGAS',2.3,.42,delivery,0,.71,.7);
  const delivered = group(delivery,0,1.5,0); parcel(delivered,-.55,0,0); parcel(delivered,.3,0,0); delivered.visible=false;

  // Orders belong to the existing shop, before the second unit opens.
  function orderCounter(x,w,title){
    const counter=group(scene,x,0,.15);
    box(w,.94,.9,'#d6a46a',counter,0,.47,0,.06);
    box(w+.12,.12,1.04,'#ffdf69',counter,0,1,0,.035);
    sign(title,w-.15,.3,counter,0,.63,.48);
    parcel(counter,w*.28,1.25,-.2,.58);
    return counter;
  }
  const orders=orderCounter(50.6,2.3,'PEDIDOS');
  const dispatch=orderCounter(60.6,1.5,'ENTREGAS');
  orders.userData.interaction='pedido';dispatch.userData.collectible='order';

  const future = group(scene, 95.6, 0, -2.4), futureLeaves = [];
  box(11, .25, 3.7, '#fff4dc', future, 0, .025, .4, .09);
  [-3, 3].forEach((x, i) => {
    const color = i ? palette.yellow : palette.blue;
    box(2.45, 4.05, .45, '#fffdf5', future, x, 2.02, 0, .1);
    box(1.88, 3.51, .09, i ? '#f5d682' : '#aacced', future, x, 1.82, .26, .025);
    const hinge = group(future, x - .94, .07, .34);
    box(1.87, 3.49, .13, color, hinge, .94, 1.75, 0, .04);
    box(1.5, 2.86, .05, i ? '#f5c634' : '#1e52d4', hinge, .94, 1.79, .09, .04);
    const handle = cylinder(.037, .62, i ? '#e8eef2' : '#ffe084', hinge, 1.55, 1.75, .16, 12);
    futureLeaves.push(hinge);
    sign(i ? 'APRENDER' : 'CERRO AZUL', 2.06, .32, future, x, 4.31, .12, '#fffaf0', '#1747c8');
  });
  planter(future,-5.5,.4); planter(future,5.5,.4); sign('2027 · O PRÓXIMO CAPÍTULO',9,.6,future,0,5.35,.12);

  // A distant, illustrative town gives the route depth without adding gameplay obstacles.
  for(const [i,x] of [-3,24,43,68,89,110].entries()){
    const house=group(scene,x,.02,-12-(i%2)*3);
    const h=3.5+(i%3)*.5;
    box(3.3,h,2.4,['#e9cc82','#ead9b5','#dbac6a'][i%3],house,0,h/2,0,.055);
    village.roof(house,3.3,2.4,h);
    [-.8,.8].forEach(px=>village.archWindow(house,px,h-1.6,1.21,.7,1.28));
    box(.7,1.65,.09,'#416994',house,0,.83,1.25,.04);
    house.traverse(object=>{if(object.isMesh)object.castShadow=false;});
  }

  village.bench(scene,8.3,-1.1);village.bench(scene,37,-1.2);village.bench(scene,69,-1.2);

  const markers = [...missions.map(m=>m.x),100].map((x, i) => {
    const g = group(scene, x - 1.4, .06, 2.4);
    const material = new THREE.MeshStandardMaterial({ color: '#1747c8', roughness: .7, transparent: true, opacity: .3 });
    const ring = mesh(new THREE.TorusGeometry(.63, .065, 10, 40), material, g, 0, 0, 0); ring.rotation.x = -Math.PI / 2;
    return { group: g, material, ring };
  });

  const interactionMarkers = [];
  for (const action of gameLevel?.actions || []) {
    const root=group(scene,...action.marker);
    root.userData.interaction=action.id;
    const marker=ball(.2,.2,.07,'#ffd23f',root);
    [-.075,0,.075].forEach(x=>ball(.019,.019,.012,'#19315d',root,x,0,.07));
    interactionMarkers.push({id:action.id,root,marker});
  }
  // Anonymous customers mark the conversations, without impersonating family members.
  for (const [x,z,color] of [[18.3,-1.2,'#e9b738'],[51.55,-.6,'#6293d2']]) {
    const person=group(scene,x,0,z);
    person.scale.setScalar(.86);
    const body=characterShapes.body(person,{skin:'#cf9879',shirt:color,trousers:'#41577b',fullness:.9,uniform:false});
    ball(.42,.48,.36,'#cf9879',person,0,2.13,0);
    ball(.43,.23,.35,'#59402e',person,0,2.43,-.05);
    [-1,1].forEach(side=>{
      characterShapes.oval(.083,.071,.04,'#f7efe5',person,side*.15,2.17,.34).castShadow=false;
      characterShapes.oval(.036,.047,.018,'#3d352d',person,side*.15,2.16,.375).castShadow=false;
      characterShapes.oval(.007,.012,.006,'#ffffff',person,side*.15-.009,2.174,.391).castShadow=false;
      characterShapes.brow(person,side*.15,2.31,.338,.15,'#59402e');
      ball(.065,.105,.073,'#cf9879',person,side*.42,2.12,0);
    });
    ball(.065,.096,.075,'#cf9879',person,0,2.04,.36);
    const smile=mesh(new THREE.TorusGeometry(.095,.013,6,16,Math.PI),'#885d45',person,0,1.94,.342);smile.rotation.z=Math.PI;
    neighbors.push({group:person,arm:body.arms[1],elbow:body.elbows[1],x});
  }
  const gabriel=createGabriel({scene,ball,group,mesh,sign,characterShapes});
  const family=createFamily({scene,ball,group,mesh,sign,characterShapes});

  // Repeated flowers share geometry and one draw call for each material.
  const sprigGeometry=new THREE.ConeGeometry(.035,.46,5),flowerGeometry=new THREE.SphereGeometry(.085,7,5);
  const stems=new THREE.InstancedMesh(sprigGeometry,mat('#659844'),96);
  const blooms=new THREE.InstancedMesh(flowerGeometry,new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.8}),480);
  const instance=new THREE.Object3D(),flowerColor=new THREE.Color();
  for(let i=0;i<96;i++){
    const x=-6+i*1.18,z=i%2?-.9-(i%5)*.14:5.25+(i%4)*.18;
    instance.position.set(x,-.009,z);instance.rotation.set(0,i*.83,(i%3-1)*.15);instance.scale.setScalar(.8+(i%4)*.12);instance.updateMatrix();stems.setMatrixAt(i,instance.matrix);
    for(let petal=0;petal<5;petal++){
      const angle=petal*Math.PI*2/5;instance.position.set(x+Math.cos(angle)*.065,.222,z+Math.sin(angle)*.065);instance.rotation.set(0,-angle,0);instance.scale.set(.9,.27,.52);instance.updateMatrix();blooms.setMatrixAt(i*5+petal,instance.matrix);
      flowerColor.set(['#ffc928','#e26945','#fffdf1','#a35794'][i%4]);blooms.setColorAt(i*5+petal,flowerColor);
    }
  }
  stems.instanceMatrix.needsUpdate=true;blooms.instanceMatrix.needsUpdate=true;blooms.instanceColor.needsUpdate=true;
  stems.receiveShadow=true;blooms.receiveShadow=true;scene.add(stems,blooms);

  const particleMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.085,.085,.045),new THREE.MeshBasicMaterial({color:'#ffffff'}),64);
  particleMesh.count=0;particleMesh.frustumCulled=false;scene.add(particleMesh);
  let particles=[];
  function onEvent(event,state,motion=true){
    if(!motion)return;
    const celebration=event.type==='checkpoint'||event.type==='complete'||event.type==='bonus',collect=event.type==='collect';
    if(!celebration&&!collect&&!['jump','land'].includes(event.type))return;
    const sweet=collect?gameLevel?.candies.find(c=>c.id===event.id):event.type==='bonus'?gameLevel?.bonuses?.find(c=>c.id===event.id):null;
    const x=(sweet?.x??state.x)-1.4,y=sweet?.y??(state.y+(celebration?2:.12));
    const count=celebration?24:collect?10:5;
    for(let i=0;i<count;i++){
      const angle=i*2.399+state.x;
      particles.push({x,y,z:2.4,vx:Math.cos(angle)*(celebration?2.8:1.3),vy:celebration?3+i%4*.6:collect?1.4+i%3*.3:.4+i%3*.15,vz:Math.sin(angle)*.8,age:0,life:celebration?1.6:collect?.7:.38,spin:angle,color:celebration||collect?['#ffd23f','#1747c8','#fffdf6'][i%3]:'#dfc9a2'});
    }
    particles=particles.slice(-64);
  }
  function animateEffects(dt,motion){
    if(!motion){particles=[];particleMesh.count=0;return;}
    particles=particles.filter(p=>p.age<p.life);
    particles.forEach((p,i)=>{
      p.age+=dt;p.vy-=dt*4;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
      instance.position.set(p.x,p.y,p.z);instance.rotation.set(p.age*4,p.spin+p.age*3,p.age*2);instance.scale.setScalar(Math.max(0,1-p.age/p.life)*(p.life>1?1.5:1));instance.updateMatrix();
      particleMesh.setMatrixAt(i,instance.matrix);flowerColor.set(p.color);particleMesh.setColorAt(i,flowerColor);
    });
    particleMesh.count=particles.length;particleMesh.instanceMatrix.needsUpdate=true;if(particleMesh.instanceColor)particleMesh.instanceColor.needsUpdate=true;
  }
  // World-positioned reading pass: scenery can never cover the page, even during camera travel.
  const memoryScene=new THREE.Scene();
  const memoryBoard=group(memoryScene), boardFace=mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#fffdf6'}),memoryBoard,0,0,.1);
  const boardFrame=box(1,1,.16,new THREE.MeshBasicMaterial({color:'#1747c8',toneMapped:false}),memoryBoard,0,0,0,.045);
  const boardLegs=[-.38,.38].map(x=>box(.065,1,.07,new THREE.MeshBasicMaterial({color:'#b0875c'}),memoryBoard,x,-1,0,.02));
  memoryBoard.traverse(o=>{o.castShadow=false;o.receiveShadow=false;});
  memoryBoard.visible=false;
  let memoryState=null, boardKey='', boardWidth=7.4, boardHeight=4.4;
  const portraits=new Map();
  if(typeof Image!=='undefined')Object.entries(memoryNarrators).forEach(([id,person])=>{
    if(!person.photo)return;
    const photo=new Image();
    photo.onload=()=>{portraits.set(id,photo);boardKey='';};
    photo.src=person.photo;
  });
  function setMemory(memory,width,height) {
    memoryState=memory;
    memoryBoard.visible=!!memory;
    if (!memory) {boardKey='';return;}
    const action=actionById(memory.id), portrait=width/Math.max(height,1)<1;
    const pixelScale=width>1100?2:1.5;
    const key=memory.id+'/'+memory.page+'/'+portrait+'/'+pixelScale;
    boardWidth=portrait?4.4:8.4;boardHeight=portrait?4.3:3.94;
    memoryBoard.userData.dimensions={width:boardWidth,height:boardHeight};
    memoryBoard.position.set(action.x+1.1,3.9,.4);
    boardFace.scale.set(boardWidth,boardHeight,1);boardFrame.scale.set(boardWidth+.16,boardHeight+.16,1);
    boardLegs.forEach((leg,i)=>{leg.position.set((i?1:-1)*boardWidth*.39,-3.05,0);leg.scale.y=3;});
    if (boardKey===key) return;
    boardKey=key;
    if(typeof document==='undefined') return;
    const canvas=document.createElement('canvas');canvas.width=1024*pixelScale;canvas.height=(portrait?1000:480)*pixelScale;
    const ctx=canvas.getContext('2d');ctx.scale(pixelScale,pixelScale);
    const canvasHeight=portrait?1000:480;
    ctx.fillStyle='#fffdf6';ctx.fillRect(0,0,1024,canvasHeight);
    ctx.fillStyle='#ffd23f';ctx.fillRect(0,0,1024,14);
    ctx.textAlign='left';ctx.textBaseline='top';
    const page=memoryPage(action,memory.page),narrator=page.person,photo=portraits.get(page.narrator);
    const photoSize=portrait?144:84,photoX=66,photoY=portrait?48:28;
    ctx.save();ctx.beginPath();ctx.arc(photoX+photoSize/2,photoY+photoSize/2,photoSize/2,0,Math.PI*2);ctx.clip();
    ctx.fillStyle='#dceeff';ctx.fillRect(photoX,photoY,photoSize,photoSize);
    if(photo){const [x,y,w,h]=narrator.crop;ctx.drawImage(photo,x*photo.width,y*photo.height,w*photo.width,h*photo.height,photoX,photoY,photoSize,photoSize);}
    else{ctx.fillStyle='#1747c8';ctx.font='700 '+photoSize*.55+'px Arial, sans-serif';ctx.textAlign='center';ctx.fillText(narrator.initials,photoX+photoSize/2,photoY+photoSize*.2);}
    ctx.restore();ctx.textAlign='left';
    const nameX=photoX+photoSize+(portrait?25:20);
    ctx.fillStyle='#19315d';ctx.font='700 '+(portrait?48:32)+'px Arial, sans-serif';ctx.fillText(narrator.name,nameX,photoY+(portrait?12:2));
    ctx.fillStyle='#536c86';ctx.font='400 '+(portrait?31:23)+'px Arial, sans-serif';ctx.fillText(narrator.role,nameX,photoY+(portrait?72:43),954-nameX);
    ctx.fillStyle='#dce4e9';ctx.fillRect(66,portrait?220:132,888,2);
    const lines=(text,fontSize,y,color,bold=false)=>{
      ctx.font=(bold?'700 ':'400 ')+fontSize+'px Arial, sans-serif';ctx.fillStyle=color;
      const words=text.split(' ');let line='';
      for(const word of words){const trial=line?line+' '+word:word;if(ctx.measureText(trial).width>888&&line){ctx.fillText(line,66,y);y+=fontSize*1.25;line=word;}else line=trial;}
      if(line){ctx.fillText(line,66,y);y+=fontSize*1.25;}return y;
    };
    let titleSize=portrait?64:45;
    if(!portrait){ctx.font='700 '+titleSize+'px Arial, sans-serif';while(ctx.measureText(action.title).width>888&&titleSize>40){titleSize--;ctx.font='700 '+titleSize+'px Arial, sans-serif';}}
    let y=lines(action.title,titleSize,portrait?253:156,'#19315d',true);
    const bodyY=y+(portrait?32:16),bodyBottom=canvasHeight-(portrait?114:74);
    let bodySize=portrait?58:43;
    // Fit the full paragraph before painting; footer and text never overlap.
    const countLines=size=>{
      ctx.font='400 '+size+'px Arial, sans-serif';let count=1,line='';
      for(const word of action.pages[memory.page].split(' ')){const trial=line?line+' '+word:word;if(ctx.measureText(trial).width>888&&line){count++;line=word;}else line=trial;}return count;
    };
    while(bodyY+countLines(bodySize)*bodySize*1.25>bodyBottom&&bodySize>(portrait?43:34))bodySize--;
    lines(action.pages[memory.page],bodySize,bodyY,'#405773');
    ctx.fillStyle='#1747c8';ctx.font='700 '+(portrait?46:38)+'px Arial, sans-serif';
    ctx.fillText(String(memory.page+1).padStart(2,'0')+' / '+String(action.pages.length).padStart(2,'0'),66,canvasHeight-(portrait?76:48));
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    boardFace.material.map?.dispose();boardFace.material.dispose();
    boardFace.material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
  }

  const sweets = [];
  if (gameLevel) {
    gameLevel.blocks.forEach((block, i) => {
      const x = block.x - 1.4;
      box(block.width, block.height, 1.55, i % 2 ? '#1747c8' : '#e6b55e', scene, x, block.height / 2, 2.4, .06);
      box(block.width + .06, .12, 1.62, '#ffda59', scene, x, block.height, 2.4, .025);
      box(.14, block.height + .02, 1.57, '#fff1c4', scene, x, block.height / 2, 2.4, .02);
      box(block.width + .025, .13, 1.57, '#fff1c4', scene, x, block.height * .48, 2.4, .02);
    });
    gameLevel.candies.forEach(candy => {
      const g = group(scene, candy.x - 1.4, candy.y, candy.kind==='order'?.25:2.4);
      if(candy.kind==='key') {
        mesh(new THREE.TorusGeometry(.21,.065,8,24),'#ffcc39',g,-.15,.1,0);
        box(.48,.1,.12,'#ffcc39',g,.16,-.06,0,.025); box(.1,.22,.12,'#ffcc39',g,.3,-.12,0,.02);
      } else if(candy.kind==='order') {
        box(.63,.46,.12,'#fffdf5',g,0,0,0,.025);
        const line=box(.44,.03,.015,'#1747c8',g,0,.02,.072,.006); line.rotation.z=-.35;
        box(.12,.1,.015,'#ffd23f',g,.17,.1,.075,.01);
      } else if(candy.kind==='building') {
        box(.56,.48,.35,candy.id%2?'#1747c8':'#ffd23f',g,0,0,0,.045);
        box(.58,.08,.37,'#fff9e5',g,0,.15,0,.02);
      } else if(candy.kind==='product') {
        parcel(g,0,0,0,.95,candy.id%2?'#f9c535':'#deac75');
      } else {
        ball(.28,.29,.23,'#ffcf33',g);
        const wrapper=new THREE.ConeGeometry(.21,.28,4);
        const left=mesh(wrapper,'#f5a82e',g,-.36,0,0);left.rotation.z=Math.PI/2;
        const right=mesh(wrapper,'#f5a82e',g,.36,0,0);right.rotation.z=-Math.PI/2;
        box(.09,.45,.36,'#fff4b5',g,0,0,0,.025);
      }
      sweets.push({ id: candy.id, y: candy.y, group: g, kind:candy.kind });
    });
  }
  const scenery=gameLevel?createScenarioScenery({scene,level:gameLevel,box,ball,cylinder,group,mesh,mat,sign,parcel}):null;
  function syncGame(state, time, decorativeMotion) {
    scenery?.sync(state,time,decorativeMotion);
    sweets.forEach(sweet => {
      sweet.group.visible = !state.collected.has(sweet.id);
      sweet.group.position.y = sweet.y + (decorativeMotion ? Math.sin(time * 2 + sweet.id) * .045 : 0);
      sweet.group.rotation.y = decorativeMotion&&sweet.kind!=='order' ? time * .9 : 0;
    });
    shutters.forEach((shutter,id)=>{shutter.position.y += ((state.done.has(id)?3.6:1.4)-shutter.position.y)*(decorativeMotion?.08:1);shutter.scale.y=state.done.has(id)?.12:1;});
    stocked.visible=state.done.has('prateleiras'); delivered.visible=state.done.has('entrega');
    rioStore.userData.fascia.material.emissive.set(state.done.has('rio-branco')?'#76a8ff':'#000000');
    rioStore.userData.fascia.material.emissiveIntensity=.45;
    rioStore.userData.celebration.visible=state.done.has('rio-branco');
    itaperucuStore.userData.celebration.visible=state.done.has('itaperucu');
    futureLeaves.forEach((leaf,i)=>{leaf.rotation.y+=((state.done.has(i?'cozinha':'cerro')?-1.38:0)-leaf.rotation.y)*(decorativeMotion?.08:1);});
    interactionMarkers.forEach(marker=>{const action=actionById(marker.id),done=state.done.has(marker.id);marker.marker.material=mat(done?'#71b65c':'#ffd23f');marker.root.visible=!state.memory&&Math.abs(state.x-action.x)<6&&(state.completed||action.stage===state.chapter);});

  }

  // Articulated Dedei: receding short hair, adult face, stubble, black shirt and jeans.
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(1.65,1.3),new THREE.ShaderMaterial({
    uniforms:{opacity:{value:.2}},transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec2 vUv; uniform float opacity; void main(){float a=(1.0-smoothstep(0.08,0.5,length(vUv-0.5)))*opacity; gl_FragColor=vec4(0.14,0.22,0.16,a);}'
  }));
  contact.rotation.x=-Math.PI/2;contact.position.y=.025;scene.add(contact);
  const guide=group(scene,-1.4,0,2.4);
  guide.name='Dedei';guide.userData.character={name:'Andrei · Dedei',reference:'client-photo',uniform:'3 Irmãos',style:'rounded-animation'};
  const dedeiBody=characterShapes.body(guide,{skin:palette.skin,fullness:1.04});
  const {torso,legs:[leftLeg,rightLeg],arms:[leftArm,rightArm],knees,elbows}=dedeiBody;
  const head=group(torso,0,2.12,0);
  characterShapes.face(head,{skin:palette.skin,width:.47,height:.55,depth:.43,stubble:true});
  // Hair is swept back with open temples and a high forehead.
  ball(.465,.4,.36,'#44372f',head,0,.19,-.13);
  ball(.38,.15,.32,'#44372f',head,-.015,.48,-.06);
  const eyes=[];
  [-1,1].forEach(side=>{
    ball(.09,.145,.1,palette.skin,head,side*.46,-.03,0);
    ball(.049,.087,.052,'#b87f68',head,side*.493,-.04,.069);
    eyes.push(ball(.11,.075,.045,'#f5eee7',head,side*.18,.025,.428));
    eyes.push(ball(.049,.058,.024,'#4c392e',head,side*.18,.017,.463));
    eyes.push(ball(.024,.04,.014,'#1e2227',head,side*.18,.017,.483));
    eyes.push(ball(.014,.014,.009,'#ffffff',head,side*.18-.014,.04,.49));
    characterShapes.brow(head,side*.18,.15,.417,.2,'#483930',side*-.07);
    ball(.048,.042,.048,'#c18c72',head,side*.058,-.12,.447);
  });
  eyes.forEach(eye=>{eye.userData.openHeight=eye.scale.y;eye.castShadow=false;});
  ball(.075,.13,.115,'#d19a7e',head,0,-.055,.436);
  const smile=mesh(new THREE.TorusGeometry(.13,.015,8,22,Math.PI),'#805c53',head,0,-.205,.405);smile.rotation.z=Math.PI;
  guide.rotation.y=.12;

  let cameraX = 0, cameraY = 0, walkTime = 0, facing = .12;
  const cameraAim=new THREE.Vector3(), cameraTarget=new THREE.Vector3(), aimTarget=new THREE.Vector3();
  function update(position, velocity, dt, time, width, height, move = true, snap = false, elevation = 0, airborne = false) {
    gabriel.update(time,move,position,!!memoryState);
    family.update(time,move,position,!!memoryState);
    livingTrees.forEach(tree=>{tree.crown.rotation.z=move?Math.sin(time*.8+tree.phase)*.023:0;});
    clouds.forEach(cloud=>{cloud.group.position.x=cloud.x+(move?Math.sin(time*.06+cloud.phase)*2.5:0);});
    floatingBalloons.forEach(balloon=>{balloon.group.rotation.z=move?Math.sin(time*1.1+balloon.phase)*.06:0;balloon.group.position.y=balloon.y+(move?Math.sin(time*1.3+balloon.phase)*.055:0);});
    neighbors.forEach(person=>{const close=move&&Math.abs(position-1.4-person.x)<4;person.group.position.y=move?Math.sin(time*1.9+person.x)*.008:0;person.arm.rotation.z=close?-.7:-.075;person.elbow.rotation.z=close?-.4+Math.sin(time*4)*.18:0;});
    animateEffects(dt,move);
    const walking = Math.abs(velocity) > .01;
    if (walking && move) walkTime += dt * 10.5;
    if (walking) facing = velocity > 0 ? Math.PI / 2 : -Math.PI / 2;
    else facing=.12;
    const blend = snap || !move ? 1 : 1 - Math.exp(-dt * 12);
    let angle = facing - guide.rotation.y;
    angle = Math.atan2(Math.sin(angle), Math.cos(angle)); guide.rotation.y += angle * blend;
    guide.position.x = position - 1.4;
    guide.position.y = elevation;
    guide.visible=!memoryState;
    const aboveGap=gameLevel?.gaps.some(([l,r])=>position>l&&position<r);
    let playerSurface=aboveGap?-Infinity:0;
    for(const block of gameLevel?.blocks||[])if(Math.abs(position-block.x)<block.width/2&&block.height<=elevation+.06)playerSurface=Math.max(playerSurface,block.height);
    for(const item of scenery?.platforms||[]) {
      const surface=item.root.userData.collider;
      if(surface?.active&&Math.abs(position-surface.x)<surface.width/2&&surface.y<=elevation+.06)playerSurface=Math.max(playerSurface,surface.y);
    }
    contact.position.x=position-1.4;contact.position.z=2.4;contact.position.y=Number.isFinite(playerSurface)?playerSurface+.026:0;
    contact.visible=!memoryState&&Number.isFinite(playerSurface);
    const shadowHeight=Number.isFinite(playerSurface)?Math.max(0,elevation-playerSurface):0;
    contact.scale.setScalar(1+shadowHeight*.16);contact.material.uniforms.opacity.value=.27/(1+shadowHeight*.6);
    const stride = walking && move ? Math.sin(walkTime) * .5 : 0;
    leftLeg.rotation.x = airborne ? -.45 : stride; rightLeg.rotation.x = airborne ? .2 : -stride;
    knees.forEach((knee,i)=>{knee.rotation.x=airborne?.65:walking&&move?Math.max(0,Math.sin(walkTime+(i?Math.PI:0)))*.48:0;});
    leftArm.rotation.x = airborne ? -.85 : -stride * .7; rightArm.rotation.x = airborne ? -.85 : stride * .7;
    elbows.forEach((elbow,i)=>{elbow.rotation.x=airborne?-.5:-.15-Math.max(0,(i?1:-1)*stride)*.23;});
    torso.rotation.y=move&&walking&&!airborne?Math.sin(walkTime)*.035:0;
    torso.position.y=move?(walking&&!airborne?Math.abs(Math.sin(walkTime))*.035:!airborne?Math.sin(time*2)*.009:0):0;
    const blinkPhase=time%5.1,blink=move&&blinkPhase<.16?Math.max(.08,Math.abs(blinkPhase-.08)/.08):1;
    eyes.forEach(eye=>{eye.scale.y=eye.userData.openHeight*blink;});
    head.rotation.z = move && walking ? Math.sin(walkTime) * .025 : 0;
    cameraX += (position - cameraX) * (snap || !move ? 1 : 1 - Math.exp(-dt * 5));
    const mobile = width <= 800;
    const aspect = width / Math.max(height, 1);
    const portrait = gameLevel && aspect < 1;
    const lead = gameLevel ? (portrait ? -.5 : aspect < 1.5 ? .4 : 1.8) : (mobile ? .6 : 3.5);
    // A narrow, tall display needs a wider view and less horizontal camera lead.
    // This keeps both the player and the next jump on screen after rotation.
    const distance = portrait ? Math.max(19, 10 / aspect) : mobile ? 17.5 : 16.8;
    // Follow the upper routes enough to keep both Dedei and his landing in view.
    const verticalTarget=gameLevel?Math.max(0,Math.min(3.5,elevation*.67)):0;
    cameraY+=(verticalTarget-cameraY)*(snap?1:1-Math.exp(-dt*4));
    cameraTarget.set(cameraX+lead+(gameLevel?portrait?1.3:2.8:4),(gameLevel?6.4:mobile?7:7.4)+cameraY,distance);
    aimTarget.set(cameraX+lead,(gameLevel?2.1:1.6)+cameraY,-.2);
    if(memoryState){
      const topSpace=aspect<1?76:62,bottomSpace=aspect<1?124:96;
      const fillY=Math.max(.42,Math.min(.72,(height-topSpace-bottomSpace)/height));
      const visibleHeight=Math.max(boardHeight/fillY,boardWidth/(aspect*.86));
      const distance=visibleHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
      cameraTarget.set(memoryBoard.position.x,memoryBoard.position.y,memoryBoard.position.z+distance);
      aimTarget.copy(memoryBoard.position);
      const offset=(bottomSpace-topSpace)/height*visibleHeight/2;
      cameraTarget.y-=offset;aimTarget.y-=offset;
    }
    const cameraBlend=snap||!move?1:1-Math.exp(-dt*7);
    camera.position.lerp(cameraTarget,cameraBlend);cameraAim.lerp(aimTarget,cameraBlend);camera.lookAt(cameraAim);
    sun.position.set(cameraX - 8, 17, 11); sun.target.position.set(cameraX + 1, 0, -1);
    markers.forEach((marker, i) => {
      const close = Math.abs(position - i * 16) < 2.8;
      marker.material.opacity = close ? .75 : .22;
      marker.material.color.set(close ? '#ffd23f' : '#1747c8');
      marker.ring.scale.setScalar(close && move ? 1 + Math.sin(time * 2.4) * .07 : 1);
    });
  }
  function resize(width, height) {
    camera.aspect = width / Math.max(height, 1);
    camera.fov = gameLevel && camera.aspect < 1 ? 40 : 36;
    camera.updateProjectionMatrix();
  }
  function render(renderer) {
    const autoClear=renderer.autoClear;
    renderer.autoClear=true;
    if(rendering){
      try{rendering.render(camera);}catch{rendering.dispose();rendering=null;renderer.setRenderTarget(null);renderer.render(scene,camera);}
    }else renderer.render(scene,camera);
    if(memoryBoard.visible){renderer.autoClear=false;renderer.clearDepth();renderer.render(memoryScene,camera);}
    renderer.autoClear=autoClear;
  }
  function configureRenderer(renderer,width,mobile=false){
    sun.shadow.mapSize.set(!mobile&&width>900?1536:1024,!mobile&&width>900?1536:1024);
    try{rendering=createGameRendering(renderer,scene,{mobile});}catch{renderer.setRenderTarget(null);rendering=null;}
  }
  function dispose() {
    rendering?.dispose();surfaces.dispose();village.dispose();
    const seenG = new Set(), seenM = new Set(), seenT = new Set();
    [scene,memoryScene].forEach(root=>root.traverse(object => {
      if (!object.isMesh) return;
      if (!seenG.has(object.geometry)) { object.geometry.dispose(); seenG.add(object.geometry); }
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach(material => {
        if (material.map && !seenT.has(material.map)) { material.map.dispose(); seenT.add(material.map); }
        if (!seenM.has(material)) { material.dispose(); seenM.add(material); }
      });
    }));
  }
  return { scene, camera, guide, update, resize, dispose, sun, syncGame, setMemory, memoryBoard, memoryScene, render, configureRenderer, onEvent, scenery, gabriel:gabriel.root, family:family.characters };
}
