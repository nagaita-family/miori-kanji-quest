// Regression for photo-verified textbook p82 (2026-10-31).
// Only blue writing boxes are test targets: straight = kanji; wavy = kanji+okurigana.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = path => fs.readFileSync(path, 'utf8');
const ctx = vm.createContext({window:{},console,document:{
  createElement:()=>({textContent:''}),
  head:{appendChild(){}},
  getElementById(){return null}
}});
const run = code => vm.runInContext(code,ctx);
for (const file of ['data-v10.js','data-v11-patch.js','data-packs.js']) run(read(file));
assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-10-31-p82');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-10-31-p82');
assert.equal(run('KANJI_PACKS.length'),8);
const pack = JSON.parse(run('JSON.stringify(currentKanjiPack())'));
assert.equal(pack.status,'current');
assert.equal(pack.stages.length,10);
assert.equal(pack.schoolTest.length,10);
const targetAnswers=['勝負','車庫','電波','放送','勉強','勝つ','波','放つ','決まる','画面'];
const targetReadings=['しょうぶ','しゃこ','でんぱ','ほうそう','べんきょう','かつ','なみ','はなつ','きまる','がめん'];
const fullPrompts=[
 'しょうぶをする。','しゃこのくるま。','でんぱがとどく。','ほうそうがながれる。',
 'べんきょうがはかどる。','しあいにかつ。','かぜがふいてなみがたつ。',
 'やをはなつ。','げきのやくがきまる。','がめんをよくみる。'
];
const answerSegments=pack.schoolTest.map(question=>question.filter(seg=>seg.lineType));
assert.deepEqual(answerSegments.map(a=>a.map(seg=>seg.answer)),targetAnswers.map(answer=>[answer]));
assert.deepEqual(answerSegments.map(a=>a[0].text),targetReadings);
assert.deepEqual(pack.schoolTest.map(q=>q.map(seg=>seg.text).join('')),fullPrompts);
assert.equal(answerSegments.flat().filter(seg=>seg.lineType==='straight').length,7);
assert.deepEqual(answerSegments.flat().filter(seg=>seg.lineType==='wavy').map(seg=>[seg.answer,seg.kanji,seg.okuri]),[
 ['勝つ','勝','つ'],['放つ','放','つ'],['決まる','決','まる']
]);
assert.equal(pack.schoolTest[8][0].text,'げきのやくが');
assert.equal(pack.schoolTest[8][0].lineType,undefined,'The contextual 劇 is not writable');
assert.equal(pack.schoolTest[8].filter(seg=>seg.lineType).length,1);
assert.equal(pack.schoolTest[9][0].answer,'画面');
assert.equal(pack.schoolTest[9][0].text,'がめん');
assert.ok(!pack.schoolTest.flat().some(seg=>seg.answer==='劇'||seg.answer==='仮面'));
assert.deepEqual(pack.stages.map(s=>s.answer+(s.okuri||'')),targetAnswers);
for (const stage of pack.stages) {
 assert.equal(stage.chars.map(c=>c.char).join(''),stage.answer);
 assert.equal(stage.readingParts.join(''),stage.reading);
 assert.ok(!stage.before.includes(stage.answer),'Do not reveal the answer in the prompt');
 if(stage.okuri) assert.ok(stage.okuriChoices.includes(stage.okuri));
}
assert.equal(pack.stages[8].before,'げきのやくが');
assert.equal(pack.stages[8].reading+pack.stages[8].okuri,'きまる');
assert.equal(pack.stages[9].reading,'がめん');
assert.equal(pack.stages[9].answer,'画面');
assert.equal(pack.stages[9].after,'をよく見る。');
assert.equal(run("kanjiPackById('2026-10-24-p78').status"),'past');
vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(pack.stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,7);
assert.equal((paper.match(/print-mark wavy/g)||[]).length,3);
for(const ans of targetAnswers)assert.ok(!paper.includes('>'+ans+'<'),'No answers on print sheet: '+ans);
assert.ok(read('index.html').includes('data-packs.js?v=20261031-p82-corrected'));
console.log('PASS p82: ten photo-verified targets, 7 straight + 3 wavy, contextual 劇 excluded, 決まる and 画面 corrected; A4 sheet, history and cache.');
