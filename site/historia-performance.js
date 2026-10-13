// Bound large desktop buffers and reduce resolution only after sustained slow play.
// Physics, CSS controls and memory typography stay independent of this scale.
export function createGamePerformance(){
  const scales=[1,.85,.72];
  let tier=0,warmup=2000,duration=0,frames=0;
  function resetWindow(){warmup=2000;duration=0;frames=0;}
  function observe(milliseconds,active=true){
    if(!active||!Number.isFinite(milliseconds)||milliseconds<=0||milliseconds>150){resetWindow();return false;}
    if(warmup>0){warmup-=milliseconds;return false;}
    duration+=milliseconds;frames++;
    if(duration<2500)return false;
    const slow=duration/frames>25;
    duration=0;frames=0;
    if(slow&&tier<scales.length-1){tier++;resetWindow();return true;}
    return false;
  }
  function pixelRatio(width,height,dpr=1,mobile=false){
    const area=Math.max(1,width*height);
    return Math.min(dpr||1,mobile?1:1.25,Math.sqrt(2_100_000/area))*scales[tier];
  }
  return{observe,pixelRatio,resetWindow,get tier(){return tier;}};
}
