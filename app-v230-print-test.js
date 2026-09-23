// v2.3.0 preview: one-sheet 10-question test inspired by the actual school worksheet.
// The whole sheet stays visible for spatial memory; tap a question to enlarge its writing area.
(() => {
  const VERSION='v2.3.0';
  const TEST_COUNT=Math.min(10,QUEST_STAGES.length);
  const answers=Array.from({length:TEST_COUNT},(_,i)=>({
    strokes:QUEST_STAGES[i].chars.map(()=>[]),
    images:QUEST_STAGES[i].chars.map(()=>''),
    okuriChoice:'',
    result:null
  }));
  let focusIndex=-1;
  let activeChar=0;

  const READING_PARTS={
    '路線':['ろ','せん'],'感':['かん'],'対':['たい'],'区':['く'],'太陽':['たい','よう'],
    '整':['ととの'],'一部':['いち','ぶ'],'家路':['いえ','じ'],'整理':['せい','り'],'表':['あらわ']
  };

  function escV230(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function parts(stage){
    if(Array.isArray(stage.readingParts)&&stage.readingParts.length===stage.chars.length)return stage.readingParts;
    return READING_PARTS[stage.answer]||stage.chars.map((_,i)=>i===0?(stage.reading||''):'');
  }
  function fullReading(stage){return `${stage.reading||''}${stage.okuri||''}`;}
  function vchars(text){return [...String(text||'')].map(ch=>`<span>${escV230(ch)}</span>`).join('');}
  function isAnswered(i){
    const stage=QUEST_STAGES[i],a=answers[i];
    const written=a.strokes.every(list=>list.length>0);
    return written&&(!stage.okuri||!!a.okuriChoice);
  }

  function installStyles(){
    if(document.getElementById('styleV230'))return;
    const s=document.createElement('style');s.id='styleV230';s.textContent=`
.printTestV230{position:fixed;inset:0;z-index:20000;background:#eaf2f8;color:#25344b;font-family:system-ui,-apple-system,'Noto Sans JP',sans-serif;display:flex;flex-direction:column;overflow:hidden}
.testTopV230{height:58px;flex:0 0 58px;background:#fff;border-bottom:1px solid #dce5ee;display:grid;grid-template-columns:180px 1fr 180px;align-items:center;padding:0 16px}
.testTopV230 h1{font-family:'Yu Mincho','Noto Serif JP',serif;font-size:25px;text-align:center;margin:0}.testTopV230 small{display:block;color:#8795a8;font-size:10px;letter-spacing:.12em;font-weight:900}.testCloseV230{justify-self:start;border:1px solid #d9e2ec;background:#fff;border-radius:13px;padding:9px 14px;font-weight:900;color:#40536c}.testProgressV230{justify-self:end;font-size:13px;font-weight:900;color:#60738d}.testProgressV230 b{font-size:18px;color:#3456a8}
.testDeskV230{flex:1;min-height:0;padding:10px 12px 8px;display:flex;justify-content:center;align-items:stretch}
.testSheetV230{position:relative;width:min(1400px,100%);height:100%;background:#fffdf7;border:1px solid #d8cfbd;border-radius:15px;box-shadow:0 12px 32px rgba(66,78,92,.12);padding:15px 15px 12px;overflow:hidden;display:flex;flex-direction:column}
.testSheetHeadV230{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:2px solid #c34c48;padding:0 4px 8px;margin-bottom:8px}.testSheetHeadV230 h2{font-family:'Yu Mincho','Noto Serif JP',serif;margin:0;font-size:20px}.testSheetHeadV230 span{font-size:11px;color:#7b8694;font-weight:800}
.testGridV230{direction:rtl;flex:1;min-height:0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));border-right:1px solid #e4ded2;border-top:1px solid #eee9df}
.testQuestionV230{direction:ltr;min-width:0;position:relative;border-left:1px solid #e4ded2;border-bottom:1px solid #eee9df;padding:7px 3px 5px;display:flex;flex-direction:column;align-items:center;cursor:pointer;background:transparent;transition:background .16s ease,box-shadow .16s ease}
.testQuestionV230:hover,.testQuestionV230:focus-visible{background:#f4f8ff;outline:none;box-shadow:inset 0 0 0 2px #8da9e9}.testQuestionV230.done{background:#fbfff9}.testQuestionV230.missing{background:#fff1ef;box-shadow:inset 0 0 0 2px #ef8e82}
.testQNoV230{width:27px;height:27px;border:1.7px solid #697784;border-radius:50%;display:grid;place-items:center;font-family:'Yu Mincho','Noto Serif JP',serif;font-weight:900;font-size:15px;margin-bottom:4px;background:#fff}
.testSentenceV230{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:clamp(13px,1.55vw,20px);line-height:1.04;color:#25282d;padding-top:2px}
.testTextRunV230{display:flex;flex-direction:column;align-items:center}.testTextRunV230 span{display:block;min-height:1.08em}
.testAnswerMiniV230{position:relative;margin:3px 0 4px;display:flex;flex-direction:column;align-items:center}
.testMiniStackV230{border:1.7px solid #728ca0;background:#fff;position:relative}.testMiniCellV230{width:clamp(44px,4.8vw,68px);height:clamp(44px,4.8vw,68px);border-bottom:1px solid #879bab;position:relative;display:grid;place-items:center}.testMiniCellV230:last-child{border-bottom:0}.testMiniCellV230 img{width:94%;height:94%;object-fit:contain}.testMiniReadingV230{position:absolute;left:calc(100% + 4px);top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:upright;font-size:9px;line-height:1;white-space:nowrap;color:#424c58}.testOkuriMiniV230{width:clamp(48px,5vw,70px);height:clamp(88px,9.8vw,136px);border:1.7px solid #728ca0;background:#fff;position:relative;display:grid;place-items:center}.testOkuriMiniV230 img{width:95%;max-height:74%;object-fit:contain}.testOkuriReadV230{position:absolute;left:calc(100% + 4px);top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:upright;font-size:9px;color:#b64b47;text-decoration:underline wavy #d95d57 1.5px;text-underline-offset:2px;background:#fff2f0;border-radius:4px;padding:2px;white-space:nowrap}.testDoneDotV230{margin-top:auto;font-size:10px;font-weight:950;color:#3f8b58;min-height:14px}
.testBottomV230{height:52px;flex:0 0 52px;display:flex;align-items:center;justify-content:center;gap:10px;padding-top:8px}.testSubmitV230{border:0;border-radius:14px;background:linear-gradient(135deg,#4f76ee,#6d8cff);color:#fff;font-size:16px;font-weight:950;padding:11px 28px;box-shadow:0 6px 16px rgba(73,102,190,.22)}.testBottomV230 span{font-size:11px;color:#7a8797;font-weight:800}

.testFocusV230{position:fixed;inset:0;z-index:20100;background:rgba(25,39,58,.48);display:grid;place-items:center;padding:12px}.testFocusCardV230{width:min(1040px,97vw);height:min(690px,94vh);background:#fff;border-radius:24px;box-shadow:0 26px 70px rgba(0,0,0,.27);display:grid;grid-template-columns:230px minmax(360px,1fr) 230px;gap:14px;padding:16px;overflow:hidden}.focusProblemV230{background:#fffdf7;border:1px solid #ded4c1;border-radius:17px;padding:13px;display:flex;flex-direction:column;align-items:center}.focusProblemV230 h3{margin:0 0 8px;font-size:15px}.focusProblemSentenceV230{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:24px}.focusProblemSentenceV230 .focusBlankV230{width:70px;height:110px;border:2px solid #758fa2;margin:5px 0;background:#fff;position:relative}.focusProblemSentenceV230 .focusBlankV230.okuri{height:180px}.focusProblemSentenceV230 .focusReadV230{position:absolute;left:calc(100% + 7px);top:50%;transform:translateY(-50%);writing-mode:vertical-rl;font-size:12px;color:#4e5660;white-space:nowrap}.focusProblemSentenceV230 .focusReadV230.okuri{color:#b64b47;text-decoration:underline wavy #d95d57 1.5px;text-underline-offset:3px;background:#fff1ef;padding:3px;border-radius:6px}
.focusWritingV230{min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.focusWritingV230>h2{margin:0 0 6px;font-size:21px}.focusWritingV230>p{margin:0 0 8px;color:#738197;font-size:11px;font-weight:800}.focusCanvasStackV230{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;max-height:520px}.focusCanvasWrapV230{position:relative;border:2px solid #8299ad;background:#fff;border-radius:7px;box-shadow:0 5px 14px rgba(65,79,97,.08)}.focusCanvasWrapV230.active{border-color:#4f76ee;box-shadow:0 0 0 4px rgba(79,118,238,.13)}.focusCanvasV230{display:block;width:220px;height:220px;touch-action:none;background:repeating-linear-gradient(0deg,transparent 0 109px,rgba(110,128,140,.12) 109px 110px),repeating-linear-gradient(90deg,transparent 0 109px,rgba(110,128,140,.12) 109px 110px)}.focusCanvasWrapV230.single .focusCanvasV230{width:min(330px,43vh);height:min(330px,43vh)}.focusCanvasReadV230{position:absolute;left:calc(100% + 8px);top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:upright;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:14px;white-space:nowrap}.focusOkuriFrameV230{position:relative;border:2px solid #8299ad;background:#fff;border-radius:7px;padding:15px 12px;height:min(390px,54vh);width:min(300px,39vh);display:grid;place-items:center}.focusOkuriFrameV230 .focusCanvasV230{width:min(260px,34vh);height:min(260px,34vh)}.focusOkuriFrameV230 .focusCanvasReadV230{color:#b64b47;text-decoration:underline wavy #d95d57 2px;text-underline-offset:3px;background:#fff1ef;border-radius:7px;padding:4px}.focusOkuriChoicesV230{display:flex;gap:7px;margin-top:8px;justify-content:center}.focusOkuriChoicesV230 button{border:1px solid #d6deea;background:#fff;border-radius:999px;padding:7px 13px;font-weight:900;color:#53647b}.focusOkuriChoicesV230 button.on{background:#fff1b9;border-color:#e0bd3d;color:#5e4c05;box-shadow:0 0 0 2px #f9e888}
.focusControlsV230{background:#f7faff;border:1px solid #e0e8f2;border-radius:17px;padding:13px;display:flex;flex-direction:column;gap:9px}.focusControlsV230 h3{margin:0;font-size:16px}.focusControlsV230 p{margin:0;font-size:11px;line-height:1.5;color:#718198;font-weight:750}.focusControlsV230 button{border:1px solid #d9e2ec;background:#fff;border-radius:12px;padding:10px;font-weight:900;color:#41536b}.focusControlsV230 .focusDoneV230{margin-top:auto;background:#5579ef;color:#fff;border-color:#5579ef;font-size:15px;padding:12px}.focusNoHintV230{background:#fff9df;border:1px solid #ecd46e;border-radius:12px;padding:9px;font-size:11px;color:#75621d;font-weight:850;line-height:1.45}

.testResultV230{position:fixed;inset:0;z-index:20200;background:rgba(26,40,58,.52);display:grid;place-items:center;padding:16px}.testResultCardV230{width:min(860px,96vw);max-height:94vh;overflow:auto;background:#fff;border-radius:26px;padding:22px;box-shadow:0 28px 70px rgba(0,0,0,.28)}.testScoreV230{text-align:center}.testScoreV230 span{font-size:12px;color:#76859a;font-weight:900}.testScoreV230 b{display:block;font-size:52px;color:#3559b9;line-height:1.05}.testScoreV230 h2{margin:6px 0}.resultGridV230{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:15px 0}.resultItemV230{border:1px solid #e0e7ef;border-radius:14px;padding:9px;background:#f9fbfe;text-align:center}.resultItemV230 .mark{font-size:24px;font-weight:950}.resultItemV230.pass .mark{color:#3f9a5a}.resultItemV230.fail .mark{color:#d65c51}.resultItemV230 b{display:block;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:18px}.resultItemV230 small{color:#78869a}.resultActionsV230{display:flex;justify-content:center;gap:9px;flex-wrap:wrap}.resultActionsV230 button{border:1px solid #d8e1eb;background:#fff;border-radius:13px;padding:10px 16px;font-weight:900;color:#42536a}.resultActionsV230 .primary{background:#5579ef;color:#fff;border-color:#5579ef}
@media(max-width:1050px){.testFocusCardV230{grid-template-columns:185px minmax(330px,1fr) 205px}.focusCanvasV230{width:190px;height:190px}.testQuestionV230{padding-left:1px;padding-right:1px}.testSentenceV230{font-size:13px}}
@media(max-width:820px) and (orientation:portrait){.testGridV230{grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,1fr)}.testFocusCardV230{grid-template-columns:1fr 190px}.focusProblemV230{display:none}.focusWritingV230{grid-column:1}.focusControlsV230{grid-column:2}.testTopV230{grid-template-columns:130px 1fr 130px}.testTopV230 h1{font-size:20px}}
`;
    document.head.appendChild(s);
  }

  function miniAnswer(stage,i){
    const a=answers[i];
    if(stage.okuri){
      return `<div class="testAnswerMiniV230"><div class="testOkuriMiniV230">${a.images[0]?`<img src="${a.images[0]}" alt="書いた字">`:''}<span class="testOkuriReadV230">${escV230(fullReading(stage))}</span></div></div>`;
    }
    const rp=parts(stage);
    return `<div class="testAnswerMiniV230"><div class="testMiniStackV230">${stage.chars.map((_,ci)=>`<div class="testMiniCellV230">${a.images[ci]?`<img src="${a.images[ci]}" alt="書いた字">`:''}<span class="testMiniReadingV230">${escV230(rp[ci]||'')}</span></div>`).join('')}</div></div>`;
  }

  function questionHtml(stage,i){
    return `<button type="button" class="testQuestionV230 ${isAnswered(i)?'done':''}" data-q="${i}"><span class="testQNoV230">${i+1}</span><div class="testSentenceV230"><div class="testTextRunV230">${vchars(stage.before)}</div>${miniAnswer(stage,i)}<div class="testTextRunV230">${vchars(stage.after)}</div></div><span class="testDoneDotV230">${isAnswered(i)?'✓ 記入ずみ':''}</span></button>`;
  }

  function renderSheet(){
    const grid=document.getElementById('testGridV230');if(!grid)return;
    grid.innerHTML=QUEST_STAGES.slice(0,TEST_COUNT).map(questionHtml).join('');
    grid.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>openFocus(Number(b.dataset.q)));
    const n=answers.filter((_,i)=>isAnswered(i)).length;
    const p=document.getElementById('testProgressV230');if(p)p.innerHTML=`記入 <b>${n}</b> / ${TEST_COUNT}`;
  }

  function openTest(){
    document.getElementById('printTestV230')?.remove();
    const root=document.createElement('section');root.id='printTestV230';root.className='printTestV230';
    root.innerHTML=`<header class="testTopV230"><button id="testCloseV230" class="testCloseV230" type="button">← 空島へ</button><div><small>WEEKLY PRINT TEST</small><h1>今週の10問テスト</h1></div><div id="testProgressV230" class="testProgressV230"></div></header><main class="testDeskV230"><section class="testSheetV230"><div class="testSheetHeadV230"><h2>漢字テスト</h2><span>問題をタップすると、大きく書けるよ</span></div><div id="testGridV230" class="testGridV230"></div><div class="testBottomV230"><button id="testPaperV230" class="testPaperV230" type="button">🖨 A4プリント・PDF</button><button id="testSubmitV230" class="testSubmitV230" type="button">提出して採点</button></div></section></main>`;
    document.body.appendChild(root);
    document.getElementById('testCloseV230').onclick=()=>root.remove();
    document.getElementById('testPaperV230').onclick=()=>window.openWeeklyPaperV235?.();
    document.getElementById('testSubmitV230').onclick=submitTest;
    renderSheet();
  }

  function problemPreview(stage){
    return `<h3>プリントの問題</h3><div class="focusProblemSentenceV230"><div class="testTextRunV230">${vchars(stage.before)}</div><div class="focusBlankV230 ${stage.okuri?'okuri':''}"><span class="focusReadV230 ${stage.okuri?'okuri':''}">${escV230(stage.okuri?fullReading(stage):(stage.reading||''))}</span></div><div class="testTextRunV230">${vchars(stage.after)}</div></div>`;
  }

  function focusCanvases(stage,i){
    const rp=parts(stage);
    if(stage.okuri){
      return `<div class="focusOkuriFrameV230"><div class="focusCanvasWrapV230 single" data-wrap="0"><canvas class="focusCanvasV230" data-ci="0" width="520" height="520"></canvas><span class="focusCanvasReadV230">${escV230(fullReading(stage))}</span></div></div><div class="focusOkuriChoicesV230">${stage.okuriChoices.map(x=>`<button type="button" data-okuri="${escV230(x)}" class="${answers[i].okuriChoice===x?'on':''}">${escV230(x)}</button>`).join('')}</div>`;
    }
    const cls=stage.chars.length===1?' single':'';
    return stage.chars.map((_,ci)=>`<div class="focusCanvasWrapV230${cls}" data-wrap="${ci}"><canvas class="focusCanvasV230" data-ci="${ci}" width="520" height="520"></canvas><span class="focusCanvasReadV230">${escV230(rp[ci]||'')}</span></div>`).join('');
  }

  function openFocus(i){
    focusIndex=i;activeChar=0;
    const stage=QUEST_STAGES[i];
    document.getElementById('testFocusV230')?.remove();
    const ov=document.createElement('div');ov.id='testFocusV230';ov.className='testFocusV230';
    ov.innerHTML=`<div class="testFocusCardV230"><section class="focusProblemV230">${problemPreview(stage)}</section><section class="focusWritingV230"><h2>${i+1}ばん</h2><p>${stage.chars.length>1?'上から続けて書こう':'大きく、いつもの字で書こう'}</p><div class="focusCanvasStackV230">${focusCanvases(stage,i)}</div></section><aside class="focusControlsV230"><h3>✏️ テスト記入</h3><div class="focusNoHintV230">本番みたいに、ここではヒントなし。思い出して書いてみよう。</div><p>書くマスをタップすると、そのマスを直せるよ。</p><button id="focusUndoV230" type="button">↩ 1画もどす</button><button id="focusClearV230" type="button">消す</button><button id="focusCancelV230" type="button">プリントにもどる</button><button id="focusDoneV230" class="focusDoneV230" type="button">✓ 記入してもどる</button></aside></div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll('.focusCanvasV230').forEach(c=>attachCanvas(c,i,Number(c.dataset.ci)));
    ov.querySelectorAll('[data-wrap]').forEach(w=>w.onclick=()=>setActiveChar(Number(w.dataset.wrap)));
    ov.querySelectorAll('[data-okuri]').forEach(b=>b.onclick=()=>{answers[i].okuriChoice=b.dataset.okuri;ov.querySelectorAll('[data-okuri]').forEach(x=>x.classList.toggle('on',x===b));});
    document.getElementById('focusUndoV230').onclick=undoActive;
    document.getElementById('focusClearV230').onclick=clearActive;
    document.getElementById('focusCancelV230').onclick=()=>{syncImages(i);ov.remove();renderSheet();};
    document.getElementById('focusDoneV230').onclick=()=>{syncImages(i);ov.remove();renderSheet();};
    setActiveChar(0);redrawFocus();
  }

  function setActiveChar(ci){activeChar=ci;document.querySelectorAll('#testFocusV230 [data-wrap]').forEach(w=>w.classList.toggle('active',Number(w.dataset.wrap)===ci));}

  function attachCanvas(canvas,qi,ci){
    const ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#17202d';ctx.lineWidth=13;
    let drawing=false,current=null;
    const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};};
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();setActiveChar(ci);drawing=true;current=[point(e)];answers[qi].strokes[ci].push(current);canvas.setPointerCapture?.(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!drawing||!current)return;e.preventDefault();const p=point(e),a=current[current.length-1];current.push(p);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(p.x,p.y);ctx.stroke();});
    const up=e=>{if(!drawing)return;drawing=false;if(current&&current.length===1){const p=current[0];ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fillStyle='#17202d';ctx.fill();}current=null;};
    canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('pointerleave',e=>{if(drawing&&e.pointerType!=='pen')up(e);});
  }

  function drawStrokes(canvas,strokes){
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#17202d';ctx.lineWidth=13;
    strokes.forEach(s=>{if(!s.length)return;if(s.length===1){ctx.beginPath();ctx.arc(s[0].x,s[0].y,5,0,Math.PI*2);ctx.fillStyle='#17202d';ctx.fill();return;}ctx.beginPath();ctx.moveTo(s[0].x,s[0].y);for(let k=1;k<s.length;k++)ctx.lineTo(s[k].x,s[k].y);ctx.stroke();});
  }
  function redrawFocus(){if(focusIndex<0)return;document.querySelectorAll('#testFocusV230 .focusCanvasV230').forEach(c=>drawStrokes(c,answers[focusIndex].strokes[Number(c.dataset.ci)]));}
  function undoActive(){if(focusIndex<0)return;answers[focusIndex].strokes[activeChar]?.pop();redrawFocus();}
  function clearActive(){if(focusIndex<0)return;answers[focusIndex].strokes[activeChar]=[];redrawFocus();}
  function syncImages(i){
    document.querySelectorAll('#testFocusV230 .focusCanvasV230').forEach(c=>{const ci=Number(c.dataset.ci);answers[i].images[ci]=answers[i].strokes[ci].length?c.toDataURL('image/png'):'';});
  }

  function rawTo109(strokes){return strokes.map(s=>s.map(p=>({x:p.x/520*109,y:p.y/520*109})));}
  function fitToExpected(strokes,expected){
    const raw=rawTo109(strokes),ub=jBBox(raw),eb=jBBox(expected),scale=Math.min(eb.w/ub.w,eb.h/ub.h);
    const ucx=ub.x+ub.w/2,ucy=ub.y+ub.h/2,ecx=eb.x+eb.w/2,ecy=eb.y+eb.h/2;
    return raw.map(s=>s.map(p=>({x:ecx+(p.x-ucx)*scale,y:ecy+(p.y-ucy)*scale})));
  }
  async function gradeChar(strokes,ch){
    if(!strokes.length)return{pass:false,shape:0,total:0};
    const exp=await expectedStrokes(ch),fitted=fitToExpected(strokes,exp),shape=jShapeScore(fitted,exp),count=jCountScore(strokes.length,exp.length),order=jOrderInfo(fitted,exp);
    const total=Math.round(shape*.77+count*.18+order.score*.05);
    return{pass:shape>=56&&total>=60,shape,count,order:order.score,total};
  }

  async function submitTest(){
    const missing=[];for(let i=0;i<TEST_COUNT;i++)if(!isAnswered(i))missing.push(i);
    document.querySelectorAll('.testQuestionV230').forEach(x=>x.classList.remove('missing'));
    if(missing.length){missing.forEach(i=>document.querySelector(`.testQuestionV230[data-q="${i}"]`)?.classList.add('missing'));const b=document.getElementById('testSubmitV230');if(b){const old=b.textContent;b.textContent=`あと ${missing.length}もん！`;setTimeout(()=>b.textContent=old,1600);}return;}
    const btn=document.getElementById('testSubmitV230');if(btn){btn.disabled=true;btn.textContent='採点中…';}
    for(let i=0;i<TEST_COUNT;i++){
      const stage=QUEST_STAGES[i],a=answers[i];
      try{
        const chars=[];for(let ci=0;ci<stage.chars.length;ci++)chars.push(await gradeChar(a.strokes[ci],stage.chars[ci].char));
        const kanjiOK=chars.every(x=>x.pass),okuriOK=!stage.okuri||a.okuriChoice===stage.okuri;
        a.result={pass:kanjiOK&&okuriOK,chars,okuriOK};
      }catch(e){a.result={pass:false,chars:[],okuriOK:!stage.okuri||a.okuriChoice===stage.okuri,error:true};}
    }
    saveResult();showResults();if(btn){btn.disabled=false;btn.textContent='提出して採点';}
  }

  function saveResult(){
    try{
      if(typeof save==='undefined'||typeof persist!=='function')return;
      if(!save.printTestsV230||typeof save.printTestsV230!=='object')save.printTestsV230={};
      const pack=(typeof ACTIVE_KANJI_PACK_ID!=='undefined'&&ACTIVE_KANJI_PACK_ID)||'default';
      const score=answers.filter(a=>a.result?.pass).length;
      const old=save.printTestsV230[pack]||{best:0,runs:0};
      save.printTestsV230[pack]={best:Math.max(old.best||0,score),runs:(old.runs||0)+1,last:score,at:new Date().toISOString()};persist();
    }catch(e){}
  }

  function showResults(){
    const score=answers.filter(a=>a.result?.pass).length,wrong=answers.map((a,i)=>a.result?.pass?null:i).filter(i=>i!==null);
    document.getElementById('testResultV230')?.remove();
    const ov=document.createElement('div');ov.id='testResultV230';ov.className='testResultV230';
    ov.innerHTML=`<div class="testResultCardV230"><div class="testScoreV230"><span>今週のプリントテスト</span><b>${score} / ${TEST_COUNT}</b><h2>${score===TEST_COUNT?'10点まん点！ 🎉':score>=8?'かなり仕上がってる！':'ここから復習すると強くなる！'}</h2></div><div class="resultGridV230">${QUEST_STAGES.slice(0,TEST_COUNT).map((s,i)=>`<div class="resultItemV230 ${answers[i].result?.pass?'pass':'fail'}"><div class="mark">${answers[i].result?.pass?'○':'△'}</div><b>${escV230(s.answer)}${s.okuri?escV230(s.okuri):''}</b><small>${escV230(fullReading(s))}</small></div>`).join('')}</div><div class="resultActionsV230"><button id="resultBackV230" type="button">プリントを見る</button>${wrong.length?'<button id="resultReviewV230" class="primary" type="button">まちがえた問題をれんしゅう</button>':''}<button id="resultRetryV230" type="button">もう一度テスト</button></div></div>`;
    document.body.appendChild(ov);
    document.getElementById('resultBackV230').onclick=()=>ov.remove();
    document.getElementById('resultRetryV230').onclick=()=>{ov.remove();answers.forEach((a,i)=>{a.strokes=QUEST_STAGES[i].chars.map(()=>[]);a.images=QUEST_STAGES[i].chars.map(()=>'');a.okuriChoice='';a.result=null;});renderSheet();};
    const review=document.getElementById('resultReviewV230');if(review)review.onclick=()=>{const first=wrong[0];ov.remove();document.getElementById('printTestV230')?.remove();startStage(first);};
  }

  installStyles();
  window.openPrintTestV230=openTest;
  if(location.pathname.endsWith('/test-v230.html')||location.pathname.endsWith('test-v230.html'))setTimeout(openTest,650);
})();
