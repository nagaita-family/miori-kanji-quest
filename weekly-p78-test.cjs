// p78 historical weekly pack: 78-page upper school test and preserved old packs.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));
assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-10-31-p82');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-10-31-p82');
assert.equal(run('KANJI_PACKS.length'),8);
assert.equal(run("kanjiPackById('2026-10-17-p74').status"),'past');
assert.equal(run('currentKanjiPack().testDate'),undefined,'No invented test date');
run("CURRENT_KANJI_PACK_ID='2026-10-24-p78';useKanjiPack(CURRENT_KANJI_PACK_ID)");
const stages=JSON.parse(run('JSON.stringify(QUEST_STAGES)'));
assert.equal(stages.length,10);
assert.deepEqual(stages.map(s=>s.answer+(s.okuri||'')),["目薬","草笛","注意","悪い","人気者","薬局","汽笛","注ぐ","悪事","筆者"]);
assert.deepEqual(stages.map(s=>s.before+s.reading+(s.okuri||'')+s.after),["めぐすりをさす。","くさぶえをふく。","ちゅういして聞く。","体調がわるい。","にんきものになる。","やっきょくで買い物をする。","きてきが聞こえる。","お茶をそそぐ。","あくじが見つかる。","ひっしゃの考え。"]);
for(const s of stages){
 assert.equal(s.chars.map(x=>x.char).join(''),s.answer);
 assert.equal(s.readingParts.join(''),s.reading);
 assert.ok(!(s.before+s.after).includes(s.answer),'No answer before writing');
 if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}
const school=JSON.parse(run('JSON.stringify(currentKanjiPack().schoolTest)'));
assert.deepEqual(school.map(q=>q.map(x=>x.text).join('')),["めぐすりをさす。","くさぶえをふく。","ちゅういしてきく。","たいちょうがわるい。","にんきものになる。","やっきょくでかいものをする。","きてきがきこえる。","おちゃをそそぐ。","あくじがみつかる。","ひっしゃのかんがえ。"]);
const targets=school.flat().filter(x=>x.lineType);
assert.equal(targets.length,18);
assert.equal(targets.filter(x=>x.lineType==='straight').length,11);
assert.equal(targets.filter(x=>x.lineType==='wavy').length,7);
const expected=[["目薬"],["草笛"],["注意","聞く"],["体調","悪い"],["人気者"],["薬局","買い","物"],["汽笛","聞こえる"],["茶","注ぐ"],["悪事","見つかる"],["筆者","考え"]];
for(let i=0;i<10;i++)assert.deepEqual(school[i].filter(x=>x.lineType).map(x=>x.answer),expected[i]);
for(const seg of targets){
 assert.ok(seg.text&&seg.answer);
 assert.ok(['straight','wavy'].includes(seg.lineType));
 if(seg.lineType==='wavy')assert.equal(seg.kanji+seg.okuri,seg.answer);
}
const extras=JSON.parse(run('JSON.stringify(currentKanjiPack().bonusWords)'));
assert.equal(extras.length,10);
assert.deepEqual(extras.map(x=>x.answer),["薬指","口笛","注目","悪人","悪者","薬草","横笛","注文","悪用","学者"]);
vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,11);
assert.equal((paper.match(/print-mark wavy/g)||[]).length,7);
for(const target of targets)assert.ok(!paper.includes('>'+target.answer+'<'),'Printed paper must hide answers');
const ui=read('app-v236-school-test.js');
assert.match(ui,/querySelectorAll\('canvas\[data-k\]'\)/);
assert.match(ui,/answers\[q\]\[targetK\]/);
assert.match(ui,/function fitSchoolFocusV236\(el\)/);
assert.match(ui,/position:absolute;left:4px;right:4px;bottom:4px/);
assert.ok(read('index.html').includes('data-packs.js?v=20261031-p82-corrected'));
console.log('PASS p78: 10 core words, 18 target lines, 7 okurigana, 10 bonus words archived, print and layout checks.');
