import * as THREE from './vendor/three.module.min.js';

export function createSurfaceLibrary(){
  const textures=[],waiting=[];let disposed=false,grassTexture,plasterTexture;
  const grass=new THREE.MeshStandardMaterial({color:'#739d42',roughness:1,metalness:0});
  const plasterColors=new Set(['#f2c552','#ffe5a0','#fff3d7','#e9cc82','#ead9b5','#dbac6a','#fffdf5','#fffdf6','#fff4dc','#f5ddad','#ead6ad']);
  if(typeof document!=='undefined'){
    const load=(file,ready)=>{
      const texture=new THREE.TextureLoader().load('/assets/historia/'+file,t=>{
        if(disposed){t.dispose();return;}t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;ready(t);
      },undefined,()=>{});textures.push(texture);return texture;
    };
    grassTexture=load('meadow-grass.webp',t=>{grass.color.set('#b4c68b');grass.map=t;grass.bumpMap=t;grass.bumpScale=.065;grass.needsUpdate=true;});
    plasterTexture=load('lime-plaster.webp',t=>{t.repeat.set(1.2,1.2);waiting.forEach(m=>{m.map=t;m.bumpMap=t;m.bumpScale=.022;m.needsUpdate=true;});});
  }
  function decorate(material,color){
    material.envMapIntensity=.25;
    if(plasterColors.has(color)){
      material.roughness=.95;material.metalness=0;waiting.push(material);
      if(plasterTexture?.image){material.map=plasterTexture;material.bumpMap=plasterTexture;material.bumpScale=.022;}
    }
    return material;
  }
  function ground(parent,w,d,x,z){
    const geometry=new THREE.PlaneGeometry(w,d),uv=geometry.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/2.6,uv.getY(i)*d/2.6);
    const plane=new THREE.Mesh(geometry,grass);plane.rotation.x=-Math.PI/2;plane.position.set(x,-.239,z);plane.receiveShadow=true;parent.add(plane);return plane;
  }
  function grassEdges(scene){
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.024,0,0,.024,0,0,.012,.18,.012,.024,0,0,.015,.32,.044,.012,.18,.012],3));
    geometry.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,side:THREE.DoubleSide,envMapIntensity:.1});
    const transform=new THREE.Object3D(),color=new THREE.Color();
    for(let patch=0;patch<6;patch++){
      const blades=new THREE.InstancedMesh(geometry,material,600);blades.position.x=-14+patch*23;blades.name='Borda do gramado';
      for(let i=0;i<600;i++){
        const tuft=Math.floor(i/5),j=i%5;
        const x=tuft/120*23+Math.sin(tuft*91.7)*.13;
        const z=tuft%2?-.91-(tuft%7)*.09:5.12+(tuft%9)*.09;
        transform.position.set(x+Math.cos(j*2.4)*.07,-.235,z+Math.sin(j*2.4)*.07);
        transform.rotation.set(0,j*2.4+tuft,0);transform.scale.setScalar(.65+(i%7)*.09);transform.updateMatrix();blades.setMatrixAt(i,transform.matrix);
        color.set(['#396c2b','#527e31','#6a943a','#82a948'][i%4]);blades.setColorAt(i,color);
      }
      blades.receiveShadow=true;scene.add(blades);
    }
  }
  function hills(scene){
    const geometry=new THREE.PlaneGeometry(165,52,110,38);geometry.rotateX(-Math.PI/2);
    const p=geometry.getAttribute('position'),colors=new Float32Array(p.count*3),c=new THREE.Color();
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),depth=(z+26)/52;
      const ridge=Math.sin(x*.08+z*.1)*1.5+Math.sin(x*.17-z*.13)*.65+Math.sin(x*.31+z*.25)*.2;
      const rise=Math.pow(1-depth,.7);
      p.setY(i,Math.max(-.5,rise*(3.8+ridge))-.3);
      c.set('#3e764a').lerp(new THREE.Color('#739952'),Math.max(0,Math.min(1,(ridge+2)/4)));
      c.toArray(colors,i*3);
    }
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.computeVertexNormals();
    const land=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,envMapIntensity:.1}));land.position.set(48,0,-43);land.receiveShadow=true;scene.add(land);return land;
  }
  function dispose(){disposed=true;textures.forEach(t=>t.dispose());}
  return {decorate,ground,grassEdges,hills,dispose};
}
