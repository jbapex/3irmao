import * as THREE from './vendor/three.module.min.js';

// Shared, smoothly shaded silhouettes. These replace body boxes without subdivision
// at runtime, extra lighting or a heavier skin shader.
export function createCharacterShapes({mesh,group,mat}){
  const ovalGeometry=new THREE.SphereGeometry(1,14,10);
  function oval(rx,ry,rz,color,parent,x=0,y=0,z=0){
    const part=mesh(ovalGeometry,color,parent,x,y,z);part.scale.set(rx,ry,rz);return part;
  }
  const profiles={
    torso:[[0,-.5],[.65,-.485],[.85,-.43],[.95,-.28],[1,-.08],[.99,.12],[.93,.3],[.78,.42],[.48,.48],[0,.5]],
    limb:[[0,-.5],[.5,-.485],[.79,-.43],[.9,-.31],[.95,-.12],[1,.16],[.94,.32],[.76,.43],[.45,.485],[0,.5]],
    sleeve:[[0,-.5],[.58,-.48],[.86,-.38],[1,-.12],[.98,.15],[.85,.35],[.5,.47],[0,.5]]
  };
  const geometries=new Map();
  function soft(kind,w,h,d,color,parent,x=0,y=0,z=0){
    if(!geometries.has(kind)){
      const points=profiles[kind].map(([r,y])=>new THREE.Vector2(r,y));
      // Catmull-Rom sampling softens profile transitions, with fixed vertex count.
      const curve=new THREE.SplineCurve(points);
      const sampled=curve.getPoints(kind==='torso'?18:12).map(p=>new THREE.Vector2(Math.max(0,p.x),p.y));
      geometries.set(kind,new THREE.LatheGeometry(sampled,16));
    }
    const part=mesh(geometries.get(kind),color,parent,x,y,z);part.scale.set(w/2,h,d/2);return part;
  }
  function brow(parent,x,y,z,width,color,angle=0){
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-width/2,0,0),new THREE.Vector3(0,.047,.018),new THREE.Vector3(width/2,.003,0));
    const arc=mesh(new THREE.TubeGeometry(curve,8,.022,5,false),color,parent,x,y,z);arc.rotation.z=angle;arc.castShadow=false;return arc;
  }
  function face(parent,{skin,width,height,depth,stubble=false}){
    const geometry=new THREE.SphereGeometry(1,24,18),positions=geometry.getAttribute('position');
    const colors=new Float32Array(positions.count*3),base=new THREE.Color(skin),shade=new THREE.Color('#896e61'),tint=new THREE.Color();
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
      const jaw=THREE.MathUtils.smoothstep(-y,.2,1);
      positions.setX(i,x*(1-jaw*.12));
      // A single cheek/jaw surface avoids seams from stacked facial spheres.
      if(z>0)positions.setZ(i,z+.045*Math.exp(-((Math.abs(x)-.45)**2*16+(y+.18)**2*22)));
      tint.copy(base);
      if(stubble)tint.lerp(shade,THREE.MathUtils.smoothstep(-y,.3,.8)*Math.max(0,z)*.3);
      tint.toArray(colors,i*3);
    }
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.computeVertexNormals();
    const material=mat(skin).clone();material.color.set('#ffffff');material.vertexColors=true;
    const head=mesh(geometry,material,parent);head.scale.set(width,height,depth);return head;
  }
  let badgeMaterial;
  function badge(parent,x,y,z){
    if(!badgeMaterial){
      badgeMaterial=new THREE.MeshBasicMaterial({color:'#ffd23f',side:THREE.FrontSide});
      if(typeof document!=='undefined'){
        const canvas=document.createElement('canvas');canvas.width=384;canvas.height=112;
        const ctx=canvas.getContext('2d');ctx.fillStyle='#ffda43';ctx.font='800 66px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('3 IRMÃOS',192,57,370);
        const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
        badgeMaterial.dispose();badgeMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
      }
    }
    const logo=mesh(new THREE.PlaneGeometry(.34,.105),badgeMaterial,parent,x,y,z);logo.rotation.y=.28;logo.castShadow=false;return logo;
  }
  function body(root,{skin='#ce977b',shirt='#151d2a',trousers='#426386',fullness=1,uniform=true}={}){
    const torso=group(root);torso.name='Corpo arredondado';
    soft('torso',.93*fullness,1.02,.66,shirt,torso,0,1.24,0);
    soft('limb',.32,.27,.3,skin,torso,0,1.74,0);
    const collar=mesh(new THREE.TorusGeometry(.177,.03,6,20),mat('#111923'),torso,0,1.715,0);collar.rotation.x=Math.PI/2;
    if(uniform)badge(torso,.185,1.43,.305);
    const legs=[],knees=[],arms=[],elbows=[];
    for(const side of [-1,1]){
      const leg=group(torso,side*.205,.88,0);legs.push(leg);
      soft('limb',.335,.54,.365,trousers,leg,0,-.18,0);
      const knee=group(leg,0,-.35,0);knees.push(knee);
      soft('limb',.285,.4,.32,trousers,knee,0,-.145,.005);
      // A low rounded sole and an oval toe, rather than stacked cuboids.
      oval(.185,.042,.295,'#c9cfcb',knee,0,-.483,.07);
      oval(.181,.12,.288,'#26323b',knee,0,-.39,.072);
      const arm=group(torso,side*.475,1.56,0);arms.push(arm);
      soft('sleeve',.35,.39,.37,shirt,arm,0,-.13,0);
      const elbow=group(arm,0,-.285,0);elbows.push(elbow);
      soft('limb',.225,.34,.25,skin,elbow,0,-.125,0);
      oval(.125,.148,.104,skin,elbow,0,-.36,.015);
      const thumb=oval(.057,.087,.07,skin,elbow,-side*.098,-.333,.06);thumb.rotation.z=side*.3;
      arm.rotation.z=-side*.075;elbow.rotation.x=-.1;
    }
    return{torso,legs,knees,arms,elbows};
  }
  return{soft,brow,badge,body,oval,face};
}
