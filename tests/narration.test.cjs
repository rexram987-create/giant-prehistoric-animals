const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
 const calls=[];let cancels=0;const states=[];
 const synthesis={cancel(){cancels++},resume(){},speak:u=>calls.push(u),getVoices:()=>[{name:'English',lang:'en-US'},{name:'עברית',lang:'he-IL',localService:true}]};
 const c=vm.createContext({console});
 assert.ok(fs.existsSync('js/narration.js'),'narration module exists');
 vm.runInContext(fs.readFileSync('js/narration.js','utf8'),c);
 c.engine=synthesis;c.Utterance=class{constructor(text){this.text=text}};c.changed=s=>states.push(s);
 const n=vm.runInContext('createNarrator({synthesis:engine,Utterance,onChange:changed})',c);
 return {c,n,calls,states,get cancels(){return cancels}};
}
test('narration uses Hebrew voice and short utterances, then completes',()=>{const s=setup();s.n.start('משפט קצר. '.repeat(80));assert.equal(s.calls[0].lang,'he-IL');assert.equal(s.calls[0].voice.lang,'he-IL');let i=0;while(s.n.status==='speaking'){assert.ok(i<200);assert.ok(s.calls[i].text.length<=180);s.calls[i++].onend()}assert.equal(s.n.status,'idle');assert.ok(i>1);assert.match(s.states.at(-1).message,/הסתיימה/)});
test('pause and resume repeat only the interrupted chunk and ignore old callbacks',()=>{const s=setup();s.n.start('משפט ראשון. '.repeat(40));const first=s.calls[0];s.n.pause();assert.equal(s.n.status,'paused');first.onend();assert.equal(s.calls.length,1);s.n.resume();assert.equal(s.calls.length,2);assert.equal(s.calls[1].text,first.text);first.onerror({error:'canceled'});assert.equal(s.n.status,'speaking')});
test('stop prevents canceled utterances from starting any more speech',()=>{const s=setup();s.n.start('טקסט. '.repeat(80));const first=s.calls[0];s.n.stop();first.onend();assert.equal(s.n.status,'idle');assert.equal(s.calls.length,1);assert.ok(s.cancels>=1)});
test('a new start replaces previous speech without overlapping queues',()=>{const s=setup();s.n.start('ישן. '.repeat(80));const first=s.calls[0];s.n.start('חדש');first.onend();assert.equal(s.calls.length,2);assert.equal(s.calls[1].text,'חדש')});
test('an engine error resets controls and explains how to retry',()=>{const s=setup();s.n.start('שלום');s.calls[0].onerror({error:'language-unavailable'});assert.equal(s.n.status,'idle');assert.match(s.states.at(-1).message,/עברית/)});
test('unsupported engines are reported without throwing',()=>{const s=setup();const n=vm.runInContext('createNarrator({onChange:changed})',s.c);assert.equal(n.supported,false);assert.doesNotThrow(()=>n.start('שלום'));assert.equal(n.status,'idle')});
test('a single very long token is safely split and no speech text is dropped',()=>{const s=setup();const text='א'.repeat(500);const chunks=vm.runInContext(`splitNarrationText('${text}')`,s.c);assert.ok(chunks.every(x=>x.length<=180));assert.equal(chunks.join(''),text)});
test('all animal readings contain discovery and fossils, but no HTML or image caveats',()=>{const s=setup();for(const id of JSON.parse(fs.readFileSync('data/animals/index.json'))){s.c.animal=JSON.parse(fs.readFileSync(`data/animals/${id}.json`));const text=vm.runInContext('buildNarrationText(animal)',s.c);assert.ok(text.includes(s.c.animal.nameHe));assert.match(text,/היסטוריית הגילוי/);assert.match(text,/שלמות המאובנים/);assert.doesNotMatch(text,/<|https:|webp|בינה מלאכותית/);}});
