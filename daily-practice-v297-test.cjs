// The daily five-question flow is tested in isolation from unrelated app screens.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const daily=read('app-v297-daily-practice.js');
const sheet=read('app-v298-word-drill.js');
const best=read('app-v295-best-writing.js');
const school=read('app-v236-school-test.js');
const release=read('app-v240-release.js');
const index=read('index.html');
const createButton=(dataset={})=>({
 dataset,handlers:{},addEventListener(type,cb){this.handlers[type]=cb;}
});
const elements={
 recommendBtn:createButton({stage:'2'}),
 missionGrid:createButton(),
 backHomeBtn:createButton(),
 stageLabel:{textContent:''}
};
let started=null;
const ctx=vm.createContext({
 window:{MioriPracticeStarV296:{starred:i=>i===4}},
 document:{
   getElementById(id){return elements[id]||null;},
   createElement(){return {textContent:'',id:'',style:{}};},
   head:{appendChild(){}}
 },
 QUEST_STAGES:Array.from({length:10},(_,i)=>({chars:[{char:String(i)}]})),
 statFor(ch){return{mastery:Number(ch)*8,seen:0,last:0}},
 startStage(i){started=i;},
 performance:{now:()=>0},
 console
});
vm.runInContext(daily,ctx,{filename:'app-v297-daily-practice.js'});
elements.recommendBtn.handlers.click();
const api=ctx.window.MioriDailyPracticeV297;
const run=api.state();
assert.equal(run.queue.length,5,'The daily recommendation schedules five exercises');
assert.equal(run.queue[0],2,'The already-displayed recommendation is first');
assert.equal(new Set(run.queue).size,5,'No duplicated exercise in the five');
for(let i=0;i<run.queue.length;i++){
 ctx.startStage(run.queue[i]);
 assert.equal(started,run.queue[i]);
 assert.equal(elements.stageLabel.textContent,'今日のおすすめ '+(i+1)+' / 5');
 assert.equal(api.afterBest(run.queue[i]),i===4?-1:run.queue[i+1],'Best selection advances through all five');
}
assert.equal(api.state(),null,'A completed daily session stops instead of looping indefinitely');
assert.match(best,/MioriDailyPracticeV297\?\.afterBest/,'Best-writing confirmation uses the new session');
assert.match(best,/if\(nextIndex<0\)\{renderHome\(\)/,'At five completions the child returns home');
assert.match(best,/data-best-stroke/,'Comparison includes an explicit pen-order button');
assert.match(best,/MioriDailyPracticeV297\?\.showStroke/);
assert.match(school,/id="schoolStrokeReplayV297"/,'School answer comparison includes a stroke replay button');
assert.match(school,/replay\.onclick/);
assert.match(sheet,/stage\.chars\.map\(\(item,ci\)/,'All the target kanji appear at once');
assert.match(sheet,/Array\.from\(\{length:WRITES\}/,'Each target has three writing spaces');
assert.match(sheet,/もう1枚 練習/,'The child can practise the whole word repeatedly');
assert.match(sheet,/practiceNotebookV270/,'Keep existing notebook storage and Pencil guard');
assert.match(sheet,/save\.practiceNotebookV270\[item\.char\]/,'Every practised character is recorded');
assert.match(sheet,/stopImmediatePropagation\(\);open\(\)/,'Multi-kanji access does not also open the old single-kanji note');
assert.match(daily,/orientation:landscape/,'Regular practice has a landscape viewport layout');
assert.match(release,/app-v297-daily-practice\.js\?v=2971/);
assert.match(release,/app-v298-word-drill\.js\?v=2981/);
assert.match(index,/app-v240-release\.js\?v=3001/);
assert.match(index,/app-v236-school-test\.js\?v=20261017-stroke-fit2/);
console.log('PASS daily five, optional stroke review, whole-word repeated note, landscape, and cache keys');
