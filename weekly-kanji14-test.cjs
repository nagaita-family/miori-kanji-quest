// Regression: 2026-11-19 photographed kanji 14, upper "書く" ①〜⑩.
// All printed context kanji are separate writing targets, including okurigana.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{
  createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}
}});
const run=expression=>vm.runInContext(expression,ctx);
for(const file of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(file));
const id='2026-11-19-kanji14-p31';
assert.equal(run('CURRENT_KANJI_PACK_ID'),id);
assert.equal(run('ACTIVE_KANJI_PACK_ID'),id);
assert.equal(run('KANJI_PACKS.length'),11);
const pack=JSON.parse(run('JSON.stringify(currentKanjiPack())'));
assert.equal(pack.status,'current');
assert.equal(pack.testDate,undefined,'Photo provides no future test date');
assert.equal(pack.shortLabel,'漢字14 書く');
assert.equal(pack.stages.length,10);
assert.equal(pack.schoolTest.length,10);
const core=['返す','主語','九州','小屋','根','返事','主な','主','屋上','根気'];
assert.deepEqual(pack.stages.map(s=>s.answer+(s.okuri||'')),core);
const prompts=[
 'ほんをよみかえす。','ぶんのしゅごをさがす。','きゅうしゅうへいく。',
 'こやをたてる。','きのねっこがはる。','おおきくへんじをする。',
 'おもなメンバー。','やぬしがでかける。','ビルのおくじょう。','こんきよくつづける。'
];
assert.deepEqual(pack.schoolTest.map(q=>q.map(s=>s.text).join('')),prompts,
 'Exactly transcribe the pictured upper ten questions');
const lines=pack.schoolTest.map(q=>q.filter(s=>s.lineType));
const expected=[
 ['本','読み','返す'],['文','主語'],['九州','行く'],['小屋'],
 ['木','根'],['大きく','返事'],['主'],['家','主','出かける'],
 ['屋上'],['根気']
];
assert.deepEqual(lines.map(q=>q.map(s=>s.answer)),expected,
 'Every printed context kanji is a separate target, not just the blue blanks');
assert.deepEqual(lines.map(q=>q.map(s=>s.lineType)),[
 ['straight','wavy','wavy'],['straight','straight'],['straight','wavy'],
 ['straight'],['straight','straight'],['wavy','straight'],
 ['straight'],['straight','straight','wavy'],['straight'],['straight']
]);
const targets=lines.flat();
assert.equal(targets.length,18);
assert.equal(targets.filter(x=>x.lineType==='straight').length,13);
assert.equal(targets.filter(x=>x.lineType==='wavy').length,5);
assert.deepEqual(targets.filter(x=>x.lineType==='wavy').map(x=>[x.text,x.answer,x.kanji,x.okuri]),[
 ['よみ','読み','読','み'],['かえす','返す','返','す'],
 ['いく','行く','行','く'],['おおきく','大きく','大','きく'],
 ['でかける','出かける','出','かける']
]);
assert.deepEqual(lines[7].map(x=>x.text),['や','ぬし','でかける'],
 '家主（やぬし）は家と主を別々に書き、出かけるも書く');
assert.equal(lines[6][0].answer,'主');
assert.equal(pack.schoolTest[6].at(-1).text,'なメンバー。',
 '主なの「な」は写真で印刷済みなので学校では空欄を増やさない');
for(const s of pack.stages){
 assert.equal(s.chars.map(c=>c.char).join(''),s.answer);
 assert.equal(s.readingParts.join(''),s.reading);
 if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}
assert.deepEqual(pack.bonusWords,[],'Unseen, cropped lower section must not be invented');
assert.match(pack.bonusNote,/写真下端/);
assert.equal(run("kanjiPackById('2026-11-10-ch10-p30').status"),'past');
assert.equal(run("kanjiPackById('2026-11-07-test6-p23').status"),'past');
assert.equal(run("kanjiTestHistory().find(x=>x.testNo===14).score"),85,
 'Previously returned historical Test 14 must not be overwritten by page 14');
run(read('app-v235-paper-pdf.js'));
const print=ctx.window.weeklyPaperHtmlV235(pack.stages);
assert.equal((print.match(/print-mark straight/g)||[]).length,13);
assert.equal((print.match(/print-mark wavy/g)||[]).length,5);
for(const item of expected.flat())assert.ok(!print.includes('>'+item+'<'),'Answer exposed in A4: '+item);
const school=read('app-v236-school-test.js');
assert.match(school,/schoolTargets3V236/,'Three-target questions have landscape sizing');
assert.match(school,/fitSchoolFocusV236/,'Landscape fit must be applied');
assert.match(school,/body.style.overflow='auto'/,'Overflow fallback must not clip a target');
assert.match(school,/schoolControlV236\{grid-column:1;grid-row:2/,
 'Landscape controls must stay on the lower row');
const index=read('index.html');
assert.match(index,/data-packs\.js\?v=20261114-ch10-deployfix&amp;fix=20261119-kanji14/);
assert.match(index,/pwa-update-v303\.js\?v=20261114-ch10-deployfix&amp;fix=20261116&amp;week=20261119-kanji14/);
assert.equal(JSON.parse(read('app-version.json')).build,'20261119.1');
console.log('PASS kanji14: 10 photographed questions, 18 targets (13 straight, 5 wavy), context, okurigana, A4, iPad controls, old records, PWA.');
