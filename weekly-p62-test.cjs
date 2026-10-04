// Historical regression for the p62 school pack after p66 became current.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));

assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-10-04-p66');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-10-04-p66');
assert.equal(run('KANJI_PACKS.length'),4);
assert.equal(run("KANJI_PACKS.find(p=>p.id==='2026-09-26-p62').status"),'past');
assert.equal(run("KANJI_PACKS.find(p=>p.id==='2026-09-26-p62').schoolTest.length"),10);
assert.equal(run("kanjiTestHistory().find(x=>x.testNo===14).score"),85);

run("useKanjiPack('2026-09-26-p62')");
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

const school=JSON.parse(run("JSON.stringify(kanjiPackById('2026-09-26-p62').schoolTest)"));
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
assert.deepEqual(school[9].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['よこ','横','straight',''],['がき','書き','wavy','き'],['じ','字','straight',''],['かく','書く','wavy','く']
]);

run("useKanjiPack('2026-09-26-p62')");
vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,14);
assert.equal((paper.match(/print-mark wavy/g)||[]).length,4);

for(const file of ['app-v236-school-test.js','app-v204-patch.js','app-v240-release.js']){
  assert.ok(!read(file).includes("ACTIVE_KANJI_PACK_ID==='2026-09-21-p58'"),file+' must not hardcode p58 as the current school pack');
}
assert.ok(read('index.html').includes('data-packs.js?v=20261004-p66'));
assert.ok(read('index.html').includes('app-v236-school-test.js?v=20261004-stroke-order'));
console.log('PASS p62 historical: ten questions, learned-kanji targets, A4 lines, p58 history, and generic school flow remain intact.');
