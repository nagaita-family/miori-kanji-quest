// v2.9.4: catch section VI CSS grid collisions that DOM-only tests cannot see.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=name=>fs.readFileSync(name,'utf8');
const base=read('kanken9-layout-v288.css');
const layout=read('kanken9-paper-nearby-v289.css');
const flow=read('kanken9-paper-flow-v291.css');
const loader=read('app-v240-release.js');
const html=read('index.html');
const script=read('kanken9-layout-v288.js');
function rule(sheet,selector){const i=sheet.indexOf(selector);assert.ok(i>=0,'Missing selector: '+selector);return sheet.slice(i,sheet.indexOf('}',i));}
for(const selector of ['#kankenPaperV283 .k9ExamWork.k9v8Fixed>.k9v8Paper','#kankenDailyV287 .k9cWork.k9v8Fixed>.k9v8DailyPaper']){
 const block=rule(layout,selector+'{');assert.match(block,/justify-content:center!important/);assert.match(block,/grid-template-columns:minmax\(0,128px\) minmax\(0,166px\)/);assert.doesNotMatch(block,/justify-content:end/);
}
for(const selector of ['#kankenPaperV283 .k9ExamPage>.k9ExamInstruction','#kankenDailyV287 .k9cPaper>.k9cTitle small']){
 const block=rule(flow,selector);assert.match(block,/writing-mode:vertical-rl!important/);assert.match(block,/right:clamp\(/);
}
assert.match(flow,/grid-template-columns:minmax\(0,92px\) minmax\(0,128px\) minmax\(0,166px\)/);
// An earlier stylesheet uses !important on the question and answer grid-column.
// The VI override must match with MORE class specificity, not merely load later.
for(const [root,work,paper,q,a,example] of [
 ['kankenPaperV283','k9ExamWork','k9v8Paper','k9ExamQuestion','k9v8Answer','k9cPaperExample'],
 ['kankenDailyV287','k9cWork','k9v8DailyPaper','k9cColumns','k9v8DailyAnswer','k9cExample']
]){
 const prefix=`#${root} .${work}.k9v8Fixed>.${paper}.k9v10HasExample>`;
 for(const [element,column] of [[q,2],[a,3],[example,1]]){
  const selector=prefix+`.`+element;
  assert.match(rule(flow,selector),new RegExp(`grid-column:${column}!important`),'VI '+element+' must have its own column');
  const old=`#${root} .${work}.k9v8Fixed .${paper}>.${element}`;
  if(base.includes(old))assert.ok(selector.split('.').length>old.split('.').length,'New '+element+' selector must beat old !important rule');
 }
 assert.ok(base.includes(`#${root} .${work}.k9v8Fixed .${paper}>.${q}`),'Keep guard tied to old conflicting CSS');
}
assert.match(flow,/@media\(max-width:570px\)/);assert.match(flow,/grid-template-rows:auto minmax\(0,1fr\)!important/);
assert.ok(loader.includes('kanken9-paper-flow-v291.css?v=2920'));
assert.ok(html.includes('app-v240-release.js?v=2943')&&html.includes('v2.9.4'));
assert.match(script,/layout\.append\(example\)/,'Example must actually be moved out of text');
for(const id of ['helpPips','strokeMsg','okuriPrompt','writeCanvas','recommendBtn','weeklyStaticOpenV202'])assert.ok(html.includes(`id="${id}"`),'School screen hook: '+id);
console.log('PASS v2.9.4: VI example, question, answer have distinct grid cells with selectors that outrank old !important CSS; paper, cache and school hooks checked.');
