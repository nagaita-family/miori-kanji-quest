// Offline regression: school data, history, real print submission and completion keys.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = path => fs.readFileSync(path, 'utf8');
const nodes = new Map();
function node(){return {innerHTML:'',textContent:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return node();},querySelectorAll(){return [];},appendChild(){},remove(){},addEventListener(){}};}
const oldSave={xp:720,stats:{路:{seen:9,mastery:88,noHelp:3}},completedStages:{0:4,3:2},okuriStats:{'整|える':{correct:3}},printTestsV230:{'2026-09-previous':{best:8,runs:2}},kanken9V280:{checked:['水'],furniture:['tree'],xp:17},specialItemsV234:{goldMokoStar:true}};
let stored=JSON.stringify(oldSave);
const ctx=vm.createContext({window:{},console,document:{getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},querySelectorAll(){return [];},querySelector(){return null;},createElement:node,head:{appendChild(){}},body:node()},localStorage:{getItem:()=>stored,setItem:(_,v)=>stored=v},location:{pathname:'/'},setTimeout(){}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js'])run(read(f));
const oldStages=run('JSON.stringify(QUEST_STAGES)');
run(read('data-packs.js'));
const stages=JSON.parse(run('JSON.stringify(QUEST_STAGES)'));
assert.equal(stages.length,10);
assert.deepEqual(stages.map(s=>s.answer+(s.okuri||'')),['泳ぐ','練習','助言','童話','申し','食品','商品','水泳','練る','助ける']);
assert.deepEqual(stages.map(s=>s.before+s.reading+(s.okuri||'')+s.after),['海でおよぐ。','サッカーのれんしゅうをする。','兄のじょげんを聞く。','どうわの絵本を読む。','手紙でもうしこむ。','しょくひんを売る。','しょうひんを買う。','すいえい教室に通う。','アイデアをねる。','子ねこをたすける。']);
assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-09-21-p58');
assert.equal(run('KANJI_PACKS.length'),2,'Only one ten-question pack is added');
assert.equal(run('JSON.stringify(pastKanjiPacks()[0].stages)'),oldStages);
assert.equal(run('kanjiTestHistory()[0].score'),65);
assert.equal(run('currentKanjiPack().addedAt'),'2026-09-21');
assert.equal(run('currentKanjiPack().testDate'),undefined,'No invented school date');
for(const s of stages){assert.equal(s.chars.map(c=>c.char).join(''),s.answer);assert.equal(s.readingParts.join(''),s.reading);if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));}
run("useKanjiPack('2026-09-previous')");
assert.equal(run('JSON.stringify(QUEST_STAGES)'),oldStages);
run('useKanjiPack(CURRENT_KANJI_PACK_ID)');
assert.equal(stored,JSON.stringify(oldSave),'Pack selection must not write saved progress');
// Execute the real app functions; DOM event binding is exercised in browser checks.
run(read('app-v10.js').split('$("missionGrid").addEventListener')[0]);
run('showScreen=()=>{};confetti=()=>{};stageIndex=0;finishStage()');
let saved=JSON.parse(stored);
assert.equal(saved.completedStages[0],4,'Legacy Test 13 counter is not reassigned');
assert.equal(saved.completedStages['2026-09-21-p58:0'],1);
assert.equal(Object.values(saved.completedStages).reduce((a,b)=>a+b,0),7,'Island reward total includes old and new completions');
run("useKanjiPack('2026-09-previous');stageIndex=0;finishStage();useKanjiPack(CURRENT_KANJI_PACK_ID)");
saved=JSON.parse(stored);
assert.equal(saved.completedStages[0],5,'Old review continues its existing counter');
assert.deepEqual(saved.kanken9V280,oldSave.kanken9V280);
assert.deepEqual(saved.stats.路,oldSave.stats.路);
assert.deepEqual(saved.printTestsV230,oldSave.printTestsV230);
assert.equal(saved.xp,oldSave.xp);
// Expose closure functions only in this VM; production gets no answer/test API.
run(read('app-v230-print-test.js').replace('  installStyles();','  window.testPrint={answers,questionHtml,problemPreview,focusCanvases,submitTest};\n  installStyles();'));
const api=ctx.window.testPrint;
for(let i=0;i<10;i++){
  const s=stages[i];
  for(const markup of [api.questionHtml(s,i),api.problemPreview(s),api.focusCanvases(s,i)])assert.ok(!markup.includes(s.answer),'Do not reveal target answer before grading');
}
const q5=api.questionHtml(stages[4],4);
assert.ok(q5.includes('<span>こ</span><span>む</span>'),'Printed こむ stays outside the answer');
assert.ok(api.focusCanvases(stages[4],4).includes('data-okuri="し"'));
run(read('app-v235-paper-pdf.js'));
const sheet=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((sheet.match(/<section class="question">/g)||[]).length,10);
assert.ok(sheet.includes('@page{size:A4 portrait;margin:11mm}'));
assert.ok(sheet.includes('direction:rtl;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(2,118mm)'));
assert.ok(sheet.includes('.text-run{writing-mode:vertical-rl'));
assert.ok(sheet.includes('印刷・PDFとして保存'));
assert.ok(sheet.includes('<span class="text-run before">手紙で</span>')&&sheet.includes('<span class="text-run after">こむ。</span>'),'Printed こむ stays outside handwritten boxes');
assert.ok(sheet.includes('<span class="reading full-reading">もうし</span>'),'Furigana shows the full reading beside question 5');
const paperQuestions=sheet.slice(sheet.indexOf('<div class="questions">'),sheet.indexOf('<div class="foot">'));
for(const s of stages)assert.ok(!paperQuestions.includes(s.answer),`Paper must not reveal ${s.answer}`);
assert.ok(read('app-v231-print-test-fix.js').includes('よみ：${stage.reading||\'\'}${stage.okuri||\'\'}'));
assert.ok(read('index.html').includes('app-v235-paper-pdf.js?v=20260923-vertical'));
const requested=[];
ctx.expectedStrokes=async ch=>{requested.push(ch);return [[{x:0,y:0},{x:109,y:109}]];};
ctx.jBBox=()=>({x:0,y:0,w:109,h:109});ctx.jShapeScore=()=>100;ctx.jCountScore=()=>100;ctx.jOrderInfo=()=>({score:100});
async function main(){
  api.answers.forEach((a,i)=>{a.strokes=stages[i].chars.map(()=>[[{x:0,y:0},{x:520,y:520}]]);a.okuriChoice=stages[i].okuri||'';});
  api.answers[4].okuriChoice='うし';
  await api.submitTest();
  assert.equal(api.answers[4].result.pass,false,'申 + wrong suffix must fail');
  assert.equal(api.answers[4].result.okuriOK,false);
  assert.equal(JSON.parse(stored).printTestsV230['2026-09-21-p58'].last,9);
  api.answers[4].okuriChoice='し';
  await api.submitTest();
  assert.equal(api.answers[4].result.pass,true,'申 + し is accepted with printed こむ');
  assert.ok(requested.includes('申')&&!requested.includes('込'));
  saved=JSON.parse(stored);
  assert.equal(saved.printTestsV230['2026-09-21-p58'].last,10);
  assert.equal(saved.printTestsV230['2026-09-21-p58'].runs,2);
  assert.deepEqual(saved.printTestsV230['2026-09-previous'],oldSave.printTestsV230['2026-09-previous']);
  assert.deepEqual(saved.kanken9V280,oldSave.kanken9V280);
  assert.deepEqual(saved.specialItemsV234,oldSave.specialItemsV234);
  for(const name of ['data-packs.js','app-v10.js','app-v11-patch.js'])assert.ok(read('index.html').includes(`${name}?v=20260921`));
  console.log('PASS p58: exact ten questions, printed こむ, no answer leakage, old pack and scores, completion isolation, correct/wrong suffix grading, Kanken and rewards retained.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
