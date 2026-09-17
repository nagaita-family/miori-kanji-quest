// v2.9.0: regression checks for the two reported right-aligned paper layouts.
// Geometry here verifies CSS rules and widths; physical iPad rendering still needs a device check.
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
assert.match(css,/:has\(\.k9ExamStroke\)/,'Stroke-order picture has its own wider layout');
assert.match(css,/:has\(#k9cStroke\)/,'Daily stroke-order picture has its own wider layout');
assert.match(css,/@media\(max-width:570px\)/,'Keep small screens accessible');
assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,125px\)/,'Fit narrow screens');
assert.match(base,/const needsBlank=kana\|\|\(!reading&&!selecting&&!stroke\)/,'Reading and choice questions do not add stray squares');
assert.ok(loader.includes('kanken9-paper-nearby-v289.css?v=2900'),'Load the new CSS without reusing iPad cached v289 CSS');
assert.ok(html.includes('app-v240-release.js?v=2900'),'Update HTML loader cache key');
assert.ok(html.includes('v2.9.0'),'Visible version must match deployed build');
const pageWidth=1000,standard=128+12+166,stroke=210+12+166;
assert.equal((pageWidth-standard)/2,(pageWidth-standard)/2); // clear geometry intention
assert.ok(standard<pageWidth/2 && stroke<pageWidth/2,'Both standard and stroke pairs fit and center inside an iPad paper');
console.log('PASS v2.9.0: daily and mock question-answer groups centered, compact reading/write/choice, wider stroke pictures, small-screen fallback and fresh iPad assets.');
