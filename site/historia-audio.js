const names=['step','jump','land','collect','door','page','mission','complete','hint','respawn','click'];
export const audioFiles={music:'/assets/historia/audio/music.mp3',...Object.fromEntries(names.map(name=>[name,'/assets/historia/audio/'+name+'.wav']))};
const mix={step:1,jump:.9,land:.8,collect:1,door:.85,page:1,mission:1,complete:1,hint:.8,respawn:.85,click:.9};
const clamp=value=>Math.max(0,Math.min(1,Number.isFinite(Number(value))?Number(value):0));

// No context, download or sound before an explicit Play/audio-control gesture.
export function createGameAudio({Context=globalThis.AudioContext||globalThis.webkitAudioContext,fetcher=(...args)=>fetch(...args),storage,onChange=()=>{}}={}){
  let prefs={enabled:true,music:.25,effects:.8};
  try{storage??=globalThis.sessionStorage;const saved=JSON.parse(storage?.getItem('3irmaos-game-audio')||'null');if(saved&&typeof saved==='object'){if(typeof saved.enabled==='boolean')prefs.enabled=saved.enabled;for(const key of ['music','effects'])if(typeof saved[key]==='number'&&Number.isFinite(saved[key]))prefs[key]=clamp(saved[key]);}}catch{}
  let context,master,musicGain,effectsGain,musicSource,loading,active=false,reading=false,disposed=false,available=!!Context;
  let offset=0,startedAt=0;
  const buffers=new Map(),voices=new Set(),lastPlayed=new Map(),abort=new AbortController();
  const state=()=>({...prefs,available,unlocked:context?.state==='running'});
  const notify=()=>onChange(state());
  const save=()=>{try{storage?.setItem('3irmaos-game-audio',JSON.stringify(prefs));}catch{}notify();};
  function gain(node,value){if(!context||!node)return;node.gain.cancelScheduledValues(context.currentTime);node.gain.setTargetAtTime(value,context.currentTime,.025);}
  function stopMusic(){
    if(!musicSource)return;
    const source=musicSource;musicSource=null;
    const duration=buffers.get('music')?.duration||1;offset=(offset+context.currentTime-startedAt)%duration;
    try{source.stop();}catch{}source.disconnect();
  }
  function stopVoices(){for(const voice of voices){try{voice.stop();}catch{}voice.disconnect();}voices.clear();}
  function sync(){
    if(!context||disposed)return;
    const audible=available&&prefs.enabled&&active&&context.state==='running';
    gain(master,audible?1:0);gain(musicGain,prefs.music*(reading?.4:1));gain(effectsGain,prefs.effects);
    if(!audible){stopMusic();stopVoices();return;}
    if(!musicSource&&buffers.has('music')&&prefs.music>0){
      const source=context.createBufferSource();source.buffer=buffers.get('music');source.loop=true;source.connect(musicGain);
      source.start(0,offset);startedAt=context.currentTime;musicSource=source;
    }
    if(prefs.music===0)stopMusic();
  }
  async function load(){
    if(loading)return loading;
    loading=Promise.allSettled(Object.entries(audioFiles).map(async([name,url])=>{
      const response=await fetcher(url,{signal:abort.signal});if(!response.ok)throw new Error('Audio file unavailable');
      const data=await response.arrayBuffer();if(disposed)return;
      const buffer=await context.decodeAudioData(data);if(!disposed){buffers.set(name,buffer);sync();}
    })).then(()=>{if(!disposed){if(!buffers.size)available=false;sync();notify();}});
    return loading;
  }
  function unlock(){
    if(disposed||!available||!prefs.enabled)return Promise.resolve(false);
    try{
      if(!context){
        context=new Context({latencyHint:'interactive'});master=context.createGain();musicGain=context.createGain();effectsGain=context.createGain();
        master.gain.value=0;musicGain.gain.value=prefs.music;effectsGain.gain.value=prefs.effects;
        musicGain.connect(master);effectsGain.connect(master);master.connect(context.destination);
        context.addEventListener?.('statechange',()=>{sync();notify();});
      }
      // Request resume synchronously inside the tap, before fetching or decoding.
      const resumed=context.state==='running'?Promise.resolve():context.resume();
      load().catch(()=>{});
      return Promise.resolve(resumed).then(()=>{sync();notify();return true;}).catch(()=>{notify();return false;});
    }catch{available=false;notify();return Promise.resolve(false);}
  }
  function play(name,{rate=1,volume=1}={}){
    if(disposed||!active||!prefs.enabled||!context||context.state!=='running'||!buffers.has(name)||!names.includes(name)||prefs.effects===0)return false;
    const cooldown=name==='step'?.12:name==='hint'?.45:.045;
    if(context.currentTime-(lastPlayed.get(name)??-100)<cooldown)return false;
    lastPlayed.set(name,context.currentTime);
    if(voices.size>=12){const first=voices.values().next().value;try{first.stop();}catch{}first.disconnect();voices.delete(first);}
    const voice=context.createBufferSource(),volumeNode=context.createGain();voice.buffer=buffers.get(name);voice.playbackRate.value=Math.max(.8,Math.min(1.2,rate));
    volumeNode.gain.value=(mix[name]||1)*clamp(volume);voice.connect(volumeNode);volumeNode.connect(effectsGain);voices.add(voice);
    voice.onended=()=>{voices.delete(voice);voice.disconnect();volumeNode.disconnect();};voice.start();return true;
  }
  return {
    unlock,play,get state(){return state();},
    setActive(value){const next=!!value;if(active===next)return;active=next;sync();},
    setReading(value){const next=!!value;if(reading===next)return;reading=next;sync();},
    setEnabled(value){prefs.enabled=!!value;sync();save();},
    setVolume(channel,value){if(!['music','effects'].includes(channel))return;prefs[channel]=clamp(value);sync();save();},
    async loaded(){await loading;},
    dispose(){if(disposed)return;active=false;sync();disposed=true;abort.abort();buffers.clear();try{context?.close()?.catch(()=>{});}catch{}}
  };
}
