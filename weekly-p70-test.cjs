// Lightweight regression for the current p70 upper-half school pack.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));

assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-10-10-p70');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-10-10-p70');
assert.equal(run('KANJI_PACKS.length'),5);
assert.equal(run("KANJI_PACKS.find(p=>p.id==='2026-10-04-p66').status"),'past');

const stages=JSON.parse(run('JSON.stringify(QUEST_STAGES)'));
assert.equal(stages.length,10);
assert.deepEqual(stages.map(s=>s.answer+(s.okuri||'')),[
  '両手','負ける','図書係','全員','祭り','農作業','負う','係る','文化祭','対話'
]);
assert.deepEqual(stages.map(s=>s.before+s.reading+(s.okuri||'')+s.after),[
  'りょうてでおさえる。','ゲームにまける。','としょがかりになる。','ぜんいんが集まる。','まつりの様子。',
  'のうさぎょうをてつだう。','かばんをせおう。','言葉がかかる。','中学校のぶんかさい。','自分とのたいわ。'
]);
for(const s of stages){
  assert.equal(s.chars.map(c=>c.char).join(''),s.answer);
  assert.equal(s.readingParts.join(''),s.reading);
  if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}

const school=JSON.parse(run('JSON.stringify(currentKanjiPack().schoolTest)'));
assert.equal(school.length,10);
assert.deepEqual(school.map(q=>q.map(x=>x.text).join('')),[
  'りょうてでおさえる。','ゲームにまける。','としょがかりになる。','ぜんいんがあつまる。','まつりのようす。',
  'のうさぎょうをてつだう。','かばんをせおう。','ことばがかかる。','ちゅうがっこうのぶんかさい。','じぶんとのたいわ。'
]);
const targets=school.flat().filter(x=>x.lineType);
assert.equal(targets.length,15);
assert.equal(targets.filter(x=>x.lineType==='straight').length,10);
assert.equal(targets.filter(x=>x.lineType==='wavy').length,5);

assert.deepEqual(school[3].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['ぜんいん','全員','straight',''],['あつまる','集まる','wavy','まる']
]);
assert.deepEqual(school[4].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['まつり','祭り','wavy','り'],['ようす','様子','straight','']
]);
assert.deepEqual(school[7].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType,x.okuri||'']),[
  ['ことば','言葉','straight',''],['かかる','係る','wavy','る']
]);
assert.deepEqual(school[8].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[
  ['ちゅうがっこう','中学校'],['ぶんかさい','文化祭']
]);
assert.deepEqual(school[9].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[
  ['じぶん','自分'],['たいわ','対話']
]);

vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,10,'A4 prints p70 straight targets');
assert.equal((paper.match(/print-mark wavy/g)||[]).length,5,'A4 prints p70 okurigana targets');
assert.ok(paper.includes('>あつまる</span>')&&paper.includes('>ようす</span>')&&paper.includes('>ちゅうがっこう</span>'),'A4 includes learned-kanji context targets');

const schoolUi=read('app-v236-school-test.js');
assert.match(schoolUi,/count}か所を1ページで記入/,'All answer boxes remain on one question page');
assert.match(schoolUi,/書き順も見てみよう/,'Answer review keeps stroke order');
assert.match(schoolUi,/@media \(orientation:landscape\) and \(max-height:900px\)/,'iPad landscape no-scroll review stays enabled');

assert.ok(read('index.html').includes('data-packs.js?v=20261010-p70'));
assert.ok(read('index.html').includes('app-v236-school-test.js?v=20261004-ipad-landscape'));
console.log('PASS p70: current upper ten questions, learned-kanji targets, okurigana lines, A4, and school review UX.');
