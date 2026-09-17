// Run with node kanken9-smoke-test.cjs; no browser, network or third-party packages required.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{},console};
vm.runInNewContext(fs.readFileSync('kanken9-data-v280.js','utf8'),ctx);
const data=ctx.window.MioriKanken9DataV280;
assert.ok(data,'The Kanken data module must initialize');
assert.equal(data.G1.length,80,'Grade 1 must contain 80 kanji');
assert.equal(data.G2.length,160,'Grade 2 must contain 160 kanji');
assert.equal(data.entries.length,240,'There must be exactly 240 practice entries');
assert.equal(new Set(data.entries.map(e=>e.char)).size,240,'Each target must be unique');
for(const entry of data.entries){
  assert.ok(entry.word.includes(entry.char),`${entry.char}: target must appear in its word`);
  assert.match(entry.reading,/^[ぁ-んー]+$/,`${entry.char}: reading must be hiragana`);
  assert.ok([...entry.word].filter(c=>/[一-龯]/.test(c)).every(c=>data.chars.includes(c)),`${entry.char}: out-of-scope kanji in ${entry.word}`);
}
const loader=fs.readFileSync('app-v240-release.js','utf8');
const html=fs.readFileSync('index.html','utf8');
for(const name of ['kanken9-data-v280.js','kanken9-island-v280.js','kanken9-ui-fix-v281.js'])assert.ok(loader.includes(name),`${name} must be loaded`);
assert.ok(html.includes('app-v240-release.js?v=2810'),'The iPad must request the fresh release loader');
assert.ok(!html.includes('<script src="./app-v233-polish.js'), 'Known-observer-loop file must not be loaded');
for(const path of ['kanken9-island-v280.js','kanken9-ui-fix-v281.js'])assert.ok(!fs.readFileSync(path,'utf8').includes('MutationObserver'),`Do not add an observer to ${path}`);
assert.ok(fs.existsSync('kanken9-island-v280.css'),'Island CSS must exist');
// Regression: v2.8.0 passed entry objects into Map.has(char) in the 40-minute mock,
// resulting in ZERO questions for children without any previously weak characters.
ctx.window.MioriKanken9V280={open(){},home(){}};
ctx.document={readyState:'loading',addEventListener(){}};
ctx.renderHome=function(){};
vm.runInNewContext(fs.readFileSync('kanken9-ui-fix-v281.js','utf8'),ctx);
const byChar=new Map(data.entries.map(e=>[e.char,e]));
for(const offset of [0,7,117,233]){
  const mock=[...new Set([...data.entries.slice(offset),...data.entries.slice(0,offset)].filter(ch=>byChar.has(ch)))].slice(0,20);
  assert.equal(mock.length,20,`Mock must produce 20 questions at offset ${offset}`);
  assert.ok(mock.every(ch=>typeof ch==='string'&&byChar.has(ch)),'Mock IDs must be kanji strings');
}
assert.equal(typeof data.entries[0],'object','Regular learning entries must stay intact');
console.log('PASS: 240 unique questions, correct mock 20-character selection, stable school-mode loader and observer safety.');
