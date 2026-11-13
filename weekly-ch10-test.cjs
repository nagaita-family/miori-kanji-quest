// Regression for 2026-11-10 ぐんぐん下9・10.
// Test includes all printed kanji, including context kanji outside blue boxes. Bonus words excluded.
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
assert.equal(pack.status,'current');assert.equal(pack.testDate,undefined);\nassert.equal(pack.shortLabel,'ぐんぐん下9・10');
assert.equal(pack.stages.length,10);assert.equal(pack.schoolTest.length,10);
const answers=['暑い','寒い','軽い','命','第一','暑中','寒','軽食','命','太陽'];
const prompts=['あついひがつづく。','さむいきせつ。','かばんがかるい。','おさないいのち。','だいいちにかんがえる。','しょちゅうみまいをかく。','かんぷうがふきつける。','けいしょくをとる。','めいれいにしたがう。','たいようがでてくる。'];
assert.deepEqual(pack.stages.map(s=>s.answer+(s.okuri||'')),answers);
assert.deepEqual(pack.schoolTest.map(q=>q.map(seg=>seg.text).join('')),prompts);
const lines=pack.schoolTest.map(q=>q.filter(s=>s.lineType));
const targets=[
 ['暑い','日'],['寒い'],['軽い'],['命'],['第一','考える'],
 ['暑中','書く'],['寒','風'],['軽食'],['命'],['太陽','出てくる']
];
const kinds=[
 ['wavy','straight'],['wavy'],['wavy'],['straight'],['straight','wavy'],
 ['straight','wavy'],['straight','straight'],['straight'],['straight'],['straight','wavy']
];
assert.deepEqual(lines.map(q=>q.map(seg=>seg.answer)),targets,
 'Every printed kanji including context must be writable');
assert.deepEqual(lines.map(q=>q.map(seg=>seg.lineType)),kinds);
assert.equal(lines.flat().filter(s=>s.lineType==='wavy').length,6);
assert.equal(lines.flat().filter(s=>s.lineType==='straight').length,9);
assert.deepEqual(lines.flat().filter(s=>s.lineType==='wavy').map(s=>[s.answer,s.kanji,s.okuri]),[
 ['暑い','暑','い'],['寒い','寒','い'],['軽い','軽','い'],
 ['考える','考','える'],['書く','書','く'],['出てくる','出','てくる']
]);
assert.equal(lines[6][1].text,'ぷう','寒風の風も独立した記入欄');
assert.equal(lines[8].length,1,'命令の「れい」は印刷上ひらがななので追加しない');
assert.equal(pack.schoolTest.flat().filter(s=>s.lineType).length,15,
 'Ten blue boxes plus five printed context kanji');

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
assert.equal((html.match(/print-mark straight/g)||[]).length,9);
assert.equal((html.match(/print-mark wavy/g)||[]).length,6);
for(const answer of targets.flat())assert.ok(!html.includes('>'+answer+'<'),'Answer exposed: '+answer);
const index=read('index.html');
assert.ok(index.includes('data-packs.js?v=20261114-ch10-deployfix'));
assert.ok(index.includes('pwa-update-v303.js?v=20261114-ch10-deployfix'));
assert.equal(JSON.parse(read('app-version.json')).build,'20261114.1');
console.log('PASS ch10: 10 questions, 15 targets including context kanji, 9 straight + 6 wavy, bonus excluded, A4 and history.');
