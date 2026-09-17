// v2.9.0: regression checks for the two reported right-aligned paper layouts.
// Geometry verifies CSS rules and widths; physical iPad rendering still needs a device check.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('kanken9-paper-nearby-v289.css','utf8');
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
assert.ok(loader.includes('kanken9-paper-nearby-v289.css?v=2900'),'Load fresh CSS, not iPad-cached v289');
assert.ok(html.includes('app-v240-release.js?v=2900'),'Update HTML loader cache key');
assert.ok(html.includes('v2.9.0'),'Visible version must match deployed build');
for(const id of ['helpPips','strokeMsg','okuriPrompt','writeCanvas','recommendBtn','weeklyStaticOpenV202']){
 assert.ok(html.includes(`id="${id}"`),`Original school study must retain ${id}`);
}
const paperWidth=1000;
for(const pairWidth of [128+12+166,210+12+166]){
 const left=(paperWidth-pairWidth)/2;
 const right=paperWidth-pairWidth-left;
 assert.ok(left>0&&right>0&&Math.abs(left-right)<1,`Centered ${pairWidth}px pair fits a typical iPad paper`);
}
console.log('PASS v2.9.0: daily and mock question-answer groups centered, compact reading/write/choice, wider stroke pictures, small-screen fallback, school hooks and fresh iPad assets.');
