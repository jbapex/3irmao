import * as THREE from './vendor/three.module.min.js';

// Camila follows the supplied client portrait. The other relatives use illustrative
// appearances until their own references are available; none implies an exact age.
export function createFamily({scene,ball,group,mesh,sign,characterShapes}) {
  const characters={}, actors=[];
  const hairCapGeometry=new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,1.49);
  const hoopGeometry=new THREE.TorusGeometry(.041,.008,5,14);
  const collarGeometry=new THREE.TorusGeometry(.181,.032,6,20);
  const cuffGeometry=new THREE.TorusGeometry(.148,.022,5,16);
  const badgeGeometry=new THREE.PlaneGeometry(.31,.09);
  let yellowShirtBadge;

  function shopBadge(parent) {
    if(!yellowShirtBadge) {
      yellowShirtBadge=new THREE.MeshBasicMaterial({color:'#19563e'});
      if(typeof document!=='undefined') {
        const canvas=document.createElement('canvas');canvas.width=384;canvas.height=112;
        const ctx=canvas.getContext('2d');
        ctx.fillStyle='#19563e';ctx.font='800 65px Arial, sans-serif';
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('3 IRMÃOS',192,57,370);
        const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
        yellowShirtBadge.dispose();
        yellowShirtBadge=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
      }
    }
    const logo=mesh(badgeGeometry,yellowShirtBadge,parent,.17,1.44,.32);
    logo.rotation.y=.25;logo.castShadow=false;
  }

  function faceDetails(head,profile) {
    const {skin,hair,width=.38,eyes:eyeColor='#68472f'}=profile;
    const eyes=[];
    for(const side of [-1,1]) {
      ball(.059,.091,.065,skin,head,side*(width-.014),-.026,.006);
      const white=ball(.063,.046,.025,'#fff5e8',head,side*.137,.051,.318);
      const iris=ball(.029,.035,.014,eyeColor,head,side*.137,.047,.34);
      const pupil=ball(.015,.022,.009,'#24272b',head,side*.137,.047,.352);
      const light=ball(.008,.009,.005,'#ffffff',head,side*.137-.009,.059,.359);
      eyes.push(white,iris,pupil,light);
      characterShapes.brow(head,side*.14,.146,.32,.137,hair,-side*.075);
    }
    eyes.forEach(eye=>{eye.userData.openHeight=eye.scale.y;eye.castShadow=false;});
    ball(.049,.082,.065,skin,head,0,-.058,.336);
    // A small open smile and one restrained tooth shape keep the face readable
    // at game scale without making the expression oversized.
    ball(.095,.042,.022,'#824e40',head,0,-.196,.308);
    const teeth=ball(.073,.013,.012,'#fff8ec',head,0,-.178,.328);teeth.castShadow=false;
    const lip=ball(.064,.012,.012,profile.lip||'#b57566',head,0,-.229,.313);lip.castShadow=false;
    return eyes;
  }

  function hairstyle(head,profile) {
    const {hair,width=.38,longHair=false}=profile;
    const cap=mesh(hairCapGeometry,hair,head,0,.035,-.017);
    cap.scale.set(width+.013,.456,.344);
    if(longHair) {
      const length=profile.hairLength||.66;
      const back=ball(width+.022,length,.22,hair,head,0,-length*.52,-.185);
      back.rotation.x=-.025;
      // The long back and two narrow locks leave the oval face and uniform clear.
      for(const side of [-1,1]) {
        const lock=ball(.094,length*.88,.116,hair,head,side*(width-.022),-length*.47,.055);
        lock.rotation.z=side*-.075;
        const shine=ball(.019,length*.66,.015,profile.highlight,head,side*(width-.03),-length*.44,.167);
        shine.rotation.z=side*-.075;shine.castShadow=false;
        const earring=mesh(hoopGeometry,'#e6b65b',head,side*(width+.016),-.1,.096);
        earring.castShadow=false;
      }
      // An off-centre sweep suggests Camila's side part without a large fringe.
      const sweep=ball(.267,.102,.094,hair,head,-.087,.354,.17);
      sweep.rotation.z=.24;
      const part=ball(.077,.167,.062,profile.highlight,head,.19,.337,.115);
      part.rotation.z=.25;
    } else {
      // Shared low-profile cap, with a few soft locks for a distinct silhouette.
      const locks=profile.curls?5:3;
      for(let i=0;i<locks;i++) {
        const spread=profile.curls?.115:.17;
        const tuft=ball(profile.curls?.104:.145,profile.curls?.1:.072,.098,
          i===1?profile.highlight:hair,head,(i-(locks-1)/2)*spread,
          .395+Math.sin(i*.85)*.025,.121);
        tuft.rotation.z=profile.curls?i*.22:-.18;
      }
      for(const side of [-1,1])ball(.047,.115,.052,hair,head,side*(width-.004),.072,.015);
    }
  }

  function make(profile,index) {
    const root=group(scene,...profile.position);root.name=profile.name;
    root.userData.character={name:profile.name,reference:profile.id==='camila'?'client-photo':'illustrative',uniform:'3 Irmãos',style:'rounded-animation'};
    const {torso:body,arms,elbows}=characterShapes.body(root,{
      skin:profile.skin,shirt:profile.shirt,trousers:profile.trousers||'#45617d',
      fullness:profile.fullness||.94,uniform:profile.id!=='camila'
    });
    if(profile.id==='camila') {
      shopBadge(body);
      const collar=mesh(collarGeometry,'#19563e',body,0,1.719,0);collar.rotation.x=Math.PI/2;
      arms.forEach(arm=>{const cuff=mesh(cuffGeometry,'#19563e',arm,0,-.267,0);cuff.rotation.x=Math.PI/2;});
    }
    const head=group(body,0,2.1,0);head.name=profile.name+' · rosto';
    characterShapes.face(head,{skin:profile.skin,width:profile.width||.38,height:.455,depth:.329,stubble:!!profile.stubble});
    hairstyle(head,profile);
    const eyes=faceDetails(head,profile);
    const label=group(root,0,2.96,.16);label.name=profile.name+' · nome';
    sign(profile.name,profile.name.length>6?1.31:1.12,.27,label,0,0,0,'#fffdf6','#1747c8');
    label.visible=false;
    root.rotation.y=profile.turn??.12;
    characters[profile.id]=root;
    actors.push({root,body,head,arms,elbows,eyes,label,phase:index*.93});
  }

  [
    {id:'leandro',name:'Leandro',position:[32,0,1],skin:'#c58d6c',hair:'#49352d',highlight:'#5c4437',shirt:'#213551',fullness:1,stubble:true,turn:.2},
    {id:'fernanda',name:'Fernanda',position:[36,0,1],skin:'#d8a183',hair:'#402d29',highlight:'#654332',shirt:'#2456a1',longHair:true,hairLength:.5,fullness:.9,turn:-.12},
    {id:'camila',name:'Camila',position:[64.2,0,1],skin:'#dda882',hair:'#503328',highlight:'#79523a',eyes:'#714c33',shirt:'#f5c634',longHair:true,hairLength:.72,fullness:.9,lip:'#b46e68',turn:.12},
    {id:'murilo',name:'Murilo',position:[70,0,1],skin:'#ce9778',hair:'#342b28',highlight:'#514139',shirt:'#225a45',fullness:.93,turn:-.14},
    {id:'davi',name:'Davi',position:[100,0,1],skin:'#d4a080',hair:'#382a25',highlight:'#584032',shirt:'#2456a1',fullness:.93,curls:true,turn:.16}
  ].forEach(make);

  function update(time,motion,playerX,reading) {
    for(const actor of actors) {
      const {root,body,head,arms,elbows,eyes,label,phase}=actor;
      const distance=Math.abs(playerX-1.4-root.position.x);
      root.visible=!reading&&distance<=20;
      if(!root.visible) {label.visible=false;continue;}
      const close=distance<5.4;
      const wave=motion&&close;
      body.position.y=motion?Math.sin(time*1.75+phase)*.008:0;
      head.rotation.y=close?THREE.MathUtils.clamp((playerX-1.4-root.position.x)*.025,-.12,.12):0;
      head.rotation.z=motion&&close?Math.sin(time*.7+phase)*.018:0;
      arms[0].rotation.z=.075;
      elbows[0].rotation.x=-.1;
      arms[1].rotation.z=wave?-.83:-.075;
      elbows[1].rotation.z=wave?-.63+Math.sin(time*4.1+phase)*.16:0;
      elbows[1].rotation.x=wave?-.2:-.1;
      const blinkPhase=(time+phase)%5.1;
      const blink=motion&&blinkPhase<.15?Math.max(.12,Math.abs(blinkPhase-.075)/.075):1;
      eyes.forEach(eye=>{eye.scale.y=eye.userData.openHeight*blink;});
      label.visible=close;
    }
  }

  return {characters,update};
}
