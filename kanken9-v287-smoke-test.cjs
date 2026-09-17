// Run against real repository scripts; no network or browser dependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const events=[];
const day={date:'2026-09-18',items:['学','校','春','海','花','魚'],done:[],goal:6,rewardIssued:false};
const ctx={window:{addEventListener:(type,fn,capture)=>events.push({type,capture})},document:{readyState:'loading',addEventListener(){},querySelector(){return null;},getElementById(){return null;}},console,Date,Math,save:{kanken9V280:{records:{},day,sets:0,badges:[],mockHistory:[]}},persist(){},showScreen(){}};
ctx.window.MioriKanken9V280={day:()=>day,open(){}};
for(const name of ['kanken9-data-v280.js','kanken9-exam-data-v283.js','kanken9-exam-finalize-v283.js','kanken9-quality-v285.js','kanken9-philosophy-v286.js','kanken9-write-blank-v287.js','kanken9-coverage-daily-v287.js']){
  vm.runInNewContext(fs.readFileSync(name,'utf8'),ctx,{filename:name});
}
const B=ctx.window.MioriKanken9DataV280,D=ctx.window.MioriKankenPaperV283Data,api=ctx.window.MioriKankenDailyV287;
assert.equal(B.entries.length,240,'All grade-one and grade-two characters must be present');
assert.equal(new Set(B.entries.map(e=>e.char)).size,240);
assert.equal(D.questions.length,105);assert.equal(D.questions.reduce((sum,q)=>sum+q.point,0),150);
assert.deepEqual(Array.from(D.sections.map(s=>D.groups[s.key].length)),[26,10,8,10,6,10,10,25]);
assert.ok(D.groups.VIII.every(q=>q.kind==='write'&&q.text.includes('□')&&!q.text.includes(q.answer)),'Every VIII prompt must contain a genuine answer square without leaking its kanji');
assert.ok(D.groups.II.every(q=>q.dynamicStroke&&q.total>=11&&Number(q.answer)<=q.total));
assert.ok(!D.sections.find(s=>s.key==='VI').instruction.includes('部首'));
assert.ok(!D.sections.find(s=>s.key==='VII').instruction.includes('反対'));
const pairs=new Map();for(const q of D.groups.IV){const list=pairs.get(q.pair)||[];list.push(q);pairs.set(q.pair,list);}
assert.equal(pairs.size,5);for(const [char,questions] of pairs){assert.equal(questions.length,2,char);assert.equal(new Set(questions.map(q=>q.answer)).size,2,char);}
assert.ok(api&&typeof api.choose==='function'&&typeof api.covered==='function');
const chosen=api.choose();
assert.equal(chosen.qs.length,7,'Daily: 3 writing, 3 reading and a rotating exam skill');
assert.deepEqual(Array.from(chosen.focus),['学','校','春']);
assert.ok(chosen.qs.slice(0,3).every(q=>q.kind==='write'&&q.coverageType==='write'&&q.text.includes('□')&&!q.text.includes(q.answer)));
assert.ok(chosen.qs.slice(3,6).every(q=>q.kind==='read'&&q.coverageType==='read'&&B.chars.includes(q.coverageChar)&&!chosen.focus.includes(q.coverageChar)));
assert.equal(new Set(chosen.qs.slice(3,6).map(q=>q.coverageChar)).size,3);
assert.ok(['II','III','IV','V','VI','VII'].includes(chosen.qs[6].section));
assert.equal(api.covered('read'),0,'Merely showing a question must not count as mastered');
const coverage=ctx.save.kanken9V280.coverageV287;
const available=B.entries.filter(e=>!chosen.focus.includes(e.char));
for(const e of available.slice(0,-3))coverage.read[e.char]={attempts:1,ok:1};
assert.equal(api.covered('read'),available.length-3);
const remaining=new Set(available.slice(-3).map(e=>e.char));
assert.deepEqual(new Set(api.choose().qs.slice(3,6).map(q=>q.coverageChar)),remaining,'Unmastered readings must be selected ahead of completed ones');
for(const e of B.entries)coverage.read[e.char]={attempts:1,ok:1};
assert.equal(api.covered('read'),240,'The full 240-character progress counter must be reachable');
coverage.format.II=1;coverage.format.III=1;coverage.format.IV=0;
const fourth=api.choose().qs.filter(q=>q.section==='IV');
assert.equal(fourth.length,2,'Two readings of the same kanji must be practiced as a pair');
assert.equal(fourth[0].target,fourth[1].target);
assert.ok(events.some(e=>e.type==='click'&&e.capture===true),'New daily handler must intercept prior document listeners at window capture');
const loader=fs.readFileSync('app-v240-release.js','utf8'),html=fs.readFileSync('index.html','utf8');
for(const f of ['kanken9-write-blank-v287.js','kanken9-coverage-daily-v287.js','kanken9-paper-guard-v287.js','kanken9-coverage-daily-v287.css','kanken9-paper-guard-v287.css'])assert.ok(loader.includes(f),`Missing asset ${f}`);
assert.ok(loader.indexOf('kanken9-write-blank-v287.js')<loader.indexOf('kanken9-exam-v283.js'));
assert.ok(html.includes('app-v240-release.js?v=2870'),'iPad must receive new loader');
assert.ok(!loader.includes('app-v233-polish.js'),'Do not reintroduce the old observer loop');
const css=fs.readFileSync('kanken9-coverage-daily-v287.css','utf8');
assert.ok(css.includes('writing-mode:vertical-rl')&&css.includes('touch-action:none!important')&&css.includes('.k9cErase'));
console.log('PASS v2.8.7: 105-question paper, 240 read/write coverage, real VIII inline blanks, on/kun pairing, daily rotation, Pencil controls and cache-busted loader.');
