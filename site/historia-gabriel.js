import * as THREE from './vendor/three.module.min.js';

// Stylized from the client-supplied Gabriel photo; the shop uniform replaces the football jersey.
export function createGabriel({scene,ball,group,mesh,sign,characterShapes}) {
  const skin='#d8a27f',hair='#49352a',shirt='#192432';
  const root=group(scene,45.15,0,.03);root.name='Gabriel';
  root.userData.character={name:'Gabriel',reference:'client-photo',uniform:'3 Irmãos',style:'rounded-animation'};
  const {torso:body,arms,elbows}=characterShapes.body(root,{skin,shirt,trousers:'#4b7093',fullness:.93});
  const head=group(body,0,2.12,0);head.name='Gabriel · cabelo e barba';
  characterShapes.face(head,{skin,width:.41,height:.5,depth:.365});
  const beard=mesh(new THREE.SphereGeometry(1,24,16,0,Math.PI*2,1.72,Math.PI-1.72),hair,head,0,-.025,.025);
  beard.scale.set(.423,.5,.381);
  // Exposed upper cheeks keep a distinct beard line around the jaw.
  [-1,1].forEach(side=>{
    ball(.16,.14,.12,skin,head,side*.215,-.08,.29);
    ball(.07,.112,.08,skin,head,side*.415,-.035,0);
    ball(.032,.07,.033,'#bf896e',head,side*.437,-.04,.05);
  });
  const cap=mesh(new THREE.SphereGeometry(1,24,16,0,Math.PI*2,0,1.47),hair,head,0,.08,-.028);
  cap.scale.set(.426,.49,.367);
  for(let i=0;i<7;i++){
    const tuft=ball(.16,.2,.19,i%3?'#49352a':'#5e4431',head,-.29+i*.086,.445+Math.sin(i*.62)*.1,.07+(i%2)*.025);
    tuft.rotation.z=-.26+i*.025;tuft.rotation.x=-.2;
  }
  const eyes=[];
  for(const side of [-1,1]){
    eyes.push(ball(.078,.052,.034,'#f5eee4',head,side*.15,.055,.347));
    eyes.push(ball(.033,.041,.018,'#63442f',head,side*.15,.049,.375));
    eyes.push(ball(.018,.028,.012,'#22272a',head,side*.15,.049,.388));
    eyes.push(ball(.009,.011,.006,'#ffffff',head,side*.15-.01,.064,.398));
    characterShapes.brow(head,side*.155,.169,.343,.168,hair,-side*.08);
    const moustache=ball(.092,.031,.034,hair,head,side*.066,-.195,.374);moustache.rotation.z=side*-.16;
  }
  eyes.forEach(eye=>{eye.userData.openHeight=eye.scale.y;eye.castShadow=false;});
  ball(.052,.096,.087,skin,head,0,-.065,.362);
  ball(.105,.051,.049,skin,head,0,-.255,.346);
  const smile=mesh(new THREE.TorusGeometry(.105,.012,8,20,Math.PI),'#805743',head,0,-.227,.385);smile.rotation.z=Math.PI;
  const name=group(root,0,3.06,.12);sign('Gabriel',1.12,.27,name,0,0,0,'#fffdf6','#1747c8');
  root.rotation.y=.14;
  function update(time,motion,playerX,reading){
    root.visible=!reading;
    const close=Math.abs(playerX-1.4-root.position.x)<5;
    body.position.y=motion?Math.sin(time*1.9)*.009:0;
    arms[1].rotation.z=motion&&close?-.92:-.075;
    elbows[1].rotation.z=motion&&close?-.7+Math.sin(time*4.5)*.18:0;
    elbows[1].rotation.x=motion&&close?-.23:-.1;
    arms[0].rotation.z=.08;
    head.rotation.y=close?.15:0;
    const phase=(time+1.6)%4.7,blink=motion&&phase<.16?Math.max(.1,Math.abs(phase-.08)/.08):1;
    eyes.forEach(eye=>eye.scale.y=eye.userData.openHeight*blink);
    name.visible=close;
  }
  return {root,update};
}
