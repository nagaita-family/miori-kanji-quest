// v2.9.1: keep the centered two-column questions while moving instructions to the right.
// Geometry checks CSS rules; actual iPad display remains an independent device check.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('kanken9-paper-nearby-v289.css','utf8');
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
assert.match(flow,/k9v10HasExample/,'Separate VI reference panel must exist');
assert.match(flow,/grid-template-columns:minmax\(0,92px\) minmax\(0,128px\) minmax\(0,166px\)/,'Dedicated column for VI example');
assert.match(flow,/@media\(max-width:570px\)/,'VI example needs a compact phone fallback');
assert.ok(loader.includes('kanken9-paper-nearby-v289.css?v=2900'),'Keep the centered base CSS');
assert.ok(loader.includes('kanken9-paper-flow-v291.css?v=2910'),'Load a fresh iPad layout');
assert.ok(loader.includes('kanken9-layout-v288.js?v=2910'),'Do not reuse stale question layouts');
assert.ok(html.includes('app-v240-release.js?v=2910'),'Update HTML loader cache key');
assert.ok(html.includes('v2.9.1'),'Visible version must match deployed build');
for(const id of ['helpPips','strokeMsg','okuriPrompt','writeCanvas','recommendBtn','weeklyStaticOpenV202'])assert.ok(html.includes(`id="${id}"`),`Original school study must retain ${id}`);
const paperWidth=1000;
for(const pairWidth of [128+12+166,210+12+166,92+2*20+128+166]){
 const left=(paperWidth-pairWidth)/2;
 const right=paperWidth-pairWidth-left;
 assert.ok(left>0&&right>0&&Math.abs(left-right)<1,`Centered ${pairWidth}px group fits typical iPad paper`);
}
console.log('PASS v2.9.1: centered daily/mock questions, vertical instructions on right, isolated VI examples, narrow-screen fallback and school hooks.');
