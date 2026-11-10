// Regression for attached kanji-test6.pdf: only the top ten blue writing boxes.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{
  createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}
}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));
assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-11-10-ch10-p30');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-11-10-ch10-p30');
assert.equal(run('KANJI_PACKS.length'),10);
const pack=JSON.parse(run("JSON.stringify(kanjiPackById('2026-11-07-test6-p23'))"));
assert.equal(pack.status,'past');assert.equal(pack.testDate,undefined,'No invented test date');
assert.equal(pack.stages.length,10);assert.equal(pack.schoolTest.length,10);
const answers=['感想','写生','真相','列車','血','暗い','橋','真心','暗号','歩道橋'];
const readings=['かんそう','しゃせい','しんそう','れっしゃ','ち','くらい','はし','まごころ','あんごう','ほどうきょう'];
const prompts=['かんそうをつたえる。','はなをしゃせいする。','しんそうがあきらかになる。','れっしゃがとおる。','ちがにじむ。','くらいみちをとおる。','ふるいはしをわたる。','まごころをこめる。','あんごうをとく。','ほどうきょうをわたる。'];
assert.deepEqual(pack.stages.map(s=>s.answer+(s.okuri||'')),answers);
assert.deepEqual(pack.schoolTest.map(q=>q.map(seg=>seg.text).join('')),prompts);
const lines=pack.schoolTest.map(q=>q.filter(seg=>seg.lineType));
assert.deepEqual(lines.map(row=>row.map(x=>x.answer)),answers.map(a=>[a]));
assert.deepEqual(lines.map(row=>row[0].text),readings);
assert.equal(lines.flat().filter(seg=>seg.lineType==='straight').length,9);
assert.deepEqual(lines.flat().filter(seg=>seg.lineType==='wavy').map(x=>[x.answer,x.kanji,x.okuri]),[['暗い','暗','い']]);
assert.equal(pack.schoolTest[1][0].text,'はなを');
assert.equal(pack.schoolTest[2][1].text,'があきらかになる。');
assert.equal(pack.schoolTest[3][1].text,'がとおる。');
assert.equal(pack.schoolTest[6][0].text,'ふるい');
assert.equal(pack.schoolTest.flat().filter(seg=>seg.lineType).length,10,'Do not mark contextual kanji as writable');
for(const s of pack.stages){
 assert.equal(s.readingParts.join(''),s.reading);
 assert.equal(s.chars.map(c=>c.char).join(''),s.answer);
 assert.ok(!(s.before+s.after).includes(s.answer));
 if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}
assert.deepEqual(pack.bonusWords.map(b=>b.answer),['理想','書写','写真','行列','血色','暗黒','石橋','真理','安全','鉄橋']);
assert.equal(run("kanjiPackById('2026-10-31-p82').status"),'past');
assert.equal(run("kanjiPackById('2026-10-24-p78').status"),'past');
vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const html=ctx.window.weeklyPaperHtmlV235(pack.stages);
assert.equal((html.match(/print-mark straight/g)||[]).length,9);
assert.equal((html.match(/print-mark wavy/g)||[]).length,1);
for(const answer of answers)assert.ok(!html.includes('>'+answer+'<'),'Answer leak: '+answer);
assert.ok(read('index.html').includes('data-packs.js?v=20261110-ch10'));
assert.ok(read('index.html').includes('pwa-update-v303.js?v=20261110-ch10'));
assert.equal(JSON.parse(read('app-version.json')).build,'20261110.1');
console.log('PASS historical test6: source-verified ten blue boxes, 9 straight + 1 wavy, bonus excluded, history, A4 and PWA.');
