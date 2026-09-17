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
for(const name of ['kanken9-data-v280.js','kanken9-island-v280.js'])assert.ok(loader.includes(name),`${name} must be loaded`);
assert.ok(!html.includes('<script src="./app-v233-polish.js'), 'Known-observer-loop file must not be loaded');
assert.ok(!fs.readFileSync('kanken9-island-v280.js','utf8').includes('MutationObserver'),'Do not add an observer to island');
assert.ok(fs.existsSync('kanken9-island-v280.css'),'Island CSS must exist');
console.log('PASS: grade 1 (80) + grade 2 (160), 240 unique questions, grade-appropriate contexts, loader and observer safety.');
