const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=f=>fs.readFileSync(f,'utf8');
const node=()=>({style:{},classList:{add(){},remove(){}},appendChild(){},insertAdjacentElement(){},remove(){}});
const doc={createElement:node,head:{appendChild(){}},querySelector(){return null},getElementById(){return null},addEventListener(){}};
const ctx=vm.createContext({window:{},document:doc,location:{pathname:'/'},console});
for(const f of ['data-v10.js','data-v11-patch.js','data-packs.js'])vm.runInContext(src(f),ctx);
const evalJs=s=>vm.runInContext(s,ctx);
let pack=JSON.parse(evalJs('JSON.stringify(currentKanjiPack().schoolTest)'));
assert.equal(pack.length,10);assert.equal(pack.map(q=>q.map(x=>x.text).join('')).join('|'),'うみでおよぐ。|サッカーのれんしゅうをする。|あにのじょげんをきく。|どうわのえほんをよむ。|てがみでもうしこむ。|しょくひんをうる。|しょうひんをかう。|すいえいきょうしつにかよう。|アイデアをねる。|こねこをたすける。');
const targets=pack.flat().filter(x=>x.lineType);assert.equal(targets.length,20);assert.equal(targets.filter(x=>x.lineType==='wavy').length,9);assert.equal(targets.filter(x=>x.lineType==='straight').length,11);
assert.deepEqual(pack[7].filter(x=>x.lineType).map(x=>[x.text,x.answer,x.lineType]),[['すいえいきょうしつ','水泳教室','straight'],['かよう','通う','wavy']]);
assert.deepEqual(pack[9].filter(x=>x.lineType).map(x=>[x.text,x.answer]),[['こ','子'],['たすける','助ける']]);
assert.equal(pack[4][2].answer,'申し込む');assert.equal(pack[4][2].kanji,'申込');assert.equal(pack[4][2].kana,'しむ');
assert.equal(evalJs('kanjiTestHistory()[0].score'),65);assert.equal(evalJs('kanjiTestHistory()[1].score'),85);assert.equal(evalJs('kanjiTestHistory()[1].reviewTargets.length'),0);
const original=evalJs('JSON.stringify(KANJI_PACKS[0].stages)');evalJs("useKanjiPack('2026-09-previous')");assert.equal(evalJs('JSON.stringify(QUEST_STAGES)'),original);evalJs('useKanjiPack(CURRENT_KANJI_PACK_ID)');
const code=src('app-v236-school-test.js').replace('  const old=window.openPrintTestV230;', '  window.__schoolTest={record,gradeOne,saveResult,redrawCanvas,focusPaper,write:a=>answers=a,writeFull:a=>fullAnswers=a,mode:m=>mode=m,completedSentence};\n  const old=window.openPrintTestV230;');vm.runInContext(code,ctx);
const api=ctx.window.__schoolTest;const seen=[];ctx.window.gradeKanjiStrokeV230=async(strokes,ch)=>{seen.push(ch);return{pass:true,total:100}};
for(const [full,k] of [[false,1],[true,-1]]){
 const html=api.focusPaper(0,k,'<canvas aria-label="記入欄"></canvas>',full);
 assert.ok(html.includes('schoolProblemV236')&&html.includes('schoolPaperBodyV236')&&html.includes('schoolWriteV236')&&html.includes('schoolSentenceV236'),'Both modes share one worksheet structure');
 assert.ok(html.indexOf('schoolWriteV236')<html.indexOf('schoolSentenceV236'),'Writing is next to the kana sentence inside one paper');
 assert.ok(html.includes('schoolUndoV236')&&html.includes('schoolClearV236')&&html.includes('schoolBackV236')&&html.includes('schoolNextV236'));
 assert.ok(!html.includes('泳ぐ'),'The answer stays hidden while writing');
 assert.ok(!html.includes('線のところ：'),'No large duplicate horizontal reading above the canvas');
}
for(const [pixelWidth,pixelHeight,displayWidth,displayHeight] of [[520,520,130,130],[440,720,185,480],[520,720,250,520]]){
 const ops=[],pencil={setTransform(...v){ops.push(['transform',...v])},clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){ops.push(['stroke',this.lineWidth])},arc(){},fill(){}};
 api.redrawCanvas({width:pixelWidth,height:pixelHeight,getBoundingClientRect:()=>({width:displayWidth,height:displayHeight}),getContext:()=>pencil},[[{x:10,y:10},{x:30,y:30}]]);
 assert.equal(ops.at(-1)[1],3.25,'The displayed pen width is shared by square and tall answer boxes');
 assert.equal(ops[1][1]*displayWidth,pixelWidth,'The X transform keeps the physical stroke size');
 assert.equal(ops[1][4]*displayHeight,pixelHeight,'The Y transform keeps the physical stroke size');
}
let rows=pack.map(q=>q.filter(x=>x.lineType).map(t=>api.record(t)));for(const row of rows)for(const a of row)a.strokes.forEach(x=>x.push([{x:1,y:1}]));api.write(rows);
assert.equal(rows[0][1].strokes.length,1,'Wavy target has one answer area, regardless of suffix length');
assert.equal(rows[4][1].strokes.length,1,'Longer wavy answers cannot reveal their character count');
assert.equal(rows[7][0].strokes.length,4,'Straight kanji retain independent handwriting recognition');
const prior={stats:{路:{mastery:88}},okuriStats:{old:{correct:4}},kanken9V280:{xp:14},printTestsV230:{'2026-09-previous':{best:8,runs:2}}};ctx.save=structuredClone(prior);ctx.persist=()=>{};
(async()=>{
 await api.gradeOne(4,1);assert.deepEqual(seen,[],'Combined kanji and kana must not be judged as a single kanji');assert.equal(rows[4][1].result.manual,true,'Mixed kana must require comparison');
 await api.gradeOne(7,0);assert.deepEqual(seen,['水','泳','教','室']);assert.equal(rows[7][0].result.pass,true);
 ctx.window.gradeKanjiStrokeV230=async()=>({pass:false,total:33});await api.gradeOne(7,0);assert.equal(rows[7][0].result.manual,true,'Uncertain handwriting requires confirmation');
 assert.equal(api.completedSentence(7),'水泳教室に通う。');
 assert.equal(api.completedSentence(4),'手紙で申し込む。');
 const full=pack.map(()=>({strokes:[[[{x:1,y:1}]]],images:[],result:{pass:true}}));
 api.writeFull(full);api.mode('test');api.saveResult();
 assert.equal(ctx.save.printTestsV230['2026-09-21-p58'].last,10);assert.deepEqual(ctx.save.printTestsV230['2026-09-previous'],prior.printTestsV230['2026-09-previous']);for(const k of ['stats','okuriStats','kanken9V280'])assert.deepEqual(ctx.save[k],prior[k]);
 console.log('PASS school data: 10 kana prompts, 20 marked targets, one blank wavy answer, hybrid grading, history and storage isolation.');
})().catch(e=>{console.error(e);process.exitCode=1});
