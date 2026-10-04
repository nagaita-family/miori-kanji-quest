// Lightweight regression for the current p66 school pack and source-derived targets.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));

assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-10-04-p66');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-10-04-p66');
assert.equal(run('KANJI_PACKS.length'),4);
assert.equal(run("KANJI_PACKS.find(p=>p.id==='2026-09-26-p62').status"),'past');

const stages=JSON.parse(run('JSON.stringify(QUEST_STAGES)'));
assert.equal(stages.length,10);
assert.deepEqual(stages.map(s=>s.answer+(s.okuri||'')),['植物','集める','化石','死ぬ','都合','植える','集合','化ける','死','都会']);
assert.deepEqual(stages.map(s=>s.before+s.reading+(s.okuri||'')+s.after),[
  'しょくぶつの世話をする。','ざいりょうをあつめる。','かせきをほる。','虫がしぬ。','つごうのよい日。',
  '花のなえをうえる。','学校にしゅうごうする。','たぬきがばける。','ひっしに泳ぐ。','とかいのまちなみ。'
]);
for(const s of stages){
  assert.equal(s.chars.map(c=>c.char).join(''),s.answer);
  assert.equal(s.readingParts.join(''),s.reading);
  if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}

const school=JSON.parse(run('JSON.stringify(currentKanjiPack().schoolTest)'));
assert.equal(school.length,10);
assert.deepEqual(school.map(q=>q.map(x=>x.text).join('')),[
  'しょくぶつのせわをする。','ざいりょうをあつめる。','かせきをほる。','むしがしぬ。','つごうのよいひ。',
  'はなのなえをうえる。','がっこうにしゅうごうする。','たぬきがばける。','ひっしにおよぐ。','とかいのまちなみ。'
]);
const targets=school.flat().filter(x=>x.lineType);
assert.equal(targets.length,16);
assert.equal(targets.filter(x=>x.lineType==='straight').length,11);
assert.equal(targets.filter(x=>x.lineType==='wavy').length,5);

assert.deepEqual(school[0].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType]),[
  ['しょくぶつ','植物','straight'],['せわ','世話','straight']
]);
assert.deepEqual(school[3].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['むし','虫','straight',''],['しぬ','死ぬ','wavy','ぬ']
]);
assert.deepEqual(school[4].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[
  ['つごう','都合'],['ひ','日']
]);
assert.deepEqual(school[5].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['はな','花','straight',''],['うえる','植える','wavy','える']
]);
assert.deepEqual(school[6].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[
  ['がっこう','学校'],['しゅうごう','集合']
]);
assert.deepEqual(school[8].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['し','死','straight',''],['およぐ','泳ぐ','wavy','ぐ']
]);

vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,11,'A4 prints straight lines for p66 new + learned kanji');
assert.equal((paper.match(/print-mark wavy/g)||[]).length,5,'A4 prints wavy lines for p66 okurigana targets');
assert.ok(paper.includes('>せわ</span>')&&paper.includes('>がっこう</span>')&&paper.includes('>およぐ</span>'),'A4 includes learned-kanji targets from the textbook sentence');

const schoolUi=read('app-v236-school-test.js');
assert.match(schoolUi,/書き順も見てみよう/,'Answer review shows stroke order');
assert.match(schoolUi,/data-school-stroke/,'Multi-kanji answers expose per-kanji stroke buttons');
assert.match(schoolUi,/playSchoolStrokeV236/,'Answer review animates stroke order');
assert.match(schoolUi,/getKanjiData/,'Stroke order reuses existing KanjiVG data');
assert.match(schoolUi,/setTimeout\(\(\)=>playSchoolStrokeV236\(strokeChars\[0\]\),60\)/,'First kanji stroke order starts automatically during review');

assert.ok(read('index.html').includes('data-packs.js?v=20261004-p66'));
assert.ok(read('index.html').includes('app-v236-school-test.js?v=20261004-ipad-landscape'));
console.log('PASS p66: current ten questions, source-based learned kanji targets, okurigana lines, A4 marks, and stroke-order answer review.');
