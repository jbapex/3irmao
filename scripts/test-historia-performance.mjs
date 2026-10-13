import assert from 'node:assert/strict';
import { createGamePerformance } from '../site/historia-performance.js';

const fast=createGamePerformance();
assert.equal(fast.pixelRatio(390,844,3,true),1);
assert.equal(fast.pixelRatio(1440,720,2,false),1.25);
for(const [w,h] of [[1920,1080],[2560,1440],[3840,2160]]){
 const ratio=fast.pixelRatio(w,h,2,false);
 assert.ok(w*h*ratio**2<=2_100_001,'Desktop buffers must stay within the pixel budget.');
}
for(let i=0;i<3600;i++)fast.observe(1000/60);
assert.equal(fast.tier,0,'Smooth devices keep the original profile.');
fast.observe(8000);assert.equal(fast.tier,0,'A tab switch or isolated stall must not reduce quality.');
const slow=createGamePerformance();let changes=0;
for(let i=0;i<900;i++)if(slow.observe(1000/30))changes++;
assert.equal(changes,2);assert.equal(slow.tier,2);
assert.ok(slow.pixelRatio(390,844,3,true)>=.7,'Adaptation is bounded.');
slow.resetWindow();assert.equal(slow.tier,2,'Pause resets samples without oscillating quality.');
const reading=createGamePerformance();
for(let i=0;i<300;i++)reading.observe(40,false);
assert.equal(reading.tier,0,'Reading does not contribute slow frame samples.');
for(let i=0;i<40;i++)reading.observe(40);
assert.equal(reading.tier,0,'Play gets a warm-up after reading.');
console.log('Performance budget passed: large desktop buffers, smooth-device preservation, sustained adaptation, isolated stalls, pause, reading and bounded resolution.');
