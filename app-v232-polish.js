// v2.3.2: grading compatibility, centered handwriting guides, meaningful okurigana choices,
// and inline okurigana selection for individual print practice.
(() => {
  const VERSION='v2.3.2';

  // ---------- Okurigana choices: choose where the kanji/okurigana boundary is ----------
  // e.g. あらわす -> す / わす / らわす
  function suffixChoicesV232(stage){
    const full=[...String(`${stage.reading||''}${stage.okuri||''}`)];
    const out=[];
    [1,2,3].forEach(n=>{if(full.length>=n)out.push(full.slice(-n).join(''));});
    return [...new Set(out)];
  }
  QUEST_STAGES.forEach(stage=>{
    if(stage.okuri)stage.okuriChoices=suffixChoicesV232(stage);
  });

  // ---------- Compatibility helpers for v2.3 print-test grader ----------
  // v2.3.0 referenced old j* helper names that are not loaded by the current index.
  // Provide those helpers from the current KanjiVG-based engine so correct answers can grade normally.
  window.expectedStrokes=async function(ch){
    const paths=await getKanjiData(ch);
    return paths.map(p=>p.pts);
  };
  window.jBBox=window.jBBox||function(strokes){
    const pts=(strokes||[]).flat();
    if(!pts.length)return{x:0,y:0,w:1,h:1};
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    pts.forEach(p=>{minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);});
    return{x:minX,y:minY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY)};
  };
  function occupancyV232(user,exp,grid=6){
    const cells=strokes=>{
      const set=new Set();
      normalizeSet(strokes).forEach(s=>resample(s,30).forEach(p=>{
        const x=clamp(Math.floor(p.x/109*grid),0,grid-1),y=clamp(Math.floor(p.y/109*grid),0,grid-1);
        set.add(`${x},${y}`);
      }));
      return set;
    };
    const a=cells(user),b=cells(exp);let inter=0;a.forEach(k=>{if(b.has(k))inter++;});
    return Math.round(100*(2*inter)/Math.max(1,a.size+b.size));
  }
  window.jShapeScore=function(user,exp){
    const base=chamferScore(user,exp),occ=occupancyV232(user,exp);
    // A little forgiving for a child's natural handwriting while still requiring the overall form.
    return Math.round(base*.72+occ*.28);
  };
  window.jCountScore=function(userCount,expectedCount){
    const d=Math.abs(userCount-expectedCount);
    if(d===0)return 100;if(d===1)return 82;if(d===2)return 62;
    return Math.max(12,58-d*9);
  };
  window.jOrderInfo=function(user,exp){
    return{score:orderScore(user,exp),own:[],miss:[]};
  };

  // ---------- Center the guide cross exactly in every writing box ----------
  function installStylesV232(){
    if(document.getElementById('styleV232'))return;
    const s=document.createElement('style');s.id='styleV232';s.textContent=`
.focusCanvasV230{
  background-image:
    linear-gradient(to right,transparent 49.72%,rgba(110,128,140,.22) 49.72%,rgba(110,128,140,.22) 50.28%,transparent 50.28%),
    linear-gradient(to bottom,transparent 49.72%,rgba(110,128,140,.22) 49.72%,rgba(110,128,140,.22) 50.28%,transparent 50.28%)!important;
  background-size:100% 100%!important;background-repeat:no-repeat!important;background-position:center!important;
}
.focusCanvasWrapV230{overflow:hidden}
.testMiniCellV230:before{content:'';position:absolute;top:0;bottom:0;left:50%;border-left:1px dashed rgba(110,128,140,.18);pointer-events:none;z-index:0}
.testMiniCellV230:after{content:'';position:absolute;left:0;right:0;top:50%;border-top:1px dashed rgba(110,128,140,.18);pointer-events:none;z-index:0}
.testMiniCellV230 img{position:relative;z-index:1}

/* Inline okurigana, directly under the handwritten kanji in individual practice. */
.paperOkuriUnitV221{display:flex!important;flex-direction:column!important;align-items:center!important}
.inlineOkuriV232{margin-top:9px;display:flex;flex-direction:column;align-items:center;gap:7px;font-family:system-ui,-apple-system,'Noto Sans JP',sans-serif;position:relative;z-index:12}
.inlineOkuriLabelV232{font-size:12px;font-weight:950;color:#a64c48;background:#fff5f3;border:1px solid #efc2bd;border-radius:999px;padding:5px 9px}
.inlineOkuriChoicesV232{display:flex;gap:7px;flex-wrap:wrap;justify-content:center}
.inlineOkuriChoicesV232 button{min-width:54px;border:1px solid #d7dfeb;background:#fff;border-radius:999px;padding:8px 13px;font-size:17px;font-weight:950;color:#42536a;box-shadow:0 3px 8px rgba(50,70,95,.06)}
.inlineOkuriChoicesV232 button.correct{background:#e9f8ed;border-color:#74bd86;color:#2e7d45}
.inlineOkuriChoicesV232 button.wrong{background:#fff0ee;border-color:#e79b92;color:#b04d46}
.inlineOkuriFeedbackV232{min-height:20px;font-size:12px;font-weight:900;color:#69798f}.inlineOkuriFeedbackV232 strong{font-family:'Yu Mincho','Noto Serif JP',serif;font-size:22px;color:#25344b}.inlineOkuriFeedbackV232 .okuriMarkV232{color:#c64c48;text-decoration:underline wavy #d85d57 2px;text-underline-offset:3px}
.okuriReviewCompleteV232{display:flex;align-items:center;justify-content:center;gap:12px;margin:5px auto 7px;padding:7px 14px;border:1px solid #f0c8c2;background:#fff8f6;border-radius:14px;max-width:520px}.okuriReviewCompleteV232 b{font-family:'Yu Mincho','Noto Serif JP',serif;font-size:26px}.okuriReviewCompleteV232 .okuriReviewSuffixV232{color:#c64c48;text-decoration:underline wavy #d85d57 2px;text-underline-offset:4px}.okuriReviewCompleteV232 span:last-child{font-size:13px;color:#68788d;font-weight:850}
@media(max-height:760px) and (orientation:landscape){.inlineOkuriV232{margin-top:5px;gap:4px}.inlineOkuriChoicesV232 button{padding:6px 11px;font-size:15px}}
`;
    document.head.appendChild(s);
  }

  // ---------- Individual practice: choose okurigana inline before review ----------
  const prevOpenReviewV232=openReview;
  let inlineAttemptsV232=0;
  function okuriStatV232(stage){
    if(!save.okuriStats||typeof save.okuriStats!=='object')save.okuriStats={};
    const key=`${stage.answer}|${stage.okuri||''}`;
    if(!save.okuriStats[key])save.okuriStats[key]={seen:0,correct:0,wrong:0,mastery:0,last:0};
    return save.okuriStats[key];
  }
  function cleanupInlineV232(){document.getElementById('inlineOkuriV232')?.remove();}
  function decorateReviewV232(stage){
    const shell=document.querySelector('#reviewScreen .reviewShell');if(!shell)return;
    shell.querySelector('.okuriReviewCompleteV232')?.remove();
    const lead=shell.querySelector('.reviewLead');
    const box=document.createElement('div');box.className='okuriReviewCompleteV232';
    box.innerHTML=`<b>${esc(stage.answer)}<span class="okuriReviewSuffixV232">${esc(stage.okuri)}</span></b><span>「${esc(`${stage.reading||''}${stage.okuri||''}`)}」</span>`;
    lead?.insertAdjacentElement('afterend',box);
    const next=$('reviewNextBtn');
    if(next){next.textContent='ミッションクリア →';next.onclick=()=>finishStage();}
  }
  function showInlineOkuriV232(gain){
    const stage=QUEST_STAGES[stageIndex];if(!stage?.okuri)return prevOpenReviewV232(gain);
    cleanupInlineV232();inlineAttemptsV232=0;
    const st=okuriStatV232(stage);st.seen++;st.last=Date.now();persist();
    const unit=document.querySelector('.paperOkuriUnitV221');
    if(!unit){prevOpenReviewV232(gain);setTimeout(()=>decorateReviewV232(stage),30);return;}
    const host=document.createElement('div');host.id='inlineOkuriV232';host.className='inlineOkuriV232';
    host.innerHTML=`<div class="inlineOkuriLabelV232">〰 送り仮名はどこから？</div><div class="inlineOkuriChoicesV232">${suffixChoicesV232(stage).map(x=>`<button type="button" data-okuri="${esc(x)}">${esc(x)}</button>`).join('')}</div><div class="inlineOkuriFeedbackV232">漢字はOK！ 下から選んで完成させよう。</div>`;
    unit.appendChild(host);
    const check=$('checkBtn');if(check){check.disabled=true;check.textContent='送り仮名をえらぼう';}
    const status=$('statusLine');if(status)status.textContent='漢字はできた！ そのまま下の送り仮名を選ぼう。';
    host.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
      if(btn.disabled)return;
      const val=btn.dataset.okuri||'';
      if(val===stage.okuri){
        btn.classList.add('correct');host.querySelectorAll('button').forEach(b=>b.disabled=true);
        const reward=inlineAttemptsV232===0?10:6,mg=inlineAttemptsV232===0?22:13;
        st.correct++;st.mastery=Math.round(clamp((st.mastery||0)+mg));st.last=Date.now();save.xp=(save.xp||0)+reward;persist();
        host.querySelector('.inlineOkuriFeedbackV232').innerHTML=`🎉 <strong>${esc(stage.answer)}<span class="okuriMarkV232">${esc(stage.okuri)}</span></strong>`;
        setTimeout(()=>{
          cleanupInlineV232();prevOpenReviewV232(gain);setTimeout(()=>decorateReviewV232(stage),20);
        },620);
      }else{
        inlineAttemptsV232++;btn.classList.add('wrong');btn.disabled=true;st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-2));st.last=Date.now();persist();
        host.querySelector('.inlineOkuriFeedbackV232').textContent='おしい！ どこからが送り仮名か、もう一度考えてみよう。';
      }
    });
  }
  openReview=function(gain){
    const stage=QUEST_STAGES[stageIndex];
    if(stage?.okuri&&charIndex===stage.chars.length-1&&document.body.classList.contains('paperModeV220')&&!document.body.classList.contains('weeklyTestModeV20')){
      showInlineOkuriV232(gain);return;
    }
    prevOpenReviewV232(gain);
  };

  // Clean stale inline controls when moving to another problem/character.
  const prevStartStageV232=startStage,prevRenderCharV232=renderChar;
  startStage=function(i){cleanupInlineV232();prevStartStageV232(i);};
  renderChar=function(){cleanupInlineV232();prevRenderCharV232();};

  // Quiet internal reference-data check: every current target should pass with its ideal KanjiVG strokes.
  async function selfCheckV232(){
    const unique=[...new Set(QUEST_STAGES.flatMap(s=>s.chars.map(c=>c.char)))],out=[];
    for(const ch of unique){
      try{
        const exp=await expectedStrokes(ch),shape=jShapeScore(exp,exp),count=jCountScore(exp.length,exp.length),order=jOrderInfo(exp,exp).score,total=Math.round(shape*.77+count*.18+order*.05);
        out.push({ch,shape,count,order,total,pass:shape>=56&&total>=60});
      }catch(e){out.push({ch,pass:false,error:String(e)});}
    }
    window.__KANJI_V232_SELF_CHECK=out;
    console.info('[Kanji Quest v2.3.2 grading self-check]',out);
  }

  installStylesV232();
  document.title=document.title.replace(/v2\.\d+\.\d+/,'v2.3.2');
  setTimeout(selfCheckV232,900);
})();