import * as THREE from './vendor/three.module.min.js';

// Linear HDR beauty, depth-aware contact shading, then a single display transform.
// Devices without renderable half-float retain the normal Three renderer.
export function createGameRendering(renderer,scene,{mobile=false}={}) {
  if(!renderer.capabilities?.isWebGL2||!renderer.extensions.has('EXT_color_buffer_float'))return null;
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});
  target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  target.depthTexture.minFilter=target.depthTexture.magFilter=THREE.NearestFilter;
  const gl=renderer.getContext();
  const colorSamples=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA16F,gl.SAMPLES)||[]);
  const depthSamples=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,gl.SAMPLES)||[]);
  target.samples=mobile?0:colorSamples.find(n=>n<=2&&depthSamples.includes(n))||0;
  const uniforms={beauty:{value:target.texture},depth:{value:target.depthTexture},resolution:{value:new THREE.Vector2(1,1)},invProjection:{value:new THREE.Matrix4()},projectionScale:{value:1}};
  const material=new THREE.ShaderMaterial({defines:{CONTACT_SAMPLES:mobile?0:6},uniforms,depthTest:false,depthWrite:false,toneMapped:true,
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
    fragmentShader:`
      uniform sampler2D beauty;
      uniform sampler2D depth;
      uniform vec2 resolution;
      uniform mat4 invProjection;
      uniform float projectionScale;
      varying vec2 vUv;
      vec3 viewPosition(vec2 uv){
        float d=texture2D(depth,clamp(uv,vec2(0.001),vec2(0.999))).r;
        vec4 p=invProjection*vec4(uv*2.0-1.0,d*2.0-1.0,1.0);
        return p.xyz/p.w;
      }
      void main(){
        vec3 color=texture2D(beauty,vUv).rgb;
        float d=texture2D(depth,vUv).r;
        #if CONTACT_SAMPLES > 0
        if(d<0.99999){
          vec2 px=1.0/resolution;
          vec3 p=viewPosition(vUv);
          vec3 left=viewPosition(vUv-vec2(px.x,0.0)),right=viewPosition(vUv+vec2(px.x,0.0));
          vec3 down=viewPosition(vUv-vec2(0.0,px.y)),up=viewPosition(vUv+vec2(0.0,px.y));
          vec3 dx=abs(right.z-p.z)<abs(p.z-left.z)?right-p:p-left;
          vec3 dy=abs(up.z-p.z)<abs(p.z-down.z)?up-p:p-down;
          vec3 n=normalize(cross(dx,dy)+vec3(0.0,0.0,0.000001));
          if(dot(n,-p)<0.0)n=-n;
          float radius=0.58;
          float pixelRadius=clamp(radius*projectionScale/max(-p.z,0.1),2.0,42.0);
          float obscurance=0.0;
          float seed=0.35;
          for(int i=0;i<CONTACT_SAMPLES;i++){
            float fi=float(i),angle=seed+fi*2.399963;
            vec2 uv=clamp(vUv+vec2(cos(angle),sin(angle))*pixelRadius*(0.3+fi*(0.693/float(CONTACT_SAMPLES-1)))*px,vec2(0.001),vec2(0.999));
            vec3 delta=viewPosition(uv)-p;
            float distance=length(delta);
            float horizon=max(dot(n,delta)/max(distance,0.001)-0.055,0.0);
            obscurance+=horizon*(1.0-smoothstep(0.15,radius,distance));
          }
          color*=1.0-min(0.25,obscurance*(1.44/float(CONTACT_SAMPLES)));
        }
        #endif
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        float luminance=dot(gl_FragColor.rgb,vec3(0.2126,0.7152,0.0722));
        gl_FragColor.rgb=max(vec3(0.0),mix(vec3(luminance),gl_FragColor.rgb,1.075));
        #include <colorspace_fragment>
      }`});
  const passScene=new THREE.Scene(),passCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);quad.frustumCulled=false;passScene.add(quad);

  // A small original studio-sky environment supplies coherent reflections.
  const envScene=new THREE.Scene();
  const envGeometry=new THREE.SphereGeometry(10,24,12),positions=envGeometry.getAttribute('position'),colors=new Float32Array(positions.count*3);
  const c=new THREE.Color();
  for(let i=0;i<positions.count;i++){
    const y=positions.getY(i)/10;
    c.copy(new THREE.Color(y>0?'#a8d9ed':'#97846a')).lerp(new THREE.Color('#dfe8e7'),1-Math.abs(y));
    c.multiplyScalar(.6).toArray(colors,i*3);
  }
  envGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const dome=new THREE.Mesh(envGeometry,new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true}));envScene.add(dome);
  const window=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({color:new THREE.Color(3.5,3.1,2.6),side:THREE.DoubleSide}));window.position.set(-4,5,5);window.lookAt(0,0,0);envScene.add(window);
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(envScene,.12,.1,30);
  scene.environment=environment.texture;pmrem.dispose();
  envGeometry.dispose();dome.material.dispose();window.geometry.dispose();window.material.dispose();
  scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.isMeshStandardMaterial)m.envMapIntensity=.25;});
  const size=new THREE.Vector2();
  function render(camera){
    renderer.getDrawingBufferSize(size);
    if(target.width!==size.x||target.height!==size.y){target.setSize(size.x,size.y);uniforms.resolution.value.copy(size);}
    uniforms.invProjection.value.copy(camera.projectionMatrixInverse);
    uniforms.projectionScale.value=camera.projectionMatrix.elements[5]*size.y*.5;
    renderer.setRenderTarget(target);renderer.render(scene,camera);
    renderer.setRenderTarget(null);renderer.render(passScene,passCamera);
  }
  function dispose(){scene.environment=null;environment.dispose();target.dispose();quad.geometry.dispose();material.dispose();}
  return {render,dispose,target,profile:mobile?'mobile':'balanced'};
}
