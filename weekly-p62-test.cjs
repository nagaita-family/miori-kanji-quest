// Lightweight regression for the current p62 school pack.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));

assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-09-26-p62');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-09-26-p62');
assert.equal(run('KANJI_PACKS.length'),3);
assert.equal(run("KANJI_PACKS.find(p=>p.id==='2026-09-21-p58').status"),'past');
assert.equal(run("KANJI_PACKS.find(p=>p.id==='2026-09-21-p58').schoolTest.length"),10);
assert.equal(run("kanjiTestHistory().find(x=>x.testNo===14).score"),85);

const stages=JSON.parse(run('JSON.stringify(QUEST_STAGES)'));
assert.equal(stages.length,10);
assert.deepEqual(stages.map(s=>s.answer+(s.okuri||'')),['客様','入学式','去年','二倍','毛筆','銀行','去る','筆','題名','横']);
assert.deepEqual(stages.map(s=>s.before+s.reading+(s.okuri||'')+s.after),[
  'おきゃくさまをもてなす。','にゅうがくしきの日。','きょねんの秋。','にばいの大きさ。','もうひつの書物。',
  'ぎんこうのそば。','きせつがさる。','ふでをにぎる。','本のだいめい。','よこ書きで字を書く。'
]);
for(const s of stages){
  assert.equal(s.chars.map(c=>c.char).join(''),s.answer);
  assert.equal(s.readingParts.join(''),s.reading);
  if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}

const school=JSON.parse(run('JSON.stringify(currentKanjiPack().schoolTest)'));
assert.equal(school.length,10);
assert.deepEqual(school.map(q=>q.map(x=>x.text).join('')),[
  'おきゃくさまをもてなす。','にゅうがくしきのひ。','きょねんのあき。','にばいのおおきさ。','もうひつのしょもつ。',
  'ぎんこうのそば。','きせつがさる。','ふでをにぎる。','ほんのだいめい。','よこがきでじをかく。'
]);
const targets=school.flat().filter(x=>x.lineType);
assert.equal(targets.length,18);
assert.equal(targets.filter(x=>x.lineType==='straight').length,14);
assert.equal(targets.filter(x=>x.lineType==='wavy').length,4);
assert.deepEqual(school[1].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType]),[
  ['にゅうがくしき','入学式','straight'],['ひ','日','straight']
]);
assert.deepEqual(school[2].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType]),[
  ['きょねん','去年','straight'],['あき','秋','straight']
]);
assert.deepEqual(school[3].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['にばい','二倍','straight',''],['おおきさ','大きさ','wavy','きさ']
]);
assert.deepEqual(school[4].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[
  ['もうひつ','毛筆'],['しょもつ','書物']
]);
assert.deepEqual(school[8].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[
  ['ほん','本'],['だいめい','題名']
]);
assert.deepEqual(school[9].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['よこ','横','straight',''],['がき','書き','wavy','き'],['じ','字','straight',''],['かく','書く','wavy','く']
]);
assert.deepEqual(school[6].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.kanji,x.okuri]),[['さる','去る','wavy','去','る']]);

vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,14,'A4 prints straight lines for new and learned kanji');
assert.equal((paper.match(/print-mark wavy/g)||[]).length,4,'A4 prints wavy lines for targets with okurigana');
assert.ok(paper.includes('>ひ</span>')&&paper.includes('>あき</span>'),'A4 includes learned-kanji readings as marked targets');
assert.ok(paper.includes('>おおきさ</span>')&&paper.includes('>がき</span>')&&paper.includes('>かく</span>'),'A4 includes wavy learned-kanji targets');

for(const file of ['app-v236-school-test.js','app-v204-patch.js','app-v240-release.js']){
  assert.ok(!read(file).includes("ACTIVE_KANJI_PACK_ID==='2026-09-21-p58'"),file+' must not hardcode p58 as the current school pack');
}
assert.ok(read('index.html').includes('data-packs.js?v=20260926-p62-learned'));
assert.ok(read('index.html').includes('app-v236-school-test.js?v=20260926-p62-current'));
console.log('PASS p62: current ten questions, new + learned kanji targets, okurigana line types, A4 marks, p58 history, and generic school flow.');
