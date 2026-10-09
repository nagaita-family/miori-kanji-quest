// Historical regression for p66 after p70 became current.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));

assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-10-10-p70');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-10-10-p70');
assert.equal(run('KANJI_PACKS.length'),5);
assert.equal(run("KANJI_PACKS.find(p=>p.id==='2026-10-04-p66').status"),'past');

run("useKanjiPack('2026-10-04-p66')");
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

const school=JSON.parse(run("JSON.stringify(kanjiPackById('2026-10-04-p66').schoolTest)"));
assert.equal(school.length,10);
const targets=school.flat().filter(x=>x.lineType);
assert.equal(targets.length,16);
assert.equal(targets.filter(x=>x.lineType==='straight').length,11);
assert.equal(targets.filter(x=>x.lineType==='wavy').length,5);
assert.deepEqual(school[6].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[
  ['がっこう','学校'],['しゅうごう','集合']
]);

run("CURRENT_KANJI_PACK_ID='2026-10-04-p66';useKanjiPack(CURRENT_KANJI_PACK_ID)");
vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,11);
assert.equal((paper.match(/print-mark wavy/g)||[]).length,5);

const schoolUi=read('app-v236-school-test.js');
assert.match(schoolUi,/書き順も見てみよう/);
assert.match(schoolUi,/@media \(orientation:landscape\) and \(max-height:900px\)/);
assert.ok(read('index.html').includes('data-packs.js?v=20261010-p70'));
assert.ok(read('index.html').includes('app-v236-school-test.js?v=20261004-ipad-landscape'));
console.log('PASS p66 historical: ten questions, learned-kanji targets, A4 marks, and school review UX remain intact.');
