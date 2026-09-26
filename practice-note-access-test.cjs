// Regression: practice notebook must be reachable without a detected mistake, including multi-kanji words.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const note=read('app-v270-practice-note.js');
const release=read('app-v240-release.js');
const html=read('index.html');

assert.match(note,/practiceAnyV271/,'Challenge screen has an always-visible practice entry');
assert.match(note,/openNotebookV270\(charIndex,st\.chars\.map\(\(_,i\)=>i\),true\)/,'Challenge entry practices every kanji in the current word');
assert.match(note,/b\.onclick=\(\)=>openNotebookV270\(target,queue,true\)/,'Review/result entry can open voluntarily');
assert.match(note,/recommended\?\[index\]:st\.chars\.map\(\(_,i\)=>i\)/,'Voluntary review practice includes every kanji while adaptive recommendations stay focused');
assert.match(note,/force\|\|stageNeedsV270\.has\(i\)/,'Voluntary notebook access does not require adaptive need state');
assert.match(note,/open:\(i=0\)=>openNotebookV270\(i,\[i\],true\)/,'Public practice API is ungated');
assert.match(note,/判定に関係なく、いつでも書ける/);
assert.match(release,/app-v270-practice-note\.js\?v=2702/,'Fresh practice-note asset is loaded');
assert.match(html,/app-v240-release\.js\?v=2946/,'Fresh loader reaches iPad cache');
console.log('PASS practice-note access: always available and multi-kanji words practice every character.');
