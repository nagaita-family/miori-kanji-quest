// v2.2.0: worksheet-style single-question practice.
// Keep the proven per-kanji judge/review flow, but place the writing canvas directly
// inside a print-like answer column so multi-kanji words are seen together.
(() => {
  const VERSION='v2.2.0';
  const prevStartStageV220=startStage;
  const prevRenderCharV220=renderChar;
  const prevOpenReviewV220=openReview;
  const prevRenderHomeV220=renderHome;

  let paperSnapshotsV220=[];
  let paperStageKeyV220='';

  function installStylesV220(){
    if(document.getElementById('styleV220'))return;
    const style=document.createElement('style');
    style.id='styleV220';
    style.textContent=`/* v2.2.0 — print-like practice sheet */
body.paperModeV220 #challengeScreen{background:#eef4f8}
body.paperModeV220 .challengeLayout{display:block;width:min(900px,96vw);padding:16px 0 28px}
body.paperModeV220 .writingPane{background:transparent;box-shadow:none;padding:0;overflow:visible}
body.paperModeV220 #challengeScreen .questionPaper{display:none!important}
body.paperModeV220 .wordProgress{display:none}
body.paperModeV220 .charPrompt{margin:10px 0 7px;font-size:16px;color:#4b5b70}

.paperPracticeV220{width:min(760px,95vw);background:#fffdf7;border:1px solid #ddd2bd;border-radius:10px;padding:20px 22px 18px;box-shadow:0 12px 34px rgba(71,78,91,.12);position:relative;overflow:hidden}
.paperPracticeV220:before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 39px,rgba(95,120,130,.035) 39px 40px)}
.paperTopV220{position:relative;z-index:1;display:flex;align-items:center;gap:12px;border-bottom:2px solid #4b87ba;padding-bottom:10px;margin-bottom:12px}
.paperNoV220{width:34px;height:34px;border:2px solid #69727f;border-radius:50%;display:grid;place-items:center;font-family:"Yu Mincho","Noto Serif JP",serif;font-size:20px;font-weight:900;background:#fff}
.paperTopV220>div{display:flex;flex-direction:column}.paperTopV220 b{font-size:17px}.paperTopV220 small{font-size:11px;color:#7c8792;margin-top:2px}
.paperBodyV220{position:relative;z-index:1;min-height:340px;display:flex;flex-direction:row-reverse;justify-content:center;align-items:flex-start;gap:12px;padding:12px 4px 8px}
.paperTextV220,.paperReadingV220{writing-mode:vertical-rl;text-orientation:upright;font-family:"Yu Mincho","Noto Serif JP",serif;font-weight:700;letter-spacing:.08em;white-space:pre-wrap}
.paperTextV220{font-size:28px;line-height:1.45;min-height:120px;padding-top:6px;color:#24272c}
.paperReadingV220{font-size:17px;line-height:1.2;padding:10px 2px 0;color:#3e4652;min-width:28px}
.paperReadingV220::before{content:"よみ";font-family:system-ui,sans-serif;font-size:9px;color:#9a8d79;letter-spacing:.06em;margin-bottom:7px}
.paperAnswerV220{display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;border:2px solid #7d96a8;background:#fff;box-shadow:inset 0 0 0 1px #ffffff}
.paperAnswerSlotV220{position:relative;width:var(--sheet-cell,220px);height:var(--sheet-cell,220px);background:#fff;border-bottom:1.5px solid #7d96a8;overflow:hidden}
.paperAnswerSlotV220:last-child{border-bottom:0}
.paperAnswerSlotV220:before,.paperOkuriBoxV220:before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px dashed rgba(111,128,139,.24);z-index:0;pointer-events:none}
.paperAnswerSlotV220:after{content:"";position:absolute;top:50%;left:0;right:0;border-top:1px dashed rgba(111,128,139,.16);z-index:0;pointer-events:none}
.paperAnswerSlotV220.active{box-shadow:inset 0 0 0 5px rgba(255,198,62,.75);background:#fffdf3}
.paperAnswerSlotV220.done{background:#fbfffc}
.paperAnswerSlotV220.done:after{border-top-color:rgba(82,151,104,.14)}
.paperAnswerSlotV220 img{position:absolute;inset:5%;width:90%;height:90%;object-fit:contain;z-index:2}
.paperCanvasMountV220,.okuriCanvasMountV220{position:absolute;inset:0;z-index:3}
.paperAnswerSlotV220 .canvasShell,.paperOkuriBoxV220 .canvasShell{width:100%!important;height:100%!important;max-width:none!important;aspect-ratio:auto!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important}
.paperAnswerSlotV220 .canvasShell .guideLine,.paperOkuriBoxV220 .canvasShell .guideLine{display:none}
.paperAnswerSlotV220 .hintBubble,.paperOkuriBoxV220 .hintBubble{left:8px;right:8px;bottom:8px;max-width:none}

.paperAnswerV220.count1{--sheet-cell:min(300px,42vh,58vw)}
.paperAnswerV220.count2{--sheet-cell:min(225px,28vh,43vw)}
.paperAnswerV220.count3,.paperAnswerV220.count4{--sheet-cell:min(170px,20vh,34vw)}
.paperAnswerV220.okuri{border:0;background:transparent;box-shadow:none}
.paperOkuriBoxV220{position:relative;width:min(230px,44vw);height:min(390px,49vh);border:2px solid #7d96a8;background:#fff;overflow:hidden;box-shadow:inset 0 0 0 5px rgba(255,198,62,.55)}
.paperOkuriBoxV220:after{content:"";position:absolute;left:0;right:0;top:58%;border-top:1px dotted rgba(112,126,136,.18);pointer-events:none}
.okuriCanvasMountV220{left:0;right:0;top:0;height:58%;bottom:auto}
.okuriSpaceV220{position:absolute;left:0;right:0;top:58%;bottom:0;display:grid;place-items:center;text-align:center;color:#9aa2a8;font-size:11px;font-weight:800;letter-spacing:.04em;pointer-events:none}
.okuriSpaceV220 span{background:#fffdf7dd;padding:6px 8px;border-radius:8px}
.paperOkuriBoxV220 .canvasShell{height:100%!important}

.paperFootV220{position:relative;z-index:1;margin-top:10px;padding-top:10px;border-top:1px dashed #c7bca9;display:flex;justify-content:center;gap:12px;align-items:center;flex-wrap:wrap;font-size:12px;color:#78828c}
.paperFootV220 b{color:#4c6073}.paperFootV220 span{background:#fff3bf;border:1px solid #efd66f;border-radius:999px;padding:4px 9px;color:#695817;font-weight:850}
body.paperModeV220 .statusLine{width:min(720px,94vw);margin-top:10px}
body.paperModeV220 .writeActions{margin-top:2px}
body.paperModeV220 .helpDock{width:min(720px,94vw);background:#fff;border-color:#dfe6ed;box-shadow:0 6px 18px rgba(66,76,91,.06)}

@media (max-width:700px){
  .paperPracticeV220{padding:14px 12px 13px}
  .paperBodyV220{gap:7px;min-height:300px}
  .paperTextV220{font-size:23px}
  .paperReadingV220{font-size:15px;min-width:22px}
  .paperAnswerV220.count1{--sheet-cell:min(260px,38vh,58vw)}
  .paperAnswerV220.count2{--sheet-cell:min(190px,25vh,42vw)}
  .paperOkuriBoxV220{width:min(205px,46vw);height:min(350px,48vh)}
}

@media (max-height:720px) and (orientation:landscape){
  .paperPracticeV220{padding-top:12px;padding-bottom:10px}
  .paperTopV220{margin-bottom:5px;padding-bottom:6px}
  .paperBodyV220{min-height:250px;padding-top:5px}
  .paperAnswerV220.count1{--sheet-cell:min(245px,39vh)}
  .paperAnswerV220.count2{--sheet-cell:min(175px,27vh)}
  .paperOkuriBoxV220{height:min(310px,49vh);width:190px}
  body.paperModeV220 .helpDock{margin-top:7px}
}
`;
    document.head.appendChild(style);
  }

  function setVersionV220(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV220(){
    setVersionV220();
    [80,320,950,1600].forEach(ms=>setTimeout(setVersionV220,ms));
  }

  function stageKeyV220(i=stageIndex){
    const pack=(typeof ACTIVE_KANJI_PACK_ID!=='undefined'&&ACTIVE_KANJI_PACK_ID)||'default';
    return `${pack}:${i}`;
  }

  function fullReadingV220(stage){return `${stage.reading||''}${stage.okuri||''}`;}

  function ensurePaperV220(){
    const pane=document.querySelector('#challengeScreen .writingPane');
    if(!pane)return null;
    let paper=$('paperPracticeV220');
    if(!paper){
      paper=document.createElement('section');
      paper.id='paperPracticeV220';
      paper.className='paperPracticeV220';
      paper.innerHTML=`
        <div class="paperTopV220">
          <span class="paperNoV220"></span>
          <div><b>漢字プリントれんしゅう</b><small>学校のテストみたいに、答えの場所へ直接書こう</small></div>
        </div>
        <div class="paperBodyV220">
          <div class="paperBeforeV220 paperTextV220"></div>
          <div class="paperReadingV220"></div>
          <div class="paperAnswerV220"></div>
          <div class="paperAfterV220 paperTextV220"></div>
        </div>
        <div class="paperFootV220"></div>`;
      pane.insertBefore(paper,pane.firstChild);
    }
    return paper;
  }

  function parkCanvasV220(){
    const pane=document.querySelector('#challengeScreen .writingPane');
    const shell=document.querySelector('#challengeScreen .canvasShell');
    const status=$('statusLine');
    if(pane&&shell&&status&&shell.parentElement!==pane) pane.insertBefore(shell,status);
    return shell;
  }

  function restoreLegacyV220(){
    const pane=document.querySelector('#challengeScreen .writingPane');
    const shell=parkCanvasV220();
    const prompt=$('charPrompt');
    if(pane&&shell&&prompt) prompt.insertAdjacentElement('afterend',shell);
    document.body.classList.remove('paperModeV220');
    const paper=$('paperPracticeV220');if(paper)paper.hidden=true;
  }

  function makeSlotsV220(stage){
    if(stage.okuri){
      return `<div class="paperOkuriBoxV220 ${charIndex===0?'active':''}">
        <div class="okuriCanvasMountV220" data-active-mount="1"></div>
        <div class="okuriSpaceV220"><span>送り仮名は<br>このあと</span></div>
      </div>`;
    }
    return stage.chars.map((c,i)=>{
      const done=i<charIndex;
      const active=i===charIndex;
      const snap=paperSnapshotsV220[i];
      return `<div class="paperAnswerSlotV220 ${done?'done':''} ${active?'active':''}" data-slot="${i}">
        ${done&&snap?`<img src="${snap}" alt="${esc(c.char)}を書いた字">`:''}
        ${active?'<div class="paperCanvasMountV220" data-active-mount="1"></div>':''}
      </div>`;
    }).join('');
  }

  function renderPaperV220(){
    // The weekly test still uses the old one-question controller until its worksheet
    // redesign is implemented separately.
    if(document.body.classList.contains('weeklyTestModeV20')){
      restoreLegacyV220();
      return;
    }

    const stage=QUEST_STAGES[stageIndex];
    if(!stage)return;
    const key=stageKeyV220();
    if(key!==paperStageKeyV220){paperStageKeyV220=key;paperSnapshotsV220=Array(stage.chars.length).fill('');}

    const paper=ensurePaperV220();if(!paper)return;
    const shell=parkCanvasV220();
    document.body.classList.add('paperModeV220');
    paper.hidden=false;

    const no=paper.querySelector('.paperNoV220');if(no)no.textContent=`${stageIndex+1}`;
    const before=paper.querySelector('.paperBeforeV220');if(before)before.textContent=stage.before||'';
    const after=paper.querySelector('.paperAfterV220');if(after)after.textContent=stage.after||'';
    const reading=paper.querySelector('.paperReadingV220');if(reading)reading.textContent=fullReadingV220(stage);
    const answer=paper.querySelector('.paperAnswerV220');
    if(answer){
      answer.className=`paperAnswerV220 count${Math.max(1,stage.chars.length)} ${stage.okuri?'okuri':''}`;
      answer.innerHTML=makeSlotsV220(stage);
    }
    const foot=paper.querySelector('.paperFootV220');
    if(foot)foot.innerHTML=stage.okuri
      ? '<b>① まず漢字を書く</b><span>② 正解したら、送り仮名を選ぶ</span>'
      : `<b>${stage.chars.length>1?`${stage.chars.length}つのマスが1つの答えだよ`:'答えのマスに直接書こう'}</b><span>黄色のマスが、いま書く場所</span>`;

    const mount=paper.querySelector('[data-active-mount="1"]');
    if(mount&&shell)mount.appendChild(shell);

    const prompt=$('charPrompt');
    if(prompt)prompt.textContent=stage.chars.length>1
      ? `${charIndex+1}文字目。上から順に、そのマスへ書こう ✏️`
      : stage.okuri?'まず漢字をこの答え欄に書こう ✏️':'答えのマスに直接書こう ✏️';
    const title=$('wordTitle');if(title)title.textContent='プリントれんしゅう';
    const label=$('stageLabel');
    if(label&&!document.body.classList.contains('historyReviewV210'))label.textContent=`PRINT PRACTICE ${stageIndex+1} / ${QUEST_STAGES.length}`;
  }

  startStage=function(i){
    paperStageKeyV220=stageKeyV220(Number(i));
    paperSnapshotsV220=[];
    prevStartStageV220(i);
    const s=QUEST_STAGES[stageIndex];
    paperStageKeyV220=stageKeyV220();
    paperSnapshotsV220=Array(s?.chars?.length||1).fill('');
    renderPaperV220();
    keepVersionV220();
  };

  renderChar=function(){
    prevRenderCharV220();
    renderPaperV220();
  };

  openReview=function(gain){
    if(!document.body.classList.contains('weeklyTestModeV20') && currentSnapshot){
      paperSnapshotsV220[charIndex]=currentSnapshot;
    }
    prevOpenReviewV220(gain);
  };

  renderHome=function(){
    restoreLegacyV220();
    prevRenderHomeV220();
    keepVersionV220();
  };

  installStylesV220();
  keepVersionV220();
})();
