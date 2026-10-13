import assert from 'node:assert/strict';
import {createGameAudio,audioFiles} from '../site/historia-audio.js';
class Param{value=0;cancelScheduledValues(){}setTargetAtTime(value){this.value=value;}}
class Node{gain=new Param();playbackRate=new Param();connect(){}disconnect(){this.disconnected=true;}start(...args){this.started=args;this.playing=true;}stop(){this.playing=false;this.onended?.();}}
const contexts=[];
class Context extends EventTarget{
 constructor(){super();this.state='suspended';this.currentTime=0;this.destination={};this.sources=[];contexts.push(this);}
 createGain(){return new Node();}createBufferSource(){const source=new Node();this.sources.push(source);return source;}
 resume(){this.state='running';return Promise.resolve();}
 decodeAudioData(bytes){return Promise.resolve({id:new Uint8Array(bytes)[0],duration:28.8});}
 close(){this.state='closed';return Promise.resolve();}
}
const entries=Object.values(audioFiles);let fetches=0;
const response=url=>({ok:true,arrayBuffer:async()=>new Uint8Array([entries.indexOf(url)]).buffer});
const fetcher=async url=>{fetches++;return response(url);};
const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
const audio=createGameAudio({Context,fetcher,storage});
assert.equal(contexts.length,0);assert.equal(fetches,0);audio.setActive(true);assert.equal(contexts.length,0,'Visibility alone must never create audio or autoplay.');
await audio.unlock();await audio.loaded();const context=contexts.at(-1);
assert.equal(fetches,12);assert.equal(context.sources.filter(s=>s.loop&&s.playing).length,1);
assert.equal(audio.play('collect'),true);assert.equal(audio.play('collect'),false,'Repeated same-frame effects must be coalesced.');
context.currentTime=3;assert.equal(audio.play('jump'),true);
audio.setActive(false);assert.ok(context.sources.every(s=>!s.playing),'Pause must stop music and active effects.');
assert.equal(audio.play('collect'),false);
audio.setActive(true);let music=context.sources.findLast(s=>s.loop&&s.playing);assert.equal(music.started[1],3,'Music resumes at its previous position.');
audio.setReading(true);audio.setVolume('music',0);assert.ok(!music.playing);audio.setVolume('music',.25);
assert.equal(context.sources.filter(s=>s.loop&&s.playing).length,1);
audio.setEnabled(false);assert.ok(context.sources.every(s=>!s.playing));
audio.setVolume('effects',2);assert.equal(audio.state.effects,1);audio.setEnabled(true);await audio.unlock();
assert.equal(context.sources.filter(s=>s.loop&&s.playing).length,1,'Repeated unlocks cannot layer music loops.');
audio.dispose();assert.equal(context.state,'closed');assert.equal(audio.play('complete'),false);

const resolvers=[];
const delayed=createGameAudio({Context,fetcher:url=>new Promise(resolve=>resolvers.push(()=>resolve(response(url)))),storage:{getItem(){return null;}}});
delayed.setActive(true);await delayed.unlock();const pendingContext=contexts.at(-1);delayed.setActive(false);
resolvers.forEach(resolve=>resolve());await delayed.loaded();
assert.equal(pendingContext.sources.length,0,'Late downloads after leaving the game must remain silent.');
delayed.setActive(true);assert.equal(pendingContext.sources.filter(s=>s.playing).length,1);delayed.dispose();

const before=contexts.length;
const muted=createGameAudio({Context,fetcher,storage:{getItem(){return '{"enabled":false,"music":0.4,"effects":0.6}';}}});
muted.setActive(true);await muted.unlock();assert.equal(contexts.length,before,'A remembered mute must not create a context.');assert.equal(muted.state.music,.4);muted.dispose();
const unsupported=createGameAudio({Context:null,fetcher});await unsupported.unlock();assert.equal(unsupported.state.available,false);unsupported.dispose();
console.log('Audio lifecycle passed: gesture-only initialization, 12 assets, event cooldown, pause/mute, saved preferences, music resume, independent volume, delayed loading, no doubled loops, unsupported API and disposal.');
