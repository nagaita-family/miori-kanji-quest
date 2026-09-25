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
const code=src('app-v236-school-test.js').replace('  const old=window.openPrintTestV230;', '  window.__schoolTest={record,gradeOne,saveResult,redrawCanvas,focusPaper,write:a=>answers=a,reviewed:q=>reviewedQuestions=q,completedSentence,complete};\n  const old=window.openPrintTestV230;');vm.runInContext(code,ctx);
const api=ctx.window.__schoolTest;const seen=[];ctx.window.gradeKanjiStrokeV230=async(strokes,ch)=>{seen.push(ch);return{pass:true,total:100}};
assert.equal((code.match(/schoolPracticeButtonV236/g)||[]).length,0,'Only the weekly school entry remains');
for(const [q,k,answer] of [[0,1,'泳ぐ'],[2,1,'助言'],[2,2,'聞く']]){
 const html=api.focusPaper(q,k,'<canvas aria-label="記入欄"></canvas>');
 assert.ok(html.includes('schoolProblemV236')&&html.includes('schoolFlowV236')&&html.includes('schoolFlowReadingV236'),'Reading and one target canvas share the cream worksheet');
 assert.equal((html.match(/<canvas/g)||[]).length,1,'A marked line has exactly one answer canvas');
 assert.ok(html.includes('schoolUndoV236')&&html.includes('schoolNextV236'));
 assert.ok(!html.includes(answer),'Answers remain hidden while writing');
 assert.ok(!html.includes('文をぜんぶ書こう'),'Full sentence copying is removed');
}
assert.ok(code.includes('schoolComparisonV236')&&code.includes('grid-template-columns:1fr 1fr'),'Handwriting and vertical answer compare side by side');
assert.ok(src('app-v204-patch.js').includes("schoolWeek?'やってみる'"),'Legacy home score refresh keeps the one school-test entry');
for(const [pixelWidth,pixelHeight,displayWidth,displayHeight] of [[520,520,130,130],[440,720,185,480],[520,720,250,520]]){
 const ops=[],pencil={setTransform(...v){ops.push(['transform',...v])},clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){ops.push(['stroke',this.lineWidth])},arc(){},fill(){}};
 api.redrawCanvas({width:pixelWidth,height:pixelHeight,getBoundingClientRect:()=>({width:displayWidth,height:displayHeight}),getContext:()=>pencil},[[{x:10,y:10},{x:30,y:30}]]);
 assert.equal(ops.at(-1)[1],3.25,'The displayed pen width is shared by square and tall answer boxes');
 assert.equal(ops[1][1]*displayWidth,pixelWidth,'The X transform keeps the physical stroke size');
 assert.equal(ops[1][4]*displayHeight,pixelHeight,'The Y transform keeps the physical stroke size');
}
let rows=pack.map(q=>q.filter(x=>x.lineType).map(t=>api.record(t)));for(const row of rows)for(const a of row)a.strokes[0].push([{x:1,y:1}]);api.write(rows);
assert.ok(rows.every(row=>row.every(a=>a.strokes.length===1)),'One target segment is one answer canvas regardless of length or line type');
assert.equal(rows[2][1].strokes.length,1,'助言 uses one canvas');
assert.equal(rows[2][2].strokes.length,1,'聞く uses one canvas');
const prior={stats:{路:{mastery:88}},okuriStats:{old:{correct:4}},kanken9V280:{xp:14},printTestsV230:{'2026-09-previous':{best:8,runs:2}}};ctx.save=structuredClone(prior);ctx.persist=()=>{};
(async()=>{
 await api.gradeOne(4,1);await api.gradeOne(7,0);await api.gradeOne(2,1);await api.gradeOne(2,2);
 assert.deepEqual(seen,[],'Combined answers use manual comparison, never single-character OCR');
 for(const [q,k] of [[4,1],[7,0],[2,1],[2,2]])assert.equal(rows[q][k].result.manual,true);
 await api.gradeOne(2,0);assert.deepEqual(seen,['兄'],'A single kanji can still be automatically assessed');
 assert.equal(api.completedSentence(7),'水泳教室に通う。');
 for(const row of rows)for(const a of row)a.result={pass:true};
 api.reviewed([0,1,2]);api.saveResult();assert.equal(ctx.save.printTestsV230['2026-09-21-p58'],undefined,'Partial review never records a ten-question run');assert.equal(ctx.save.schoolPracticeV236['2026-09-21-p58'].lastQuestion,3);
 api.reviewed([...Array(10).keys()]);api.saveResult();assert.equal(ctx.save.printTestsV230['2026-09-21-p58'].last,10);assert.equal(ctx.save.printTestsV230['2026-09-21-p58'].runs,1);
 assert.deepEqual(ctx.save.printTestsV230['2026-09-previous'],prior.printTestsV230['2026-09-previous']);for(const k of ['stats','okuriStats','kanken9V280'])assert.deepEqual(ctx.save[k],prior[k]);
 console.log('PASS school: one entry, one canvas per target, partial/full save isolation, handwriting comparison, history protection.');
})().catch(e=>{console.error(e);process.exitCode=1});
