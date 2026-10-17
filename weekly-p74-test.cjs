// p74 (教材74ページ) current upper school test regression.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx=vm.createContext({window:{},console,document:{createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById(){return null}}});
const run=code=>vm.runInContext(code,ctx);
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])run(read(f));
assert.equal(run('CURRENT_KANJI_PACK_ID'),'2026-10-17-p74');
assert.equal(run('ACTIVE_KANJI_PACK_ID'),'2026-10-17-p74');
assert.equal(run('KANJI_PACKS.length'),6);
assert.equal(run("kanjiPackById('2026-10-10-p70').status"),'past');
const stages=JSON.parse(run('JSON.stringify(QUEST_STAGES)'));
assert.equal(stages.length,10);
assert.deepEqual(stages.map(s=>s.answer+(s.okuri||'')),["鉄板","電柱","油田","空港","板","柱","油","港","部分","押さえる"]);
assert.deepEqual(stages.map(s=>s.before+s.reading+(s.okuri||'')+s.after),["てっぱんでふたをする。","太いでんちゅう。","ゆでんをほる。","くうこう行きのバス。","木のいたを切る。","はしらを立てる。","あぶらでいためる。","みなとから船が出る。","漢字をぶぶんにわける。","ペンをおさえる。"]);
for(const s of stages){
 assert.equal(s.chars.map(x=>x.char).join(''),s.answer);
 assert.equal(s.readingParts.join(''),s.reading);
 if(s.okuri)assert.ok(s.okuriChoices.includes(s.okuri));
}
const school=JSON.parse(run('JSON.stringify(currentKanjiPack().schoolTest)'));
assert.deepEqual(school.map(q=>q.map(x=>x.text).join('')),["てっぱんでふたをする。","ふといでんちゅう。","ゆでんをほる。","くうこういきのバス。","きのいたをきる。","はしらをたてる。","あぶらでいためる。","みなとからふねがでる。","かんじをぶぶんにわける。","ペンをおさえる。"]);
const targets=school.flat().filter(x=>x.lineType);
assert.equal(targets.length,18);
assert.equal(targets.filter(x=>x.lineType==='straight').length,12);
assert.equal(targets.filter(x=>x.lineType==='wavy').length,6);
for(const [question,expected] of [[1,["太い","電柱"]],[3,["空港","行き"]],[4,["木","板","切る"]],[5,["柱","立てる"]],[7,["港","船","出る"]],[8,["漢字","部分"]],[9,["押さえる"]]]){
 assert.deepEqual(school[question].filter(x=>x.lineType).map(x=>x.answer),expected);
}
assert.equal(school[9].find(x=>x.lineType).okuri,'さえる');
vm.runInContext(read('app-v235-paper-pdf.js'),ctx);
const paper=ctx.window.weeklyPaperHtmlV235(stages);
assert.equal((paper.match(/print-mark straight/g)||[]).length,12);
assert.equal((paper.match(/print-mark wavy/g)||[]).length,6);
const ui=read('app-v236-school-test.js');
assert.match(ui,/querySelectorAll\('canvas\[data-k\]'\)/);
assert.match(ui,/answers\[q\]\[targetK\]/);
assert.match(ui,/@media \(orientation:landscape\) and \(min-width:700px\) and \(max-height:900px\)/);
assert.ok(read('index.html').includes('data-packs.js?v=20261017-p74'));
assert.match(ui,/Landscape worksheet: reserve a real footer/);
assert.match(ui,/position:absolute;left:4px;right:4px;bottom:4px/,'iPad writing buttons have a viewport-anchored footer');
assert.match(ui,/function fitSchoolFocusV236\(el\)/,'overflowing multi-target questions are fitted');
assert.match(ui,/flow\.scrollWidth<=flow\.clientWidth/,'column overflow is measured instead of silently clipped');
assert.match(ui,/requestAnimationFrame\(\(\)=>fitSchoolFocusV236\(el\)\)/,'fit runs when each question opens');
assert.ok(read('index.html').includes('app-v236-school-test.js?v=20261017-stroke-fit2'),'iPad home-screen cache is busted');
console.log('PASS p74: ten prompts, 18 learned-kanji targets, 6 okurigana targets, A4, Pencil layout, and previous-pack isolation.');
