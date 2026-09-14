// v2.2.1: worksheet-style single-question practice.
// One vertical sentence, per-cell readings, and batch judgement for multi-kanji words.
(() => {
  const VERSION='v2.2.1';
  const prevStartStageV221=startStage;
  const prevRenderCharV221=renderChar;
  const prevRenderHomeV221=renderHome;
  const prevJudgeCurrentV221=judgeCurrent;

  let paperStageKeyV221='';
  let batchActiveV221=false;
  let batchCreditedV221=new Set();
  let batchResultsV221=[];

  const READING_PARTS_V221={
    '路線':['ろ','せん'],
    '感':['かん'],
    '対':['たい'],
    '区':['く'],
    '太陽':['たい','よう'],
    '整':['ととの'],
    '一部':['いち','ぶ'],
    '家路':['いえ','じ'],
    '整理':['せい','り'],
    '表':['あらわ']
  };

  function readingPartsV221(stage){
    if(Array.isArray(stage.readingParts)&&stage.readingParts.length===stage.chars.length)return stage.readingParts;
    const mapped=READING_PARTS_V221[stage.answer];
    if(mapped&&mapped.length===stage.chars.length)return mapped;
    if(stage.chars.length===1)return [stage.reading||''];
    return stage.chars.map((_,i)=>i===0?(stage.reading||''):'');
  }

  function fullReadingV221(stage){return `${stage.reading||''}${stage.okuri||''}`;}
  function stageKeyV221(i=stageIndex){
    const pack=(typeof ACTIVE_KANJI_PACK_ID!=='undefined'&&ACTIVE_KANJI_PACK_ID)||'default';
    return `${pack}:${i}`;
  }

  function installStylesV221(){
    let style=document.getElementById('styleV220');
    if(!style){style=document.createElement('style');style.id='styleV220';document.head.appendChild(style);}
    style.textContent=`
body.paperModeV220 #challengeScreen{background:#eef4f8}
body.paperModeV220 .challengeLayout{display:block;width:min(900px,96vw);padding:16px 0 28px}
body.paperModeV220 .writingPane{background:transparent;box-shadow:none;padding:0;overflow:visible}
body.paperModeV220 #challengeScreen .questionPaper{display:none!important}
body.paperModeV220 .wordProgress{display:none}
body.paperModeV220 .charPrompt{margin:9px 0 7px;font-size:16px;color:#4b5b70}
.paperPracticeV221{width:min(760px,95vw);background:#fffdf7;border:1px solid #ddd2bd;border-radius:10px;padding:18px 22px 16px;box-shadow:0 12px 34px rgba(71,78,91,.12);position:relative;overflow:hidden}
.paperPracticeV221:before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 39px,rgba(95,120,130,.035) 39px 40px)}
.paperTopV221{position:relative;z-index:1;display:flex;align-items:center;gap:12px;border-bottom:2px solid #4b87ba;padding-bottom:9px;margin-bottom:10px}
.paperNoV221{width:34px;height:34px;border:2px solid #69727f;border-radius:50%;display:grid;place-items:center;font-family:"Yu Mincho","Noto Serif JP",serif;font-size:20px;font-weight:900;background:#fff}
.paperTopV221>div{display:flex;flex-direction:column}.paperTopV221 b{font-size:17px}.paperTopV221 small{font-size:11px;color:#7c8792;margin-top:2px}
.paperBodyV221{position:relative;z-index:1;display:flex;justify-content:center;padding:8px 4px 5px;min-height:430px}
.paperSentenceV221{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;font-family:"Yu Mincho","Noto Serif JP",serif;font-weight:700;color:#24272c}
.paperTextRunV221{display:flex;flex-direction:column;align-items:center;font-size:28px;line-height:1.18;letter-spacing:.02em}
.paperTextRunV221 span{display:block;min-height:33px}
.paperAnswerUnitV221{position:relative;margin:4px 0;display:flex;flex-direction:column;align-items:center}
.paperAnswerStackV221{position:relative;border:2px solid #7d96a8;background:#fff;overflow:visible}
.paperAnswerCellV221{position:relative;width:var(--cell,190px);height:var(--cell,190px);border-bottom:1.5px solid #7d96a8;background:#fff;overflow:visible}
.paperAnswerCellV221:last-child{border-bottom:0}
.paperAnswerCellV221:before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px dashed rgba(111,128,139,.20);pointer-events:none}
.paperAnswerCellV221:after{content:"";position:absolute;top:50%;left:0;right:0;border-top:1px dashed rgba(111,128,139,.14);pointer-events:none}
.paperReadingPartV221{position:absolute;right:-42px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:upright;font-size:15px;line-height:1.05;letter-spacing:.04em;color:#3f4650;font-family:"Yu Mincho","Noto Serif JP",serif;font-weight:700;white-space:nowrap}
.paperAnswerCellV221.pass{box-shadow:inset 0 0 0 5px rgba(85,181,113,.25)}
.paperAnswerCellV221.fail{box-shadow:inset 0 0 0 5px rgba(226,98,83,.32)}
.paperCanvasMountV221{position:absolute;inset:0;z-index:4;overflow:hidden}
.paperCanvasMountV221 .canvasShell{width:100%!important;height:100%!important;max-width:none!important;aspect-ratio:auto!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important}
.paperCanvasMountV221 .guideLine{display:none!important}
body.batchWriteV221 .paperCanvasMountV221 .hintSvg{display:none!important}
.paperAnswerStackV221.count1{--cell:min(285px,40vh,57vw)}
.paperAnswerStackV221.count2{--cell:min(205px,26vh,41vw)}
.paperAnswerStackV221.count3,.paperAnswerStackV221.count4{--cell:min(150px,18vh,31vw)}
.paperOkuriUnitV221{position:relative;margin:4px 0}
.paperOkuriBoxV221{position:relative;width:min(220px,43vw);height:min(340px,45vh);border:2px solid #7d96a8;background:#fff;overflow:visible}
.paperOkuriBoxV221:before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px dashed rgba(111,128,139,.18)}
.paperOkuriReadingV221{position:absolute;right:-43px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:upright;font-size:15px;font-family:"Yu Mincho","Noto Serif JP",serif;letter-spacing:.04em;white-space:nowrap}
.paperOkuriBoxV221 .paperCanvasMountV221{inset:0}
.paperFootV221{position:relative;z-index:1;margin-top:8px;padding-top:9px;border-top:1px dashed #c7bca9;display:flex;justify-content:center;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px;color:#78828c}
.paperFootV221 b{color:#4c6073}.paperFootV221 span{background:#fff3bf;border:1px solid #efd66f;border-radius:999px;padding:4px 9px;color:#695817;font-weight:850}
body.paperModeV220 .statusLine{width:min(720px,94vw);margin-top:9px}
body.paperModeV220 .writeActions{margin-top:2px}
body.paperModeV220 .helpDock{width:min(720px,94vw);background:#fff;border-color:#dfe6ed;box-shadow:0 6px 18px rgba(66,76,91,.06)}
body.batchWriteV221 .helpDock{display:none}
.batchReviewV221{position:fixed;inset:0;z-index:9999;background:rgba(25,37,52,.48);display:grid;place-items:center;padding:18px}
.batchReviewCardV221{width:min(680px,94vw);max-height:90vh;overflow:auto;background:#fff;border-radius:28px;padding:22px;box-shadow:0 28px 70px rgba(0,0,0,.25);text-align:center}
.batchReviewCardV221 h2{font-size:34px;margin:4px 0 6px}.batchReviewCardV221 p{color:#66758b;margin:0 0 14px;font-weight:800}
.batchCompareV221{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.batchCharV221{background:#f8fbff;border:1px solid #dfe8f2;border-radius:20px;padding:10px}.batchCharV221 b{display:block;font-size:13px;color:#65748a;margin-bottom:7px}
.batchCharPairV221{display:grid;grid-template-columns:1fr 1fr;gap:7px;align-items:center}.batchCharPairV221 img{width:100%;aspect-ratio:1;object-fit:contain;background:#fff;border-radius:12px;border:1px solid #e4e9ee}.batchSampleV221{aspect-ratio:1;display:grid;place-items:center;background:#fff;border-radius:12px;border:1px solid #e4e9ee;font-family:"Yu Mincho","Noto Serif JP",serif;font-size:72px;font-weight:900}
.batchReviewCardV221 button{margin-top:16px;background:linear-gradient(135deg,#4c7dff,#6d8cff);color:white;font-weight:950;border-radius:16px;padding:13px 22px}
@media(max-width:700px){.paperPracticeV221{padding:13px 11px}.paperBodyV221{min-height:360px}.paperTextRunV221{font-size:23px}.paperTextRunV221 span{min-height:28px}.paperAnswerStackV221.count1{--cell:min(250px,37vh,55vw)}.paperAnswerStackV221.count2{--cell:min(175px,23vh,38vw)}.paperReadingPartV221,.paperOkuriReadingV221{right:-36px;font-size:13px}.paperOkuriBoxV221{width:min(195px,43vw);height:min(310px,43vh)}}
@media(max-height:720px) and (orientation:landscape){.paperBodyV221{min-height:300px}.paperTextRunV221{font-size:22px}.paperAnswerStackV221.count1{--cell:min(230px,36vh)}.paperAnswerStackV221.count2{--cell:min(150px,23vh)}.paperOkuriBoxV221{height:min(270px,43vh);width:170px}}
`;
  }

  function setVersionV221(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV221(){setVersionV221();[80,320,950,1600].forEach(ms=>setTimeout(setVersionV221,ms));}

  function charsHtmlV221(text){return [...String(text||'')].map(ch=>`<span>${esc(ch)}</span>`).join('');}

  function ensurePaperV221(){
    const pane=document.querySelector('#challengeScreen .writingPane');if(!pane)return null;
    let paper=$('paperPracticeV220');
    if(!paper){paper=document.createElement('section');paper.id='paperPracticeV220';pane.insertBefore(paper,pane.firstChild);}
    paper.className='paperPracticeV221';
    return paper;
  }

  function parkCanvasV221(){
    const pane=document.querySelector('#challengeScreen .writingPane');
    const shell=document.querySelector('#challengeScreen .canvasShell');
    const status=$('statusLine');
    if(pane&&shell&&status&&shell.parentElement!==pane)pane.insertBefore(shell,status);
    return shell;
  }

  function resetCanvasSizeV221(){
    const c=$('writeCanvas');if(!c)return;
    if(c.width!==760||c.height!==760){c.width=760;c.height=760;userStrokes=[];currentStroke=null;}
  }

  function restoreLegacyV221(){
    const pane=document.querySelector('#challengeScreen .writingPane');
    const shell=parkCanvasV221();const prompt=$('charPrompt');
    resetCanvasSizeV221();
    if(pane&&shell&&prompt)prompt.insertAdjacentElement('afterend',shell);
    document.body.classList.remove('paperModeV220','batchWriteV221');
    const paper=$('paperPracticeV220');if(paper)paper.hidden=true;
    const help=$('helpDock');if(help)help.hidden=false;
  }

  function answerHtmlV221(stage){
    if(stage.okuri){
      return `<div class="paperOkuriUnitV221"><div class="paperOkuriBoxV221"><div class="paperCanvasMountV221" data-canvas-mount="1"></div></div><span class="paperOkuriReadingV221">${esc(fullReadingV221(stage))}</span></div>`;
    }
    const parts=readingPartsV221(stage);
    return `<div class="paperAnswerUnitV221"><div class="paperAnswerStackV221 count${Math.max(1,stage.chars.length)}">${stage.chars.map((c,i)=>`<div class="paperAnswerCellV221" data-cell="${i}"><span class="paperReadingPartV221">${esc(parts[i]||'')}</span></div>`).join('')}<div class="paperCanvasMountV221" data-canvas-mount="1"></div></div></div>`;
  }

  function renderPaperV221(){
    if(document.body.classList.contains('weeklyTestModeV20')){restoreLegacyV221();return;}
    const stage=QUEST_STAGES[stageIndex];if(!stage)return;
    const key=stageKeyV221();if(key!==paperStageKeyV221){paperStageKeyV221=key;batchCreditedV221=new Set();batchResultsV221=[];}
    const paper=ensurePaperV221();const shell=parkCanvasV221();if(!paper||!shell)return;
    document.body.classList.add('paperModeV220');paper.hidden=false;
    batchActiveV221=stage.chars.length>1&&!stage.okuri;
    document.body.classList.toggle('batchWriteV221',batchActiveV221);

    paper.innerHTML=`<div class="paperTopV221"><span class="paperNoV221">${stageIndex+1}</span><div><b>漢字プリントれんしゅう</b><small>文を上から読みながら、答えの場所へ直接書こう</small></div></div><div class="paperBodyV221"><div class="paperSentenceV221"><div class="paperTextRunV221">${charsHtmlV221(stage.before)}</div>${answerHtmlV221(stage)}<div class="paperTextRunV221">${charsHtmlV221(stage.after)}</div></div></div><div class="paperFootV221">${stage.okuri?'<b>長い答え欄は区切らない</b><span>漢字のあとに送り仮名クイズ</span>':stage.chars.length>1?'<b>全部の文字を続けて書こう</b><span>最後にまとめて判定</span>':'<b>読みの左のマスへ書こう</b>'}</div>`;
    const mount=paper.querySelector('[data-canvas-mount="1"]');if(mount)mount.appendChild(shell);

    const c=$('writeCanvas');
    if(batchActiveV221){
      const n=stage.chars.length;
      if(c.width!==760||c.height!==760*n){c.width=760;c.height=760*n;userStrokes=[];currentStroke=null;}
      charIndex=0;helpLevel=0;checkAttempts=0;checkPassed=false;
      const check=$('checkBtn');if(check)check.textContent='まとめて判定';
      const prompt=$('charPrompt');if(prompt)prompt.textContent=`「${stage.reading}」を上から続けて書こう ✏️`;
      const status=$('statusLine');if(status)status.textContent='全部書けたら「まとめて判定」を押そう！';
      stage.chars.slice(1).forEach(info=>{statFor(info.char).seen++;});persist();
    }else{
      resetCanvasSizeV221();
      const check=$('checkBtn');if(check)check.textContent='できた！判定';
      const prompt=$('charPrompt');if(prompt)prompt.textContent=stage.okuri?'長い答え欄に、まず漢字を書こう ✏️':'読みの左のマスへ書こう ✏️';
    }
    const title=$('wordTitle');if(title)title.textContent='プリントれんしゅう';
    const label=$('stageLabel');if(label&&!document.body.classList.contains('historyReviewV210'))label.textContent=`PRINT PRACTICE ${stageIndex+1} / ${QUEST_STAGES.length}`;
  }

  function occupancyV221(user,exp,grid=6){
    const cells=strokes=>{const set=new Set();normalizeSet(strokes).forEach(s=>resample(s,30).forEach(p=>{const x=clamp(Math.floor(p.x/109*grid),0,grid-1),y=clamp(Math.floor(p.y/109*grid),0,grid-1);set.add(`${x},${y}`);}));return set;};
    const a=cells(user),b=cells(exp);let inter=0;a.forEach(k=>{if(b.has(k))inter++;});return Math.round(100*(2*inter)/Math.max(1,a.size+b.size));
  }
  function aspectV221(user,exp){const ub=bbox(user),eb=bbox(exp),ur=ub.w/Math.max(1,ub.h),er=eb.w/Math.max(1,eb.h);return Math.round(clamp(100-Math.abs(Math.log(Math.max(.05,ur)/Math.max(.05,er)))*90));}

  function splitStrokesV221(index,n){
    const c=$('writeCanvas'),cellH=c.height/n,y0=index*cellH,y1=(index+1)*cellH;
    return userStrokes.filter(s=>s.length&&((s.reduce((a,p)=>a+p.y,0)/s.length)>=y0)&&((s.reduce((a,p)=>a+p.y,0)/s.length)<y1)).map(s=>s.map(p=>({x:p.x/c.width*109,y:(p.y-y0)/cellH*109})));
  }

  function snapshotCellV221(index,n){
    const c=$('writeCanvas'),cellH=c.height/n,t=document.createElement('canvas');t.width=760;t.height=760;
    const x=t.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,760,760);x.drawImage(c,0,index*cellH,c.width,cellH,0,0,760,760);return t.toDataURL('image/png');
  }

  async function judgeBatchV221(){
    const stage=QUEST_STAGES[stageIndex],n=stage.chars.length;
    if(!userStrokes.length){$('statusLine').textContent='まだ白紙だよ。上から順に全部書いてみよう！';return;}
    checkAttempts++;$('statusLine').textContent='全部の字をまとめて見ています…';
    const results=[];
    for(let i=0;i<n;i++){
      const info=stage.chars[i],user=splitStrokesV221(i,n),st=statFor(info.char);
      if(!user.length){results.push({i,info,pass:false,empty:true,shape:0});continue;}
      try{
        const paths=await getKanjiData(info.char),exp=paths.map(p=>p.pts);
        const base=chamferScore(user,exp),occ=occupancyV221(user,exp),asp=aspectV221(user,exp),order=orderScore(user,exp),diff=Math.abs(user.length-exp.length);
        const shape=Math.round(base*.58+occ*.29+asp*.13),count=diff===0?100:diff===1?68:diff===2?38:8,total=Math.round(shape*.77+count*.18+order*.05);
        let countOK;if(exp.length<=5)countOK=diff===0||(diff===1&&shape>=76);else if(exp.length<=11)countOK=diff<=1||(diff===2&&shape>=82&&occ>=67);else countOK=diff<=2||(diff===3&&shape>=84&&occ>=70);
        const pass=base>=57&&occ>=51&&asp>=49&&shape>=62&&total>=65&&countOK;
        results.push({i,info,pass,shape,count,order,total,expected:exp.length,actual:user.length,occ,asp});
        if(pass&&!batchCreditedV221.has(i)){
          batchCreditedV221.add(i);st.correct++;st.noHelp++;const gain=Math.max(6,30-(checkAttempts>1?4:0)),mg=Math.max(4,22-(checkAttempts>1?3:0));st.mastery=Math.round(clamp((st.mastery||0)+mg));st.last=Date.now();save.xp=(save.xp||0)+gain;
        }else if(!pass){st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-2));st.last=Date.now();}
      }catch(e){results.push({i,info,pass:false,error:true,shape:0});}
    }
    persist();batchResultsV221=results;
    document.querySelectorAll('.paperAnswerCellV221').forEach((cell,i)=>{cell.classList.remove('pass','fail');cell.classList.add(results[i]?.pass?'pass':'fail');});
    const bad=results.filter(r=>!r.pass);
    if(bad.length){
      const labels=bad.map(r=>`${r.i+1}文字目`).join('・');
      $('statusLine').innerHTML=`✏️ <b>おしい！</b> ${labels}をもう一度見てみよう。必要なら「消す」で全部書き直してOK！`;
      return;
    }
    batchResultsV221=results.map(r=>({...r,snapshot:snapshotCellV221(r.i,n)}));
    showBatchReviewV221(stage);
  }

  function showBatchReviewV221(stage){
    document.getElementById('batchReviewV221')?.remove();
    const ov=document.createElement('div');ov.id='batchReviewV221';ov.className='batchReviewV221';
    ov.innerHTML=`<div class="batchReviewCardV221"><div class="eyebrow">まとめて判定 OK!</div><h2>「${esc(stage.answer)}」できた！</h2><p>続けて書けたね。自分の字とお手本を見くらべよう。</p><div class="batchCompareV221">${batchResultsV221.map(r=>`<div class="batchCharV221"><b>${r.i+1}文字目　形 ${r.shape}</b><div class="batchCharPairV221"><img src="${r.snapshot}" alt="自分で書いた${esc(r.info.char)}"><div class="batchSampleV221">${esc(r.info.char)}</div></div></div>`).join('')}</div><button id="batchContinueV221" type="button">${stage.okuri?'送り仮名へ →':'ミッションクリア →'}</button></div>`;
    document.body.appendChild(ov);
    $('batchContinueV221').onclick=()=>{ov.remove();charIndex=stage.chars.length-1;batchActiveV221=false;document.body.classList.remove('batchWriteV221');nextAfterReview();};
  }

  startStage=function(i){
    paperStageKeyV221='';batchCreditedV221=new Set();batchResultsV221=[];batchActiveV221=false;
    prevStartStageV221(i);renderPaperV221();keepVersionV221();
  };

  renderChar=function(){
    if(batchActiveV221)return;
    prevRenderCharV221();renderPaperV221();
  };

  judgeCurrent=async function(){if(batchActiveV221)return judgeBatchV221();return prevJudgeCurrentV221();};
  $('checkBtn').onclick=judgeCurrent;

  renderHome=function(){restoreLegacyV221();prevRenderHomeV221();keepVersionV221();};

  installStylesV221();keepVersionV221();
})();
