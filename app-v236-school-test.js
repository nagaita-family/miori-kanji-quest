// School Test 14: marked kana segments, shared by practice, ten-question test and print.
(() => {
  const packId='2026-09-21-p58';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const available=()=>typeof ACTIVE_KANJI_PACK_ID!=='undefined' && ACTIVE_KANJI_PACK_ID===packId && !!currentKanjiPack()?.schoolTest;
  const questions=()=>currentKanjiPack().schoolTest;
  const targets=q=>questions()[q].filter(s=>s.lineType);
  const completedSentence=q=>questions()[q].map(s=>s.answer||s.text).join('');
  const writable=t=>[...t.answer];
  const isKanji=ch=>/^[\u3400-\u9fff]$/.test(ch);
  const record=t=>({strokes:Array.from({length:writable(t).length},()=>[]),images:[],result:null});
  let mode='test',answers=[],fullAnswers=[],focus=null,review=[],reviewAt=0,selected=0,pencilSeen=false;
  const byId=id=>document.getElementById(id);
  const line=(t,active=false)=>`<span class="schoolMarkV236 ${t.lineType||''} ${active?'active':''}">${esc(t.text)}</span>`;
  const sentence=(q,active=-1)=>{let k=0;return questions()[q].map(s=>s.lineType?line(s,k++===active):`<span>${esc(s.text)}</span>`).join('');};
  const style=document.createElement('style');style.id='schoolStyleV236';style.textContent=`
.schoolV236{position:fixed;inset:0;z-index:21000;background:#e9f1fa;display:flex;flex-direction:column;color:#26354b;font-family:system-ui,'Noto Sans JP',sans-serif}
.schoolHeadV236{height:58px;background:white;display:flex;align-items:center;justify-content:space-between;padding:8px 14px;gap:8px}.schoolHeadV236 b{font-size:19px}.schoolHeadV236 button,.schoolActionsV236 button,.schoolControlV236 button,.schoolVerifyV236 button{border:1px solid #cbd6e5;border-radius:10px;background:#fff;color:#344d75;font-size:14px;font-weight:800;padding:10px;cursor:pointer}.schoolHeadV236 button{white-space:nowrap}
.schoolPaperV236{direction:rtl;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));background:#fffdf8;flex:1;min-height:0;margin:10px;border:1px solid #c9d0d7;border-radius:12px;overflow:hidden}
.schoolQV236{direction:ltr;border-left:1px solid #d8d5ca;min-width:0;display:flex;align-items:center;flex-direction:column;position:relative;padding:6px 2px;background:transparent;cursor:pointer;color:#26354b}.schoolQV236:hover,.schoolQV236:focus-visible{background:#f0f6ff}.schoolQV236 .num{border:1px solid #69778a;border-radius:50%;width:27px;height:27px;display:grid;place-items:center;flex:none;font-weight:800}.schoolSentenceV236{display:flex;flex-direction:column;align-items:center;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:clamp(12px,1.55vw,19px);line-height:1.12;margin-top:8px}.schoolSentenceV236>span{writing-mode:vertical-rl;text-orientation:upright;white-space:nowrap}.schoolMarkV236{writing-mode:vertical-rl;text-orientation:upright;white-space:nowrap;text-decoration:underline solid #26354b 2px;text-underline-position:left;text-underline-offset:2px}.schoolMarkV236.wavy{color:#ad3838;text-decoration:underline wavy #c84242 2px}.schoolMarkV236.active{background:#ffeb8a;border-radius:3px}.schoolBoxesV236{display:flex;flex-direction:column;align-items:center;gap:3px;margin:4px 0}.schoolBoxV236{width:clamp(38px,4.8vw,65px);height:clamp(33px,5vw,59px);border:1.5px solid #7a8da6;background:#fff;display:grid;place-items:center}.schoolBoxV236 img{max-width:100%;max-height:100%}.schoolDoneV236{font-size:10px;color:#397d51;font-weight:800;margin-top:auto}.schoolActionsV236{height:57px;display:flex;gap:10px;justify-content:center;align-items:center;padding:4px}.schoolActionsV236 .primary,.schoolControlV236 .primary,.schoolVerifyV236 .primary{background:#496ed8;color:white;border-color:#496ed8}
.schoolFocusV236{position:fixed;inset:0;z-index:21100;background:#223347aa;display:grid;place-items:center;padding:10px}.schoolCardV236{width:min(1000px,98vw);height:min(710px,97dvh);background:white;border-radius:18px;display:grid;grid-template-columns:minmax(145px,230px) minmax(0,1fr) minmax(145px,210px);gap:10px;padding:12px;overflow:hidden}.schoolProblemV236{border:1px solid #e2d7c3;border-radius:12px;background:#fffdf6;display:flex;align-items:center;flex-direction:column;padding:8px;min-height:0;overflow:auto}.schoolProblemV236 .schoolSentenceV236{font-size:21px;margin:12px 0}.schoolWriteV236{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:0;overflow:auto}.schoolWriteV236 h2{font-size:20px;margin:3px 0}.schoolWriteV236 p{font-size:13px;margin:3px 0 10px}.schoolCanvasesV236{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;align-content:center}.schoolCanvasWrapV236{position:relative;border:2px solid #72859c;border-radius:7px}.schoolCanvasWrapV236.on{border-color:#416be4;box-shadow:0 0 0 3px #b5c9ff}.schoolCanvasWrapV236 canvas{display:block;width:clamp(110px,19vh,185px);height:clamp(110px,19vh,185px);touch-action:none;background:linear-gradient(transparent 49.8%,#e4e9ef 50%,transparent 50.2%),linear-gradient(90deg,transparent 49.8%,#e4e9ef 50%,transparent 50.2%)}.schoolCanvasWrapV236 label{position:absolute;right:4px;top:4px;background:#fff9;padding:2px;font-size:11px}.schoolControlV236{display:flex;flex-direction:column;gap:8px;background:#f4f8ff;border-radius:12px;padding:10px;min-width:0;overflow:auto}.schoolControlV236 p{font-size:12px;line-height:1.5}.schoolControlV236 .primary{margin-top:auto}.schoolVerifyV236{position:fixed;inset:0;z-index:21200;background:#223347b8;display:grid;place-items:center;padding:12px}.schoolVerifyCardV236{width:min(560px,96vw);max-height:94dvh;overflow:auto;border-radius:18px;background:white;text-align:center;padding:20px}.schoolVerifyCardV236 h2{font-size:19px}.schoolVerifyCardV236 .compare{font-size:25px;font-weight:800;color:#294d9b}.schoolVerifyCardV236 .strokes{display:flex;justify-content:center;gap:3px;flex-wrap:wrap}.schoolVerifyCardV236 img{height:75px;width:75px;object-fit:contain;border:1px solid #b8c9da}.schoolVerifyCardV236 button{margin:8px 4px}.schoolScoreV236{font-size:35px;color:#315bc0;font-weight:900}.schoolReviewRowsV236{max-height:36vh;overflow:auto;text-align:left}.schoolReviewRowsV236 div{padding:5px;border-bottom:1px solid #e1e6ef}
@media(max-width:800px){.schoolCardV236{grid-template-columns:155px minmax(0,1fr) 156px;gap:6px;padding:7px}.schoolProblemV236 .schoolSentenceV236{font-size:17px}.schoolCanvasWrapV236 canvas{width:clamp(95px,15vh,140px);height:clamp(95px,15vh,140px)}}
@media(max-width:600px){.schoolPaperV236{overflow:auto}.schoolQV236{min-width:58px}.schoolCardV236{grid-template-columns:130px minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}.schoolProblemV236 .schoolSentenceV236{font-size:15px}.schoolControlV236{grid-column:1/-1;flex-direction:row;flex-wrap:wrap;align-items:center}.schoolControlV236 p{display:none}.schoolControlV236 button{flex:1}.schoolControlV236 .primary{margin:0}}
.schoolV236,.schoolFocusV236,.schoolVerifyV236{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overscroll-behavior:contain}
.schoolFocusV236{touch-action:none}
.schoolCardV236{grid-template-columns:minmax(0,1fr) minmax(170px,245px);grid-template-rows:minmax(0,1fr) auto;max-height:calc(100dvh - 12px)}
.schoolProblemV236{grid-column:2;grid-row:1;overflow:hidden}.schoolProblemV236 .schoolSentenceV236{font-size:clamp(15px,2.3vh,22px);max-height:100%;overflow:auto}
.schoolWriteV236{grid-column:1;grid-row:1;overflow:hidden;justify-content:center}
.schoolControlV236{grid-column:1/-1;grid-row:2;display:flex;flex-direction:row;align-items:center;padding:6px;gap:6px;overflow:visible}
.schoolControlV236 b,.schoolControlV236 p{display:none}.schoolControlV236 button{flex:1;padding:9px 4px}.schoolControlV236 .primary{margin:0}
.schoolCanvasesV236{display:flex;flex-direction:column;flex-wrap:nowrap;gap:4px;max-height:100%;overflow:auto;overscroll-behavior:contain}
.schoolCanvasWrapV236 canvas{width:clamp(105px,15vh,146px);height:clamp(105px,15vh,146px)}
.schoolFullV236 .schoolWriteV236 h2{font-size:18px}
.schoolFullV236 .schoolCanvasesV236{overflow:hidden}
.schoolFullV236 .schoolCanvasWrapV236 canvas{width:min(400px,53vw);height:min(540px,68dvh);background:linear-gradient(90deg,transparent 49.75%,#c8d4e2 50%,transparent 50.25%),linear-gradient(0deg,transparent 49.75%,#eef1f5 50%,transparent 50.25%)}
.schoolFullV236 .schoolProblemV236 .schoolSentenceV236{font-size:clamp(16px,2.1vh,21px)}
.schoolFullV236 .schoolCanvasWrapV236 label{font-size:11px}
.schoolVerifyCardV236 .strokes.fullSentenceV236 img{height:min(34vh,260px);width:auto;max-width:90%;border:1px solid #b8c9da}
.schoolVerifyCardV236 .compare.fullSentenceV236{writing-mode:vertical-rl;text-orientation:upright;text-align:left;max-height:220px;margin:5px auto;white-space:normal;font-size:18px;line-height:1.5}
.schoolQV236 .schoolFullBoxV236{width:clamp(40px,5vw,67px);height:clamp(85px,12vw,145px)}
.schoolQV236{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;justify-items:center;align-items:start}
.schoolQV236 .num{grid-column:1/-1;grid-row:1}
.schoolQV236 .schoolSentenceV236{grid-column:2;grid-row:2}
.schoolQV236 .schoolBoxesV236{grid-column:1;grid-row:2}
.schoolQV236 .schoolDoneV236{grid-column:1/-1;grid-row:3}
.schoolQV236 .schoolBoxV236{width:clamp(29px,3.4vw,48px);height:clamp(34px,4.6vw,52px)}
.schoolQV236 .schoolFullBoxV236{width:clamp(30px,3.6vw,51px);height:clamp(88px,12vw,145px)}
@media(max-width:800px){.schoolCardV236{grid-template-columns:minmax(0,1fr) minmax(130px,185px);grid-template-rows:minmax(0,1fr) auto}.schoolProblemV236 .schoolSentenceV236{font-size:clamp(14px,1.8vh,18px)}.schoolCanvasWrapV236 canvas{width:clamp(94px,12vh,130px);height:clamp(94px,12vh,130px)}.schoolFullV236 .schoolCanvasWrapV236 canvas{width:min(335px,47vw);height:min(570px,65dvh)}}
@media(max-width:600px){.schoolCardV236{grid-template-columns:minmax(0,1fr) 120px;grid-template-rows:minmax(0,1fr) auto}.schoolProblemV236 .schoolSentenceV236{font-size:14px}.schoolControlV236{grid-column:1/-1;grid-row:2}.schoolFullV236 .schoolCanvasWrapV236 canvas{width:min(225px,51vw);height:min(540px,61dvh)}}
`;document.head.appendChild(style);
  function start(test=true){if(!available())return window.openPrintTestV230Legacy?.();mode=test?'test':'single';answers=questions().map(row=>row.filter(s=>s.lineType).map(record));fullAnswers=questions().map(()=>({strokes:[[]],images:[],result:null}));pencilSeen=false;selected=0;render();}
  function render(){
    byId('schoolV236')?.remove();
    const el=document.createElement('section');el.id='schoolV236';el.className='schoolV236';
    const boxes=(row,q)=>mode==='test'
      ? `<span class="schoolBoxV236 schoolFullBoxV236">${fullAnswers[q].images[0]?`<img alt="記入済み" src="${fullAnswers[q].images[0]}">`:''}</span>`
      : row.filter(t=>t.lineType).map((t,k)=>`<span class="schoolBoxV236">${answers[q][k].images[0]?`<img alt="記入済み" src="${answers[q][k].images[0]}">`:''}</span>`).join('');
    el.innerHTML=`<div class="schoolHeadV236"><button id="schoolCloseV236">← 空島へ</button><b>${mode==='test'?'学校の10問テスト':'学校テストれんしゅう'}</b><span>${mode==='test'?'かなの文を、左のわくに全部書こう':'練習する問題をえらぼう'}</span></div><div class="schoolPaperV236">${questions().map((row,q)=>`<button type="button" class="schoolQV236" data-q="${q}"><span class="num">${q+1}</span><span class="schoolSentenceV236">${sentence(q)}</span><span class="schoolBoxesV236">${boxes(row,q)}</span><span class="schoolDoneV236">${(mode==='test'?complete(fullAnswers[q]):answers[q].every(complete))?'✓ 記入ずみ':''}</span></button>`).join('')}</div><div class="schoolActionsV236"><button id="schoolPaperV236">🖨 A4プリント・PDF</button>${mode==='test'?'<button id="schoolSubmitV236" class="primary">提出して確認</button>':''}</div>`;
    document.body.appendChild(el);
    byId('schoolCloseV236').onclick=()=>el.remove();
    byId('schoolPaperV236').onclick=()=>window.openWeeklyPaperV235();
    el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>mode==='test'?openFullFocus(Number(b.dataset.q)):openFocus(Number(b.dataset.q),0));
    if(mode==='test')byId('schoolSubmitV236').onclick=submit;
  }
  const complete=a=>a.strokes.every(st=>st.length>0);
  function openFocus(q,k){selected=q;focus={q,k,ci:0};byId('schoolFocusV236')?.remove();const t=targets(q)[k],a=answers[q][k];const el=document.createElement('section');el.id='schoolFocusV236';el.className='schoolFocusV236';const count=targets(q).length;el.innerHTML=`<div class="schoolCardV236"><section class="schoolProblemV236"><b>${q+1}ばん・${k+1}/${count}か所</b><div class="schoolSentenceV236">${sentence(q,k)}</div></section><section class="schoolWriteV236"><h2>線のところ：${esc(t.text)}</h2><p>${t.lineType==='wavy'?'波線：漢字と送り仮名まで書こう':'直線：漢字だけを書こう'}</p><div class="schoolCanvasesV236">${a.strokes.map((_,ci)=>`<div class="schoolCanvasWrapV236" data-ci="${ci}"><canvas width="520" height="520" data-ci="${ci}" aria-label="${isKanji(writable(t)[ci])?'漢字':'送り仮名'}の記入欄"></canvas><label>${isKanji(writable(t)[ci])?'漢字':'送り仮名'}</label></div>`).join('')}</div></section><aside class="schoolControlV236"><b>✏️ 線のところだけ</b><p>ヒントなし。書くわくをタップすると、そのわくを直せるよ。</p><button id="schoolUndoV236">↩ 1画もどす</button><button id="schoolClearV236">消す</button><button id="schoolBackV236">プリントにもどる</button><button id="schoolNextV236" class="primary">${k+1<count?'次の線へ →':'✓ 記入してもどる'}</button></aside></div>`;document.body.appendChild(el);el.querySelectorAll('canvas').forEach(c=>attach(c,a,Number(c.dataset.ci)));el.querySelectorAll('[data-ci].schoolCanvasWrapV236').forEach(w=>w.onclick=()=>active(Number(w.dataset.ci)));active(0);redraw();byId('schoolUndoV236').onclick=()=>{a.strokes[focus.ci].pop();redraw()};byId('schoolClearV236').onclick=()=>{a.strokes[focus.ci]=[];redraw()};byId('schoolBackV236').onclick=()=>{snapshot();el.remove();render()};byId('schoolNextV236').onclick=()=>{snapshot();el.remove();if(k+1<count)openFocus(q,k+1);else if(mode==='single'&&answers[q].every(complete))finishSingle(q);else render()};}
  function openFullFocus(q){
    selected=q;focus={q,k:-1,ci:0,full:true};byId('schoolFocusV236')?.remove();
    const a=fullAnswers[q],el=document.createElement('section');el.id='schoolFocusV236';el.className='schoolFocusV236 schoolFullV236';
    el.innerHTML=`<div class="schoolCardV236"><section class="schoolProblemV236"><b>${q+1}ばん・かなの問題文</b><div class="schoolSentenceV236">${sentence(q)}</div></section><section class="schoolWriteV236"><h2>文をぜんぶ、たてに書こう</h2><p>右上から下へ。長い文は左の列へ続けよう。</p><div class="schoolCanvasesV236"><div class="schoolCanvasWrapV236 on" data-ci="0"><canvas width="520" height="720" data-ci="0" aria-label="文全体の記入欄"></canvas><label>右から左へ</label></div></div></section><aside class="schoolControlV236"><b>✏️ 文をぜんぶ</b><p>右のかな文を見て、線の部分を漢字に直して書こう。</p><button id="schoolUndoV236">↩ 1画もどす</button><button id="schoolClearV236">消す</button><button id="schoolBackV236">プリントにもどる</button><button id="schoolNextV236" class="primary">✓ 記入してもどる</button></aside></div>`;
    document.body.appendChild(el);const canvas=el.querySelector('canvas');attach(canvas,a,0);redraw();
    byId('schoolUndoV236').onclick=()=>{a.strokes[0].pop();redraw()};
    byId('schoolClearV236').onclick=()=>{a.strokes[0]=[];redraw()};
    byId('schoolBackV236').onclick=byId('schoolNextV236').onclick=()=>{snapshot();el.remove();render()};
  }
  function active(ci){focus.ci=ci;byId('schoolFocusV236')?.querySelectorAll('.schoolCanvasWrapV236').forEach(w=>w.classList.toggle('on',Number(w.dataset.ci)===ci));}
  function attach(c,a,ci){
    let drawing=false,current=null,pointerId=null;
    const pos=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
    c.onpointerdown=e=>{
      if(e.pointerType==='touch'&&(pencilSeen||Number(e.width)>=18||Number(e.height)>=18)){e.preventDefault();return}
      if(e.pointerType==='pen')pencilSeen=true;
      e.preventDefault();e.stopPropagation();
      if(!focus.full)active(ci);
      drawing=true;pointerId=e.pointerId;current=[pos(e)];a.strokes[ci].push(current);c.setPointerCapture?.(e.pointerId);
    };
    c.onpointermove=e=>{if(!drawing||e.pointerId!==pointerId)return;e.preventDefault();e.stopPropagation();current.push(pos(e));redrawCanvas(c,a.strokes[ci])};
    const finish=e=>{if(!drawing||e.pointerId!==pointerId)return;e.preventDefault();e.stopPropagation();drawing=false;pointerId=null;current=null;redrawCanvas(c,a.strokes[ci])};
    c.onpointerup=finish;c.onpointercancel=finish;c.onlostpointercapture=finish;
  }
  function redrawCanvas(c,strokes){const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.lineWidth=13;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#17202d';x.fillStyle='#17202d';strokes.forEach(s=>{if(!s.length)return;if(s.length===1){x.beginPath();x.arc(s[0].x,s[0].y,6,0,Math.PI*2);x.fill();return}x.beginPath();x.moveTo(s[0].x,s[0].y);s.slice(1).forEach(p=>x.lineTo(p.x,p.y));x.stroke()})}
  function redraw(){const a=focus.full?fullAnswers[focus.q]:answers[focus.q][focus.k];byId('schoolFocusV236')?.querySelectorAll('canvas').forEach(c=>redrawCanvas(c,a.strokes[Number(c.dataset.ci)]))}
  function snapshot(){const a=focus.full?fullAnswers[focus.q]:answers[focus.q][focus.k];byId('schoolFocusV236')?.querySelectorAll('canvas').forEach(c=>a.images[Number(c.dataset.ci)]=a.strokes[Number(c.dataset.ci)].length?c.toDataURL('image/png'):'')}
  ['selectstart','dragstart','contextmenu'].forEach(type=>document.addEventListener(type,e=>{if(e.target.closest?.('#schoolV236,#schoolFocusV236,#schoolVerifyV236'))e.preventDefault()},{capture:true}));
  document.addEventListener('touchmove',e=>{if(byId('schoolFocusV236')&&!e.target.closest?.('button'))e.preventDefault()},{capture:true,passive:false});
  async function gradeOne(q,k){const t=targets(q)[k],a=answers[q][k],marks=[];try{for(const [ci,ch] of writable(t).entries())if(isKanji(ch))marks.push(await window.gradeKanjiStrokeV230(a.strokes[ci],ch));a.result={pass:t.lineType==='straight'&&marks.every(m=>m.pass&&m.total>=75),manual:t.lineType==='wavy'||marks.some(m=>!m.pass||m.total<75),marks};}catch(e){a.result={pass:false,manual:true,marks,error:true}}}
  async function submit(){
    if(mode==='test'){
      const missing=fullAnswers.map((a,q)=>complete(a)?null:q+1).filter(Boolean);
      if(missing.length){alert(`まだ書いていない問題：${missing.join('、')}番`);return}
      byId('schoolSubmitV236').disabled=true;
      // A whole handwritten sentence includes unmarked kana and arbitrary line
      // breaks. The kanji stroke judge cannot recognize that composition.
      review=fullAnswers.map((_,q)=>({q,full:true}));reviewAt=0;nextReview();return;
    }
    const missing=[];answers.forEach((row,q)=>row.forEach((a,k)=>{if(!complete(a))missing.push(`${q+1}番の${k+1}か所目`)}));
    if(missing.length){alert(`まだ書いていないところ：${missing.slice(0,3).join('、')}${missing.length>3?' ほか':''}`);return}
    byId('schoolSubmitV236').disabled=true;
    for(let q=0;q<answers.length;q++)for(let k=0;k<answers[q].length;k++)await gradeOne(q,k);
    review=answers.flatMap((row,q)=>row.map((a,k)=>a.result.manual?{q,k}:null).filter(Boolean));reviewAt=0;nextReview();
  }
  async function finishSingle(q){for(let k=0;k<answers[q].length;k++)await gradeOne(q,k);review=answers[q].map((a,k)=>a.result.manual?{q,k}:null).filter(Boolean);reviewAt=0;nextReview()}
  function nextReview(){
    byId('schoolVerifyV236')?.remove();
    if(reviewAt>=review.length){saveResult();showResult();return}
    const {q,k,full}=review[reviewAt],t=full?null:targets(q)[k],a=full?fullAnswers[q]:answers[q][k];
    const el=document.createElement('section');el.id='schoolVerifyV236';el.className='schoolVerifyV236';
    el.innerHTML=`<div class="schoolVerifyCardV236"><h2>${full?`${q+1}番の文を見くらべよう`:`${q+1}番・${k+1}か所目を見くらべよう`}</h2><p>自分で書いた字</p><div class="strokes ${full?'fullSentenceV236':''}">${a.images.map(x=>`<img src="${x}" alt="自分の字">`).join('')}</div><p>こたえ（提出後の確認）</p><div class="compare ${full?'fullSentenceV236':''}">${esc(full?completedSentence(q):t.answer)}</div><p>${full?'文全体と、線の漢字・送り仮名を見くらべよう。':t.lineType==='wavy'?'送り仮名もふくめて確かめよう。':'字の形を確かめよう。'}</p><button id="schoolYesV236" class="primary">○ あってる</button><button id="schoolNoV236">△ まだちがう</button><button id="schoolAgainV236">↻ もう一回</button></div>`;
    document.body.appendChild(el);
    byId('schoolYesV236').onclick=()=>{a.result={pass:true,manual:false};reviewAt++;nextReview()};
    byId('schoolNoV236').onclick=()=>{a.result={pass:false,manual:false};reviewAt++;nextReview()};
    byId('schoolAgainV236').onclick=()=>{
      el.remove();a.result=null;
      if(full)openFullFocus(q);else openFocus(q,k);
      const button=byId('schoolNextV236');button.textContent='書き直して確認';
      button.onclick=async()=>{if(!complete(a)){alert('記入欄に書いてね');return}snapshot();byId('schoolFocusV236').remove();if(!full)await gradeOne(q,k);nextReview()};
    };
  }
  function saveResult(){
    try{
      if(typeof save==='undefined'||typeof persist!=='function')return;
      if(mode==='test'){
        const score=fullAnswers.filter(a=>a.result?.pass).length;
        save.printTestsV230||={};const old=save.printTestsV230[packId]||{best:0,runs:0};
        save.printTestsV230[packId]={best:Math.max(old.best||0,score),runs:(old.runs||0)+1,last:score,at:new Date().toISOString()};
      }else{
        save.schoolPracticeV236||={};save.schoolPracticeV236[packId]={lastQuestion:selected+1,at:new Date().toISOString()};
      }
      persist();
    }catch(e){}
  }
  function showResult(){
    byId('schoolVerifyV236')?.remove();
    const rows=mode==='test'?fullAnswers.map((a,q)=>({q,pass:!!a.result?.pass,detail:completedSentence(q)})):[{q:selected,pass:answers[selected].every(a=>a.result?.pass),detail:targets(selected).map((t,k)=>`${t.text} → ${t.answer} ${answers[selected][k].result?.pass?'○':'△'}`).join(' ／ ')}];
    const score=rows.filter(row=>row.pass).length;
    const el=document.createElement('section');el.id='schoolVerifyV236';el.className='schoolVerifyV236';
    el.innerHTML=`<div class="schoolVerifyCardV236"><h2>${mode==='test'?'学校の10問テスト':'学校テストれんしゅう'}の結果</h2><div class="schoolScoreV236">${score} / ${rows.length}</div><div class="schoolReviewRowsV236">${rows.map(row=>`<div><b>${row.q+1}番 ${row.pass?'○':'△'}</b> ${esc(row.detail)}</div>`).join('')}</div><button id="schoolResultCloseV236" class="primary">プリントにもどる</button></div>`;
    document.body.appendChild(el);byId('schoolResultCloseV236').onclick=()=>{el.remove();render()};
  }
  const old=window.openPrintTestV230;window.openPrintTestV230Legacy=old;window.openPrintTestV230=()=>available()?start(true):old();window.openSchoolPracticeV236=()=>available()?start(false):old();window.schoolTestModelV236={questions,targets,completedSentence};
  const entry=document.createElement('button');entry.id='schoolPracticeButtonV236';entry.type='button';entry.textContent='✏️ 学校テストれんしゅう';entry.style.cssText='margin:10px auto;display:block;border:0;background:#315bc0;color:white;border-radius:12px;padding:12px 22px;font-weight:800;font-size:16px';entry.onclick=window.openSchoolPracticeV236;document.querySelector('#weeklyStaticV202')?.insertAdjacentElement('afterend',entry);
})();
