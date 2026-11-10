// Regression for 2026-11-10 光3・下 24–30, ちいちゃんのかげおくり②.
// Only the top ten blue boxes are writing targets; lower words are bonus only.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{
  createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}
}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));
const id='2026-11-10-ch10-p30';
assert.equal(run('CURRENT_KANJI_PACK_ID'),id);
assert.equal(run('ACTIVE_KANJI_PACK_ID'),id);
assert.equal(run('KANJI_PACKS.length'),10);
const pack=JSON.parse(run('JSON.stringify(currentKanjiPack())'));
assert.equal(pack.status,'current');assert.equal(pack.testDate,undefined);
assert.equal(pack.stages.length,10);assert.equal(pack.schoolTest.length,10);
const answers=['暑い','寒い','軽い','命','第一','暑中','寒','軽食','命','太陽'];
const prompts=['あついひがつづく。','さむいきせつ。','かばんがかるい。','おさないいのち。','だいいちにかんがえる。','しょちゅうみまいをかく。','かんぷうがふきつける。','けいしょくをとる。','めいれいにしたがう。','たいようがでてくる。'];
assert.deepEqual(pack.stages.map(s=>s.answer+(s.okuri||'')),answers);
assert.deepEqual(pack.schoolTest.map(q=>q.map(seg=>seg.text).join('')),prompts);
const lines=pack.schoolTest.map(q=>q.filter(s=>s.lineType));
assert.deepEqual(lines.map(q=>q.map(seg=>seg.answer)),answers.map(a=>[a]));
assert.equal(lines.flat().filter(s=>s.lineType==='wavy').length,3);
assert.equal(lines.flat().filter(s=>s.lineType==='straight').length,7);
assert.deepEqual(lines.flat().filter(s=>s.lineType==='wavy').map(s=>[s.answer,s.kanji,s.okuri]),
 [['暑い','暑','い'],['寒い','寒','い'],['軽い','軽','い']]);
assert.deepEqual([lines[6][0].answer,lines[8][0].answer],['寒','命'],
 '寒風の「風」、命令の「れい」は書く欄ではない');
assert.equal(pack.schoolTest.flat().filter(s=>s.lineType).length,10,
 'Printed surrounding characters must not become additional targets');
for(const s of pack.stages){
 assert.equal(s.readingParts.join(''),s.reading);
 assert.equal(s.chars.map(c=>c.char).join(''),s.answer);
 if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}
assert.deepEqual(pack.bonusWords.map(x=>x.answer),
 ['残暑','寒中','軽石','命中','落第','猛暑','寒空','軽油','生命','陽気']);
assert.equal(run("kanjiPackById('2026-11-07-test6-p23').status"),'past');
assert.equal(run("kanjiPackById('2026-10-31-p82').status"),'past');
vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const html=ctx.window.weeklyPaperHtmlV235(pack.stages);
assert.equal((html.match(/print-mark straight/g)||[]).length,7);
assert.equal((html.match(/print-mark wavy/g)||[]).length,3);
for(const answer of answers)assert.ok(!html.includes('>'+answer+'<'),'Answer exposed: '+answer);
const index=read('index.html');
assert.ok(index.includes('data-packs.js?v=20261110-ch10'));
assert.ok(index.includes('pwa-update-v303.js?v=20261110-ch10'));
assert.equal(JSON.parse(read('app-version.json')).build,'20261110.1');
console.log('PASS ch10: 10 photo-verified boxes, 7 straight + 3 wavy, bonus excluded, historical data, A4 and PWA.');
