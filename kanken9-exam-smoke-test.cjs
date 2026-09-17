// node kanken9-exam-smoke-test.cjs — no network or third-party packages.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{},console};
vm.runInNewContext(fs.readFileSync('kanken9-data-v280.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('kanken9-exam-data-v283.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('kanken9-exam-finalize-v283.js','utf8'),ctx);
const source=ctx.window.MioriKanken9DataV280,exam=ctx.window.MioriKankenPaperV283Data;
assert.ok(exam,'Paper questions must load');
const expected=[['I',26,1],['II',10,1],['III',8,1],['IV',10,1],['V',6,1],['VI',10,2],['VII',10,2],['VIII',25,2]];
assert.equal(exam.questions.length,105);
assert.equal(exam.total,150);
assert.equal(new Set(exam.questions.map(q=>q.id)).size,105,'Unique question IDs');
for(const [key,count,point] of expected){
  const items=exam.groups[key];assert.equal(items.length,count,`Section ${key} question count`);
  assert.ok(items.every(q=>q.point===point&&q.id&&q.number>0),`Section ${key} point value and number`);
}
assert.equal(exam.questions.reduce((sum,q)=>sum+q.point,0),150,'Sample section distribution must total 150');
assert.equal(new Set(exam.questions.filter(q=>q.section==='VIII').map(q=>q.target)).size,25,'25 distinct writing targets');
for(const q of exam.questions){
  assert.ok(q.answer,'No item has an empty answer');
  if(q.target)assert.ok(source.chars.includes(q.target),`${q.id} answer is outside 240-char curriculum: ${q.target}`);
  if(q.kind==='read'){
    assert.ok(q.text.includes(q.target),`${q.id}: underline target missing`);
    const item=source.entries.find(e=>e.char===q.target&&e.word===q.target);
    assert.ok(item,`${q.id}: reading target must be an isolated kanji`);
    assert.equal(q.answer,item.reading,`${q.id}: isolated kanji reading must match source data`);
  }
  if(q.kind==='write'){
    assert.equal(q.answer,q.target,`${q.id}: writing target mismatch`);
    assert.ok(!q.text.includes(q.target),`${q.id}: do not print the writing answer in its prompt`);
  }
  if(q.kind==='bank')assert.ok(q.options.includes(q.answer),`${q.id}: word bank omits correct answer`);
  if(q.kind==='shape')assert.ok(q.options.includes(q.answer)&&q.options.length===2,`${q.id}: shape choices invalid`);
  if(q.kind==='stroke'){
    assert.ok(q.strokes.length>=Number(q.answer),`${q.id}: highlighted stroke does not exist`);
    assert.ok(q.strokes.every(s=>/^M[\d\sHVQL,.-]+$/.test(s)),`${q.id}: invalid SVG stroke path`);
  }
}
const readTargets=new Set(exam.questions.filter(q=>q.kind==='read').map(q=>q.target));
assert.ok(exam.questions.filter(q=>q.kind==='write').every(q=>!readTargets.has(q.target)),'No same-character reading followed by written recall');
const css=fs.readFileSync('kanken9-exam-v283.css','utf8');
assert.ok(css.includes('100dvh')&&css.includes('touch-action:none')&&css.includes('.k9ExamFooter'),'Responsive Pencil view and stable navigation are required');
const loader=fs.readFileSync('app-v240-release.js','utf8');
for(const name of ['kanken9-exam-data-v283.js','kanken9-exam-finalize-v283.js','kanken9-exam-screen-v283.js','kanken9-exam-v283.js'])assert.ok(loader.includes(name),`Loader is missing ${name}`);
assert.ok(!fs.readFileSync('kanken9-exam-v283.js','utf8').includes('MutationObserver'),'Avoid previous observer-loop bug');
assert.ok(fs.existsSync('kanken9-exam-v283.css'));
const nodes={};const deferred=[];
const app={appendChild(el){nodes[el.id]=el;}};
ctx.document={readyState:'loading',getElementById(id){return id==='app'?app:nodes[id]||null;},createElement(tag){return {tag,id:'',className:'',innerHTML:'',handlers:{},classList:{remove(){}},addEventListener(event,cb){this.handlers[event]=cb;}};},addEventListener(){}};
ctx.window.MioriKanken9V280={open(){return true;}};
ctx.window.confirm=()=>true;ctx.showScreen=id=>assert.ok(nodes[id],`showScreen target ${id} must exist`);
ctx.queueMicrotask=cb=>deferred.push(cb);ctx.persist=()=>{};ctx.save={};
vm.runInNewContext(fs.readFileSync('kanken9-exam-screen-v283.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('kanken9-exam-v283.js','utf8'),ctx);
const api=ctx.window.MioriKankenPaperV283;
assert.ok(api,'New exam API must be exposed');
assert.equal(api.selectQuestions('mini').length,15,'Mini test size');
assert.equal(api.selectQuestions('mini').reduce((sum,q)=>sum+q.point,0),21,'Mini score maximum');
assert.equal(api.selectQuestions('full').length,105,'Full mock size');
api.open('mini');deferred.splice(0).forEach(cb=>cb());
const page=nodes.kankenPaperV283;
assert.ok(page.innerHTML.includes('15問 おためしテスト'),'Intro must render on first visit without throwing');
page.handlers.click({target:{closest(){return {dataset:{paper:'start'}};}}});
assert.ok(page.innerHTML.includes('下線の漢字'),'First question renders after starting');
page.handlers.click({target:{closest(){return {dataset:{paper:'next'}};}}});
assert.ok(page.innerHTML.includes('2 / 15'),'Next-question navigation must work');
console.log('PASS: original eight-section distribution 105 questions / 150 points, 15-question mini, kanji/reading checks, no answer leakage, Pencil view, cold-start and navigation.');
