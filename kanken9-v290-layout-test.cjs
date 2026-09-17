// v2.9.2: check centered paper, vertical directions and actual VI grid specificity.
// These are stylesheet regression checks, not a substitute for physical iPad rendering.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('kanken9-paper-nearby-v289.css','utf8');
const baseCss=fs.readFileSync('kanken9-layout-v288.css','utf8');
const flow=fs.readFileSync('kanken9-paper-flow-v291.css','utf8');
const loader=fs.readFileSync('app-v240-release.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const base=fs.readFileSync('kanken9-layout-v288.js','utf8');
for(const selector of [
 '#kankenPaperV283 .k9ExamWork.k9v8Fixed>.k9v8Paper',
 '#kankenDailyV287 .k9cWork.k9v8Fixed>.k9v8DailyPaper'
]){
 const i=css.indexOf(selector+'{');assert.ok(i>=0,`Missing ${selector}`);
 const rules=css.slice(i,css.indexOf('}',i));
 assert.match(rules,/justify-content:center!important/,`Center entire question-and-answer cluster: ${selector}`);
 assert.match(rules,/grid-template-columns:minmax\(0,128px\) minmax\(0,166px\)/,`Compact text+answer columns: ${selector}`);
 assert.doesNotMatch(rules,/justify-content:end/,`Regression: right aligned ${selector}`);
}
assert.match(css,/:has\(\.k9ExamStroke\)/,'Mock stroke-order picture has a wider layout');
assert.match(css,/:has\(#k9cStroke\)/,'Daily stroke-order picture has a wider layout');
assert.match(css,/@media\(max-width:570px\)/,'Keep small screens accessible');
assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,125px\)/,'Fit narrow screens');
assert.match(base,/const needsBlank=kana\|\|\(!reading&&!selecting&&!stroke\)/,'Reading and choice questions do not add stray squares');
for(const selector of ['#kankenPaperV283 .k9ExamPage>.k9ExamInstruction','#kankenDailyV287 .k9cPaper>.k9cTitle small']){
 const index=flow.indexOf(selector);assert.ok(index>=0,`Vertical instruction selector missing ${selector}`);
 const rule=flow.slice(index,flow.indexOf('}',index));
 assert.match(rule,/position:absolute!important/);
 assert.match(rule,/writing-mode:vertical-rl!important/);
 assert.match(rule,/right:clamp\(/);
}
assert.match(flow,/grid-template-columns:minmax\(0,92px\) minmax\(0,128px\) minmax\(0,166px\)/,'Dedicated VI example/question/answer columns');
// The previous build passed all tests yet overlapped: its VI selectors omitted work.k9v8Fixed,
// so earlier !important grid-column rules from the base sheet won on specificity.
for(const [root,work,paper,question,answer,example] of [
 ['kankenPaperV283','k9ExamWork','k9v8Paper','k9ExamQuestion','k9v8Answer','k9cPaperExample'],
 ['kankenDailyV287','k9cWork','k9v8DailyPaper','k9cColumns','k9v8DailyAnswer','k9cExample']
]){
 const prefix=`#${root} .${work}.k9v8Fixed>.${paper}.k9v10HasExample>`;
 for(const [item,column] of [[question,2],[answer,3],[example,1]]){
  const selector=prefix+`.${item}`;
  const i=flow.indexOf(selector);assert.ok(i>=0,`VI ${item} must override base grid specificity`);
  const block=flow.slice(i,flow.indexOf('}',i));
  assert.match(block,new RegExp(`grid-column:${column}!important`),`VI ${item} must occupy column ${column}`);
 }
 const oldSelector=`#${root} .${work}.k9v8Fixed .${paper}>.${question}`;
 assert.ok(baseCss.includes(oldSelector),'Track the earlier conflicting !important rule');
 assert.ok(prefix.split('.').length>oldSelector.split('.').length,'VI override must have greater class specificity');
}
assert.match(flow,/@media\(max-width:570px\)/,'VI example needs a compact phone fallback');
assert.match(flow,/grid-template-rows:auto minmax\(0,1fr\)!important/,'On phones example uses its own row');
assert.ok(loader.includes('kanken9-paper-nearby-v289.css?v=2900'),'Keep the centered base CSS');
assert.ok(loader.includes('kanken9-paper-flow-v291.css?v=2920'),'Load fixed VI CSS with a new iPad cache key');
assert.ok(loader.includes('kanken9-layout-v288.js?v=2910'),'Preserve tested Pencil DOM logic');
assert.ok(html.includes('app-v240-release.js?v=2920'),'Update HTML loader cache key');
assert.ok(html.includes('v2.9.2'),'Visible version must match deployed build');
for(const id of ['helpPips','strokeMsg','okuriPrompt','writeCanvas','recommendBtn','weeklyStaticOpenV202']){
 assert.ok(html.includes(`id="${id}"`),`Original school study must retain ${id}`);
}
console.log('PASS v2.9.2: VI example, question and Pencil each have a distinct CSS grid lane with sufficient specificity; other paper and school hooks unchanged.');
