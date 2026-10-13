import * as THREE from './vendor/three.module.min.js';

// Lightweight, original village details. Repeated tiles and foliage are instanced.
export function createVillageKit({box,ball,cylinder,group,mesh,mat}) {
  const tileGeometry=new THREE.CylinderGeometry(.115,.14,.54,8,1,true,-Math.PI/2,Math.PI);
  tileGeometry.rotateX(-Math.PI/2);
  const tileMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.92});
  const leafGeometry=new THREE.BufferGeometry();
  const outline=[[0,-.55,0],[-.27,-.18,.015],[-.22,.27,0],[0,.6,-.025],[.22,.27,0],[.27,-.18,.015]],leafVertices=[];
  for(let i=0;i<6;i++)leafVertices.push(0,0,.075,...outline[i],...outline[(i+1)%6]);
  leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute(leafVertices,3));leafGeometry.computeVertexNormals();
  const leafMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.87,side:THREE.DoubleSide,envMapIntensity:.15});
  const helper=new THREE.Object3D(),color=new THREE.Color();
  let disposed=false;
  const paving=new THREE.MeshStandardMaterial({color:'#f7edda',roughness:.97});
  let pavementTexture;
  if(typeof document!=='undefined'){
    pavementTexture=new THREE.TextureLoader().load('/assets/historia/village-cobblestone.webp',texture=>{
      if(disposed){texture.dispose();return;}
      texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
      texture.anisotropy=4;paving.map=texture;paving.bumpMap=texture;paving.bumpScale=.045;paving.needsUpdate=true;
    },undefined,()=>{});
  }
  function pavement(parent,w,d,x,y,z){
    const geometry=new THREE.PlaneGeometry(w,d);
    const uv=geometry.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/4.2,uv.getY(i)*d/4.2);
    const floor=mesh(geometry,paving,parent,x,y,z);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
    return floor;
  }
  function roof(parent,w,d,y){
    const root=group(parent,0,y,-.1),slope=.43,half=d/2+.18;
    const rise=half*slope;
    box(w+.55,.14,d+.44,'#71503b',root,0,-.035,0,.025);
    const columns=Math.ceil((w+.42)/.245),rows=Math.ceil(half/.43),tiles=new THREE.InstancedMesh(tileGeometry,tileMaterial,columns*rows*2);
    let i=0;
    for(const side of [-1,1]){
      const slab=box(w+.5,.12,Math.hypot(half,rise),'#b65b38',root,0,rise/2,side*half/2,.025);
      slab.rotation.x=side*Math.atan(slope);
      for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
        const z=side*(.15+row*.43);
        helper.position.set(-(columns-1)*.245/2+col*.245,rise-Math.abs(z)*slope+.085,z);
        helper.rotation.set(side*Math.atan(slope),0,0);helper.scale.setScalar(1);helper.updateMatrix();
        tiles.setMatrixAt(i,helper.matrix);color.set(['#b86d44','#ce8251','#ae5738','#d39261','#bc6941'][(col+row*3)%5]);tiles.setColorAt(i++,color);
      }
    }
    tiles.castShadow=true;tiles.receiveShadow=true;root.add(tiles);
    const ridge=cylinder(.15,w+.54,'#c78254',root,0,rise+.12,0,12);ridge.rotation.z=Math.PI/2;
    return root;
  }
  function foliage(parent,seed=0,radius=1){
    const count=560,leaves=new THREE.InstancedMesh(leafGeometry,leafMaterial,count);
    let randomState=(Math.abs(Math.floor(seed*971))+317)>>>0;
    const rand=()=>{randomState=(1664525*randomState+1013904223)>>>0;return randomState/4294967296;};
    for(let i=0;i<count;i++){
      const cluster=i%7,theta=cluster*2.399963+seed*.7;
      const cx=Math.cos(theta)*(.35+cluster%3*.09)*radius,cz=Math.sin(theta)*.45*radius,cy=.45+(cluster%3)*.32;
      const angle=rand()*Math.PI*2,ny=rand()*2-1,nr=Math.sqrt(1-ny*ny),r=(.36+rand()*.25)*radius;
      helper.position.set(cx+Math.cos(angle)*nr*r,cy+ny*r*.85,cz+Math.sin(angle)*nr*r);
      helper.rotation.set(rand()*Math.PI,rand()*Math.PI*2,rand()*Math.PI*2);helper.scale.set(.38+rand()*.25,.36+rand()*.25,1);helper.updateMatrix();
      leaves.setMatrixAt(i,helper.matrix);color.set(['#285d2b','#3e792e','#548b34','#709e3d','#8bad48'][Math.floor(rand()*5)]);leaves.setColorAt(i,color);
    }
    leaves.castShadow=true;leaves.receiveShadow=true;leaves.name='Folhas naturais';parent.add(leaves);return leaves;
  }
  function archWindow(parent,x,y,z,w=.9,h=1.6){
    // A recessed arch and a raised stone surround, built from actual geometry.
    const r=w/2,shape=new THREE.Shape();shape.moveTo(-r,0);shape.lineTo(-r,h-r);
    shape.absarc(0,h-r,r,Math.PI,0,true);shape.lineTo(r,0);shape.closePath();
    const arch=mesh(new THREE.ExtrudeGeometry(shape,{depth:.07,bevelEnabled:false,curveSegments:12}), '#254f85',parent,x,y,z);
    const frame=mesh(new THREE.TorusGeometry(r+.045,.075,8,24,Math.PI),'#f5ddad',parent,x,y+h-r,z+.1);
    box(.12,h-r,.15,'#f5ddad',parent,x-r-.045,y+(h-r)/2,z+.1,.02);
    box(.12,h-r,.15,'#f5ddad',parent,x+r+.045,y+(h-r)/2,z+.1,.02);
    box(w+.27,.13,.27,'#f5ddad',parent,x,y,z+.12,.02);
    box(.06,h-.15,.09,'#e9c677',parent,x,y+h/2,z+.14,.01);
    box(w-.08,.05,.09,'#e9c677',parent,x,y+h*.56,z+.14,.01);
    return arch;
  }
  function lantern(parent,x,y,z){
    const root=group(parent,x,y,z);
    box(.11,.3,.22,'#36464c',root,0,0,-.08,.02);
    box(.32,.5,.26,'#37474c',root,0,-.14,.12,.04);
    const glass=new THREE.MeshStandardMaterial({color:'#ffeac1',emissive:'#ffc66c',emissiveIntensity:.38,roughness:.4});
    box(.22,.33,.28,glass,root,0,-.14,.135,.02);
    box(.04,.38,.3,'#37474c',root,0,-.14,.145,.008);
    mesh(new THREE.ConeGeometry(.26,.2,4),'#37474c',root,0,.19,.12).rotation.y=Math.PI/4;
  }
  function bench(parent,x,z){
    const root=group(parent,x,0,z);
    for(let i=0;i<3;i++)box(2.15,.11,.15,'#b98045',root,0,.64,-.19+i*.18,.025);
    for(let i=0;i<3;i++)box(2.15,.14,.1,'#b98045',root,0,.87+i*.18,-.3,.025);
    for(const side of [-1,1]){
      box(.11,.65,.45,'#35494b',root,side*.8,.29,0,.02);
      box(.1,.93,.09,'#35494b',root,side*.8,.77,-.35,.02);
    }
    return root;
  }
  function dispose(){disposed=true;pavementTexture?.dispose();}
  return {pavement,roof,foliage,archWindow,lantern,bench,dispose};
}
